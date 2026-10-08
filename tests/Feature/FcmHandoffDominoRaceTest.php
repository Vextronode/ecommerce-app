<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

// regresi domino handoff steal: kalau pemenang handoff pertama tidak langsung
// ditandai aktif, pemanggil paralel berikutnya membaca dia sebagai pemilik lama yang
// tidak aktif dan ikut menang berantai (push lintas akun bocor).
// diuji dengan memanggil FcmTokenManager ASLI dari beberapa proses paralel nyata,
// jadi copy logic di sini tidak bisa menyembunyikan race.
// WAJIB jalan di mysql/mariadb (row-lock innoDB sebenarnya); driver lain di-skip
// supaya tidak memberi hijau palsu.
class FcmHandoffDominoRaceTest extends TestCase
{
    private const JUMLAH_PEKERJA = 4;

    private const JUMLAH_ITERASI = 4;

    private string $token = '';

    /** @var array<int, int> */
    private array $userIds = [];

    protected function setUp(): void
    {
        parent::setUp();

        if (Schema::getConnection()->getDriverName() !== 'mysql') {
            $this->markTestSkipped('uji race domino butuh row-lock innoDB (mysql/mariadb).');
        }

        // jangan pernah menulis user uji ke db kerja/dev. test ini bikin & hapus baris
        // users asli, jadi wajib diarahkan ke db test terpisah.
        if (Schema::getConnection()->getDatabaseName() === 'cibenda_mart') {
            $this->markTestSkipped('uji race domino harus jalan di db test terpisah, bukan cibenda_mart.');
        }

        if (! function_exists('proc_open')) {
            $this->markTestSkipped('proc_open tidak tersedia untuk uji paralel.');
        }
    }

    protected function tearDown(): void
    {
        if ($this->userIds !== []) {
            User::whereIn('id', $this->userIds)->delete();
        }

        parent::tearDown();
    }

    public function test_handoff_paralel_hanya_satu_pemenang_dan_nol_error(): void
    {
        $bootstrap = base_path('bootstrap/app.php');
        $autoload = base_path('vendor/autoload.php');
        $koneksi = config('database.connections.mysql');
        $path = base_path('tests/Feature/race_domino_manager_child.php');

        file_put_contents($path, $this->skripWorker($autoload, $bootstrap, $koneksi));

        $salah = 0;
        $error = 0;

        try {
            for ($iterasi = 0; $iterasi < self::JUMLAH_ITERASI; $iterasi++) {
                $this->siapkanUser();
                $idPekerja = $this->userIds;

                $gate = tempnam(sys_get_temp_dir(), 'domgate');
                file_put_contents($gate, '');

                $procs = [];
                $pipes = [];

                foreach ($idPekerja as $uid) {
                    $cmd = [PHP_BINARY, $path, (string) $uid, $gate, $this->token];
                    $procs[$uid] = proc_open(
                        $cmd,
                        [1 => ['pipe', 'w'], 2 => ['pipe', 'w']],
                        $pipes[$uid]
                    );
                }

                usleep(500000);
                file_put_contents($gate, (string) ((int) ((microtime(true) + 0.25) * 1000000)));

                $menang = 0;

                foreach ($idPekerja as $uid) {
                    $out = trim((string) stream_get_contents($pipes[$uid][1]));
                    fclose($pipes[$uid][1]);
                    fclose($pipes[$uid][2]);
                    proc_close($procs[$uid]);

                    if ($out === '200') {
                        $menang++;
                    } elseif (str_starts_with($out, 'err')) {
                        $error++;
                    }
                }

                @unlink($gate);

                if ($menang !== 1) {
                    $salah++;
                }
            }
        } finally {
            @unlink($path);
        }

        $this->assertSame(0, $error, 'tidak boleh ada worker yang error/500');
        $this->assertSame(
            0,
            $salah,
            'handoff paralel wajib punya tepat satu pemenang; lebih dari satu berarti domino handoff steal'
        );
    }

    private function siapkanUser(): void
    {
        if ($this->userIds !== []) {
            User::whereIn('id', $this->userIds)->delete();
            $this->userIds = [];
        }

        $this->token = 'TOKEN-DOMINO-'.bin2hex(random_bytes(10));

        $lama = User::create([
            'name' => 'lama',
            'email' => 'domino-lama-'.uniqid().'@x.test',
            'role' => 'user',
        ]);
        $lama->forceFill(['fcm_token' => $this->token, 'last_seen_at' => now()->subHours(5)])->save();
        $this->userIds[] = $lama->id;

        for ($i = 0; $i < self::JUMLAH_PEKERJA; $i++) {
            $u = User::create([
                'name' => "pekerja{$i}",
                'email' => 'domino-pekerja-'.$i.'-'.uniqid().'@x.test',
                'role' => 'user',
            ]);
            $this->userIds[] = $u->id;
        }
    }

    private function skripWorker(string $autoload, string $bootstrap, array $koneksi): string
    {
        $host = var_export((string) ($koneksi['host'] ?? '127.0.0.1'), true);
        $port = var_export((string) ($koneksi['port'] ?? '3306'), true);
        $database = var_export((string) $koneksi['database'], true);
        $username = var_export((string) $koneksi['username'], true);
        $password = var_export((string) ($koneksi['password'] ?? ''), true);
        $autoloadPhp = var_export($autoload, true);
        $bootstrapPhp = var_export($bootstrap, true);

        return <<<PHP
<?php

require {$autoloadPhp};
\$app = require {$bootstrapPhp};
\$app->make(Illuminate\\Contracts\\Console\\Kernel::class)->bootstrap();

use App\\Models\\User;
use App\\Services\\FcmTokenManager;
use Illuminate\\Support\\Facades\\DB;

config([
    'database.default' => 'childmysql',
    'database.connections.childmysql' => [
        'driver' => 'mysql',
        'host' => {$host},
        'port' => {$port},
        'database' => {$database},
        'username' => {$username},
        'password' => {$password},
        'charset' => 'utf8mb4',
        'collation' => 'utf8mb4_unicode_ci',
        'prefix' => '',
    ],
]);
DB::purge('childmysql');
DB::setDefaultConnection('childmysql');

list(\$script, \$userId, \$gate, \$token) = \$argv;

\$batas = microtime(true) + 10;
while (true) {
    \$target = @file_get_contents(\$gate);
    if (\$target !== false && \$target !== '') {
        if ((int) (microtime(true) * 1000000) >= (int) \$target) {
            break;
        }
    }
    if (microtime(true) > \$batas) {
        echo "err:barrier-timeout\\n";
        exit(0);
    }
    usleep(50);
}

try {
    \$user = User::find((int) \$userId);
    \$hasil = app(FcmTokenManager::class)->handoffJikaPemilikLamaTidakAktif(\$user, \$token);
    echo \$hasil['status']."\\n";
} catch (\\Throwable \$e) {
    echo "err:".get_class(\$e)."\\n";
}
PHP;
    }
}

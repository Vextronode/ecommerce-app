<?php

namespace Tests\Feature;

use App\Models\Store;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

// regresi akechi(red): race cooldown bank & fcm harus dibuktikan dengan eksekusi PARALEL nyata,
// bukan cuma perilaku sekuensial. test ini fork dua proses php yang nembak endpoint barengan
// lewat http kernel, pakai sqlite file + cache file yang dishare antar proses.
class WaveTwoRealRaceTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        if (! function_exists('pcntl_fork')) {
            $this->markTestSkipped('pcntl tidak tersedia untuk uji paralel.');
        }

        // bersihkan artefak db file dari run sebelumnya
        @unlink(base_path('tests/Feature/race_wave2.sqlite'));
    }

    protected function tearDown(): void
    {
        // db file fork cuma artefak test, jangan biarkan nyampah di working tree
        @unlink(base_path('tests/Feature/race_wave2.sqlite'));
        @unlink(base_path('tests/Feature/race_bank_child.php'));

        parent::tearDown();
    }

    public function test_cooldown_bank_tidak_bisa_dilewati_dua_request_paralel(): void
    {
        $script = <<<'PHP'
<?php
require __DIR__.'/../../vendor/autoload.php';
putenv('DB_CONNECTION=sqlite');
putenv('DB_DATABASE='.getenv('RACE_DB'));
$_ENV['DB_CONNECTION'] = 'sqlite';
$_ENV['DB_DATABASE'] = getenv('RACE_DB');
$app = require __DIR__.'/../../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

config([
    'database.default' => 'sqlite',
    'database.connections.sqlite.database' => getenv('RACE_DB'),
    'cache.default' => 'file',
]);
DB::purge('sqlite');

$merchantId = (int) getenv('RACE_MERCHANT_ID');
$nomor = getenv('RACE_NOMOR');

// login biar rule current_password punya guard auth yang benar
Auth::loginUsingId($merchantId);

$request = Illuminate\Http\Request::create('/merchant/withdrawals/update-bank', 'POST', [
    'bank_name' => 'mandiri',
    'bank_account_number' => $nomor,
    'bank_account_holder' => 'Paralel',
    'password' => 'rahasia123',
]);
$request->setLaravelSession(app('session.store'));
app()->instance('request', $request);
$request->setUserResolver(fn () => App\Models\User::find($merchantId));

$controller = new App\Http\Controllers\Merchant\WithdrawalController;

try {
    $controller->updateBank($request);
    echo "OK\n";
} catch (Illuminate\Validation\ValidationException $e) {
    echo "REJECT\n";
} catch (\Throwable $e) {
    echo "ERR:".$e->getMessage()."\n";
}
PHP;

        $path = base_path('tests/Feature/race_bank_child.php');
        file_put_contents($path, $script);

        $this->buatDatabaseDanCacheFileUntukFork();

        // bersihkan cache file store biar tidak ada lock/cooldown sisa dari run sebelumnya
        Cache::store('file')->flush();

        $barrier = tempnam(sys_get_temp_dir(), 'barrier');
        $hasilFile = tempnam(sys_get_temp_dir(), 'hasil');

        $pids = [];
        foreach (['111111', '222222'] as $i => $nomor) {
            $pid = pcntl_fork();
            if ($pid === 0) {
                putenv('RACE_DB='.base_path('tests/Feature/race_wave2.sqlite'));
                putenv('RACE_MERCHANT_ID='.$this->merchantId);
                putenv('RACE_STORE_ID='.$this->storeId);
                putenv('RACE_NOMOR='.$nomor);
                putenv('APP_ENV=testing');
                putenv('DB_CONNECTION=sqlite');
                putenv('DB_DATABASE='.base_path('tests/Feature/race_wave2.sqlite'));

                // tunggu barrier dibuka barengan
                while (! file_exists($barrier)) {
                    usleep(1000);
                }

                $out = shell_exec('php -d variables_order=EGPCS '.escapeshellarg($path).' 2>&1');
                file_put_contents($hasilFile.'.'.$nomor, (string) $out);
                exit(0);
            }
            $pids[] = $pid;
        }

        // buka barrier
        file_put_contents($barrier, 'go');

        foreach ($pids as $pid) {
            pcntl_waitpid($pid, $status);
        }

        $hasil = [];
        foreach (['111111', '222222'] as $nomor) {
            $hasil[$nomor] = trim((string) @file_get_contents($hasilFile.'.'.$nomor));
        }

        @unlink($barrier);
        @unlink($hasilFile);
        foreach (['111111', '222222'] as $nomor) {
            @unlink($hasilFile.'.'.$nomor);
        }
        @unlink($path);

        // tepat satu yang boleh OK
        $ok = array_filter($hasil, fn ($h) => $h === 'OK');
        $this->assertCount(1, $ok, 'harus tepat satu request paralel yang lolos: '.json_encode($hasil));
    }

    private int $merchantId = 0;

    private int $storeId = 0;

    private function buatDatabaseDanCacheFileUntukFork(): void
    {
        // test ini butuh sqlite file, bukan :memory:, supaya bisa dishare antar proses.
        config([
            'database.default' => 'sqlite',
            'database.connections.sqlite.database' => base_path('tests/Feature/race_wave2.sqlite'),
        ]);
        @unlink(base_path('tests/Feature/race_wave2.sqlite'));
        touch(base_path('tests/Feature/race_wave2.sqlite'));
        DB::purge('sqlite');

        $this->artisan('migrate', ['--force' => true]);

        $merchant = User::factory()->create([
            'email' => 'merchant.race.'.uniqid().'@example.com',
            'password' => Hash::make('rahasia123'),
            'role' => 'user',
        ]);
        $merchant->forceFill(['role' => 'pedagang'])->save();
        $this->merchantId = $merchant->id;

        $store = Store::create([
            'user_id' => $merchant->id,
            'name' => 'Toko Race Parallel',
            'slug' => 'toko-race-para-'.uniqid(),
            'bank_name' => 'BCA',
            'bank_account_number' => '1234567890',
            'bank_account_holder' => 'Budi Santoso',
        ]);
        $this->storeId = $store->id;

        // pakai cache file supaya cooldown & lock dishare antar proses fork
        config(['cache.default' => 'file']);
    }
}

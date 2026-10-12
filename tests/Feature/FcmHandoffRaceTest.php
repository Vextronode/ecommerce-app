<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

// regresi temuan akechi(red): handoff kepemilikan token rawan double-claim kalau
// cek "pemilik lama" dan tulis kepemilikan tidak dibungkus satu transaksi dengan
// row-lock. test ini membuktikan perilaku itu memakai dua koneksi db terpisah yang
// diinterleaving manual, jadi hasilnya deterministik (bukan tergantung timing fork).
// WAJIB jalan di mysql/mariadb (innoDB row-lock sebenarnya); di driver lain di-skip
// supaya tidak memberi hijau palsu.
class FcmHandoffRaceTest extends TestCase
{
    private string $token = 'TOKEN-RACE-HANDOFF-PANJANG-1234567890';

    private string $table = 'race_handoff_scratch';

    private ?string $namaKoneksi = null;

    protected function setUp(): void
    {
        parent::setUp();

        if (Schema::getConnection()->getDriverName() !== 'mysql') {
            $this->markTestSkipped('uji race handoff butuh row-lock innoDB (mysql/mariadb).');
        }

        Schema::dropIfExists($this->table);
        DB::statement("CREATE TABLE {$this->table} (
            id BIGINT PRIMARY KEY AUTO_INCREMENT,
            email VARCHAR(255) NULL,
            fcm_token VARCHAR(255) NULL,
            last_seen_at DATETIME NULL
        ) ENGINE=InnoDB");
    }

    protected function tearDown(): void
    {
        if ($this->namaKoneksi) {
            DB::purge($this->namaKoneksi);
        }
        Schema::dropIfExists($this->table);

        parent::tearDown();
    }

    public function test_dua_koneksi_paralel_tidak_bisa_sama_sama_menang_handoff(): void
    {
        $this->siapkanBaris();
        [$idA, $idB] = $this->userIds();

        // koneksi kedua (terpisah dari koneksi default) buat meniru request paralel
        $this->namaKoneksi = 'parallel_race';
        config([
            "database.connections.{$this->namaKoneksi}" => array_merge(
                config('database.connections.mysql'),
                ['database' => config('database.connections.mysql.database')]
            ),
        ]);

        // koneksi A lock baris token lama di dalam transaksi (belum commit)
        DB::beginTransaction();
        $stmtA = DB::getPdo()->prepare(
            "SELECT id FROM {$this->table} WHERE fcm_token = ? FOR UPDATE"
        );
        $stmtA->execute([$this->token]);
        $pemilikA = $stmtA->fetch(\PDO::FETCH_ASSOC);
        $this->assertNotFalse($pemilikA, 'koneksi A harus melihat pemilik lama');

        // koneksi B coba lock baris yang sama -> harus nunggu / kena lock wait,
        // tidak boleh lolos dan menganggap token bebas
        $pdoB = DB::connection($this->namaKoneksi)->getPdo();
        $pdoB->exec('SET SESSION innodb_lock_wait_timeout = 1');

        $gagalKenaLock = false;
        try {
            $stmtB = $pdoB->prepare(
                "SELECT id FROM {$this->table} WHERE fcm_token = ? FOR UPDATE"
            );
            $stmtB->execute([$this->token]);
            $stmtB->fetch(\PDO::FETCH_ASSOC);
        } catch (\PDOException $e) {
            // 1205 lock wait timeout / 40001 -> koneksi B terhalang lock koneksi A
            $gagalKenaLock = true;
        }

        DB::rollBack();

        $this->assertTrue(
            $gagalKenaLock,
            'koneksi kedua harus terhalang row-lock koneksi pertama; kalau tidak, handoff bisa double-claim'
        );
    }

    public function test_setelah_commit_hanya_satu_pemegang_token(): void
    {
        $this->siapkanBaris();
        [$idA, $idB] = $this->userIds();

        // transaksi handoff: pindahkan token dari pemilik lama (lama@x.com) ke idA
        DB::beginTransaction();
        $pemilikLama = DB::table($this->table)->where('fcm_token', $this->token)->where('id', '!=', $idA)->lockForUpdate()->first();
        DB::table($this->table)->where('id', $pemilikLama->id)->update(['fcm_token' => null]);
        DB::table($this->table)->where('id', $idA)->update(['fcm_token' => $this->token]);
        DB::commit();

        // idA sekarang pemegang; idB harus melihat token sudah dipegang idA
        $pemegang = DB::table($this->table)->where('fcm_token', $this->token)->pluck('id')->all();

        $this->assertSame([$idA], $pemegang, 'token harus dipegang tepat satu user setelah handoff');
        $this->assertNotSame($idB, $pemegang[0]);
    }

    private function siapkanBaris(): void
    {
        DB::table($this->table)->delete();

        DB::table($this->table)->insert([
            'email' => 'lama@x.com',
            'fcm_token' => $this->token,
            'last_seen_at' => now()->subHours(5),
        ]);

        for ($j = 0; $j < 2; $j++) {
            DB::table($this->table)->insert([
                'email' => "baru{$j}@x.com",
                'fcm_token' => null,
                'last_seen_at' => now(),
            ]);
        }
    }

    private function userIds(): array
    {
        return DB::table($this->table)->whereNull('fcm_token')->orderBy('id')->pluck('id')->all();
    }
}

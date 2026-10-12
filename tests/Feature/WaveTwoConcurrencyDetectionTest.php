<?php

namespace Tests\Feature;

use App\Broadcasting\FcmChannel;
use App\Models\User;
use Illuminate\Database\ConcurrencyErrorDetector;
use Illuminate\Database\DeadlockException;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Notifications\AnonymousNotifiable;
use Illuminate\Support\Facades\DB;
use PDOException;
use Tests\TestCase;

// regresi temuan akechi(red) vektor 4: error concurrency db tidak boleh bocor jadi 500.
// deadlock, lock wait timeout (mysql 1205), dan database is locked (sqlite) semua harus
// dipetakan ke 409 di saveFcmToken. plus regresi fcmchannel: token baru tidak boleh
// ikut terhapus saat fcm balas unregistered untuk token lama.
class WaveTwoConcurrencyDetectionTest extends TestCase
{
    use RefreshDatabase;

    private function buatUser(array $overrides = []): User
    {
        return User::factory()->create(array_merge([
            'role' => 'user',
        ], $overrides));
    }

    // --- detektor concurrency dipakai controller ---

    public function test_detektor_concurrency_mengenali_lock_wait_timeout_mysql(): void
    {
        $detector = app(ConcurrencyErrorDetector::class);

        $e = new PDOException('SQLSTATE[HY000]: General error: 1205 Lock wait timeout exceeded; try restarting transaction');

        $this->assertTrue($detector->causedByConcurrencyError($e));
    }

    public function test_detektor_concurrency_mengenali_deadlock_victim(): void
    {
        $detector = app(ConcurrencyErrorDetector::class);

        $e = new PDOException('Deadlock found when trying to get lock; try restarting transaction');

        $this->assertTrue($detector->causedByConcurrencyError($e));
    }

    public function test_detektor_concurrency_mengenali_database_is_locked_sqlite(): void
    {
        $detector = app(ConcurrencyErrorDetector::class);

        $e = new PDOException('SQLSTATE[HY000]: General error: 5 database is locked');

        $this->assertTrue($detector->causedByConcurrencyError($e));
    }

    public function test_deadlock_exception_laravel_extends_pdo_bukan_query_exception(): void
    {
        // ini alasan utama tambalan: DeadlockException extends PDOException,
        // jadi catch(QueryException) biasa akan meleset dan membocorkan 500.
        $this->assertInstanceOf(PDOException::class, new DeadlockException('x'));
    }

    public function test_save_fcm_token_memeta_deadlock_ke_409_bukan_500(): void
    {
        $user = $this->buatUser(['fcm_token' => null]);

        // paksa transaksi melempar deadlock nyata (PDOException, bukan QueryException)
        DB::shouldReceive('transaction')
            ->once()
            ->andThrow(new DeadlockException('Deadlock found when trying to get lock; try restarting transaction'));

        $resp = $this->actingAs($user)->postJson(route('notifications.saveFcmToken'), [
            'fcm_token' => 'TOKEN-DEADLOCK-PANJANG-1234567890',
        ]);

        $resp->assertStatus(409);
        $resp->assertJson(['success' => false]);
        $this->assertNull($user->fresh()->fcm_token);
    }

    public function test_save_fcm_token_memeta_lock_wait_timeout_ke_409(): void
    {
        $user = $this->buatUser(['fcm_token' => null]);

        DB::shouldReceive('transaction')
            ->once()
            ->andThrow(new PDOException('SQLSTATE[HY000]: General error: 1205 Lock wait timeout exceeded; try restarting transaction'));

        $resp = $this->actingAs($user)->postJson(route('notifications.saveFcmToken'), [
            'fcm_token' => 'TOKEN-LOCKWAIT-PANJANG-1234567890',
        ]);

        $resp->assertStatus(409);
    }

    public function test_save_fcm_token_memeta_database_locked_ke_409(): void
    {
        $user = $this->buatUser(['fcm_token' => null]);

        DB::shouldReceive('transaction')
            ->once()
            ->andThrow(new PDOException('SQLSTATE[HY000]: General error: 5 database is locked'));

        $resp = $this->actingAs($user)->postJson(route('notifications.saveFcmToken'), [
            'fcm_token' => 'TOKEN-LOCKED-PANJANG-1234567890',
        ]);

        $resp->assertStatus(409);
    }

    public function test_save_fcm_token_error_lain_tetap_dilempar_bukan_disamarkan_409(): void
    {
        $user = $this->buatUser(['fcm_token' => null]);

        // bug tak terduga yang bukan concurrency error harus tetap meledak,
        // jangan sampai ditelan jadi 409 palsu.
        DB::shouldReceive('transaction')
            ->once()
            ->andThrow(new \RuntimeException('koneksi db mati total'));

        $this->withoutExceptionHandling();

        $this->expectException(\RuntimeException::class);

        $this->actingAs($user)->postJson(route('notifications.saveFcmToken'), [
            'fcm_token' => 'TOKEN-BUG-BUKAN-CONCURRENCY-PANJANG-1234567890',
        ]);
    }

    // --- fcmchannel match-check (berbasis baris db, anti race vektor 5) ---

    public function test_fcmchannel_null_out_token_saat_token_yang_dikirim_masih_sama(): void
    {
        $user = $this->buatUser(['fcm_token' => 'TOKEN-LAMA-KADALUARSA-1234567890']);

        $channel = new FcmChannel;

        // fcm balas unregistered untuk token yang persis masih tersimpan di db
        $this->panggilBersihkanToken($channel, $user, 'TOKEN-LAMA-KADALUARSA-1234567890', 'UNREGISTERED', 404);

        $this->assertNull($user->fresh()->fcm_token, 'token kadaluarsa harus dibersihkan');
    }

    public function test_fcmchannel_tidak_hapus_token_baru_saat_objek_masih_pegang_token_lama(): void
    {
        // skenario race vektor 5: job notifikasi pegang snapshot user bertoken lama,
        // tapi user sudah ganti device dan simpan token baru di db sebelum fcm balas.
        $user = $this->buatUser(['fcm_token' => 'TOKEN-LAMA-KADALUARSA-1234567890']);

        // simulasikan device baru menyimpan token baru di db sementara $user masih snapshot lama
        DB::table('users')->where('id', $user->id)->update(['fcm_token' => 'TOKEN-BARU-VALID-PANJANG-0987654321']);

        $channel = new FcmChannel;

        // fcm balas unregistered untuk token lama yang dikirim job
        $this->panggilBersihkanToken($channel, $user, 'TOKEN-LAMA-KADALUARSA-1234567890', 'UNREGISTERED', 404);

        // token baru yang valid di db tidak boleh ikut terhapus
        $this->assertSame('TOKEN-BARU-VALID-PANJANG-0987654321', $user->fresh()->fcm_token, 'token baru valid tidak boleh ikut terhapus oleh job stale');
    }

    public function test_fcmchannel_tidak_hapus_token_saat_error_bukan_unregistered(): void
    {
        $user = $this->buatUser(['fcm_token' => 'TOKEN-TETAP-PANJANG-1234567890']);

        $channel = new FcmChannel;

        // error server biasa (500) bukan unregistered -> token jangan disentuh
        $this->panggilBersihkanToken($channel, $user, 'TOKEN-TETAP-PANJANG-1234567890', 'INTERNAL', 500);

        $this->assertSame('TOKEN-TETAP-PANJANG-1234567890', $user->fresh()->fcm_token);
    }

    public function test_fcmchannel_aman_untuk_notifiable_bukan_model(): void
    {
        $channel = new FcmChannel;

        // anonymous notifiable (bukan eloquent model) tidak boleh meledak
        $anon = new AnonymousNotifiable;

        $this->panggilBersihkanToken($channel, $anon, 'TOKEN-APA-SAJAR-PANJANG-1234567890', 'UNREGISTERED', 404);

        $this->assertTrue(true, 'tidak boleh throw untuk notifiable non-model');
    }

    public function test_fcmchannel_hormati_global_scope_saat_bersihkan_token(): void
    {
        $user = $this->buatUser(['fcm_token' => 'TOKEN-SCOPE-PANJANG-1234567890']);

        // tambah global scope sementara yang menyembunyikan user ini.
        // pembersihan token wajib hormati scope (pakai newQuery, bukan newQueryWithoutScopes)
        // supaya tidak menembus isolasi tenant/soft delete di masa depan.
        $scope = new class implements Scope
        {
            public function apply(Builder $builder, Model $model): void
            {
                $builder->where('id', '<', 0);
            }
        };

        User::addGlobalScope('uji_isolasi', $scope);

        try {
            $channel = new FcmChannel;
            $this->panggilBersihkanToken($channel, $user, 'TOKEN-SCOPE-PANJANG-1234567890', 'UNREGISTERED', 404);

            // baris disembunyikan scope -> token tidak boleh dihapus
            $this->assertDatabaseHas('users', [
                'id' => $user->id,
                'fcm_token' => 'TOKEN-SCOPE-PANJANG-1234567890',
            ]);
        } finally {
            User::clearBootedModels();
        }
    }

    private function panggilBersihkanToken(FcmChannel $channel, object $notifiable, string $token, ?string $errorCode, int $status): void
    {
        $reflection = new \ReflectionMethod($channel, 'bersihkanTokenKadaluarsa');
        $reflection->setAccessible(true);
        $reflection->invoke($channel, $notifiable, $token, $errorCode, $status);
    }
}

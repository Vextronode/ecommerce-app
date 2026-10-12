<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\FcmTokenManager;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

// regresi temuan 5b (token squat) + verifikasi satu pintu fcm token.
// handoff kepemilikan token hanya boleh jalan kalau pemilik lama sudah tidak aktif.
// sinyal aktif pakai users.last_seen_at, bukan tabel sessions: di produksi
// SESSION_DRIVER=redis sehingga tabel sessions tidak pernah terisi.
class FcmTokenManagerTest extends TestCase
{
    use RefreshDatabase;

    private function manager(): FcmTokenManager
    {
        return app(FcmTokenManager::class);
    }

    private function buatUser(?string $token = null, ?string $lastSeen = null): User
    {
        return User::factory()->create([
            'role' => 'user',
            'password' => Hash::make('rahasia123'),
            'fcm_token' => $token,
            'last_seen_at' => $lastSeen,
        ]);
    }

    public function test_claim_token_milik_user_lain_ditolak_409(): void
    {
        $korban = $this->buatUser('TOKEN-KORBAN-MANAGER-PANJANG-123456', now()->toDateTimeString());
        $penyerang = $this->buatUser(null, now()->toDateTimeString());

        $hasil = $this->manager()->claim($penyerang, 'TOKEN-KORBAN-MANAGER-PANJANG-123456');

        $this->assertSame(FcmTokenManager::DITOLAK_MILIK_ORANG_LAIN, $hasil['status']);
        $this->assertSame('TOKEN-KORBAN-MANAGER-PANJANG-123456', $korban->fresh()->fcm_token);
        $this->assertNull($penyerang->fresh()->fcm_token);
    }

    public function test_guard_claim_menolak_sendiri_tanpa_bantuan_unique_index(): void
    {
        // test ini mengunci guard aplikasi ($ownedByOther), bukan unique index db.
        // unique index sementara dilepas, jadi kalau guard aplikasi rusak/hilang,
        // claim bakal lolos 200 (unique index tidak lagi jadi jaring terakhir).
        $korban = $this->buatUser('TOKEN-GUARD-PANJANG-1234567890', now()->toDateTimeString());
        $penyerang = $this->buatUser(null, now()->toDateTimeString());

        Schema::table('users', function ($table) {
            $table->dropUnique(['fcm_token']);
        });

        $hasil = null;

        try {
            $hasil = $this->manager()->claim($penyerang, 'TOKEN-GUARD-PANJANG-1234567890');
        } finally {
            // bersihkan duplikat (kalau guard bocor) supaya unique index bisa dipasang balik
            DB::table('users')
                ->where('fcm_token', 'TOKEN-GUARD-PANJANG-1234567890')
                ->where('id', '!=', $korban->id)
                ->update(['fcm_token' => null]);

            Schema::table('users', function ($table) {
                $table->unique('fcm_token');
            });
        }

        $this->assertSame(FcmTokenManager::DITOLAK_MILIK_ORANG_LAIN, $hasil['status'], 'guard $ownedByOther harus menolak walau unique index dilepas');
        $this->assertSame('TOKEN-GUARD-PANJANG-1234567890', $korban->fresh()->fcm_token);
        $this->assertNull($penyerang->fresh()->fcm_token);
    }

    public function test_claim_token_sendiri_sukses(): void
    {
        $user = $this->buatUser(null);

        $hasil = $this->manager()->claim($user, 'TOKEN-SENDIRI-MANAGER-PANJANG-123456789');

        $this->assertSame(FcmTokenManager::SUKSES, $hasil['status']);
        $this->assertSame('TOKEN-SENDIRI-MANAGER-PANJANG-123456789', $user->fresh()->fcm_token);
    }

    public function test_clear_mengosongkan_token_user(): void
    {
        $user = $this->buatUser('TOKEN-CLEAR-MANAGER-PANJANG-123456789');

        $this->manager()->clear($user);

        $this->assertNull($user->fresh()->fcm_token);
    }

    public function test_handoff_ke_user_baru_saat_pemilik_lama_tidak_aktif(): void
    {
        // pemilik lama punya token tapi last_seen_at sudah lama (device dijual/pindah)
        $pemilikLama = $this->buatUser('TOKEN-BERSAMA-PANJANG-123456789', now()->subHours(2)->toDateTimeString());
        $userBaru = $this->buatUser(null, now()->toDateTimeString());

        $hasil = $this->manager()->handoffJikaPemilikLamaTidakAktif($userBaru, 'TOKEN-BERSAMA-PANJANG-123456789');

        $this->assertSame(FcmTokenManager::SUKSES, $hasil['status']);
        $this->assertSame('TOKEN-BERSAMA-PANJANG-123456789', $userBaru->fresh()->fcm_token);
        $this->assertNull($pemilikLama->fresh()->fcm_token);
    }

    public function test_handoff_ke_user_baru_saat_pemilik_lama_belum_pernah_login(): void
    {
        // last_seen_at null dianggap tidak aktif (device baru / belum ada heartbeat)
        $pemilikLama = $this->buatUser('TOKEN-NULL-SEEN-PANJANG-1234567890', null);
        $userBaru = $this->buatUser(null, now()->toDateTimeString());

        $hasil = $this->manager()->handoffJikaPemilikLamaTidakAktif($userBaru, 'TOKEN-NULL-SEEN-PANJANG-1234567890');

        $this->assertSame(FcmTokenManager::SUKSES, $hasil['status']);
        $this->assertSame('TOKEN-NULL-SEEN-PANJANG-1234567890', $userBaru->fresh()->fcm_token);
    }

    public function test_handoff_ditolak_saat_pemilik_lama_masih_aktif(): void
    {
        // pemilik lama baru aktif -> jangan longgar, tetap 409 (anti handoff bypass)
        $pemilikLama = $this->buatUser('TOKEN-AKTIF-PANJANG-1234567890', now()->toDateTimeString());
        $userBaru = $this->buatUser(null, now()->toDateTimeString());

        $hasil = $this->manager()->handoffJikaPemilikLamaTidakAktif($userBaru, 'TOKEN-AKTIF-PANJANG-1234567890');

        $this->assertSame(FcmTokenManager::DITOLAK_MILIK_ORANG_LAIN, $hasil['status']);
        $this->assertSame('TOKEN-AKTIF-PANJANG-1234567890', $pemilikLama->fresh()->fcm_token);
        $this->assertNull($userBaru->fresh()->fcm_token);
    }

    public function test_handoff_menandai_last_seen_at_agar_tidak_bisa_direbut_berantai(): void
    {
        // regresi domino handoff steal: pemenang pertama yang baru login (last_seen_at null/lama)
        // wajib langsung ditandai aktif (last_seen_at = now) supaya request paralel/berikutnya ditolak 409
        $pemilikLama = $this->buatUser('TOKEN-DOMINO-RACE-PANJANG-1234567890', now()->subHours(2)->toDateTimeString());
        $pemenangPertama = $this->buatUser(null, null);
        $penyerangKedua = $this->buatUser(null, null);

        $hasil1 = $this->manager()->handoffJikaPemilikLamaTidakAktif($pemenangPertama, 'TOKEN-DOMINO-RACE-PANJANG-1234567890');
        $hasil2 = $this->manager()->handoffJikaPemilikLamaTidakAktif($penyerangKedua, 'TOKEN-DOMINO-RACE-PANJANG-1234567890');

        $this->assertSame(FcmTokenManager::SUKSES, $hasil1['status']);
        $this->assertSame(FcmTokenManager::DITOLAK_MILIK_ORANG_LAIN, $hasil2['status']);
        $this->assertNotNull($pemenangPertama->fresh()->last_seen_at);
        $this->assertSame('TOKEN-DOMINO-RACE-PANJANG-1234567890', $pemenangPertama->fresh()->fcm_token);
        $this->assertNull($penyerangKedua->fresh()->fcm_token);
    }

    public function test_handoff_token_belum_dimiliki_siapapun_jadi_claim_biasa(): void
    {
        $user = $this->buatUser(null, now()->toDateTimeString());

        $hasil = $this->manager()->handoffJikaPemilikLamaTidakAktif($user, 'TOKEN-BEBAS-PANJANG-1234567890');

        $this->assertSame(FcmTokenManager::SUKSES, $hasil['status']);
        $this->assertSame('TOKEN-BEBAS-PANJANG-1234567890', $user->fresh()->fcm_token);
    }

    public function test_handoff_lewat_login_route_device_switch(): void
    {
        // end to end: pemilik lama token nyangkut & sudah lama tidak aktif,
        // user baru login bawa token itu -> kepemilikan pindah
        $pemilikLama = $this->buatUser('TOKEN-NYANGKUT-PANJANG-123456789', now()->subHours(5)->toDateTimeString());
        $userBaru = $this->buatUser(null, now()->toDateTimeString());

        $this->post(route('login'), [
            'email' => $userBaru->email,
            'password' => 'rahasia123',
            'fcm_token' => 'TOKEN-NYANGKUT-PANJANG-123456789',
        ]);

        $this->assertAuthenticatedAs($userBaru);
        $this->assertSame('TOKEN-NYANGKUT-PANJANG-123456789', $userBaru->fresh()->fcm_token);
        $this->assertNull($pemilikLama->fresh()->fcm_token);
    }

    public function test_login_dengan_token_milik_user_yang_masih_aktif_tidak_dirampas(): void
    {
        // vektor handoff bypass: attacker login bawa token korban yang masih aktif
        // -> token korban TIDAK boleh pindah
        $korban = $this->buatUser('TOKEN-KORBAN-AKTIF-PANJANG-123456', now()->toDateTimeString());
        $penyerang = $this->buatUser(null, now()->toDateTimeString());

        $this->post(route('login'), [
            'email' => $penyerang->email,
            'password' => 'rahasia123',
            'fcm_token' => 'TOKEN-KORBAN-AKTIF-PANJANG-123456',
        ]);

        $this->assertAuthenticatedAs($penyerang);
        $this->assertSame('TOKEN-KORBAN-AKTIF-PANJANG-123456', $korban->fresh()->fcm_token);
        $this->assertNull($penyerang->fresh()->fcm_token);
    }

    public function test_logout_mengosongkan_token(): void
    {
        $user = $this->buatUser('TOKEN-LOGOUT-PANJANG-1234567890', now()->toDateTimeString());

        $this->actingAs($user)->post(route('logout'));

        $this->assertNull($user->fresh()->fcm_token);
    }

    public function test_clear_if_no_active_session_mengosongkan_token_saat_activity_basi(): void
    {
        $user = $this->buatUser('TOKEN-CLEAR-BASI-PANJANG-1234567890', now()->subMinutes(10)->toDateTimeString());

        $this->manager()->clearIfNoActiveSession($user);

        $this->assertNull($user->fresh()->fcm_token);
    }

    public function test_clear_if_no_active_session_mempertahankan_token_saat_activity_baru(): void
    {
        // heartbeat baru: token perangkat lain tidak boleh dicabut.
        $user = $this->buatUser('TOKEN-CLEAR-BARU-PANJANG-1234567890', now()->toDateTimeString());

        $this->manager()->clearIfNoActiveSession($user);

        $this->assertSame('TOKEN-CLEAR-BARU-PANJANG-1234567890', $user->fresh()->fcm_token);
    }

    public function test_clear_if_no_active_session_tidak_menyentuh_token_baru_user_lain(): void
    {
        // conditional update memakai where fcm_token = token pemilik objek, jadi
        // kalau token objek sudah basi/dipindah ke orang lain, clear tidak mencabut
        // token yang sekarang dipegang user lain.
        $user = $this->buatUser('TOKEN-LAMA-CLEAR-PANJANG-1234567890', now()->subMinutes(10)->toDateTimeString());

        // objek basi meniru instance yang dipegang proses lain sebelum token berganti
        $objekBasi = User::find($user->id);
        $objekBasi->fcm_token = 'TOKEN-LAMA-CLEAR-PANJANG-1234567890';
        $objekBasi->last_seen_at = now()->subMinutes(10);

        $user->forceFill(['fcm_token' => 'TOKEN-BARU-PANGGANTI-1234567890'])->save();

        $this->manager()->clearIfNoActiveSession($objekBasi);

        $this->assertSame('TOKEN-BARU-PANGGANTI-1234567890', $user->fresh()->fcm_token);
    }
}

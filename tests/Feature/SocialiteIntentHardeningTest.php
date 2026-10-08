<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as SocialiteUser;
use Tests\TestCase;

// regresi akechi(red): intent link wajib sekali pakai, punya ttl, terikat session id, dan tersimpan server-side
class SocialiteIntentHardeningTest extends TestCase
{
    use RefreshDatabase;

    private function fakeGoogle(string $email, string $googleId, ?string $name = 'Google User'): void
    {
        $user = new SocialiteUser;
        $user->id = $googleId;
        $user->name = $name;
        $user->email = $email;
        $user->user = ['email_verified' => true];

        // Socialite::fake bisa dipanggil ulang sehingga provider diganti per callback,
        // tidak seperti shouldReceive yang mengunci mock pertama.
        Socialite::fake('google', $user);
    }

    public function test_intent_kedaluwarsa_setelah_ttl(): void
    {
        $user = User::factory()->create([
            'email' => 'ttl@gmail.com',
            'role' => 'user',
            'google_id' => null,
            'password' => Hash::make('rahasia123'),
        ]);

        $this->fakeGoogle('ttl@gmail.com', 'GOOGLE-TTL');
        $this->get(route('google.callback'))->assertRedirect(route('google.link.confirm'));

        $nonce = (string) session('socialite.link_intent');

        // lewat 10 menit -> intent harus mati
        $this->travel(11)->minutes();

        $resp = $this->post(route('google.link.confirmed'), ['password' => 'rahasia123', 'nonce' => $nonce]);
        $user->refresh();

        $resp->assertRedirect('/login');
        $resp->assertSessionHasErrors('email');
        $this->assertGuest();
        $this->assertNull($user->google_id);
    }

    public function test_masih_valid_di_dalam_ttl(): void
    {
        $user = User::factory()->create([
            'email' => 'valid@gmail.com',
            'role' => 'user',
            'google_id' => null,
            'password' => Hash::make('rahasia123'),
        ]);

        $this->fakeGoogle('valid@gmail.com', 'GOOGLE-VALID');
        $this->get(route('google.callback'));

        $nonce = (string) session('socialite.link_intent');

        $this->travel(9)->minutes();

        $resp = $this->post(route('google.link.confirmed'), ['password' => 'rahasia123', 'nonce' => $nonce]);
        $user->refresh();

        $resp->assertRedirect(route('dashboard'));
        $this->assertAuthenticated();
        $this->assertSame($user->id, auth()->id());
        $this->assertEquals('GOOGLE-VALID', $user->google_id);
    }

    public function test_callback_kedua_benar_benar_menimpa_intent_dengan_user_baru(): void
    {
        User::factory()->create([
            'email' => 'korban@gmail.com',
            'role' => 'user',
            'google_id' => null,
            'password' => Hash::make('rahasia123'),
        ]);
        $lain = User::factory()->create([
            'email' => 'lain@gmail.com',
            'role' => 'user',
            'google_id' => null,
            'password' => Hash::make('rahasia456'),
        ]);

        // callback pertama (korban) -> intent korban
        $this->fakeGoogle('korban@gmail.com', 'GOOGLE-KORBAN');
        $this->get(route('google.callback'));
        $nonceKorban = (string) session('socialite.link_intent');

        // callback kedua di sesi yang sama (akun lain) -> pointer nonce harus ganti
        $this->fakeGoogle('lain@gmail.com', 'GOOGLE-LAIN');
        $this->get(route('google.callback'));
        $nonceBaru = (string) session('socialite.link_intent');

        $this->assertNotSame($nonceKorban, $nonceBaru);

        // intent lama harus sudah dibuang dari store server-side
        $this->assertNull(Cache::get('socialite_link_intent:'.$nonceKorban));

        // submit nonce baru -> hanya user intent terakhir yang ketaut
        $resp = $this->post(route('google.link.confirmed'), ['password' => 'rahasia456', 'nonce' => $nonceBaru]);
        $resp->assertRedirect(route('dashboard'));
        $this->assertSame($lain->id, auth()->id());
        $this->assertEquals('GOOGLE-LAIN', $lain->fresh()->google_id);
    }

    public function test_nonce_salah_ditolak(): void
    {
        $user = User::factory()->create([
            'email' => 'nonce@gmail.com',
            'role' => 'user',
            'google_id' => null,
            'password' => Hash::make('rahasia123'),
        ]);

        $this->fakeGoogle('nonce@gmail.com', 'GOOGLE-NONCE');
        $this->get(route('google.callback'));

        $resp = $this->post(route('google.link.confirmed'), ['password' => 'rahasia123', 'nonce' => 'nonce-palsu']);
        $user->refresh();

        $resp->assertRedirect('/login');
        $this->assertGuest();
        $this->assertNull($user->google_id);
    }

    public function test_intent_sekali_pakai_tidak_bisa_replay(): void
    {
        $user = User::factory()->create([
            'email' => 'replay@gmail.com',
            'role' => 'user',
            'google_id' => null,
            'password' => Hash::make('rahasia123'),
        ]);

        $this->fakeGoogle('replay@gmail.com', 'GOOGLE-REPLAY');
        $this->get(route('google.callback'));

        $nonce = (string) session('socialite.link_intent');

        // submit pertama sukses
        $this->post(route('google.link.confirmed'), ['password' => 'rahasia123', 'nonce' => $nonce])
            ->assertRedirect(route('dashboard'));

        // intent sudah dibuang dari session + store server-side
        $this->assertNull(session('socialite.link_intent'));
        $this->assertNull(Cache::get('socialite_link_intent:'.$nonce));

        auth()->logout();

        // submit kedua dengan nonce yang sama harus gagal (intent sudah dihapus)
        $resp = $this->post(route('google.link.confirmed'), ['password' => 'rahasia123', 'nonce' => $nonce]);
        $resp->assertRedirect('/login');
        $this->assertGuest();
    }

    public function test_nonce_baru_setelah_intent_ditimpa_hanya_menautkan_user_intent_terakhir(): void
    {
        $korban = User::factory()->create([
            'email' => 'korban@gmail.com',
            'role' => 'user',
            'google_id' => null,
            'password' => Hash::make('rahasia123'),
        ]);
        $lain = User::factory()->create([
            'email' => 'lain@gmail.com',
            'role' => 'user',
            'google_id' => null,
            'password' => Hash::make('rahasia456'),
        ]);

        // intent korban ditimpa intent lain di sesi yang sama
        $this->fakeGoogle('korban@gmail.com', 'GOOGLE-KORBAN');
        $this->get(route('google.callback'));

        $this->fakeGoogle('lain@gmail.com', 'GOOGLE-LAIN');
        $this->get(route('google.callback'));
        $nonceBaru = (string) session('socialite.link_intent');

        // submit nonce baru -> harus menautkan ke user intent terakhir, korban tidak tersentuh
        $resp = $this->post(route('google.link.confirmed'), ['password' => 'rahasia456', 'nonce' => $nonceBaru]);

        $korban->refresh();
        $lain->refresh();

        $resp->assertRedirect(route('dashboard'));
        $this->assertAuthenticated();
        $this->assertSame($lain->id, auth()->id());
        $this->assertEquals('GOOGLE-LAIN', $lain->google_id);
        $this->assertNull($korban->google_id);
    }

    public function test_nonce_valid_tapi_klien_penyerang_beda_fingerprint_ditolak(): void
    {
        $user = User::factory()->create([
            'email' => 'binding@gmail.com',
            'role' => 'user',
            'google_id' => null,
            'password' => Hash::make('rahasia123'),
        ]);

        // intent dibuat klien sah
        $this->fakeGoogle('binding@gmail.com', 'GOOGLE-BINDING');
        $this->get(route('google.callback'));
        $nonce = (string) session('socialite.link_intent');

        // klien penyerang: user agent + ip beda, bawa nonce yang sama
        $resp = $this->withHeaders([
            'User-Agent' => 'AttackerBrowser/1.0',
            'X-Forwarded-For' => '203.0.113.77',
        ])->post(route('google.link.confirmed'), ['password' => 'rahasia123', 'nonce' => $nonce]);
        $user->refresh();

        $resp->assertRedirect('/login');
        $this->assertGuest();
        $this->assertNull($user->google_id);
    }

    public function test_role_drift_ditolak_saat_link_confirmed(): void
    {
        $user = User::factory()->create([
            'email' => 'drifter@gmail.com',
            'role' => 'user',
            'google_id' => null,
            'password' => Hash::make('rahasia123'),
        ]);

        $this->fakeGoogle('drifter@gmail.com', 'GOOGLE-MILIK-ATTACKER');
        $this->get(route('google.callback'))->assertRedirect(route('google.link.confirm'));
        $nonce = (string) session('socialite.link_intent');

        // korban dipromosikan jadi admin di sela window intent
        $user->forceFill(['role' => 'admin'])->save();

        $resp = $this->post(route('google.link.confirmed'), ['password' => 'rahasia123', 'nonce' => $nonce]);
        $user->refresh();

        $resp->assertRedirect('/login');
        $resp->assertSessionHasErrors('email');
        $this->assertGuest();
        $this->assertNull($user->google_id);
    }

    public function test_intent_expired_dibuang_dari_store_saat_diakses(): void
    {
        $user = User::factory()->create([
            'email' => 'bersih@gmail.com',
            'role' => 'user',
            'google_id' => null,
            'password' => Hash::make('rahasia123'),
        ]);

        $this->fakeGoogle('bersih@gmail.com', 'GOOGLE-BERSIH');
        $this->get(route('google.callback'));
        $this->assertNotNull(session('socialite.link_intent'));

        $this->travel(11)->minutes();

        // memicu resolveIntent lewat confirmLink -> intent expired harus ditolak
        $this->get(route('google.link.confirm'))->assertRedirect('/login');

        $user->refresh();
        $this->assertNull($user->google_id);
        $this->assertGuest();
    }
}

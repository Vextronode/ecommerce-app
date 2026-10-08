<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Socialite\Contracts\User as SocialiteUser;
use Laravel\Socialite\Facades\Socialite;
use Mockery;
use Tests\TestCase;

class SocialiteLinkEdgeCaseTest extends TestCase
{
    use RefreshDatabase;

    private function fakeGoogle(string $email, string $googleId, ?bool $verified = true, ?string $name = 'Google User'): void
    {
        $raw = $verified === null ? [] : ['email_verified' => $verified];

        $abstract = Mockery::mock(SocialiteUser::class);
        $abstract->shouldReceive('getEmail')->andReturn($email);
        $abstract->shouldReceive('getUser')->andReturn($raw);
        $abstract->shouldReceive('getName')->andReturn($name);
        $abstract->email = $email;
        $abstract->id = $googleId;
        $abstract->name = $name;
        $abstract->user = $raw;

        Socialite::shouldReceive('driver')->andReturnSelf();
        Socialite::shouldReceive('redirectUrl')->andReturnSelf();
        Socialite::shouldReceive('user')->andReturn($abstract);
    }

    private function nonceFromSession(): string
    {
        return (string) session('socialite.link_intent');
    }

    public function test_link_confirmed_tanpa_intent_redirect_login_dan_tidak_menautkan(): void
    {
        $korban = User::factory()->create([
            'email' => 'korban@gmail.com',
            'role' => 'user',
            'google_id' => null,
            'password' => Hash::make('rahasia123'),
        ]);

        // langsung post tanpa lewat callback -> tidak ada intent di session
        $resp = $this->post(route('google.link.confirmed'), ['password' => 'rahasia123']);
        $korban->refresh();

        $resp->assertRedirect('/login');
        $resp->assertSessionHasErrors('email');
        $this->assertGuest();
        $this->assertNull($korban->google_id);
    }

    public function test_link_confirm_get_tanpa_intent_redirect_login(): void
    {
        $resp = $this->get(route('google.link.confirm'));

        $resp->assertRedirect('/login');
        $resp->assertSessionHasErrors('email');
    }

    public function test_link_confirmed_kalau_user_intent_sudah_dihapus_tidak_crash(): void
    {
        $user = User::factory()->create([
            'email' => 'hilang@gmail.com',
            'role' => 'user',
            'google_id' => null,
            'password' => Hash::make('rahasia123'),
        ]);

        $this->fakeGoogle('hilang@gmail.com', 'GOOGLE-HILANG');
        $this->get(route('google.callback'));

        $nonce = $this->nonceFromSession();

        // user lenyap sebelum submit password (misal admin hapus akun)
        $user->delete();

        $resp = $this->post(route('google.link.confirmed'), ['password' => 'rahasia123', 'nonce' => $nonce]);

        $resp->assertRedirect('/login');
        $resp->assertSessionHasErrors('email');
        $this->assertGuest();
    }

    public function test_link_confirmed_password_benar_tapi_google_id_balapan_ke_user_lain_ditolak(): void
    {
        $korban = User::factory()->create([
            'email' => 'korban@gmail.com',
            'role' => 'user',
            'google_id' => null,
            'password' => Hash::make('rahasia123'),
        ]);

        $this->fakeGoogle('korban@gmail.com', 'GOOGLE-RACE');
        $this->get(route('google.callback'))->assertRedirect(route('google.link.confirm'));

        $nonce = $this->nonceFromSession();

        // concurrency-ish: tepat sebelum submit, google_id yang sama dipakai user lain
        $penyusup = User::factory()->create([
            'email' => 'penyusup@gmail.com',
            'role' => 'user',
            'google_id' => 'GOOGLE-RACE',
        ]);

        $resp = $this->post(route('google.link.confirmed'), ['password' => 'rahasia123', 'nonce' => $nonce]);
        $korban->refresh();
        $penyusup->refresh();

        $resp->assertRedirect('/login');
        $resp->assertSessionHasErrors('email');
        $this->assertGuest();
        $this->assertNull($korban->google_id);
        $this->assertEquals('GOOGLE-RACE', $penyusup->google_id);
    }

    public function test_email_baru_dibuatkan_user_baru_dengan_google_id_terisi_dan_verified(): void
    {
        $this->fakeGoogle('fresh@gmail.com', 'GOOGLE-FRESH', name: 'Pelanggan Fresh');

        $resp = $this->get(route('google.callback'));

        $resp->assertRedirect(route('dashboard'));
        $this->assertAuthenticated();

        $user = User::where('email', 'fresh@gmail.com')->first();
        $this->assertNotNull($user);
        $this->assertEquals('GOOGLE-FRESH', $user->google_id);
        $this->assertEquals('user', $user->role);
        $this->assertNotNull($user->email_verified_at);
    }

    public function test_akun_manual_punya_google_id_lain_tetap_ditolak(): void
    {
        $user = User::factory()->create([
            'email' => 'bentrok@gmail.com',
            'role' => 'user',
            'google_id' => 'GOOGLE-OLD',
        ]);

        $this->fakeGoogle('bentrok@gmail.com', 'GOOGLE-NEW-LAIN');

        $resp = $this->get(route('google.callback'));
        $user->refresh();

        $resp->assertRedirect('/login');
        $resp->assertSessionHasErrors('email');
        $this->assertGuest();
        $this->assertEquals('GOOGLE-OLD', $user->google_id);
    }
}

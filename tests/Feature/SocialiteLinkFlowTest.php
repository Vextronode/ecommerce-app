<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Socialite\Contracts\User as SocialiteUser;
use Laravel\Socialite\Facades\Socialite;
use Mockery;
use Tests\TestCase;

class SocialiteLinkFlowTest extends TestCase
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

    public function test_akun_manual_email_sama_tidak_auto_login_dan_diarahkan_ke_konfirmasi(): void
    {
        $user = User::factory()->create([
            'email' => 'manual@gmail.com',
            'role' => 'user',
            'google_id' => null,
        ]);
        $user->forceFill(['email_verified_at' => null])->save();

        $this->fakeGoogle('manual@gmail.com', 'GOOGLE-MANUAL-1');

        $resp = $this->get(route('google.callback'));
        $user->refresh();

        $resp->assertRedirect(route('google.link.confirm'));
        $this->assertGuest();
        $this->assertNull($user->google_id);
    }

    public function test_password_benar_menautkan_google_id_dan_login(): void
    {
        $user = User::factory()->create([
            'email' => 'manual@gmail.com',
            'role' => 'user',
            'google_id' => null,
            'password' => Hash::make('rahasia123'),
        ]);

        $this->fakeGoogle('manual@gmail.com', 'GOOGLE-MANUAL-2');
        $this->get(route('google.callback'))->assertRedirect(route('google.link.confirm'));

        $resp = $this->post(route('google.link.confirmed'), ['password' => 'rahasia123', 'nonce' => $this->nonceFromSession()]);
        $user->refresh();

        $resp->assertRedirect(route('dashboard'));
        $this->assertAuthenticatedAs($user);
        $this->assertEquals('GOOGLE-MANUAL-2', $user->google_id);
        $this->assertNotNull($user->email_verified_at);
    }

    public function test_password_salah_tidak_menautkan_dan_tidak_login(): void
    {
        $user = User::factory()->create([
            'email' => 'manual@gmail.com',
            'role' => 'user',
            'google_id' => null,
            'password' => Hash::make('rahasia123'),
        ]);

        $this->fakeGoogle('manual@gmail.com', 'GOOGLE-MANUAL-3');
        $this->get(route('google.callback'));

        $resp = $this->post(route('google.link.confirmed'), ['password' => 'salahbanget', 'nonce' => $this->nonceFromSession()]);
        $user->refresh();

        $resp->assertSessionHasErrors('password');
        $this->assertGuest();
        $this->assertNull($user->google_id);
    }

    public function test_google_id_sudah_dipakai_user_lain_ditolak_tanpa_overwrite(): void
    {
        $pemilik = User::factory()->create([
            'email' => 'pemilik@gmail.com',
            'role' => 'user',
            'google_id' => 'GOOGLE-DIPAKAI',
        ]);

        $lain = User::factory()->create([
            'email' => 'lain@gmail.com',
            'role' => 'user',
            'google_id' => null,
        ]);

        $this->fakeGoogle('lain@gmail.com', 'GOOGLE-DIPAKAI');

        $resp = $this->get(route('google.callback'));
        $pemilik->refresh();
        $lain->refresh();

        $resp->assertRedirect('/login');
        $resp->assertSessionHasErrors('email');
        $this->assertGuest();
        $this->assertEquals('GOOGLE-DIPAKAI', $pemilik->google_id);
        $this->assertNull($lain->google_id);
    }

    public function test_akun_sudah_punya_google_id_sama_langsung_login(): void
    {
        $user = User::factory()->create([
            'email' => 'cocok@gmail.com',
            'role' => 'user',
            'google_id' => 'GOOGLE-COCOK',
        ]);

        $this->fakeGoogle('cocok@gmail.com', 'GOOGLE-COCOK');

        $resp = $this->get(route('google.callback'));

        $resp->assertRedirect(route('dashboard'));
        $this->assertAuthenticatedAs($user);
    }

    public function test_provider_tanpa_flag_email_verified_ditolak_fail_closed(): void
    {
        $user = User::factory()->create([
            'email' => 'noverflag@gmail.com',
            'role' => 'user',
            'google_id' => null,
        ]);

        $this->fakeGoogle('noverflag@gmail.com', 'GOOGLE-NOVERFLAG', verified: null);

        $resp = $this->get(route('google.callback'));
        $user->refresh();

        $resp->assertRedirect('/login');
        $resp->assertSessionHasErrors('email');
        $this->assertGuest();
        $this->assertNull($user->google_id);
    }

    public function test_email_baru_dibuatkan_user_baru(): void
    {
        $this->fakeGoogle('baru@gmail.com', 'GOOGLE-BARU', name: 'Pelanggan Baru');

        $resp = $this->get(route('google.callback'));

        $resp->assertRedirect(route('dashboard'));
        $this->assertAuthenticated();

        $user = User::where('email', 'baru@gmail.com')->first();
        $this->assertNotNull($user);
        $this->assertEquals('GOOGLE-BARU', $user->google_id);
        $this->assertEquals('user', $user->role);
        $this->assertNotNull($user->email_verified_at);
    }
}

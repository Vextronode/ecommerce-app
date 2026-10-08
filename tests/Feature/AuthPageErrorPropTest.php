<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Laravel\Socialite\Contracts\User as SocialiteUser;
use Laravel\Socialite\Facades\Socialite;
use Mockery;
use Tests\TestCase;

class AuthPageErrorPropTest extends TestCase
{
    use RefreshDatabase;

    /**
     * error redirect socialite harus sampai ke prop `errors` halaman login,
     * bukan cuma nyangkut di session flash. assertInertia membuktikan prop
     * benar-benar dikirim ke React, beda dengan assertSessionHasErrors yang
     * cuma membaca flash dan bisa lolos walau ui buta.
     */
    public function test_error_redirect_google_tampil_di_prop_errors_halaman_login(): void
    {
        $this->get('/auth/google/callback')->assertRedirect('/login');

        $this->get('/login')
            ->assertInertia(fn (Assert $page) => $page
                ->component('Auth/Login')
                ->where('errors.email', 'Gagal login pakai Google.')
            );
    }

    public function test_email_google_belum_verifikasi_tampil_di_prop_errors_halaman_login(): void
    {
        $raw = ['email_verified' => false];
        $abstract = Mockery::mock(SocialiteUser::class);
        $abstract->shouldReceive('getEmail')->andReturn('belum@gmail.com');
        $abstract->shouldReceive('getUser')->andReturn($raw);
        $abstract->shouldReceive('getName')->andReturn('Google User');
        $abstract->email = 'belum@gmail.com';
        $abstract->id = 'GOOGLE-BELUM';
        $abstract->name = 'Google User';
        $abstract->user = $raw;

        Socialite::shouldReceive('driver')->andReturnSelf();
        Socialite::shouldReceive('redirectUrl')->andReturnSelf();
        Socialite::shouldReceive('user')->andReturn($abstract);

        $this->get('/auth/google/callback')->assertRedirect('/login');

        $this->get('/login')
            ->assertInertia(fn (Assert $page) => $page
                ->component('Auth/Login')
                ->where('errors.email', 'Email akun Google Anda belum terverifikasi.')
            );
    }

    public function test_prop_errors_kosong_di_halaman_login_normal(): void
    {
        $this->get('/login')
            ->assertInertia(fn (Assert $page) => $page
                ->component('Auth/Login')
                ->where('errors', fn ($errors) => $errors->isEmpty())
            );
    }
}

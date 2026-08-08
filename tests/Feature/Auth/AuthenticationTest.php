<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_screen_can_be_rendered(): void
    {
        $response = $this->get('/login');

        $response->assertStatus(200);
    }

    public function test_users_can_authenticate_using_the_login_screen(): void
    {
        $user = User::factory()->create();

        $response = $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard', absolute: false));
    }

    public function test_users_can_not_authenticate_with_invalid_password(): void
    {
        $user = User::factory()->create();

        $this->post('/login', [
            'email' => $user->email,
            'password' => 'wrong-password',
        ]);

        $this->assertGuest();
    }

    public function test_users_can_logout(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post('/logout');

        $this->assertGuest();
        $response->assertRedirect(route('login'));
    }

    public function test_user_login_rejects_merchant_accounts(): void
    {
        $merchant = User::factory()->create([
            'role' => 'pedagang',
        ]);

        $response = $this->post('/login', [
            'email' => $merchant->email,
            'password' => 'password',
            'expected_role' => 'user',
        ]);

        $this->assertGuest();
        $response->assertSessionHasErrors('email');
    }

    public function test_merchant_login_rejects_user_accounts(): void
    {
        $user = User::factory()->create([
            'role' => 'user',
        ]);

        $response = $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
            'expected_role' => 'pedagang',
        ]);

        $this->assertGuest();
        $response->assertSessionHasErrors('email');
    }

    public function test_admin_cannot_authenticate_from_the_default_user_login_screen(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
        ]);

        $response = $this->post('/login', [
            'email' => $admin->email,
            'password' => 'password',
            'expected_role' => 'user',
        ]);

        $this->assertGuest();
        $response->assertSessionHasErrors('email');
    }

    public function test_merchants_are_redirected_away_from_user_storefront(): void
    {
        $merchant = User::factory()->create([
            'role' => 'pedagang',
        ]);

        $response = $this->actingAs($merchant)->get('/shop');

        $response->assertRedirect('/pedagang/dashboard');
    }

    public function test_merchant_logout_returns_to_merchant_login(): void
    {
        $merchant = User::factory()->create([
            'role' => 'pedagang',
        ]);

        $response = $this
            ->actingAs($merchant)
            ->post('/logout', [
                'source' => 'merchant',
            ]);

        $this->assertGuest();
        $response->assertRedirect(route('merchant.login.view'));
    }
}

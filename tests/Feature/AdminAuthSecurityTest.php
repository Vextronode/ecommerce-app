<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AdminAuthSecurityTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config(['admin.prefix' => 'cibenda-portal']);
    }

    public function test_admin_login_screen_can_be_rendered(): void
    {
        $response = $this->get('/cibenda-portal/login');

        $response->assertStatus(200);
    }

    public function test_common_guessable_admin_urls_return_404(): void
    {
        $this->get('/admin')->assertStatus(404);
        $this->get('/admin/login')->assertStatus(404);
        $this->get('/cibenda-admin')->assertStatus(404);
        $this->get('/login/admin')->assertStatus(404);
    }

    public function test_admin_can_authenticate_with_full_name_email_and_password(): void
    {
        $admin = User::factory()->create([
            'name' => 'Admin CibendaMart',
            'email' => 'admin@cibendamart.com',
            'password' => Hash::make('password123'),
            'role' => 'admin',
        ]);

        $response = $this->post('/login', [
            'name' => 'Admin CibendaMart',
            'email' => 'admin@cibendamart.com',
            'password' => 'password123',
            'expected_role' => 'admin',
        ]);

        $this->assertAuthenticatedAs($admin);
        $response->assertRedirect('/cibenda-portal/dashboard');
    }

    public function test_admin_login_fails_if_full_name_does_not_match(): void
    {
        User::factory()->create([
            'name' => 'Admin CibendaMart',
            'email' => 'admin@cibendamart.com',
            'password' => Hash::make('password123'),
            'role' => 'admin',
        ]);

        $response = $this->post('/login', [
            'name' => 'Wrong Admin Name',
            'email' => 'admin@cibendamart.com',
            'password' => 'password123',
            'expected_role' => 'admin',
        ]);

        $this->assertGuest();
        $response->assertSessionHasErrors('name');
    }

    public function test_non_admin_account_cannot_login_through_admin_portal(): void
    {
        User::factory()->create([
            'name' => 'User Biasa',
            'email' => 'user@gmail.com',
            'password' => Hash::make('password123'),
            'role' => 'user',
        ]);

        $response = $this->post('/login', [
            'name' => 'User Biasa',
            'email' => 'user@gmail.com',
            'password' => 'password123',
            'expected_role' => 'admin',
        ]);

        $this->assertGuest();
        $response->assertSessionHasErrors('email');
    }

    public function test_unauthenticated_user_cannot_access_admin_dashboard(): void
    {
        $response = $this->get('/cibenda-portal/dashboard');

        $response->assertRedirect('/login');
    }

    public function test_regular_user_is_redirected_away_from_admin_dashboard(): void
    {
        $user = User::factory()->create([
            'role' => 'user',
        ]);

        $response = $this->actingAs($user)->get('/cibenda-portal/dashboard');

        $response->assertRedirect('/dashboard');
    }

    public function test_admin_can_access_admin_dashboard(): void
    {
        $admin = User::factory()->create([
            'name' => 'Admin CibendaMart',
            'email' => 'admin@cibendamart.com',
            'role' => 'admin',
            'email_verified_at' => now(),
        ]);

        $response = $this->actingAs($admin)->get('/cibenda-portal/dashboard');

        $response->assertStatus(200);
    }

    public function test_admin_logout_redirects_back_to_admin_login_portal(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
        ]);

        $response = $this->actingAs($admin)->post('/logout', [
            'source' => 'admin',
        ]);

        $this->assertGuest();
        $response->assertRedirect('/cibenda-portal/login');
    }
}

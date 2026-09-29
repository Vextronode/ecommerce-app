<?php

namespace Tests\Feature;

use App\Models\Store;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class MerchantFirstLoginFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_new_merchant_with_temporary_password_is_redirected_to_setup_store(): void
    {
        $user = User::factory()->create([
            'name' => 'Pak Haji Udin',
            'email' => 'toko.udin@cibendamart.com',
            'password' => Hash::make('admin12345'),
            'role' => 'pedagang',
            'is_password_changed' => false,
        ]);

        Store::create([
            'user_id' => $user->id,
            'name' => 'Toko Sembako Berkah',
            'slug' => 'toko-sembako-berkah',
            'subdistrict' => 'Cibenda',
            'sid_status' => 'verified',
        ]);

        // Login sebagai pedagang
        $response = $this->post('/login', [
            'email' => 'toko.udin@cibendamart.com',
            'password' => 'admin12345',
            'expected_role' => 'pedagang',
        ]);

        $this->assertAuthenticatedAs($user);

        // Saat mengakses dashboard, harus di-redirect ke halaman setup-store
        $dashboardResponse = $this->actingAs($user)->get('/pedagang/dashboard');
        $dashboardResponse->assertRedirect(route('merchant.store.setup'));

        // Akses halaman setup-store berhasil
        $setupResponse = $this->actingAs($user)->get('/pedagang/setup-store');
        $setupResponse->assertOk();
    }

    public function test_new_merchant_can_setup_store_and_change_password_then_access_dashboard(): void
    {
        $user = User::factory()->create([
            'name' => 'Pak Haji Udin',
            'email' => 'toko.udin@cibendamart.com',
            'password' => Hash::make('admin12345'),
            'role' => 'pedagang',
            'is_password_changed' => false,
        ]);

        $store = Store::create([
            'user_id' => $user->id,
            'name' => 'Toko Sembako Berkah',
            'slug' => 'toko-sembako-berkah',
            'subdistrict' => 'Cibenda',
            'sid_status' => 'verified',
        ]);

        // Submit form setup store
        $response = $this->actingAs($user)->post('/pedagang/setup-store', [
            'store_name' => 'Toko Sembako Berkah Sukses',
            'password' => 'PasswordBaru#2026',
            'password_confirmation' => 'PasswordBaru#2026',
        ]);

        $response->assertRedirect(route('merchant.dashboard'));

        $user->refresh();
        $this->assertTrue((bool) $user->is_password_changed);
        $this->assertTrue(Hash::check('PasswordBaru#2026', $user->password));

        $store->refresh();
        $this->assertEquals('Toko Sembako Berkah Sukses', $store->name);

        // Setelah setup selesai, pedagang bisa membuka dashboard tanpa redirect
        $dashboardResponse = $this->actingAs($user)->get('/pedagang/dashboard');
        $dashboardResponse->assertOk();
    }
}

<?php

namespace Tests\Feature;

use App\Models\Store;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class MerchantSettingsSecurityTest extends TestCase
{
    use RefreshDatabase;

    protected User $merchantUser;
    protected Store $store;

    protected function setUp(): void
    {
        parent::setUp();

        $this->merchantUser = User::factory()->create([
            'role' => 'pedagang',
            'is_password_changed' => true,
            'email_verified_at' => now(),
            'password' => Hash::make('OldPassword123!'),
        ]);

        $this->store = Store::create([
            'user_id' => $this->merchantUser->id,
            'name' => 'Toko Jaya Mandiri',
            'slug' => 'toko-jaya-mandiri',
            'support_email' => 'cs@tokojaya.com',
            'address' => 'Jl. Pangandaran No. 12',
            'is_active' => true,
        ]);
    }

    public function test_guest_cannot_access_merchant_settings(): void
    {
        $response = $this->get(route('merchant.settings.index'));
        $response->assertRedirect('/pedagang/login');
    }

    public function test_merchant_can_access_settings_with_security_and_notifications(): void
    {
        $response = $this->actingAs($this->merchantUser)->get(route('merchant.settings.index'));
        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Merchant/Settings/Index')
            ->has('merchantUser')
            ->has('merchantStore')
            ->has('notificationSettings')
            ->has('sessions')
        );
    }

    public function test_merchant_can_update_notification_preferences(): void
    {
        $payload = [
            'pesanan_baru' => true,
            'pembayaran_berhasil' => false,
            'pengiriman_pesanan' => true,
            'ulasan_baru' => false,
            'stok_menipis' => true,
            'penarikan_saldo' => true,
        ];

        $response = $this->actingAs($this->merchantUser)
            ->put(route('merchant.settings.notifications.update'), $payload);

        $response->assertSessionHas('success');

        $this->merchantUser->refresh();
        $this->assertTrue($this->merchantUser->notification_settings['pesanan_baru']);
        $this->assertFalse($this->merchantUser->notification_settings['pembayaran_berhasil']);
        $this->assertFalse($this->merchantUser->notification_settings['ulasan_baru']);
    }

    public function test_merchant_can_update_password_with_valid_current_password(): void
    {
        $response = $this->actingAs($this->merchantUser)
            ->put(route('password.update'), [
                'current_password' => 'OldPassword123!',
                'password' => 'NewSecurePass2026!',
                'password_confirmation' => 'NewSecurePass2026!',
            ]);

        $response->assertSessionHasNoErrors();

        $this->merchantUser->refresh();
        $this->assertTrue(Hash::check('NewSecurePass2026!', $this->merchantUser->password));
    }

    public function test_merchant_cannot_update_password_with_wrong_current_password(): void
    {
        $response = $this->actingAs($this->merchantUser)
            ->put(route('password.update'), [
                'current_password' => 'WrongPassword!',
                'password' => 'NewSecurePass2026!',
                'password_confirmation' => 'NewSecurePass2026!',
            ]);

        $response->assertSessionHasErrors(['current_password']);

        $this->merchantUser->refresh();
        $this->assertTrue(Hash::check('OldPassword123!', $this->merchantUser->password));
    }

    public function test_merchant_cannot_logout_other_sessions_with_wrong_password(): void
    {
        $response = $this->actingAs($this->merchantUser)
            ->delete(route('merchant.settings.sessions.destroy'), [
                'password' => 'WrongPassword!',
            ]);

        $response->assertSessionHasErrors(['password']);
    }

    public function test_merchant_can_logout_other_sessions_with_correct_password(): void
    {
        $response = $this->actingAs($this->merchantUser)
            ->delete(route('merchant.settings.sessions.destroy'), [
                'password' => 'OldPassword123!',
            ]);

        $response->assertSessionHas('success');
    }
}

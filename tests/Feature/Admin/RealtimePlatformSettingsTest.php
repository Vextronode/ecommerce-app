<?php

namespace Tests\Feature\Admin;

use App\Events\PlatformSettingsUpdated;
use App\Jobs\ProcessWithdrawalPayout;
use App\Models\PlatformSetting;
use App\Models\Store;
use App\Models\User;
use Database\Seeders\PlatformSettingSeeder;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Str;
use Tests\TestCase;

class RealtimePlatformSettingsTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $merchant;
    protected Store $store;

    protected function setUp(): void
    {
        parent::setUp();

        config(['admin.prefix' => 'cibenda-portal']);
        $this->seed(PlatformSettingSeeder::class);

        $this->admin = User::factory()->create([
            'name' => 'Admin CibendaMart',
            'email' => 'admin@cibendamart.com',
            'role' => 'admin',
        ]);

        $this->merchant = User::factory()->create(['role' => 'pedagang']);
        $this->store = Store::create([
            'user_id' => $this->merchant->id,
            'name' => 'Toko Nelayan Pangandaran',
            'slug' => 'toko-nelayan-'.Str::random(6),
            'bank_name' => 'BCA',
            'bank_account_number' => '1234567890',
            'bank_account_holder' => 'Nelayan Mandiri',
        ]);
        $this->store->forceFill(['available_balance' => 100000, 'pending_balance' => 0])->save();
    }

    public function test_updating_platform_settings_broadcasts_realtime_event_immediately(): void
    {
        Event::fake([PlatformSettingsUpdated::class]);

        $payload = [
            'settings' => [
                ['key' => 'enable_withdrawal', 'value' => false],
                ['key' => 'enable_online_payment', 'value' => false],
            ],
        ];

        $response = $this->actingAs($this->admin)
            ->put(route('admin.settings.update'), $payload);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        Event::assertDispatched(PlatformSettingsUpdated::class, function (PlatformSettingsUpdated $event) {
            $channels = $event->broadcastOn();
            $this->assertCount(1, $channels);
            $this->assertSame('platform-settings', $channels[0]->name);
            $this->assertSame('PlatformSettingsUpdated', $event->broadcastAs());
            $this->assertInstanceOf(ShouldBroadcastNow::class, $event);

            $this->assertArrayHasKey('enable_withdrawal', $event->settings);
            $this->assertFalse($event->settings['enable_withdrawal']);
            $this->assertArrayHasKey('enable_online_payment', $event->settings);
            $this->assertFalse($event->settings['enable_online_payment']);

            $this->assertContains('enable_withdrawal', $event->changedKeys);
            $this->assertContains('enable_online_payment', $event->changedKeys);

            $broadcastData = $event->broadcastWith();
            $this->assertArrayHasKey('changed_keys', $broadcastData);
            $this->assertContains('enable_withdrawal', $broadcastData['changed_keys']);

            return true;
        });
    }

    public function test_merchant_cannot_withdraw_when_withdrawal_killswitch_is_disabled(): void
    {
        PlatformSetting::set('enable_withdrawal', false);

        $response = $this->actingAs($this->merchant)
            ->post(route('merchant.withdrawals.store'), [
                'amount' => 50000,
            ]);

        $response->assertSessionHasErrors([
            'amount' => 'Layanan penarikan saldo pedagang sedang dinonaktifkan sementara oleh admin.',
        ]);

        $this->assertDatabaseMissing('withdrawals', [
            'store_id' => $this->store->id,
            'amount' => 50000,
        ]);
    }

    public function test_merchant_can_withdraw_when_withdrawal_is_enabled(): void
    {
        Queue::fake([ProcessWithdrawalPayout::class]);
        PlatformSetting::set('enable_withdrawal', true);

        $response = $this->actingAs($this->merchant)
            ->post(route('merchant.withdrawals.store'), [
                'amount' => 50000,
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('withdrawals', [
            'store_id' => $this->store->id,
            'amount' => 50000,
            'status' => 'pending',
        ]);

        Queue::assertPushed(ProcessWithdrawalPayout::class);
    }

    public function test_user_cannot_negotiate_when_negotiation_killswitch_is_disabled(): void
    {
        $category = \App\Models\Category::first() ?? \App\Models\Category::create(['name' => 'Ikan', 'slug' => 'ikan']);
        $product = \App\Models\Product::create([
            'store_id' => $this->store->id,
            'category_id' => $category->id,
            'name' => 'Ikan Kembung Segar',
            'slug' => 'ikan-kembung-segar-test',
            'price' => 30000,
            'stock' => 10,
            'is_active' => true,
        ]);

        $buyer = User::factory()->create(['role' => 'user']);
        $room = \App\Models\ChatRoom::create([
            'user_id' => $buyer->id,
            'store_id' => $this->store->id,
            'last_message_at' => now(),
        ]);

        PlatformSetting::set('enable_negotiation', false);

        $response = $this->actingAs($buyer)
            ->postJson("/chat/rooms/{$room->id}/negotiate", [
                'product_id' => $product->id,
                'offered_price' => 25000,
                'quantity' => 1,
            ]);

        $response->assertStatus(403);
        $response->assertJson([
            'message' => 'Fitur tawar-menawar harga sedang dinonaktifkan sementara oleh admin platform.',
        ]);
    }
}

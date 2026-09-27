<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\Store;
use App\Models\User;
use App\Models\Withdrawal;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;
use Tests\TestCase;

class SprintOneSecurityTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test #S2-01: Withdrawal rejects if store already has a pending withdrawal.
     */
    public function test_withdrawal_rejects_when_another_withdrawal_is_pending(): void
    {
        $merchant = User::factory()->create([
            'role' => 'pedagang',
            'is_password_changed' => true,
        ]);

        $store = Store::create([
            'user_id' => $merchant->id,
            'name' => 'Toko Bahari',
            'slug' => 'toko-bahari-'.Str::random(6),
            'available_balance' => 200000,
            'pending_balance' => 0,
            'bank_name' => 'BCA',
            'bank_account_number' => '1234567890',
            'bank_account_holder' => 'Nelayan Bahari',
        ]);

        // Create an existing pending withdrawal
        Withdrawal::create([
            'store_id' => $store->id,
            'reference_no' => 'WD-TEST-001',
            'amount' => 50000,
            'bank_name' => 'BCA',
            'account_number' => '1234567890',
            'account_holder' => 'Nelayan Bahari',
            'status' => 'pending',
        ]);

        // Attempting a second withdrawal must be rejected
        $response = $this->actingAs($merchant)->post(route('merchant.withdrawals.store'), [
            'amount' => 50000,
        ]);

        $response->assertSessionHasErrors('amount');
        $this->assertDatabaseCount('withdrawals', 1);
    }

    /**
     * Test #S2-02: Order model hides payment_payload on array/JSON serialization.
     */
    public function test_order_model_hides_payment_payload_on_serialization(): void
    {
        $buyer = User::factory()->create(['role' => 'user']);
        $merchant = User::factory()->create(['role' => 'pedagang']);
        $store = Store::create([
            'user_id' => $merchant->id,
            'name' => 'Toko Ikan',
            'slug' => 'toko-ikan-'.Str::random(6),
        ]);

        $order = Order::create([
            'store_id' => $store->id,
            'user_id' => $buyer->id,
            'invoice_number' => 'ORD-TEST-SERIALIZE',
            'customer_name' => 'Budi Santoso',
            'customer_phone' => '081234567890',
            'shipping_address' => 'Jl. Pantai Indah No. 1, Pangandaran',
            'delivery_method' => 'local_delivery',
            'subtotal' => 50000,
            'shipping_cost' => 10000,
            'total_amount' => 60000,
            'payment_method' => 'qris',
            'payment_status' => 'pending',
            'shipping_status' => 'pending',
            'payment_payload' => [
                'transaction_id' => 'midtrans-raw-secret-12345',
                'actions' => [['name' => 'generate-qr-code', 'url' => 'https://api.sandbox.midtrans.com']],
            ],
        ]);

        $array = $order->toArray();
        $this->assertArrayNotHasKey('payment_payload', $array);

        $json = json_encode($order);
        $this->assertStringNotContainsString('midtrans-raw-secret-12345', $json);
    }

    /**
     * Test #S2-03: Public tracker masks customer PII for unauthenticated spectators.
     */
    public function test_public_tracker_masks_customer_pii_for_unauthorized_spectator(): void
    {
        $buyer = User::factory()->create(['role' => 'user']);
        $merchant = User::factory()->create(['role' => 'pedagang']);
        $store = Store::create([
            'user_id' => $merchant->id,
            'name' => 'Toko Seafood',
            'slug' => 'toko-seafood-'.Str::random(6),
        ]);

        $order = Order::create([
            'store_id' => $store->id,
            'user_id' => $buyer->id,
            'invoice_number' => 'ORD-PII-TEST-001',
            'customer_name' => 'Ahmad Subagja',
            'customer_phone' => '081234567890',
            'shipping_address' => 'Dusun Karangsari RT 01 RW 02, Desa Pananjung, Kec. Pangandaran',
            'delivery_method' => 'local_delivery',
            'subtotal' => 75000,
            'shipping_cost' => 10000,
            'total_amount' => 85000,
            'payment_method' => 'cod',
            'payment_status' => 'pending',
            'shipping_status' => 'shipped',
        ]);

        // Unauthenticated visitor
        $response = $this->get(route('tracker.show', ['invoice_number' => $order->invoice_number]));
        $response->assertOk();

        $page = $response->viewData('page');
        $orderData = $page['props']['order'];

        // Phone must be masked
        $this->assertNotEquals('081234567890', $orderData['customer_phone']);
        $this->assertStringContainsString('*', $orderData['customer_phone']);

        // Address must have masked indicator
        $this->assertStringContainsString('[Alamat Disamarkan]', $orderData['shipping_address']);
    }

    /**
     * Test #S2-03: Authorized driver sees unmasked PII for delivery.
     */
    public function test_authorized_driver_session_can_view_unmasked_customer_pii(): void
    {
        $buyer = User::factory()->create(['role' => 'user']);
        $merchant = User::factory()->create(['role' => 'pedagang']);
        $store = Store::create([
            'user_id' => $merchant->id,
            'name' => 'Toko Seafood 2',
            'slug' => 'toko-seafood-2-'.Str::random(6),
        ]);

        $order = Order::create([
            'store_id' => $store->id,
            'user_id' => $buyer->id,
            'invoice_number' => 'ORD-PII-TEST-002',
            'customer_name' => 'Ahmad Subagja',
            'customer_phone' => '081234567890',
            'shipping_address' => 'Dusun Karangsari RT 01 RW 02, Desa Pananjung, Kec. Pangandaran',
            'delivery_method' => 'local_delivery',
            'subtotal' => 75000,
            'shipping_cost' => 10000,
            'total_amount' => 85000,
            'payment_method' => 'cod',
            'payment_status' => 'pending',
            'shipping_status' => 'shipped',
        ]);

        // Driver with authorized session
        $response = $this->withSession(["driver_authorized_{$order->invoice_number}" => true])
            ->get(route('tracker.show', ['invoice_number' => $order->invoice_number]));

        $response->assertOk();
        $page = $response->viewData('page');
        $orderData = $page['props']['order'];

        $this->assertEquals('081234567890', $orderData['customer_phone']);
        $this->assertEquals('Ahmad Subagja', $orderData['customer_name']);
        $this->assertEquals('Dusun Karangsari RT 01 RW 02, Desa Pananjung, Kec. Pangandaran', $orderData['shipping_address']);
    }

    /**
     * Test #S2-04: acceptHandover rejects if QR code was not scanned first.
     */
    public function test_accept_handover_rejects_without_qr_scan_session(): void
    {
        $buyer = User::factory()->create(['role' => 'user']);
        $merchant = User::factory()->create(['role' => 'pedagang']);
        $store = Store::create([
            'user_id' => $merchant->id,
            'name' => 'Toko Ikan Handover',
            'slug' => 'toko-handover-'.Str::random(6),
        ]);

        $order = Order::create([
            'store_id' => $store->id,
            'user_id' => $buyer->id,
            'invoice_number' => 'ORD-HANDOVER-001',
            'customer_name' => 'Target Customer',
            'customer_phone' => '0811111111',
            'shipping_address' => 'Pangandaran',
            'delivery_method' => 'local_delivery',
            'subtotal' => 30000,
            'shipping_cost' => 5000,
            'total_amount' => 35000,
            'payment_method' => 'cod',
            'payment_status' => 'pending',
            'shipping_status' => 'processing',
        ]);

        // Direct POST to accept-handover without QR scan session must be rejected with 403
        $response = $this->post(route('tracker.acceptHandover', ['invoice_number' => $order->invoice_number]));
        $response->assertStatus(403);

        // Now simulate scanning the signed QR handover route
        $signedUrl = URL::signedRoute('tracker.handover', ['invoice_number' => $order->invoice_number]);
        $scanResponse = $this->get($signedUrl);
        $scanResponse->assertOk();

        // Now acceptHandover in that session must succeed
        $acceptResponse = $this->post(route('tracker.acceptHandover', ['invoice_number' => $order->invoice_number]));
        $acceptResponse->assertRedirect(route('tracker.show', ['invoice_number' => $order->invoice_number]));
    }

    /**
     * Test #S2-05: HandleInertiaRequests does not share is_password_changed.
     */
    public function test_inertia_global_share_does_not_expose_internal_password_changed_flag(): void
    {
        $user = User::factory()->create([
            'role' => 'user',
            'is_password_changed' => false,
        ]);

        $response = $this->actingAs($user)->get('/dashboard');
        $response->assertOk();

        $page = $response->viewData('page');
        $userData = $page['props']['auth']['user'];

        $this->assertNotNull($userData);
        $this->assertArrayNotHasKey('is_password_changed', $userData);
    }
}

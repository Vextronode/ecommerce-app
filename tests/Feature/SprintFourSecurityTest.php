<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\Store;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class SprintFourSecurityTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test #R3-01: COD delivery completion marks order paid but does NOT credit digital store balance.
     * Prevents platform fund drainage since merchant already collects cash in person.
     */
    public function test_cod_delivery_completion_does_not_credit_store_balance(): void
    {
        $merchant = User::factory()->create(['role' => 'pedagang', 'is_password_changed' => true]);
        $store = Store::create([
            'user_id' => $merchant->id,
            'name' => 'Toko Seafood',
            'slug' => 'toko-seafood-'.Str::random(6),
            'available_balance' => 0,
            'pending_balance' => 0,
        ]);

        $buyer = User::factory()->create(['role' => 'user']);
        $order = Order::create([
            'store_id' => $store->id,
            'user_id' => $buyer->id,
            'invoice_number' => 'ORD-COD-'.Str::random(6),
            'customer_name' => 'Budi Santoso',
            'customer_phone' => '081234567890',
            'shipping_address' => 'Jl. Pantai Barat No. 12',
            'shipping_pin' => '1234',
            'delivery_method' => 'local_delivery',
            'subtotal' => 100000,
            'shipping_cost' => 10000,
            'total_amount' => 110000,
            'payment_method' => 'cod',
            'payment_status' => 'pending',
            'shipping_status' => 'shipped',
        ]);

        // Courier enters PIN to complete delivery
        $response = $this->withSession(["driver_authorized_{$order->invoice_number}" => true])
            ->post(route('tracker.complete', $order->invoice_number), [
                'pin' => '1234',
            ]);

        $response->assertSessionHasNoErrors();
        $order->refresh();
        $store->refresh();

        // Order status must be delivered and COD payment marked paid
        $this->assertEquals('delivered', $order->shipping_status);
        $this->assertEquals('paid', $order->payment_status);

        // Crucial security check: Store balance must NOT be credited!
        $this->assertEquals(0, (float) $store->available_balance);
        $this->assertNull($order->balance_credited_at);
    }

    /**
     * Test #R3-02: Non-COD online payment delivery completion DOES safely credit store balance.
     */
    public function test_online_payment_delivery_completion_credits_store_balance(): void
    {
        $merchant = User::factory()->create(['role' => 'pedagang', 'is_password_changed' => true]);
        $store = Store::create([
            'user_id' => $merchant->id,
            'name' => 'Toko Ikan',
            'slug' => 'toko-ikan-'.Str::random(6),
            'available_balance' => 0,
            'pending_balance' => 110000,
        ]);

        $buyer = User::factory()->create(['role' => 'user']);
        $order = Order::create([
            'store_id' => $store->id,
            'user_id' => $buyer->id,
            'invoice_number' => 'ORD-VA-'.Str::random(6),
            'customer_name' => 'Siti Nurhaliza',
            'customer_phone' => '081298765432',
            'shipping_address' => 'Jl. Pantai Timur No. 5',
            'shipping_pin' => '5678',
            'delivery_method' => 'local_delivery',
            'subtotal' => 100000,
            'shipping_cost' => 10000,
            'total_amount' => 110000,
            'payment_method' => 'va',
            'payment_status' => 'paid',
            'shipping_status' => 'shipped',
        ]);

        // Courier enters PIN to complete delivery
        $response = $this->withSession(["driver_authorized_{$order->invoice_number}" => true])
            ->post(route('tracker.complete', $order->invoice_number), [
                'pin' => '5678',
            ]);

        $response->assertSessionHasNoErrors();
        $order->refresh();
        $store->refresh();

        // Order delivered & store balance credited from escrow pending_balance
        $this->assertEquals('delivered', $order->shipping_status);
        $this->assertEquals(110000, (float) $store->available_balance);
        $this->assertEquals(0, (float) $store->pending_balance);
        $this->assertNotNull($order->balance_credited_at);
    }

    /**
     * Test #R3-03: PIN rate limiter locks by invoice across multiple IP addresses.
     * Prevents brute-forcing PINs by rotating proxies or IP spoofing.
     */
    public function test_pin_rate_limiter_locks_by_invoice_across_multiple_ips(): void
    {
        $merchant = User::factory()->create(['role' => 'pedagang', 'is_password_changed' => true]);
        $store = Store::create([
            'user_id' => $merchant->id,
            'name' => 'Toko Udang',
            'slug' => 'toko-udang-'.Str::random(6),
            'available_balance' => 0,
            'pending_balance' => 0,
        ]);

        $buyer = User::factory()->create(['role' => 'user']);
        $order = Order::create([
            'store_id' => $store->id,
            'user_id' => $buyer->id,
            'invoice_number' => 'ORD-BRUTE-'.Str::random(6),
            'customer_name' => 'Target Customer',
            'customer_phone' => '081200001111',
            'shipping_address' => 'Jl. Merdeka No. 1',
            'shipping_pin' => '4321',
            'delivery_method' => 'local_delivery',
            'subtotal' => 50000,
            'shipping_cost' => 5000,
            'total_amount' => 55000,
            'payment_method' => 'cod',
            'payment_status' => 'pending',
            'shipping_status' => 'shipped',
        ]);

        RateLimiter::clear('pin_verify_' . $order->invoice_number);

        // 1st wrong attempt: verify remaining attempts message and validation error bag
        $firstAttempt = $this->withSession(["driver_authorized_{$order->invoice_number}" => true])
            ->withServerVariables(['REMOTE_ADDR' => '1.2.3.4'])
            ->post(route('tracker.complete', $order->invoice_number), [
                'pin' => '0000',
            ]);
        $firstAttempt->assertSessionHasErrors('pin');
        $this->assertStringContainsString('Sisa percobaan: 4 kali lagi', session('errors')->first('pin'));

        // Next 4 wrong attempts to hit limit of 5
        for ($i = 0; $i < 4; $i++) {
            $this->withSession(["driver_authorized_{$order->invoice_number}" => true])
                ->withServerVariables(['REMOTE_ADDR' => '1.2.3.4'])
                ->post(route('tracker.complete', $order->invoice_number), [
                    'pin' => '0000',
                ]);
        }

        // 6th attempt from a DIFFERENT IP 5.6.7.8 should still be blocked!
        $response = $this->withSession(["driver_authorized_{$order->invoice_number}" => true])
            ->withServerVariables(['REMOTE_ADDR' => '5.6.7.8'])
            ->post(route('tracker.complete', $order->invoice_number), [
                'pin' => '0000',
            ]);

        $response->assertSessionHas('error');
        $response->assertSessionHasErrors('pin');
        $this->assertStringContainsString('Terlalu banyak percobaan PIN salah', session('error'));
        $this->assertStringContainsString('Akses diblokir selama', session('errors')->first('pin'));
    }

    /**
     * Test #R3-04: Merchant order index does not leak sensitive payment gateway fields.
     */
    public function test_merchant_order_index_hides_sensitive_payment_gateway_metadata(): void
    {
        $merchant = User::factory()->create(['role' => 'pedagang', 'is_password_changed' => true]);
        $store = Store::create([
            'user_id' => $merchant->id,
            'name' => 'Toko Kepiting',
            'slug' => 'toko-kepiting-'.Str::random(6),
            'available_balance' => 0,
            'pending_balance' => 0,
        ]);

        $buyer = User::factory()->create(['role' => 'user']);
        $order = Order::create([
            'store_id' => $store->id,
            'user_id' => $buyer->id,
            'invoice_number' => 'ORD-SENSITIVE-'.Str::random(6),
            'customer_name' => 'Rahasia Buyer',
            'customer_phone' => '081233334444',
            'shipping_address' => 'Jl. Pelabuhan No. 9',
            'shipping_pin' => '1122',
            'delivery_method' => 'local_delivery',
            'subtotal' => 50000,
            'shipping_cost' => 5000,
            'total_amount' => 55000,
            'payment_method' => 'va',
            'va_number' => '998877665544',
            'bill_key' => 'SECRET_BILL_KEY_123',
            'biller_code' => '70012',
            'payment_payload' => ['token' => 'top_secret_token'],
            'payment_status' => 'pending',
            'shipping_status' => 'processing',
        ]);

        $response = $this->actingAs($merchant)->get(route('merchant.orders.index'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Merchant/Order/Index')
            ->has('orders.data.0', fn (Assert $item) => $item
                ->where('invoice_number', $order->invoice_number)
                ->where('customer_name', 'Rahasia Buyer')
                ->missing('va_number')
                ->missing('bill_key')
                ->missing('biller_code')
                ->missing('payment_payload')
                ->etc()
            )
        );
    }
}

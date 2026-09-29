<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\Store;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class SprintTwoSecurityTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test #S2-06: ReportController sanitizes/whitelists sort_by.
     */
    public function test_report_controller_defaults_to_sales_when_sort_by_is_invalid(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'is_password_changed' => true,
        ]);

        // Hit with invalid sort_by (e.g. SQL injection probe or unwhitelisted column)
        $response = $this->actingAs($admin)->get(route('admin.reports.index', [
            'sort_by' => 'invalid_column_injection_attempt',
        ]));

        $response->assertOk();
        $page = $response->viewData('page');
        $filters = $page['props']['filters'];

        // Must default to 'sales'
        $this->assertEquals('sales', $filters['sort_by']);
    }

    /**
     * Test #S2-07: Order model mass assignment protection.
     * balance_credited_at and stock_restored_at must not be fillable.
     */
    public function test_order_model_does_not_allow_mass_assigning_internal_timestamps(): void
    {
        $buyer = User::factory()->create(['role' => 'user']);
        $merchant = User::factory()->create(['role' => 'pedagang']);
        $store = Store::create([
            'user_id' => $merchant->id,
            'name' => 'Toko Nelayan Lestari',
            'slug' => 'toko-nelayan-lestari-'.Str::random(6),
        ]);

        $fakeTimestamp = '2020-01-01 00:00:00';

        $order = Order::create([
            'store_id' => $store->id,
            'user_id' => $buyer->id,
            'invoice_number' => 'ORD-MASS-ASSIGN-001',
            'customer_name' => 'Test Customer',
            'customer_phone' => '0812345678',
            'shipping_address' => 'Jl. Laut No. 1',
            'delivery_method' => 'local_delivery',
            'subtotal' => 20000,
            'shipping_cost' => 5000,
            'total_amount' => 25000,
            'payment_method' => 'cod',
            'payment_status' => 'pending',
            'shipping_status' => 'pending',
            'balance_credited_at' => $fakeTimestamp, // Should be blocked by mass-assignment
            'stock_restored_at' => $fakeTimestamp,   // Should be blocked by mass-assignment
        ]);

        $fresh = $order->fresh();
        $this->assertNull($fresh->balance_credited_at);
        $this->assertNull($fresh->stock_restored_at);
    }

    /**
     * Test #S2-11: Withdrawal endpoint rate limit throttle:3,1.
     */
    public function test_withdrawal_endpoint_throttles_after_rate_limit_exceeded(): void
    {
        $merchant = User::factory()->create([
            'role' => 'pedagang',
            'is_password_changed' => true,
        ]);

        $store = Store::create([
            'user_id' => $merchant->id,
            'name' => 'Toko Saldo Aman',
            'slug' => 'toko-saldo-aman-'.Str::random(6),
            'available_balance' => 1000000,
            'pending_balance' => 0,
            'bank_name' => 'BCA',
            'bank_account_number' => '1234567890',
            'bank_account_holder' => 'Nelayan Aman',
        ]);

        // Send 3 requests (throttle is 3 per minute)
        for ($i = 0; $i < 3; $i++) {
            $this->actingAs($merchant)->post(route('merchant.withdrawals.store'), [
                'amount' => 50000,
            ]);
        }

        // 4th request must be throttled with HTTP 429
        $response = $this->actingAs($merchant)->post(route('merchant.withdrawals.store'), [
            'amount' => 50000,
        ]);

        $response->assertStatus(429);
    }

    /**
     * Test #S2-10: Login route throttle triggers on rate limit.
     */
    public function test_login_route_throttles_excessive_attempts(): void
    {
        // 10 attempts per minute allowed on route level
        for ($i = 0; $i < 10; $i++) {
            $this->post('/login', [
                'email' => "bot_{$i}@test.com",
                'password' => 'wrong-password',
            ]);
        }

        // 11th request must receive HTTP 429 Too Many Requests
        $response = $this->post('/login', [
            'email' => 'bot_11@test.com',
            'password' => 'wrong-password',
        ]);

        $response->assertStatus(429);
    }
}

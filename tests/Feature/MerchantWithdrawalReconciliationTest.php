<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\Store;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class MerchantWithdrawalReconciliationTest extends TestCase
{
    use RefreshDatabase;

    public function test_withdrawal_page_syncs_total_sales_and_separates_cod(): void
    {
        $merchant = User::factory()->create(['role' => 'pedagang']);
        $store = Store::create([
            'user_id' => $merchant->id,
            'name' => 'Toko Lilis Test',
            'slug' => 'toko-lilis-test-'.Str::random(6),
        ]);
        $buyer = User::factory()->create(['role' => 'user']);

        // 1. Pesanan COD Rp 279.000 (Subtotal 24k + Ongkir 255k) status paid delivered
        Order::create([
            'store_id' => $store->id,
            'user_id' => $buyer->id,
            'invoice_number' => 'ORD-COD-'.Str::random(6),
            'customer_name' => 'Buyer COD',
            'customer_phone' => '081234567890',
            'shipping_address' => 'Pangandaran',
            'delivery_method' => 'local_delivery',
            'subtotal' => 24000,
            'shipping_cost' => 255000,
            'total_amount' => 279000,
            'payment_method' => 'cod',
            'payment_channel' => 'cod',
            'payment_status' => 'paid',
            'shipping_status' => 'delivered',
        ]);

        // 2. Pesanan Online Rp 20.000 (Subtotal 20k, Ongkir 0) status paid delivered & already credited
        $onlineOrder = Order::create([
            'store_id' => $store->id,
            'user_id' => $buyer->id,
            'invoice_number' => 'ORD-ONLINE-'.Str::random(6),
            'customer_name' => 'Buyer Online',
            'customer_phone' => '081234567891',
            'shipping_address' => 'Cibenda',
            'delivery_method' => 'local_delivery',
            'subtotal' => 20000,
            'shipping_cost' => 0,
            'total_amount' => 22000,
            'payment_method' => 'va',
            'payment_channel' => 'bca_va',
            'payment_status' => 'paid',
            'shipping_status' => 'delivered',
        ]);
        $onlineOrder->forceFill([
            'escrow_credited_at' => now(),
            'balance_credited_at' => now(),
        ])->save();
        $store->forceFill(['available_balance' => 20000, 'pending_balance' => 0])->save();

        // Total sales: 279.000 + 20.000 = 299.000
        $response = $this->actingAs($merchant)->get(route('merchant.withdrawals.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Merchant/Withdrawals/Index')
            ->where('stats.total_earnings', 299000)
            ->where('stats.total_cod', 279000)
            ->where('stats.total_digital', 20000)
            ->where('stats.available_balance', 20000)
        );
    }

    public function test_withdrawal_page_auto_reconciles_uncredited_online_delivered_orders(): void
    {
        $merchant = User::factory()->create(['role' => 'pedagang']);
        $store = Store::create([
            'user_id' => $merchant->id,
            'name' => 'Toko Reconcile Test',
            'slug' => 'toko-reconcile-test-'.Str::random(6),
        ]);
        $store->forceFill(['available_balance' => 0, 'pending_balance' => 50000])->save();

        $buyer = User::factory()->create(['role' => 'user']);

        // Pesanan online delivered tapi balance_credited_at masih null
        $order = Order::create([
            'store_id' => $store->id,
            'user_id' => $buyer->id,
            'invoice_number' => 'ORD-UNCREDITED-'.Str::random(6),
            'customer_name' => 'Buyer Reconcile',
            'customer_phone' => '081234567892',
            'shipping_address' => 'Cibenda',
            'delivery_method' => 'local_delivery',
            'subtotal' => 50000,
            'shipping_cost' => 0,
            'total_amount' => 52000,
            'payment_method' => 'qris',
            'payment_channel' => 'gopay',
            'payment_status' => 'paid',
            'shipping_status' => 'delivered',
        ]);
        $order->forceFill(['escrow_credited_at' => now()])->save();

        $this->assertNull($order->balance_credited_at);
        $this->assertEquals(0, (float) $store->available_balance);

        // Kunjungi halaman penarikan saldo
        $response = $this->actingAs($merchant)->get(route('merchant.withdrawals.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->where('stats.available_balance', 50000)
            ->where('stats.pending_balance', 0)
        );

        // Verifikasi database ter-reconcile
        $this->assertNotNull($order->fresh()->balance_credited_at);
        $this->assertEquals(50000, (float) $store->fresh()->available_balance);
        $this->assertEquals(0, (float) $store->fresh()->pending_balance);
    }

    public function test_credit_store_balance_self_heals_when_escrow_credited_at_is_null_for_paid_online_order(): void
    {
        $merchant = User::factory()->create(['role' => 'pedagang']);
        $store = Store::create([
            'user_id' => $merchant->id,
            'name' => 'Toko Self Heal',
            'slug' => 'toko-self-heal-'.Str::random(6),
        ]);
        $store->forceFill(['available_balance' => 0, 'pending_balance' => 0])->save();

        $buyer = User::factory()->create(['role' => 'user']);

        $order = Order::create([
            'store_id' => $store->id,
            'user_id' => $buyer->id,
            'invoice_number' => 'ORD-HEAL-'.Str::random(6),
            'customer_name' => 'Buyer Heal',
            'customer_phone' => '081234567893',
            'shipping_address' => 'Cibenda',
            'delivery_method' => 'local_delivery',
            'subtotal' => 75000,
            'shipping_cost' => 10000,
            'total_amount' => 87000,
            'payment_method' => 'va',
            'payment_channel' => 'bca_va',
            'payment_status' => 'paid',
            'shipping_status' => 'delivered',
        ]);

        $this->assertNull($order->escrow_credited_at);
        $this->assertNull($order->balance_credited_at);

        $result = $order->creditStoreBalance();
        $this->assertTrue($result);

        $order->refresh();
        $store->refresh();

        $this->assertNotNull($order->escrow_credited_at);
        $this->assertNotNull($order->balance_credited_at);
        $this->assertEquals(85000, (float) $store->available_balance);
    }
}

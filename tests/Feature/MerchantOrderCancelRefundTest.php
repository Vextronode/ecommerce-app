<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Store;
use App\Models\User;
use App\Services\MidtransService;
use App\Services\PaymentSyncService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Mockery;
use Tests\TestCase;

/**
 * regresi perilaku jalur cancel order paid non-COD di dashboard pedagang.
 *
 * menutup blind spot wave 5: dulu jalur ini menulis payment_status='refunded'
 * yang ditolak skema enum (500), dan menarik escrow tanpa memanggil refund gateway.
 */
class MerchantOrderCancelRefundTest extends TestCase
{
    use RefreshDatabase;

    private function seedOrder(User $merchant, User $buyer, string $method = 'gopay', string $shipping = 'processing'): array
    {
        $store = Store::create([
            'user_id' => $merchant->id,
            'name' => 'Toko Uji Refund',
            'slug' => 'toko-uji-refund-'.Str::random(6),
            'has_completed_tour' => true,
        ]);
        $store->forceFill(['pending_balance' => 100000, 'available_balance' => 0, 'sid_status' => 'verified'])->save();

        $category = Category::firstOrCreate(['slug' => 'kat-refund'], ['name' => 'Kat Refund']);
        $product = Product::create([
            'store_id' => $store->id,
            'category_id' => $category->id,
            'name' => 'Produk Refund',
            'slug' => 'produk-refund-'.Str::random(6),
            'price' => 100000,
            'stock' => 5,
            'is_active' => true,
        ]);

        $order = Order::create([
            'store_id' => $store->id,
            'user_id' => $buyer->id,
            'invoice_number' => 'ORD-REF-'.strtoupper(Str::random(8)),
            'customer_name' => 'Buyer Ref',
            'customer_phone' => '08123456789',
            'shipping_address' => 'Pangandaran',
            'delivery_method' => 'self_pickup',
            'subtotal' => 100000,
            'shipping_cost' => 0,
            'total_amount' => 100000,
            'payment_method' => $method,
            'payment_channel' => $method === 'va' ? 'bca_va' : ($method === 'gopay' ? 'gopay' : null),
            'payment_status' => 'paid',
            'shipping_status' => $shipping,
        ]);
        $order->forceFill(['escrow_credited_at' => now()])->save();
        $order->refresh();

        OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'product_name' => $product->name,
            'price' => 100000,
            'quantity' => 1,
            'unit' => 'pcs',
        ]);

        return [$store, $order];
    }

    public function test_cancel_order_paid_non_cod_tidak_500_dan_menandai_refunded(): void
    {
        $merchant = User::factory()->create(['role' => 'pedagang']);
        $buyer = User::factory()->create(['role' => 'user']);
        [$store, $order] = $this->seedOrder($merchant, $buyer, 'gopay');

        $mock = Mockery::mock(MidtransService::class);
        $mock->shouldReceive('refundTransaction')
            ->once()
            ->with($order->invoice_number, 100000.0, Mockery::any())
            ->andReturn(['status_code' => '200']);
        $this->app->instance(MidtransService::class, $mock);

        $this->actingAs($merchant)
            ->put("/pedagang/merchant/orders/{$order->id}/status", ['shipping_status' => 'cancelled'])
            ->assertRedirect()
            ->assertSessionHas('success');

        $order->refresh();
        $store->refresh();

        $this->assertSame('cancelled', $order->shipping_status);
        $this->assertSame('refunded', $order->payment_status);
        $this->assertSame(0, (int) $store->pending_balance, 'escrow lokal ditarik setelah refund dipicu');
    }

    public function test_cancel_paid_non_cod_dengan_gateway_gagal_menandai_needs_reconciliation(): void
    {
        $merchant = User::factory()->create(['role' => 'pedagang']);
        $buyer = User::factory()->create(['role' => 'user']);
        [, $order] = $this->seedOrder($merchant, $buyer, 'gopay');

        $mock = Mockery::mock(MidtransService::class);
        $mock->shouldReceive('refundTransaction')
            ->once()
            ->with($order->invoice_number, 100000.0, Mockery::any())
            ->andReturn(null);
        $this->app->instance(MidtransService::class, $mock);

        $this->actingAs($merchant)
            ->put("/pedagang/merchant/orders/{$order->id}/status", ['shipping_status' => 'cancelled'])
            ->assertRedirect();

        $order->refresh();
        $this->assertTrue((bool) ($order->payment_payload['needs_reconciliation'] ?? false), 'refund gagal harus ditandai needs_reconciliation');
    }

    public function test_cancel_paid_va_order_requires_manual_refund_without_gateway_call(): void
    {
        $merchant = User::factory()->create(['role' => 'pedagang']);
        $buyer = User::factory()->create(['role' => 'user']);
        [$store, $order] = $this->seedOrder($merchant, $buyer, 'va');

        $mock = Mockery::mock(MidtransService::class);
        $mock->shouldReceive('refundTransaction')->never();
        $this->app->instance(MidtransService::class, $mock);

        $this->actingAs($merchant)
            ->put("/pedagang/merchant/orders/{$order->id}/status", ['shipping_status' => 'cancelled'])
            ->assertRedirect()
            ->assertSessionHas('info');

        $order->refresh();
        $store->refresh();

        $this->assertSame('cancelled', $order->shipping_status);
        $this->assertSame('paid', $order->payment_status, 'status pembayaran tetap paid sampai diselesaikan manual');
        $this->assertSame(0, (int) $store->pending_balance, 'escrow pedagang tetap ditarik saat pesanan dibatalkan');
        $this->assertTrue((bool) ($order->payment_payload['needs_reconciliation'] ?? false));
        $this->assertSame('manual_bank_transfer', $order->payment_payload['refund_type'] ?? null);
    }

    public function test_partial_refund_webhook_only_affects_cancelled_order_in_multi_store_checkout(): void
    {
        $merchantA = User::factory()->create(['role' => 'pedagang']);
        $merchantB = User::factory()->create(['role' => 'pedagang']);
        $buyer = User::factory()->create(['role' => 'user']);

        [$storeA, $orderA] = $this->seedOrder($merchantA, $buyer, 'gopay');
        [$storeB, $orderB] = $this->seedOrder($merchantB, $buyer, 'gopay');

        $parentTx = 'MID-MULTI-TX-'.Str::random(8);
        $orderA->forceFill(['parent_transaction_id' => $parentTx, 'shipping_status' => 'cancelled', 'payment_status' => 'paid'])->save();
        $orderB->forceFill(['parent_transaction_id' => $parentTx, 'shipping_status' => 'processing', 'payment_status' => 'paid'])->save();

        $syncService = app(PaymentSyncService::class);

        // Simulasi notifikasi partial_refund dari Midtrans untuk kedua order dalam parent transaction yang sama
        $syncService->applyPaymentStatus($orderA->id, 'partial_refund');
        $syncService->applyPaymentStatus($orderB->id, 'partial_refund');

        $orderA->refresh();
        $orderB->refresh();
        $storeB->refresh();

        $this->assertSame('refunded', $orderA->payment_status, 'Order A yang dibatalkan harus ditandai refunded');
        $this->assertSame('paid', $orderB->payment_status, 'Order B yang aktif tidak boleh ditandai refunded');
        $this->assertSame('processing', $orderB->shipping_status);
        $this->assertSame(100000, (int) $storeB->pending_balance, 'Escrow toko B tidak boleh berkurang');
    }

    public function test_order_non_cod_paid_yang_sudah_dikirim_tidak_bisa_dibatalkan(): void
    {
        $merchant = User::factory()->create(['role' => 'pedagang']);
        $buyer = User::factory()->create(['role' => 'user']);
        [, $order] = $this->seedOrder($merchant, $buyer, 'va', 'shipped');

        $mock = Mockery::mock(MidtransService::class);
        $mock->shouldReceive('refundTransaction')->never();
        $this->app->instance(MidtransService::class, $mock);

        $this->actingAs($merchant)
            ->put("/pedagang/merchant/orders/{$order->id}/status", ['shipping_status' => 'cancelled'])
            ->assertRedirect()
            ->assertSessionHas('error');

        $order->refresh();
        $this->assertSame('shipped', $order->shipping_status, 'order yang sudah dikirim tidak boleh dibatalkan');
        $this->assertSame('paid', $order->payment_status);
    }

    public function test_cancel_order_cod_belum_dibayar_tidak_memicu_refund_gateway(): void
    {
        $merchant = User::factory()->create(['role' => 'pedagang']);
        $buyer = User::factory()->create(['role' => 'user']);
        [, $order] = $this->seedOrder($merchant, $buyer, 'cod');
        // COD belum dibayar saat dibatalkan
        $order->forceFill(['payment_status' => 'pending'])->save();

        $mock = Mockery::mock(MidtransService::class);
        $mock->shouldReceive('refundTransaction')->never();
        $this->app->instance(MidtransService::class, $mock);

        $this->actingAs($merchant)
            ->put("/pedagang/merchant/orders/{$order->id}/status", ['shipping_status' => 'cancelled'])
            ->assertRedirect();

        $order->refresh();
        $this->assertSame('cancelled', $order->shipping_status);
        // COD belum pernah bayar, jadi statusnya failed, bukan refunded
        $this->assertSame('failed', $order->payment_status);
    }
}

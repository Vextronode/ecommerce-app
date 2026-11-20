<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Store;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class MerchantSelfPickupOrderCompletionTest extends TestCase
{
    use RefreshDatabase;

    private function createOrderFixture(User $merchant, User $buyer, string $method = 'cod', string $delivery = 'self_pickup', string $paymentStatus = 'pending', string $shippingStatus = 'processing'): Order
    {
        $store = Store::create([
            'user_id' => $merchant->id,
            'name' => 'Toko Uji Pickup',
            'slug' => 'toko-uji-pickup-'.Str::random(6),
            'has_completed_tour' => true,
        ]);
        $store->forceFill([
            'pending_balance' => 50000,
            'available_balance' => 0,
            'sid_status' => 'verified',
        ])->save();

        $category = Category::firstOrCreate(['slug' => 'kat-pickup'], ['name' => 'Kat Pickup']);
        $product = Product::create([
            'store_id' => $store->id,
            'category_id' => $category->id,
            'name' => 'Produk Pickup',
            'slug' => 'produk-pickup-'.Str::random(6),
            'price' => 50000,
            'stock' => 10,
            'is_active' => true,
        ]);

        $order = Order::create([
            'store_id' => $store->id,
            'user_id' => $buyer->id,
            'invoice_number' => 'ORD-PICKUP-'.strtoupper(Str::random(8)),
            'customer_name' => 'Buyer Pickup',
            'customer_phone' => '08123456789',
            'shipping_address' => 'Desa Cibenda',
            'delivery_method' => $delivery,
            'subtotal' => 50000,
            'shipping_cost' => 0,
            'service_fee' => 0,
            'tax_amount' => 0,
            'total_amount' => 50000,
            'payment_method' => $method,
            'payment_status' => $paymentStatus,
            'shipping_status' => $shippingStatus,
        ]);

        if ($paymentStatus === 'paid' && $method !== 'cod') {
            $order->forceFill(['escrow_credited_at' => now()])->save();
            $order->refresh();
        }

        OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'product_name' => $product->name,
            'price' => 50000,
            'quantity' => 1,
            'unit' => 'pcs',
        ]);

        return $order;
    }

    public function test_merchant_can_complete_cod_self_pickup_order(): void
    {
        $merchant = User::factory()->create(['role' => 'pedagang']);
        $buyer = User::factory()->create(['role' => 'user']);
        $order = $this->createOrderFixture($merchant, $buyer, 'cod', 'self_pickup', 'pending', 'processing');

        $this->actingAs($merchant)
            ->put("/pedagang/merchant/orders/{$order->id}/status", [
                'shipping_status' => 'delivered',
            ])
            ->assertRedirect(route('merchant.orders.index'))
            ->assertSessionHas('success');

        $order->refresh();
        $this->assertSame('delivered', $order->shipping_status);
        $this->assertSame('paid', $order->payment_status, 'Pesanan COD self-pickup otomatis menjadi paid setelah diselesaikan penjual');
    }

    public function test_merchant_can_complete_non_cod_self_pickup_order_and_credit_balance(): void
    {
        $merchant = User::factory()->create(['role' => 'pedagang']);
        $buyer = User::factory()->create(['role' => 'user']);
        $order = $this->createOrderFixture($merchant, $buyer, 'va', 'self_pickup', 'paid', 'shipped');

        $this->actingAs($merchant)
            ->put("/pedagang/merchant/orders/{$order->id}/status", [
                'shipping_status' => 'delivered',
            ])
            ->assertRedirect(route('merchant.orders.index'))
            ->assertSessionHas('success');

        $order->refresh();
        $store = $order->store->fresh();

        $this->assertSame('delivered', $order->shipping_status);
        $this->assertSame('paid', $order->payment_status);
        $this->assertSame(50000, (int) $store->available_balance, 'Saldo escrow berhasil dilepas ke available_balance');
    }

    public function test_merchant_cannot_complete_local_delivery_order_directly(): void
    {
        $merchant = User::factory()->create(['role' => 'pedagang']);
        $buyer = User::factory()->create(['role' => 'user']);
        $order = $this->createOrderFixture($merchant, $buyer, 'cod', 'local_delivery', 'pending', 'processing');

        $this->actingAs($merchant)
            ->put("/pedagang/merchant/orders/{$order->id}/status", [
                'shipping_status' => 'delivered',
            ])
            ->assertRedirect(route('merchant.orders.index'))
            ->assertSessionHas('error');

        $order->refresh();
        $this->assertSame('processing', $order->shipping_status, 'Pesanan kurir lokal tidak boleh diselesaikan manual oleh penjual');
    }

    public function test_merchant_cannot_complete_unpaid_non_cod_self_pickup_order(): void
    {
        $merchant = User::factory()->create(['role' => 'pedagang']);
        $buyer = User::factory()->create(['role' => 'user']);
        $order = $this->createOrderFixture($merchant, $buyer, 'va', 'self_pickup', 'pending', 'processing');

        $this->actingAs($merchant)
            ->put("/pedagang/merchant/orders/{$order->id}/status", [
                'shipping_status' => 'delivered',
            ])
            ->assertRedirect(route('merchant.orders.index'))
            ->assertSessionHas('error');

        $order->refresh();
        $this->assertSame('processing', $order->shipping_status);
    }
}

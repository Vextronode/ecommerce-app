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

class MultiOrderSwitchToCodTest extends TestCase
{
    use RefreshDatabase;

    private function createMultiOrderFixture(User $buyer): array
    {
        $category = Category::firstOrCreate(['slug' => 'kat-multi'], ['name' => 'Kat Multi']);

        $merchantA = User::factory()->create(['role' => 'pedagang']);
        $storeA = Store::create([
            'user_id' => $merchantA->id,
            'name' => 'Toko A',
            'slug' => 'toko-a-'.Str::random(6),
            'has_completed_tour' => true,
        ]);
        $productA = Product::create([
            'store_id' => $storeA->id,
            'category_id' => $category->id,
            'name' => 'Produk A',
            'slug' => 'produk-a-'.Str::random(6),
            'price' => 25000,
            'stock' => 10,
            'is_active' => true,
        ]);

        $merchantB = User::factory()->create(['role' => 'pedagang']);
        $storeB = Store::create([
            'user_id' => $merchantB->id,
            'name' => 'Toko B',
            'slug' => 'toko-b-'.Str::random(6),
            'has_completed_tour' => true,
        ]);
        $productB = Product::create([
            'store_id' => $storeB->id,
            'category_id' => $category->id,
            'name' => 'Produk B',
            'slug' => 'produk-b-'.Str::random(6),
            'price' => 35000,
            'stock' => 10,
            'is_active' => true,
        ]);

        $parentId = 'CIBENDA-PARENT-'.strtoupper(Str::random(8));

        $orderA = Order::create([
            'store_id' => $storeA->id,
            'user_id' => $buyer->id,
            'invoice_number' => 'INV-A-'.strtoupper(Str::random(8)),
            'parent_transaction_id' => $parentId,
            'customer_name' => 'Buyer Test',
            'customer_phone' => '08123456789',
            'shipping_address' => 'Desa Cibenda',
            'delivery_method' => 'local_delivery',
            'subtotal' => 25000,
            'shipping_cost' => 5000,
            'total_amount' => 30000,
            'payment_method' => 'va',
            'payment_channel' => 'bca_va',
            'payment_status' => 'pending',
            'shipping_status' => 'pending',
        ]);
        OrderItem::create([
            'order_id' => $orderA->id,
            'product_id' => $productA->id,
            'product_name' => $productA->name,
            'price' => 25000,
            'quantity' => 1,
            'unit' => 'pcs',
        ]);

        $orderB = Order::create([
            'store_id' => $storeB->id,
            'user_id' => $buyer->id,
            'invoice_number' => 'INV-B-'.strtoupper(Str::random(8)),
            'parent_transaction_id' => $parentId,
            'customer_name' => 'Buyer Test',
            'customer_phone' => '08123456789',
            'shipping_address' => 'Desa Cibenda',
            'delivery_method' => 'local_delivery',
            'subtotal' => 35000,
            'shipping_cost' => 5000,
            'total_amount' => 40000,
            'payment_method' => 'va',
            'payment_channel' => 'bca_va',
            'payment_status' => 'pending',
            'shipping_status' => 'pending',
        ]);
        OrderItem::create([
            'order_id' => $orderB->id,
            'product_id' => $productB->id,
            'product_name' => $productB->name,
            'price' => 35000,
            'quantity' => 1,
            'unit' => 'pcs',
        ]);

        return [$orderA, $orderB, $parentId];
    }

    public function test_switching_to_cod_in_multi_order_checkout_switches_all_related_orders(): void
    {
        $buyer = User::factory()->create(['role' => 'user']);
        [$orderA, $orderB, $parentId] = $this->createMultiOrderFixture($buyer);

        $mockMidtrans = Mockery::mock(MidtransService::class);
        $mockMidtrans->shouldReceive('cancelTransaction')
            ->once()
            ->with($parentId)
            ->andReturn(['status_code' => '200']);
        $this->app->instance(MidtransService::class, $mockMidtrans);

        $response = $this->actingAs($buyer)
            ->post("/payment/{$orderA->id}/switch-to-cod");

        $response->assertRedirect(route('checkout.success', ['order_id' => $orderA->id]));
        $response->assertSessionHas('success');

        $orderA->refresh();
        $orderB->refresh();

        $this->assertSame('cod', $orderA->payment_method);
        $this->assertSame('cod', $orderA->payment_channel);
        $this->assertSame('cod', $orderB->payment_method, 'Pesanan toko B dalam 1 checkout gabungan harus ikut dialihkan ke COD');
        $this->assertSame('cod', $orderB->payment_channel);
        $this->assertSame('pending', $orderA->payment_status);
        $this->assertSame('pending', $orderB->payment_status);
    }

    public function test_cod_orders_are_not_cancelled_when_gateway_sends_cancel_status(): void
    {
        $buyer = User::factory()->create(['role' => 'user']);
        [$orderA, $orderB, $parentId] = $this->createMultiOrderFixture($buyer);

        $orderA->update(['payment_method' => 'cod', 'payment_channel' => 'cod']);
        $orderB->update(['payment_method' => 'cod', 'payment_channel' => 'cod']);

        $syncService = app(PaymentSyncService::class);
        $syncService->applyPaymentStatus($orderA->id, 'cancel');
        $syncService->applyPaymentStatus($orderB->id, 'cancel');

        $orderA->refresh();
        $orderB->refresh();

        $this->assertSame('pending', $orderA->shipping_status, 'Pesanan COD tidak boleh dibatalkan oleh event cancel gateway');
        $this->assertSame('pending', $orderA->payment_status);
        $this->assertSame('pending', $orderB->shipping_status);
        $this->assertSame('pending', $orderB->payment_status);
    }
}

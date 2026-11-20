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

class AdminOrderReconciliationTest extends TestCase
{
    use RefreshDatabase;

    private function createReconciliationOrder(string $refundType = 'manual_bank_transfer'): Order
    {
        $merchant = User::factory()->create(['role' => 'pedagang']);
        $buyer = User::factory()->create(['role' => 'user']);

        $store = Store::create([
            'user_id' => $merchant->id,
            'name' => 'Toko Desa Reconcile',
            'slug' => 'toko-desa-reconcile-'.Str::random(6),
            'has_completed_tour' => true,
        ]);

        $category = Category::firstOrCreate(['slug' => 'kat-recon'], ['name' => 'Kat Recon']);
        $product = Product::create([
            'store_id' => $store->id,
            'category_id' => $category->id,
            'name' => 'Produk Recon',
            'slug' => 'produk-recon-'.Str::random(6),
            'price' => 75000,
            'stock' => 10,
            'is_active' => true,
        ]);

        $order = Order::create([
            'store_id' => $store->id,
            'user_id' => $buyer->id,
            'invoice_number' => 'ORD-REC-'.strtoupper(Str::random(8)),
            'customer_name' => 'Buyer Recon',
            'customer_phone' => '08987654321',
            'shipping_address' => 'Desa Cibenda',
            'delivery_method' => 'self_pickup',
            'subtotal' => 75000,
            'shipping_cost' => 0,
            'total_amount' => 75000,
            'payment_method' => 'va',
            'payment_channel' => 'bca_va',
            'payment_status' => 'paid',
            'shipping_status' => 'cancelled',
        ]);
        $order->forceFill([
            'payment_payload' => [
                'needs_reconciliation' => true,
                'refund_type' => $refundType,
                'refund_reason' => 'Virtual Account memerlukan refund manual transfer oleh pengelola',
                'refund_amount' => 75000,
            ],
        ])->save();

        OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'product_name' => $product->name,
            'price' => 75000,
            'quantity' => 1,
            'unit' => 'pcs',
        ]);

        return $order;
    }

    public function test_admin_dashboard_shows_pending_refund_reconciliations(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $order = $this->createReconciliationOrder();

        $prefix = config('admin.prefix', 'cibenda-portal');

        $response = $this->actingAs($admin)->get("/{$prefix}/dashboard");

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Dashboard')
            ->has('pendingReconciliations', 1)
            ->where('pendingReconciliations.0.invoice_number', $order->invoice_number)
            ->where('pendingReconciliations.0.refund_amount', 75000)
        );
    }

    public function test_admin_can_resolve_order_reconciliation(): void
    {
        $admin = User::factory()->create(['role' => 'admin', 'name' => 'Admin Desa']);
        $order = $this->createReconciliationOrder();

        $prefix = config('admin.prefix', 'cibenda-portal');

        $response = $this->actingAs($admin)
            ->post("/{$prefix}/pesanan/{$order->id}/reconcile", [
                'notes' => 'Transfer manual BCA berhasil dilakukan',
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $order->refresh();
        $this->assertSame('refunded', $order->payment_status);
        $this->assertFalse((bool) ($order->payment_payload['needs_reconciliation'] ?? true));
        $this->assertSame('Admin Desa', $order->payment_payload['reconciled_by'] ?? null);
        $this->assertNotEmpty($order->payment_payload['reconciled_at'] ?? null);
    }

    public function test_non_admin_cannot_resolve_order_reconciliation(): void
    {
        $user = User::factory()->create(['role' => 'user']);
        $order = $this->createReconciliationOrder();

        $prefix = config('admin.prefix', 'cibenda-portal');

        $response = $this->actingAs($user)
            ->post("/{$prefix}/pesanan/{$order->id}/reconcile");

        $response->assertRedirect('/dashboard');
    }
}

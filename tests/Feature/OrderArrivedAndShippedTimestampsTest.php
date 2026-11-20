<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Store;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Tests\TestCase;

class OrderArrivedAndShippedTimestampsTest extends TestCase
{
    use RefreshDatabase;

    private function createTestOrder(string $shippingStatus = 'processing', string $deliveryMethod = 'local_delivery'): Order
    {
        $merchant = User::factory()->create(['role' => 'pedagang']);
        $buyer = User::factory()->create(['role' => 'user']);

        $store = Store::create([
            'user_id' => $merchant->id,
            'name' => 'Toko Kurir '.Str::random(6),
            'slug' => 'toko-kurir-'.Str::random(6),
            'has_completed_tour' => true,
        ]);

        $category = Category::firstOrCreate(['slug' => 'kat-kurir'], ['name' => 'Kat Kurir']);
        $product = Product::create([
            'store_id' => $store->id,
            'category_id' => $category->id,
            'name' => 'Produk Kurir',
            'slug' => 'produk-kurir-'.Str::random(6),
            'price' => 50000,
            'stock' => 10,
            'is_active' => true,
        ]);

        $order = Order::create([
            'store_id' => $store->id,
            'user_id' => $buyer->id,
            'invoice_number' => 'ORD-TIME-'.strtoupper(Str::random(8)),
            'customer_name' => 'Buyer Kurir',
            'customer_phone' => '08111222333',
            'shipping_address' => 'Desa Cibenda RT 01',
            'delivery_method' => $deliveryMethod,
            'subtotal' => 50000,
            'shipping_cost' => 5000,
            'total_amount' => 55000,
            'payment_method' => 'gopay',
            'payment_status' => 'paid',
            'shipping_status' => $shippingStatus,
        ]);

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

    public function test_mark_as_arrived_persists_arrived_at_in_database_and_survives_cache_clear(): void
    {
        $order = $this->createTestOrder('shipped');
        $this->assertNull($order->arrived_at);
        $this->assertFalse($order->isArrived());

        $order->markAsArrived();

        $order->refresh();
        $this->assertNotNull($order->arrived_at, 'arrived_at harus tersimpan di kolom database (ORD-02)');
        $this->assertTrue($order->isArrived());

        // Simulasi cache clear (misal redis reboot atau optimize:clear)
        Cache::flush();

        $this->assertTrue($order->isArrived(), 'isArrived harus tetap true meskipun cache dikosongkan karena tersimpan di DB');
    }

    public function test_order_transition_to_shipped_automatically_sets_shipped_at(): void
    {
        $order = $this->createTestOrder('processing');
        $this->assertNull($order->shipped_at);

        $order->update(['shipping_status' => 'shipped']);

        $order->refresh();
        $this->assertNotNull($order->shipped_at, 'shipped_at harus terisi otomatis saat status beralih ke shipped (ORD-03)');
    }

    public function test_updating_other_fields_does_not_reset_shipped_at(): void
    {
        $order = $this->createTestOrder('shipped');
        $pastShippedAt = now()->subHours(5);
        $order->forceFill(['shipped_at' => $pastShippedAt])->save();

        // Update atribut lain seperti notes atau shipping_pin
        $order->update(['notes' => 'Catatan baru']);

        $order->refresh();
        $this->assertSame(
            $pastShippedAt->timestamp,
            $order->shipped_at->timestamp,
            'shipped_at tidak boleh ter-reset saat kolom lain di-update'
        );
    }

    public function test_can_buyer_complete_uses_shipped_at_for_four_hour_threshold(): void
    {
        $order = $this->createTestOrder('shipped');
        $pastShippedAt = now()->subHours(5);
        $order->forceFill(['shipped_at' => $pastShippedAt])->save();

        // Simulasi update baru yang memperbarui updated_at
        $order->update(['notes' => 'Baru saja diupdate']);

        // Walaupun updated_at baru saja, 4 jam harus tetap dihitung dari shipped_at
        $this->assertTrue(
            $order->canBuyerComplete(),
            'Pembeli harus dapat menyelesaikan pesanan karena shipped_at > 4 jam lalu'
        );
    }

    public function test_can_buyer_complete_cannot_complete_before_four_hours_unless_arrived(): void
    {
        $order = $this->createTestOrder('shipped');
        $order->forceFill(['shipped_at' => now()->subHours(1)])->save();

        $this->assertFalse(
            $order->canBuyerComplete(),
            'Pembeli tidak boleh menyelesaikan pesanan sebelum 4 jam jika kurir belum tiba'
        );

        $order->markAsArrived();
        $order->refresh();

        $this->assertTrue(
            $order->canBuyerComplete(),
            'Pembeli dapat menyelesaikan pesanan segera setelah kurir tiba'
        );
    }
}

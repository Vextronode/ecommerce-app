<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductSku;
use App\Models\Store;
use App\Models\User;
use App\Services\PaymentSyncService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class OrderReviveStockGuardTest extends TestCase
{
    use RefreshDatabase;

    private function buatStore(User $merchant, string $prefix): Store
    {
        $store = Store::create([
            'user_id' => $merchant->id,
            'name' => "Toko {$prefix}",
            'slug' => "toko-{$prefix}-".Str::random(6),
        ]);
        $store->forceFill(['pending_balance' => 0, 'available_balance' => 0])->save();

        return $store;
    }

    private function buatProduk(Store $store, string $prefix, int $stock): Product
    {
        $category = Category::create([
            'name' => "Kategori {$prefix}",
            'slug' => "kategori-{$prefix}-".Str::random(6),
        ]);

        return Product::create([
            'store_id' => $store->id,
            'category_id' => $category->id,
            'name' => "Produk {$prefix}",
            'slug' => "produk-{$prefix}-".Str::random(6),
            'price' => 50000,
            'stock' => $stock,
            'is_active' => true,
        ]);
    }

    private function buatOrderCancelled(User $buyer, Store $store, Product $product, int $quantity): Order
    {
        $order = Order::create([
            'store_id' => $store->id,
            'user_id' => $buyer->id,
            'invoice_number' => 'ORD-REVIVE-'.strtoupper(Str::random(8)),
            'customer_name' => 'Buyer Revive',
            'customer_phone' => '08123456789',
            'shipping_address' => 'Pangandaran',
            'delivery_method' => 'self_pickup',
            'subtotal' => 50000 * $quantity,
            'shipping_cost' => 0,
            'total_amount' => 50000 * $quantity,
            'payment_method' => 'va',
            'payment_channel' => 'bca_va',
            'payment_status' => 'pending',
            'shipping_status' => 'pending',
        ]);

        OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'product_name' => $product->name,
            'price' => 50000,
            'quantity' => $quantity,
            'unit' => 'pcs',
        ]);

        // pesanan dibatalkan seperti alur buyer cancel / expire: stok dibalikin dan ditandai stock_restored_at
        $order->restoreStock();
        $order->update(['shipping_status' => 'cancelled', 'payment_status' => 'failed']);

        return $order->fresh();
    }

    /**
     * happy path: stok masih cukup, order cancelled harus di-revive normal jadi paid + pending.
     */
    public function test_revive_order_cancelled_dengan_stok_cukup_berhasil_normal(): void
    {
        $merchant = User::factory()->create(['role' => 'pedagang']);
        $store = $this->buatStore($merchant, 'cukup');
        $product = $this->buatProduk($store, 'cukup', 20);
        $buyer = User::factory()->create(['role' => 'user']);

        // quantity 3; stok belum pernah didecrement di test ini, jadi restore menaikkan 20 -> 23
        $order = $this->buatOrderCancelled($buyer, $store, $product, 3);
        $this->assertNotNull($order->stock_restored_at);
        $this->assertEquals(23, $product->fresh()->stock);

        app(PaymentSyncService::class)->applyPaymentStatus($order->id, 'settlement');

        $revived = $order->fresh();
        $this->assertEquals('paid', $revived->payment_status);
        $this->assertEquals('pending', $revived->shipping_status);
        $this->assertNull($revived->stock_restored_at);

        // stok ditarik balik sejumlah quantity order -> 23 - 3 = 20
        $this->assertEquals(20, $product->fresh()->stock);
        $this->assertTrue($revived->canFulfillStock());
    }

    /**
     * temuan red-team: stok fisik sudah 0 saat webhook settlement telat datang.
     * order tidak boleh di-revive jadi order aktif yang bisa dikirim.
     */
    public function test_revive_order_cancelled_dengan_stok_habis_tidak_menghasilkan_order_aktif(): void
    {
        $merchant = User::factory()->create(['role' => 'pedagang']);
        $store = $this->buatStore($merchant, 'habis');
        $product = $this->buatProduk($store, 'habis', 5);
        $buyer = User::factory()->create(['role' => 'user']);

        // quantity 5; setelah cancel stok balik ke 5, lalu stok dijual ke pembeli lain sampai 0
        $order = $this->buatOrderCancelled($buyer, $store, $product, 5);
        $product->forceFill(['stock' => 0])->save();

        app(PaymentSyncService::class)->applyPaymentStatus($order->id, 'settlement');

        $flagged = $order->fresh();

        // uang tetap tercatat masuk supaya refund bisa dijalankan
        $this->assertEquals('paid', $flagged->payment_status);

        // tapi order TIDAK boleh hidup kembali jadi order biasa
        $this->assertNotEquals('pending', $flagged->shipping_status);
        $this->assertEquals('cancelled', $flagged->shipping_status);
        $this->assertFalse($flagged->canFulfillStock());
        $this->assertTrue((bool) ($flagged->payment_payload['needs_reconciliation'] ?? false));

        // stok tidak boleh disentuh dan tetap 0, ga boleh jadi minus
        $this->assertEquals(0, $product->fresh()->stock);
    }

    /**
     * order yang tidak bisa fulfill stok harus ditolak oleh merchant saat mau dikirim.
     */
    public function test_merchant_tidak_bisa_kirim_order_yang_stoknya_habis(): void
    {
        $merchant = User::factory()->create(['role' => 'pedagang', 'is_password_changed' => true]);
        $store = $this->buatStore($merchant, 'guard');
        $product = $this->buatProduk($store, 'guard', 5);
        $buyer = User::factory()->create(['role' => 'user']);

        $order = $this->buatOrderCancelled($buyer, $store, $product, 5);
        $product->forceFill(['stock' => 0])->save();

        app(PaymentSyncService::class)->applyPaymentStatus($order->id, 'settlement');

        $response = $this->actingAs($merchant)->put(
            route('merchant.orders.update-status', ['id' => $order->id]),
            ['shipping_status' => 'shipped']
        );

        $response->assertSessionHas('error');
        $this->assertEquals('cancelled', $order->fresh()->shipping_status);
    }

    /**
     * deductRestoredStock harus jujur: return false dan tidak nyentuh stok saat stok tidak mencukupi.
     */
    public function test_deduct_restored_stock_jujur_saat_stok_kurang(): void
    {
        $merchant = User::factory()->create(['role' => 'pedagang']);
        $store = $this->buatStore($merchant, 'deduct');
        $product = $this->buatProduk($store, 'deduct', 10);
        $buyer = User::factory()->create(['role' => 'user']);

        $order = $this->buatOrderCancelled($buyer, $store, $product, 4);
        $product->forceFill(['stock' => 1])->save();

        $result = $order->fresh()->deductRestoredStock();

        $this->assertFalse($result);
        $this->assertEquals(1, $product->fresh()->stock);
        // flag restore tetap terpasang karena stok belum ditarik, biar konsisten
        $this->assertNotNull($order->fresh()->stock_restored_at);
    }

    /**
     * item bervarian mengikuti kontrak checkout: checkout men-decrement sku dan master sekaligus,
     * jadi revive juga menarik balik dari dua-duanya. ini memastikan stok tidak menggelembung.
     */
    public function test_revive_order_varian_menarik_balik_sku_dan_master(): void
    {
        $merchant = User::factory()->create(['role' => 'pedagang']);
        $store = $this->buatStore($merchant, 'varian');
        $product = $this->buatProduk($store, 'varian', 20);
        $buyer = User::factory()->create(['role' => 'user']);

        $sku = ProductSku::create([
            'product_id' => $product->id,
            'variant_name' => 'Level 3 - Original',
            'price' => 50000,
            'stock' => 10,
        ]);

        $order = Order::create([
            'store_id' => $store->id,
            'user_id' => $buyer->id,
            'invoice_number' => 'ORD-REVIVE-VAR-'.strtoupper(Str::random(8)),
            'customer_name' => 'Buyer Varian',
            'customer_phone' => '08123456789',
            'shipping_address' => 'Pangandaran',
            'delivery_method' => 'self_pickup',
            'subtotal' => 100000,
            'shipping_cost' => 0,
            'total_amount' => 100000,
            'payment_method' => 'va',
            'payment_channel' => 'bca_va',
            'payment_status' => 'pending',
            'shipping_status' => 'pending',
        ]);

        OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'product_name' => $product->name,
            'variant_name' => 'Level 3 - Original',
            'price' => 50000,
            'quantity' => 2,
            'unit' => 'pcs',
        ]);

        // cancel: stok sku dan master sama-sama dibalikin
        $order->restoreStock();
        $order->update(['shipping_status' => 'cancelled', 'payment_status' => 'failed']);
        $this->assertEquals(12, $sku->fresh()->stock);
        $this->assertEquals(22, $product->fresh()->stock);

        app(PaymentSyncService::class)->applyPaymentStatus($order->id, 'settlement');

        $revived = $order->fresh();
        $this->assertEquals('paid', $revived->payment_status);
        $this->assertEquals('pending', $revived->shipping_status);

        // revive narik balik dari dua-duanya, kembali ke angka sebelum dibatalkan
        $this->assertEquals(10, $sku->fresh()->stock);
        $this->assertEquals(20, $product->fresh()->stock);
    }
}

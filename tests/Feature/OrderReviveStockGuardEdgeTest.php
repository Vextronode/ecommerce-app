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

/**
 * edge case adversarial untuk patch revive order cancelled (temuan red-team oversell).
 * sengaja dipisah dari test milik futaba biar kalau ada yang bocor ketahuan independen.
 */
class OrderReviveStockGuardEdgeTest extends TestCase
{
    use RefreshDatabase;

    private function buatStore(User $merchant, string $prefix): Store
    {
        $store = Store::create([
            'user_id' => $merchant->id,
            'name' => "Toko {$prefix}",
            'slug' => "toko-edge-{$prefix}-".Str::random(6),
        ]);
        $store->forceFill(['pending_balance' => 0, 'available_balance' => 0])->save();

        return $store;
    }

    private function buatProduk(Store $store, string $prefix, int $stock): Product
    {
        $category = Category::create([
            'name' => "Kategori {$prefix}",
            'slug' => "kategori-edge-{$prefix}-".Str::random(6),
        ]);

        return Product::create([
            'store_id' => $store->id,
            'category_id' => $category->id,
            'name' => "Produk {$prefix}",
            'slug' => "produk-edge-{$prefix}-".Str::random(6),
            'price' => 50000,
            'stock' => $stock,
            'is_active' => true,
        ]);
    }

    /**
     * bikin order cancelled yang sudah lewat restoreStock (stock_restored_at terisi).
     * items: array of ['product' => Product, 'quantity' => int, 'variant_name' => ?string, 'price' => int]
     */
    private function buatOrderCancelled(User $buyer, Store $store, array $items, array $overrides = []): Order
    {
        $subtotal = 0;
        foreach ($items as $item) {
            $subtotal += ($item['price'] ?? 50000) * $item['quantity'];
        }

        $order = Order::create(array_merge([
            'store_id' => $store->id,
            'user_id' => $buyer->id,
            'invoice_number' => 'ORD-EDGE-'.strtoupper(Str::random(8)),
            'customer_name' => 'Buyer Edge',
            'customer_phone' => '08123456789',
            'shipping_address' => 'Pangandaran',
            'delivery_method' => 'self_pickup',
            'subtotal' => $subtotal,
            'shipping_cost' => 0,
            'total_amount' => $subtotal,
            'payment_method' => 'va',
            'payment_channel' => 'bca_va',
            'payment_status' => 'pending',
            'shipping_status' => 'pending',
        ], $overrides));

        foreach ($items as $item) {
            OrderItem::create([
                'order_id' => $order->id,
                'product_id' => $item['product']->id,
                'product_name' => $item['product']->name,
                'variant_name' => $item['variant_name'] ?? null,
                'price' => $item['price'] ?? 50000,
                'quantity' => $item['quantity'],
                'unit' => 'pcs',
            ]);
        }

        $order->restoreStock();
        $order->update(['shipping_status' => 'cancelled', 'payment_status' => 'failed']);

        return $order->fresh();
    }

    /**
     * partial insufficiency: dua item berbeda, item kedua stoknya kurang.
     * deductRestoredStock wajib return false tanpa menyentuh stok item pertama sama sekali.
     */
    public function test_partial_insufficiency_tidak_menyentuh_stok_item_pertama(): void
    {
        $merchant = User::factory()->create(['role' => 'pedagang']);
        $store = $this->buatStore($merchant, 'partial');
        $produkA = $this->buatProduk($store, 'partial-a', 10);
        $produkB = $this->buatProduk($store, 'partial-b', 10);
        $buyer = User::factory()->create(['role' => 'user']);

        $order = $this->buatOrderCancelled($buyer, $store, [
            ['product' => $produkA, 'quantity' => 3],
            ['product' => $produkB, 'quantity' => 4],
        ]);

        // setelah restore: A=13, B=14. item kedua dibuat kurang, item pertama tetap cukup.
        $produkB->forceFill(['stock' => 1])->save();

        $result = $order->fresh()->deductRestoredStock();

        $this->assertFalse($result, 'partial insufficiency harus ditolak');
        // item pertama tidak boleh tersentuh sama sekali
        $this->assertEquals(13, $produkA->fresh()->stock, 'stok item pertama tidak boleh berubah saat order ditolak');
        // item kedua juga tidak boleh tersentuh
        $this->assertEquals(1, $produkB->fresh()->stock);
        // flag restore tetap terpasang
        $this->assertNotNull($order->fresh()->stock_restored_at);
    }

    /**
     * campuran item varian + non varian dalam satu order.
     * revive harus memperlakukan sku + master untuk varian, master saja untuk non varian.
     */
    public function test_campuran_item_varian_dan_non_varian(): void
    {
        $merchant = User::factory()->create(['role' => 'pedagang']);
        $store = $this->buatStore($merchant, 'campur');
        $produkVar = $this->buatProduk($store, 'campur-var', 20);
        $produkPlain = $this->buatProduk($store, 'campur-plain', 20);
        $buyer = User::factory()->create(['role' => 'user']);

        $sku = ProductSku::create([
            'product_id' => $produkVar->id,
            'variant_name' => 'Pedas Level 5',
            'price' => 50000,
            'stock' => 8,
        ]);

        $order = $this->buatOrderCancelled($buyer, $store, [
            ['product' => $produkVar, 'quantity' => 2, 'variant_name' => 'Pedas Level 5'],
            ['product' => $produkPlain, 'quantity' => 3],
        ]);

        // setelah restore: sku=10, master var=22, plain=23
        $this->assertEquals(10, $sku->fresh()->stock);
        $this->assertEquals(22, $produkVar->fresh()->stock);
        $this->assertEquals(23, $produkPlain->fresh()->stock);

        app(PaymentSyncService::class)->applyPaymentStatus($order->id, 'settlement');

        $revived = $order->fresh();
        $this->assertEquals('paid', $revived->payment_status);
        $this->assertEquals('pending', $revived->shipping_status);
        // revive: sku 10-2=8, master var 22-2=20, plain 23-3=20
        $this->assertEquals(8, $sku->fresh()->stock);
        $this->assertEquals(20, $produkVar->fresh()->stock);
        $this->assertEquals(20, $produkPlain->fresh()->stock);
    }

    /**
     * order cancelled tanpa restore stok sama sekali (stock_restored_at null).
     * revive harus aman: order tetap boleh hidup karena stoknya belum pernah dibalikin.
     */
    public function test_revive_order_cancelled_tanpa_restore_stok_tetap_aman(): void
    {
        $merchant = User::factory()->create(['role' => 'pedagang']);
        $store = $this->buatStore($merchant, 'norestore');
        $produk = $this->buatProduk($store, 'norestore', 10);
        $buyer = User::factory()->create(['role' => 'user']);

        // order cancelled tapi stock_restored_at tetap null (cancel belum sempat restore)
        $order = Order::create([
            'store_id' => $store->id,
            'user_id' => $buyer->id,
            'invoice_number' => 'ORD-EDGE-NR-'.strtoupper(Str::random(8)),
            'customer_name' => 'Buyer NoRestore',
            'customer_phone' => '08123456789',
            'shipping_address' => 'Pangandaran',
            'delivery_method' => 'self_pickup',
            'subtotal' => 100000,
            'shipping_cost' => 0,
            'total_amount' => 100000,
            'payment_method' => 'va',
            'payment_channel' => 'bca_va',
            'payment_status' => 'failed',
            'shipping_status' => 'cancelled',
        ]);
        OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $produk->id,
            'product_name' => $produk->name,
            'price' => 50000,
            'quantity' => 2,
            'unit' => 'pcs',
        ]);

        $this->assertNull($order->fresh()->stock_restored_at);

        app(PaymentSyncService::class)->applyPaymentStatus($order->id, 'settlement');

        $revived = $order->fresh();
        $this->assertEquals('paid', $revived->payment_status);
        // stok belum pernah dibalikin, jadi order boleh lanjut tanpa nyentuh stok
        $this->assertEquals('pending', $revived->shipping_status);
        $this->assertEquals(10, $produk->fresh()->stock, 'stok tidak boleh ditarik kalau belum pernah direstore');
    }

    /**
     * idempotensi: webhook settlement berturut-turut tidak boleh dobel deduct stok,
     * dobel escrow, atau dobel menandai needs_reconciliation.
     */
    public function test_webhook_settlement_beruntun_idempoten_tanpa_dobel(): void
    {
        $merchant = User::factory()->create(['role' => 'pedagang']);
        $store = $this->buatStore($merchant, 'idem');
        $produk = $this->buatProduk($store, 'idem', 20);
        $buyer = User::factory()->create(['role' => 'user']);

        $order = $this->buatOrderCancelled($buyer, $store, [
            ['product' => $produk, 'quantity' => 3],
        ]);

        $service = app(PaymentSyncService::class);
        // stok awal 20, cancel membalikin ke 23, revive pertama menarik balik 3 => 20
        $service->applyPaymentStatus($order->id, 'settlement');
        $afterFirst = $produk->fresh()->stock;
        $escrowFirst = $store->fresh()->pending_balance;

        // webhook kedua dan ketiga (retry dari midtrans)
        $service->applyPaymentStatus($order->id, 'settlement');
        $service->applyPaymentStatus($order->id, 'settlement');

        $this->assertEquals($afterFirst, $produk->fresh()->stock, 'stok tidak boleh dobel ditarik');
        $this->assertEquals(20, $produk->fresh()->stock);
        $this->assertEquals($escrowFirst, $store->fresh()->pending_balance, 'escrow tidak boleh dobel dikredit');
        $this->assertEquals('paid', $order->fresh()->payment_status);
        $this->assertEquals('pending', $order->fresh()->shipping_status);
        $this->assertNull($order->fresh()->stock_restored_at);
    }

    /**
     * idempotensi jalur gagal: settlement beruntun saat stok habis tidak boleh dobel flag,
     * dan tidak boleh diam-diam menghidupkan order di percobaan berikutnya.
     */
    public function test_webhook_gagal_revive_beruntun_tetap_cancelled_dan_flag_tidak_dobel(): void
    {
        $merchant = User::factory()->create(['role' => 'pedagang']);
        $store = $this->buatStore($merchant, 'idemfail');
        $produk = $this->buatProduk($store, 'idemfail', 10);
        $buyer = User::factory()->create(['role' => 'user']);

        $order = $this->buatOrderCancelled($buyer, $store, [
            ['product' => $produk, 'quantity' => 5],
        ]);
        $produk->forceFill(['stock' => 0])->save();

        $service = app(PaymentSyncService::class);
        $service->applyPaymentStatus($order->id, 'settlement');
        $service->applyPaymentStatus($order->id, 'settlement');

        $flagged = $order->fresh();
        $this->assertEquals('cancelled', $flagged->shipping_status);
        $this->assertEquals('paid', $flagged->payment_status);
        $this->assertEquals(0, $produk->fresh()->stock);
        // payload harus tetap valid dan flag konsisten (bukan array nested aneh)
        $this->assertIsArray($flagged->payment_payload);
        $this->assertTrue((bool) ($flagged->payment_payload['needs_reconciliation'] ?? false));
    }

    /**
     * order cod: revive tidak boleh berlaku karena cod bukan alur payment gateway.
     * guard stok hilir tetap bekerja untuk order cod yang kehabisan stok.
     */
    public function test_order_cod_tetap_kena_guard_stok_hilir(): void
    {
        $merchant = User::factory()->create(['role' => 'pedagang', 'is_password_changed' => true]);
        $store = $this->buatStore($merchant, 'cod');
        $produk = $this->buatProduk($store, 'cod', 5);
        $buyer = User::factory()->create(['role' => 'user']);

        $order = Order::create([
            'store_id' => $store->id,
            'user_id' => $buyer->id,
            'invoice_number' => 'ORD-EDGE-COD-'.strtoupper(Str::random(8)),
            'customer_name' => 'Buyer COD',
            'customer_phone' => '08123456789',
            'shipping_address' => 'Pangandaran',
            'delivery_method' => 'self_pickup',
            'subtotal' => 100000,
            'shipping_cost' => 0,
            'total_amount' => 100000,
            'payment_method' => 'cod',
            'payment_channel' => null,
            'payment_status' => 'pending',
            'shipping_status' => 'processing',
        ]);
        OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $produk->id,
            'product_name' => $produk->name,
            'price' => 50000,
            'quantity' => 2,
            'unit' => 'pcs',
        ]);

        // stok dijual habis oleh pembeli lain
        $produk->forceFill(['stock' => 0])->save();

        $this->assertFalse($order->fresh()->canFulfillStock());

        // stok 0 tapi qty 2 harus ditolak saat merchant mau kirim. qty 2 > stok 0.
        $response = $this->actingAs($merchant)->put(
            route('merchant.orders.update-status', ['id' => $order->id]),
            ['shipping_status' => 'shipped']
        );

        $response->assertSessionHas('error');
        $this->assertEquals('processing', $order->fresh()->shipping_status);
    }

    /**
     * qty lebih besar dari stok tapi stok masih positif (bukan nol).
     * guard harus menolak revive, karena butuh qty penuh bukan sebagian.
     */
    public function test_qty_lebih_besar_dari_stok_positif_ditolak_saat_revive(): void
    {
        $merchant = User::factory()->create(['role' => 'pedagang']);
        $store = $this->buatStore($merchant, 'qtygt');
        $produk = $this->buatProduk($store, 'qtygt', 20);
        $buyer = User::factory()->create(['role' => 'user']);

        $order = $this->buatOrderCancelled($buyer, $store, [
            ['product' => $produk, 'quantity' => 10],
        ]);

        // butuh 10, stok cuma 3 (masih positif, tapi kurang)
        $produk->forceFill(['stock' => 3])->save();

        app(PaymentSyncService::class)->applyPaymentStatus($order->id, 'settlement');

        $flagged = $order->fresh();
        $this->assertEquals('cancelled', $flagged->shipping_status);
        $this->assertEquals('paid', $flagged->payment_status);
        $this->assertEquals(3, $produk->fresh()->stock, 'stok tidak boleh ditarik saat qty tidak terpenuhi');
        $this->assertTrue((bool) ($flagged->payment_payload['needs_reconciliation'] ?? false));
        $this->assertFalse($flagged->canFulfillStock());
    }

    /**
     * hasSufficientStockForReactivation harus false kalau sku varian hilang walau master cukup.
     */
    public function test_varian_hilang_master_cukup_tetap_dianggap_tidak_cukup(): void
    {
        $merchant = User::factory()->create(['role' => 'pedagang']);
        $store = $this->buatStore($merchant, 'skuhilang');
        $produk = $this->buatProduk($store, 'skuhilang', 50);
        $buyer = User::factory()->create(['role' => 'user']);

        $sku = ProductSku::create([
            'product_id' => $produk->id,
            'variant_name' => 'Original',
            'price' => 50000,
            'stock' => 20,
        ]);

        $order = $this->buatOrderCancelled($buyer, $store, [
            ['product' => $produk, 'quantity' => 2, 'variant_name' => 'Original'],
        ]);

        // sku dihapus merchant, master masih banyak
        $sku->delete();

        $this->assertFalse($order->fresh()->hasSufficientStockForReactivation());
    }

    /**
     * canFulfillStock harus false kalau stock_restored_at masih terisi (stok di tangan pembeli lain).
     */
    public function test_can_fulfill_stock_false_kalau_stok_masih_direstore(): void
    {
        $merchant = User::factory()->create(['role' => 'pedagang']);
        $store = $this->buatStore($merchant, 'restoredflag');
        $produk = $this->buatProduk($store, 'restoredflag', 20);
        $buyer = User::factory()->create(['role' => 'user']);

        $order = $this->buatOrderCancelled($buyer, $store, [
            ['product' => $produk, 'quantity' => 2],
        ]);

        // order cancelled + stok sudah dibalikin + stok fisik kosong total
        $produk->forceFill(['stock' => 0])->save();

        $this->assertNotNull($order->fresh()->stock_restored_at);
        $this->assertFalse($order->fresh()->canFulfillStock());
    }
}

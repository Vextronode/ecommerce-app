<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductReview;
use App\Models\Store;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Tests\TestCase;

/**
 * memverifikasi agregasi statistik toko di halaman katalog.
 *
 * sebelum patch, setiap toko menjalankan satu query Product terpisah
 * (n+1 kuadratik). test ini mengunci dua hal sekaligus: angkanya benar,
 * dan jumlah query tidak tumbuh mengikuti jumlah toko.
 */
class ShopStoreStatsTest extends TestCase
{
    use RefreshDatabase;

    private function buatToko(User $merchant, string $nama, string $prefix): Store
    {
        $store = Store::create([
            'user_id' => $merchant->id,
            'name' => $nama,
            'slug' => "toko-{$prefix}-".Str::random(6),
            'has_completed_tour' => true,
        ]);
        $store->forceFill(['pending_balance' => 0, 'available_balance' => 0, 'sid_status' => 'verified'])->save();

        return $store;
    }

    private function buatProduk(Store $store, User $merchant, string $nama, int $stok = 100): Product
    {
        $category = Category::firstOrCreate(
            ['slug' => 'kategori-uji'],
            ['name' => 'Kategori Uji']
        );

        return Product::create([
            'store_id' => $store->id,
            'category_id' => $category->id,
            'name' => $nama,
            'slug' => Str::slug($nama).'-'.Str::random(6),
            'price' => 50000,
            'stock' => $stok,
            'is_active' => true,
        ]);
    }

    private function buatOrderDelivered(Store $store, User $buyer, Product $product, int $qty): void
    {
        $order = Order::create([
            'store_id' => $store->id,
            'user_id' => $buyer->id,
            'invoice_number' => 'ORD-STAT-'.strtoupper(Str::random(8)),
            'customer_name' => 'Buyer Stat',
            'customer_phone' => '08123456789',
            'shipping_address' => 'Pangandaran',
            'delivery_method' => 'self_pickup',
            'subtotal' => 50000 * $qty,
            'shipping_cost' => 0,
            'total_amount' => 50000 * $qty,
            'payment_method' => 'va',
            'payment_channel' => 'bca_va',
            'payment_status' => 'paid',
            'shipping_status' => 'delivered',
        ]);

        OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'product_name' => $product->name,
            'price' => 50000,
            'quantity' => $qty,
            'unit' => 'pcs',
        ]);
    }

    public function test_total_terjual_dan_rating_toko_dihitung_benar(): void
    {
        $merchant = User::factory()->create(['role' => 'pedagang']);
        $buyer = User::factory()->create(['role' => 'user']);

        $store = $this->buatToko($merchant, 'Toko Sumber Rejeki', 'stat');
        $produkA = $this->buatProduk($store, $merchant, 'Produk Statistik A');
        $produkB = $this->buatProduk($store, $merchant, 'Produk Statistik B');

        // dua order delivered: total 5 unit terjual dari dua produk berbeda
        $this->buatOrderDelivered($store, $buyer, $produkA, 2);
        $this->buatOrderDelivered($store, $buyer, $produkB, 3);

        // satu order belum delivered: tidak boleh ikut dihitung
        $belumKirim = Order::create([
            'store_id' => $store->id,
            'user_id' => $buyer->id,
            'invoice_number' => 'ORD-STAT-'.strtoupper(Str::random(8)),
            'customer_name' => 'Buyer Stat',
            'customer_phone' => '08123456789',
            'shipping_address' => 'Pangandaran',
            'delivery_method' => 'self_pickup',
            'subtotal' => 50000,
            'shipping_cost' => 0,
            'total_amount' => 50000,
            'payment_method' => 'va',
            'payment_channel' => 'bca_va',
            'payment_status' => 'paid',
            'shipping_status' => 'processing',
        ]);
        OrderItem::create([
            'order_id' => $belumKirim->id,
            'product_id' => $produkA->id,
            'product_name' => $produkA->name,
            'price' => 50000,
            'quantity' => 9,
            'unit' => 'pcs',
        ]);

        ProductReview::create([
            'order_item_id' => OrderItem::whereHas('order', fn ($q) => $q->where('shipping_status', 'delivered'))->first()->id,
            'user_id' => $buyer->id,
            'store_id' => $store->id,
            'product_id' => $produkA->id,
            'rating' => 4,
            'comment' => 'bagus',
            'is_anonymous' => false,
        ]);

        $response = $this->get('/shop?search=Sumber');

        $response->assertOk();

        $toko = collect($response->viewData('page')['props']['relatedStores'] ?? [])
            ->firstWhere('name', 'Toko Sumber Rejeki');

        $this->assertNotNull($toko, 'toko hasil pencarian harus muncul');
        $this->assertSame(5, (int) $toko['total_sold'], 'hanya order delivered yang dihitung');
        $this->assertSame('4.0', $toko['average_rating']);
    }
    public function test_jumlah_query_tidak_tumbuh_ikut_jumlah_toko(): void
    {
        $buyer = User::factory()->create(['role' => 'user']);

        $ukur = function (): int {
            DB::flushQueryLog();
            DB::enableQueryLog();
            $this->get('/shop?search=Katalog');
            $jumlah = count(DB::getQueryLog());
            DB::disableQueryLog();

            return $jumlah;
        };

        // tiga toko
        for ($i = 1; $i <= 3; $i++) {
            $merchant = User::factory()->create(['role' => 'pedagang']);
            $store = $this->buatToko($merchant, "Toko Katalog {$i}", "k{$i}");
            $this->buatProduk($store, $merchant, "Produk Katalog {$i}");
        }
        $queryTigaToko = $ukur();

        // tambah tiga toko lagi
        for ($i = 4; $i <= 6; $i++) {
            $merchant = User::factory()->create(['role' => 'pedagang']);
            $store = $this->buatToko($merchant, "Toko Katalog {$i}", "k{$i}");
            $this->buatProduk($store, $merchant, "Produk Katalog {$i}");
        }
        $queryEnamToko = $ukur();

        $this->assertLessThanOrEqual(
            $queryTigaToko + 2,
            $queryEnamToko,
            "jumlah query tidak boleh tumbuh mengikuti jumlah toko: 3 toko={$queryTigaToko}, 6 toko={$queryEnamToko}"
        );
    }
}

<?php

namespace Tests\Feature;

use App\Models\Cart;
use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductReview;
use App\Models\Store;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

/**
 * membuktikan pelanggaran unique constraint pada jalur transaksi tidak
 * bocor jadi 500 mentah, melainkan ditangani sebagai conflict yang ramah.
 *
 * di sqlite lockForUpdate tidak menyerialkan request paralel, jadi jalur
 * race bisa dipaksa langsung dengan memicu unique violation yang nyata.
 */
class UniqueRaceBleedTest extends TestCase
{
    use RefreshDatabase;

    private function buatStore(User $merchant, string $prefix): Store
    {
        $store = Store::create([
            'user_id' => $merchant->id,
            'name' => "Toko {$prefix}",
            'slug' => "toko-{$prefix}-".Str::random(6),
        ]);
        $store->forceFill(['pending_balance' => 0, 'available_balance' => 0, 'sid_status' => 'verified'])->save();

        return $store;
    }

    private function buatProduk(Store $store, string $prefix, int $stock = 10): Product
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

    public function test_pelanggaran_unique_cart_tidak_bocor_500(): void
    {
        $merchant = User::factory()->create(['role' => 'pedagang']);
        $store = $this->buatStore($merchant, 'cart');
        $product = $this->buatProduk($store, 'cart');
        $buyer = User::factory()->create(['role' => 'user']);

        Cart::create([
            'user_id' => $buyer->id,
            'product_id' => $product->id,
            'preparation_option' => '',
            'quantity' => 1,
        ]);

        $response = $this->actingAs($buyer)->post('/cart', [
            'product_id' => $product->id,
            'quantity' => 1,
            'preparation_option' => '',
        ]);

        $this->assertNotSame(
            500,
            $response->getStatusCode(),
            'pelanggaran unique pada cart tidak boleh menjadi 500 mentah'
        );

        $this->assertDatabaseCount('carts', 1);
    }

    public function test_pelanggaran_unique_review_tidak_bocor_500(): void
    {
        $merchant = User::factory()->create(['role' => 'pedagang']);
        $store = $this->buatStore($merchant, 'review');
        $product = $this->buatProduk($store, 'review');
        $buyer = User::factory()->create(['role' => 'user']);

        $order = Order::create([
            'store_id' => $store->id,
            'user_id' => $buyer->id,
            'invoice_number' => 'ORD-RACE-'.strtoupper(Str::random(8)),
            'customer_name' => 'Buyer Race',
            'customer_phone' => '08123456789',
            'shipping_address' => 'Pangandaran',
            'delivery_method' => 'self_pickup',
            'subtotal' => 50000,
            'shipping_cost' => 0,
            'total_amount' => 50000,
            'payment_method' => 'va',
            'payment_channel' => 'bca_va',
            'payment_status' => 'paid',
            'shipping_status' => 'delivered',
        ]);

        $item = OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'product_name' => $product->name,
            'price' => 50000,
            'quantity' => 1,
            'unit' => 'pcs',
        ]);

        ProductReview::create([
            'order_item_id' => $item->id,
            'user_id' => $buyer->id,
            'store_id' => $store->id,
            'product_id' => $product->id,
            'rating' => 5,
            'comment' => 'sudah ada',
            'is_anonymous' => false,
        ]);

        $response = $this->actingAs($buyer)->post("/history/rating/{$item->id}", [
            'rating' => 4,
            'comment' => 'ulasan kedua',
        ]);

        $this->assertNotSame(
            500,
            $response->getStatusCode(),
            'pelanggaran unique pada ulasan tidak boleh menjadi 500 mentah'
        );

        $this->assertDatabaseCount('product_reviews', 1);
    }
}

<?php

namespace Tests\Feature;

use App\Models\Cart;
use App\Models\Category;
use App\Models\Product;
use App\Models\Store;
use App\Models\User;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

/**
 * memverifikasi perilaku nyata jalur race pada keranjang.
 *
 * laravel 13 mengimplementasikan updateOrCreate lewat createOrFirst yang
 * menangkap UniqueConstraintViolationException di dalam framework, jadi
 * race insert pada tabel berunique tidak bocor jadi 500.
 *
 * test ini mengunci perilaku itu supaya kalau api framework berubah
 * atau kode diganti ke pola insert mentah, kita langsung tahu.
 */
class CartRaceBehaviorTest extends TestCase
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

    /**
     * updateOrCreate harus menyelesaikan konflik unique dengan menemukan baris
     * yang sudah ada, bukan melempar exception ke luar.
     */
    public function test_update_or_create_menyerap_konflik_unique(): void
    {
        $merchant = User::factory()->create(['role' => 'pedagang']);
        $store = $this->buatStore($merchant, 'serap');
        $product = $this->buatProduk($store, 'serap');
        $buyer = User::factory()->create(['role' => 'user']);

        $attrs = [
            'user_id' => $buyer->id,
            'product_id' => $product->id,
            'preparation_option' => '',
        ];

        Cart::updateOrCreate($attrs, ['quantity' => 1]);
        $kedua = Cart::updateOrCreate($attrs, ['quantity' => 3]);

        $this->assertDatabaseCount('carts', 1);
        $this->assertSame(3, $kedua->quantity);
        $this->assertFalse($kedua->wasRecentlyCreated);
    }

    /**
     * jalur endpoint tetap tidak 500 walaupun dikirim dua kali berturut-turut,
     * karena guard early-return di controller menangkap kasus ini.
     */
    public function test_endpoint_cart_tidak_500_saat_baris_sudah_ada(): void
    {
        $merchant = User::factory()->create(['role' => 'pedagang']);
        $store = $this->buatStore($merchant, 'endpoint');
        $product = $this->buatProduk($store, 'endpoint');
        $buyer = User::factory()->create(['role' => 'user']);

        $this->actingAs($buyer)->post('/cart', [
            'product_id' => $product->id,
            'quantity' => 2,
            'preparation_option' => '',
        ])->assertRedirect();

        $response = $this->actingAs($buyer)->post('/cart', [
            'product_id' => $product->id,
            'quantity' => 2,
            'preparation_option' => '',
        ]);

        $this->assertNotSame(500, $response->getStatusCode());
        $this->assertSame(4, Cart::first()->quantity);
        $this->assertDatabaseCount('carts', 1);
    }

    /**
     * batas nyata framework: insert mentah tetap melempar unique violation.
     * ini yang jadi pengingat kalau ada kode baru memakai create() langsung.
     */
    public function test_insert_mentah_masih_melempar_unique_violation(): void
    {
        $merchant = User::factory()->create(['role' => 'pedagang']);
        $store = $this->buatStore($merchant, 'mentah');
        $product = $this->buatProduk($store, 'mentah');
        $buyer = User::factory()->create(['role' => 'user']);

        $attrs = [
            'user_id' => $buyer->id,
            'product_id' => $product->id,
            'preparation_option' => '',
            'quantity' => 1,
        ];

        Cart::create($attrs);

        $this->expectException(UniqueConstraintViolationException::class);
        Cart::create($attrs);
    }
}

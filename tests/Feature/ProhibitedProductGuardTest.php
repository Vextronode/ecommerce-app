<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\Store;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProhibitedProductGuardTest extends TestCase
{
    use RefreshDatabase;

    private function createMerchant(): array
    {
        $merchant = User::forceCreate([
            'name' => 'Pedagang Uji',
            'email' => 'pedagang-'.uniqid().'@example.test',
            'password' => bcrypt('password123'),
            'role' => 'pedagang',
            'status' => 'active',
            'is_password_changed' => true,
            'email_verified_at' => now(),
        ]);

        $store = Store::forceCreate([
            'user_id' => $merchant->id,
            'name' => 'Toko Uji',
            'slug' => 'toko-uji-'.uniqid(),
            'address' => 'Jl. Cibenda No. 10, Pangandaran',
            'bank_name' => 'BRI',
            'bank_account_number' => '123456789012',
            'bank_account_holder' => 'Pedagang Uji',
            'sid_status' => 'verified',
        ]);

        return [$merchant, $store];
    }

    public function test_merchant_cannot_create_product_with_prohibited_name(): void
    {
        [$merchant, $store] = $this->createMerchant();
        $category = Category::firstOrCreate(['slug' => 'kategori-uji'], ['name' => 'Kategori Uji']);

        $prohibitedNames = [
            'Rokok Gudang Garam Surya 16',
            'roko',
            'udud',
            'gas lpg',
            'Tabung LPG 3kg Melon Hijau',
            'Vape Pod Starter Kit',
            'Benih Bening Lobster Tangkapan',
            'Anggur Merah Amer Cap Orang Tua',
            'Obat Kuat Viagra Asli',
            'Petasan Cabe Ledak Keras',
            'Baju Bekas Impor Thrift Balpres',
        ];

        foreach ($prohibitedNames as $badName) {
            $response = $this->actingAs($merchant)->post('/pedagang/products', [
                'name' => $badName,
                'category_id' => $category->id,
                'price' => 25000,
                'stock' => 10,
                'description' => 'Deskripsi produk biasa',
            ]);

            $response->assertSessionHasErrors('name');
            $this->assertDatabaseMissing('products', [
                'store_id' => $store->id,
                'name' => $badName,
            ]);
        }
    }

    public function test_merchant_cannot_create_product_with_prohibited_description(): void
    {
        [$merchant, $store] = $this->createMerchant();
        $category = Category::firstOrCreate(['slug' => 'kategori-uji'], ['name' => 'Kategori Uji']);

        $response = $this->actingAs($merchant)->post('/pedagang/products', [
            'name' => 'Paket Sembako Murah',
            'category_id' => $category->id,
            'price' => 50000,
            'stock' => 5,
            'description' => 'Paket sembako berisi beras, minyak, dan bonus rokok tembakau iris pilihan.',
        ]);

        $response->assertSessionHasErrors('description');
        $this->assertDatabaseMissing('products', [
            'store_id' => $store->id,
            'name' => 'Paket Sembako Murah',
        ]);
    }

    public function test_merchant_cannot_create_product_with_prohibited_variant_or_sku(): void
    {
        [$merchant, $store] = $this->createMerchant();
        $category = Category::firstOrCreate(['slug' => 'kategori-uji'], ['name' => 'Kategori Uji']);

        $response = $this->actingAs($merchant)->post('/pedagang/products', [
            'name' => 'Paket Alat Tani & Hobi',
            'category_id' => $category->id,
            'description' => 'Paket serbaguna berkualitas tinggi.',
            'variants' => [
                [
                    'name' => 'Pilihan Tambahan',
                    'options' => ['Cangkul', 'Liquid Pod Vape Mangga'],
                ],
            ],
            'skus' => [
                [
                    'variant_name' => 'Cangkul',
                    'price' => 75000,
                    'stock' => 5,
                ],
                [
                    'variant_name' => 'Liquid Pod Vape Mangga',
                    'price' => 90000,
                    'stock' => 5,
                ],
            ],
        ]);

        $response->assertSessionHasErrors(['variants.0.options.1', 'skus.1.variant_name']);
        $this->assertDatabaseMissing('products', [
            'store_id' => $store->id,
            'name' => 'Paket Alat Tani & Hobi',
        ]);
    }

    public function test_merchant_cannot_update_product_to_prohibited_item(): void
    {
        [$merchant, $store] = $this->createMerchant();
        $category = Category::firstOrCreate(['slug' => 'kategori-uji'], ['name' => 'Kategori Uji']);

        // Buat produk awal yang sah
        $product = Product::create([
            'store_id' => $store->id,
            'category_id' => $category->id,
            'name' => 'Kecap Manis Tradisional',
            'slug' => 'kecap-manis-tradisional-'.uniqid(),
            'price' => 12000,
            'stock' => 20,
            'description' => 'Kecap manis kedelai hitam khas daerah Cibenda.',
            'is_active' => true,
        ]);

        // Coba perbarui nama menjadi gas lpg subsidi
        $response = $this->actingAs($merchant)->post("/pedagang/products/{$product->slug}", [
            'name' => 'Gas LPG 3kg Melon Subsidi',
            'category_id' => $category->id,
            'price' => 21000,
            'stock' => 10,
            'description' => 'Kecap manis kedelai hitam.',
        ]);

        $response->assertSessionHasErrors('name');
        $this->assertDatabaseMissing('products', [
            'id' => $product->id,
            'name' => 'Gas LPG 3kg Melon Subsidi',
        ]);
    }

    public function test_merchant_can_create_legitimate_product_successfully(): void
    {
        [$merchant, $store] = $this->createMerchant();
        $category = Category::firstOrCreate(['slug' => 'kategori-uji'], ['name' => 'Kategori Uji']);

        $response = $this->actingAs($merchant)->post('/pedagang/products', [
            'name' => 'Ikan Asin Jambal Roti Pangandaran',
            'category_id' => $category->id,
            'price' => 45000,
            'stock' => 15,
            'description' => 'Ikan asin jambal roti segar olahan tradisional nelayan pesisir Pangandaran, higienis dan gurih.',
        ]);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect();

        $this->assertDatabaseHas('products', [
            'store_id' => $store->id,
            'name' => 'Ikan Asin Jambal Roti Pangandaran',
        ]);
    }
}

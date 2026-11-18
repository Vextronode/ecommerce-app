<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\Store;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SitemapTest extends TestCase
{
    use RefreshDatabase;

    public function test_sitemap_xml_returns_valid_xml_response(): void
    {
        $response = $this->get('/sitemap.xml');

        $response->assertOk();
        $response->assertHeader('Content-Type', 'application/xml; charset=utf-8');
        $this->assertStringContainsString('<?xml version="1.0" encoding="UTF-8"?>', $response->getContent());
        $this->assertStringContainsString('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"', $response->getContent());
        $this->assertStringContainsString('/dashboard', $response->getContent());
        $this->assertStringContainsString('/mitra', $response->getContent());
        $this->assertStringContainsString('/shop', $response->getContent());
        $this->assertStringContainsString('/about', $response->getContent());
    }

    public function test_sitemap_contains_active_products_and_stores(): void
    {
        $user = User::factory()->create();
        $store = Store::create([
            'user_id' => $user->id,
            'name' => 'Toko Berkah Pangandaran',
            'slug' => 'toko-berkah-pangandaran',
            'description' => 'Toko oleh-oleh khas Pangandaran',
        ]);

        $category = Category::create([
            'name' => 'Kuliner Desa',
            'slug' => 'kuliner-desa',
        ]);

        $activeProduct = Product::create([
            'store_id' => $store->id,
            'category_id' => $category->id,
            'name' => 'Sale Pisang Kering Cibenda',
            'slug' => 'sale-pisang-kering-cibenda',
            'description' => 'Sale pisang khas desa',
            'price' => 15000,
            'stock' => 50,
            'is_active' => true,
        ]);

        $inactiveProduct = Product::create([
            'store_id' => $store->id,
            'category_id' => $category->id,
            'name' => 'Produk Nonaktif',
            'slug' => 'produk-nonaktif',
            'description' => 'Produk gudang',
            'price' => 20000,
            'stock' => 0,
            'is_active' => false,
        ]);

        $response = $this->get('/sitemap.xml');

        $response->assertOk();
        $content = $response->getContent();

        $this->assertStringContainsString('/store/toko-berkah-pangandaran', $content);
        $this->assertStringContainsString('/product/sale-pisang-kering-cibenda', $content);
        $this->assertStringNotContainsString('/product/produk-nonaktif', $content);
        $this->assertStringContainsString('/shop?kategori=kuliner-desa', $content);
    }
}

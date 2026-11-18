<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Models\Store;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Cache;

class SitemapController extends Controller
{
    /**
     * Generate dynamic XML sitemap for search engines.
     */
    public function index(): Response
    {
        $cacheTtl = app()->isProduction() ? 21600 : 60; // 6 hours in prod, 1 min in dev

        $xml = Cache::remember('storefront_sitemap_xml', $cacheTtl, function () {
            return $this->generateSitemapXml();
        });

        return response($xml, 200, [
            'Content-Type' => 'application/xml; charset=utf-8',
            'X-Robots-Tag' => 'noindex, follow',
        ]);
    }

    /**
     * Build the raw XML structure.
     */
    private function generateSitemapXml(): string
    {
        $baseUrl = rtrim(config('app.url', url('/')), '/');

        $staticPages = [
            [
                'loc' => $baseUrl.'/dashboard',
                'changefreq' => 'daily',
                'priority' => '1.0',
                'lastmod' => now()->startOfDay()->toIso8601String(),
            ],
            [
                'loc' => $baseUrl.'/shop',
                'changefreq' => 'daily',
                'priority' => '0.9',
                'lastmod' => now()->startOfDay()->toIso8601String(),
            ],
            [
                'loc' => $baseUrl.'/mitra',
                'changefreq' => 'weekly',
                'priority' => '0.8',
                'lastmod' => now()->startOfDay()->toIso8601String(),
            ],
            [
                'loc' => $baseUrl.'/about',
                'changefreq' => 'monthly',
                'priority' => '0.6',
                'lastmod' => now()->startOfMonth()->toIso8601String(),
            ],
            [
                'loc' => $baseUrl.'/kebijakan/perjanjian-mitra',
                'changefreq' => 'monthly',
                'priority' => '0.4',
                'lastmod' => now()->startOfMonth()->toIso8601String(),
            ],
            [
                'loc' => $baseUrl.'/kebijakan/refund',
                'changefreq' => 'monthly',
                'priority' => '0.4',
                'lastmod' => now()->startOfMonth()->toIso8601String(),
            ],
        ];

        // Fetch active products with slug and timestamps
        $products = Product::query()
            ->where('is_active', true)
            ->whereNotNull('slug')
            ->select(['slug', 'updated_at'])
            ->latest('updated_at')
            ->get();

        // Fetch active stores with slug and timestamps
        $stores = Store::query()
            ->whereNotNull('slug')
            ->select(['slug', 'updated_at'])
            ->latest('updated_at')
            ->get();

        // Fetch categories
        $categories = Category::query()
            ->whereNotNull('slug')
            ->select(['slug', 'updated_at'])
            ->get();

        $xml = '<?xml version="1.0" encoding="UTF-8"?>';
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">';

        // 1. Static Pages
        foreach ($staticPages as $page) {
            $xml .= '<url>';
            $xml .= '<loc>'.htmlspecialchars($page['loc'], ENT_XML1).'</loc>';
            if (! empty($page['lastmod'])) {
                $xml .= '<lastmod>'.$page['lastmod'].'</lastmod>';
            }
            $xml .= '<changefreq>'.$page['changefreq'].'</changefreq>';
            $xml .= '<priority>'.$page['priority'].'</priority>';
            $xml .= '</url>';
        }

        // 2. Active Products
        foreach ($products as $product) {
            $productUrl = $baseUrl.'/product/'.$product->slug;
            $xml .= '<url>';
            $xml .= '<loc>'.htmlspecialchars($productUrl, ENT_XML1).'</loc>';
            if ($product->updated_at) {
                $xml .= '<lastmod>'.$product->updated_at->toIso8601String().'</lastmod>';
            }
            $xml .= '<changefreq>daily</changefreq>';
            $xml .= '<priority>0.8</priority>';
            $xml .= '</url>';
        }

        // 3. Active Stores
        foreach ($stores as $store) {
            $storeUrl = $baseUrl.'/store/'.$store->slug;
            $xml .= '<url>';
            $xml .= '<loc>'.htmlspecialchars($storeUrl, ENT_XML1).'</loc>';
            if ($store->updated_at) {
                $xml .= '<lastmod>'.$store->updated_at->toIso8601String().'</lastmod>';
            }
            $xml .= '<changefreq>weekly</changefreq>';
            $xml .= '<priority>0.7</priority>';
            $xml .= '</url>';
        }

        // 4. Categories
        foreach ($categories as $category) {
            $categoryUrl = $baseUrl.'/shop?kategori='.$category->slug;
            $xml .= '<url>';
            $xml .= '<loc>'.htmlspecialchars($categoryUrl, ENT_XML1).'</loc>';
            if ($category->updated_at) {
                $xml .= '<lastmod>'.$category->updated_at->toIso8601String().'</lastmod>';
            }
            $xml .= '<changefreq>weekly</changefreq>';
            $xml .= '<priority>0.6</priority>';
            $xml .= '</url>';
        }

        $xml .= '</urlset>';

        return $xml;
    }
}

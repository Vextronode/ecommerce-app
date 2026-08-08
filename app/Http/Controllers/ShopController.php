<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ShopController extends Controller
{
    public function index(Request $request)
    {
        $categories = Category::all();
        $query = Product::with(['store', 'category'])
            ->withSum(['orderItems as sold' => function ($query) {
                $query->whereHas('order', function ($q) {
                    $q->where('shipping_status', 'delivered');
                });
            }], 'quantity')
            ->withAvg('reviews as rating', 'rating')
            ->where('is_active', true)
            ->where('stock', '>', 0);

        if ($request->has('search') && $request->search != '') {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhereHas('category', function ($qCat) use ($search) {
                      $qCat->where('name', 'like', "%{$search}%");
                  });
            });
        }

        $products = $query->latest()->get();

        $groupedProducts = [];
        foreach ($categories as $category) {
            $catProducts = $products->where('category_id', $category->id)->values();
            if ($catProducts->count() > 0) {
                $groupedProducts[] = [
                    'category_name' => $category->name,
                    'products' => $catProducts,
                ];
            }
        }

        return Inertia::render('Storefront/Shop', [
            'categories' => $categories,
            'groupedProducts' => $groupedProducts,
            'searchQuery' => $request->search ?? '',
        ]);
    }

    public function show($slug)
    {
        $product = Product::with([
            'store' => function ($query) {
                $query->withCount(['products', 'followers'])->withAvg('reviews', 'rating');
            },
            'category',
            'images',
            'variants.options',
            'skus',
            'reviews.user',
        ])
        ->withCount('reviews')
        ->withSum(['orderItems as sold' => function ($query) {
            $query->whereHas('order', function ($q) {
                $q->where('shipping_status', 'delivered');
            });
        }], 'quantity')
        ->withAvg('reviews as rating', 'rating')
        ->where('slug', $slug)->firstOrFail();

        $relatedProducts = Product::with(['store', 'category'])
            ->withSum(['orderItems as sold' => function ($query) {
                $query->whereHas('order', function ($q) {
                    $q->where('shipping_status', 'delivered');
                });
            }], 'quantity')
            ->withAvg('reviews as rating', 'rating')
            ->where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->where('is_active', true)
            ->where('stock', '>', 0)
            ->latest()
            ->take(5)
            ->get();

        return Inertia::render('Storefront/ProductDetail', [
            'product' => $product,
            'relatedProducts' => $relatedProducts,
        ]);
    }

    public function storeDetail(Request $request, $slug)
    {
        $store = \App\Models\Store::withCount(['followers', 'products'])
            ->where('slug', $slug)
            ->firstOrFail();

        // Calculate store rating and sold count across all its products
        $storeStats = \App\Models\Product::where('store_id', $store->id)
            ->withAvg('reviews as rating', 'rating')
            ->withSum(['orderItems as sold' => function ($query) {
                $query->whereHas('order', function ($q) {
                    $q->where('shipping_status', 'delivered');
                });
            }], 'quantity')
            ->get();

        $averageRating = $storeStats->avg('rating');
        $totalSold = $storeStats->sum('sold');

        // Append to store object
        $store->average_rating = $averageRating ? number_format($averageRating, 1) : 0;
        $store->total_sold = $totalSold ?? 0;
        
        // Filter params
        $filter = $request->query('filter', 'populer');
        $tab = $request->query('tab', 'beranda');
        $search = $request->query('search', '');

        // Fetch Categories inside this store (categories of products in this store)
        $categoryIds = \App\Models\Product::where('store_id', $store->id)->distinct()->pluck('category_id');
        $categories = \App\Models\Category::whereIn('id', $categoryIds)
            ->withCount(['products' => function ($q) use ($store) {
                $q->where('store_id', $store->id)->where('is_active', true);
            }])
            ->get();

        // Query for products
        $query = \App\Models\Product::with(['category'])
            ->where('store_id', $store->id)
            ->where('is_active', true)
            ->withSum(['orderItems as sold' => function ($q) {
                $q->whereHas('order', function ($q2) {
                    $q2->where('shipping_status', 'delivered');
                });
            }], 'quantity')
            ->withAvg('reviews as rating', 'rating');

        if ($search) {
            $query->where('name', 'like', "%{$search}%");
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        // Apply sorting based on filter
        switch ($filter) {
            case 'terbaru':
                $query->latest();
                break;
            case 'terlaris':
                $query->orderByDesc('sold');
                break;
            case 'harga_rendah':
                $query->orderBy('price', 'asc');
                break;
            case 'harga_tinggi':
                $query->orderBy('price', 'desc');
                break;
            case 'populer':
            default:
                // For popular, we can mix rating and sold, or just sold for now
                $query->orderByDesc('sold');
                break;
        }

        $products = $query->paginate(20)->withQueryString();

        // Group products for Beranda tab
        $groupedProducts = [];
        if ($tab === 'beranda' && empty($search)) {
            // "Semua Produk"
            $groupedProducts[] = [
                'title' => 'Semua Produk',
                'products' => \App\Models\Product::with(['category', 'store'])
                    ->where('store_id', $store->id)
                    ->where('is_active', true)
                    ->withSum(['orderItems as sold' => function ($q) {
                        $q->whereHas('order', function ($q2) {
                            $q2->where('shipping_status', 'delivered');
                        });
                    }], 'quantity')
                    ->withAvg('reviews as rating', 'rating')
                    ->latest()
                    ->take(10)
                    ->get()
            ];

            // "Produk Terlaris"
            $groupedProducts[] = [
                'title' => 'Produk Terlaris',
                'products' => \App\Models\Product::with(['category', 'store'])
                    ->where('store_id', $store->id)
                    ->where('is_active', true)
                    ->withSum(['orderItems as sold' => function ($q) {
                        $q->whereHas('order', function ($q2) {
                            $q2->where('shipping_status', 'delivered');
                        });
                    }], 'quantity')
                    ->withAvg('reviews as rating', 'rating')
                    ->orderByDesc('sold')
                    ->take(10)
                    ->get()
            ];

            // "Kategori Terbaik" or Specific category
            if ($categories->isNotEmpty()) {
                $firstCat = $categories->first();
                $groupedProducts[] = [
                    'title' => $firstCat->name,
                    'products' => \App\Models\Product::with(['category', 'store'])
                        ->where('store_id', $store->id)
                        ->where('category_id', $firstCat->id)
                        ->where('is_active', true)
                        ->withSum(['orderItems as sold' => function ($q) {
                            $q->whereHas('order', function ($q2) {
                                $q2->where('shipping_status', 'delivered');
                            });
                        }], 'quantity')
                        ->withAvg('reviews as rating', 'rating')
                        ->take(10)
                        ->get()
                ];
            }
        }

        // Check if current user is following the store
        $isFollowing = auth()->check() ? $store->followers()->where('user_id', auth()->id())->exists() : false;

        return Inertia::render('Storefront/StoreDetail', [
            'store' => $store,
            'isFollowing' => $isFollowing,
            'categories' => $categories,
            'products' => $products,
            'groupedProducts' => $groupedProducts,
            'filters' => [
                'tab' => $tab,
                'filter' => $filter,
                'search' => $search,
                'category_id' => $request->query('category_id'),
            ]
        ]);
    }
}

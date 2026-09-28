<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Models\Store;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ShopController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with(['store', 'category'])
            ->withSum(['orderItems as sold' => function ($query) {
                $query->whereHas('order', function ($q) {
                    $q->where('shipping_status', 'delivered');
                });
            }], 'quantity')
            ->withAvg('reviews as rating', 'rating')
            ->where('is_active', true)
            ->where('stock', '>', 0);

        // Category filter
        if ($request->filled('category') && $request->category !== 'all') {
            $cat = $request->category;
            $query->whereHas('category', function ($q) use ($cat) {
                $q->where('slug', $cat)->orWhere('name', $cat);
            });
        }

        // Price range filter
        if ($request->filled('min_price') && is_numeric($request->min_price)) {
            $query->where('price', '>=', (float) $request->min_price);
        }
        if ($request->filled('max_price') && is_numeric($request->max_price)) {
            $query->where('price', '<=', (float) $request->max_price);
        }

        $relatedStores = [];
        if ($request->has('search') && $request->search != '') {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhereHas('category', function ($qCat) use ($search) {
                        $qCat->where('name', 'like', "%{$search}%");
                    });
            });

            // Find related stores (either store name matches OR it sells a matching product)
            $relatedStores = Store::withCount(['products', 'followers'])
                ->where('name', 'like', "%{$search}%")
                ->orWhereHas('products', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                })
                ->get();
                
            foreach ($relatedStores as $store) {
                $storeStats = Product::where('store_id', $store->id)
                    ->withAvg('reviews as rating', 'rating')
                    ->withSum(['orderItems as sold' => function ($query) {
                        $query->whereHas('order', function ($q) {
                            $q->where('shipping_status', 'delivered');
                        });
                    }], 'quantity')
                    ->get();
                    
                $store->average_rating = $storeStats->avg('rating') ? number_format($storeStats->avg('rating'), 1) : "0.0";
                $store->total_sold = $storeStats->sum('sold') ?? 0;
                
                $randomNoise = mt_rand(1, 1000) / 1000;
                $store->score = ((float)$store->average_rating * 20) + $store->total_sold + $randomNoise;
            }
            
            $relatedStores = $relatedStores->sortByDesc('score')->take(3)->values();
        }

        // Sorting: Primary (default, popular, newest) and Extra (price_asc, price_desc, top_rated)
        $sort = $request->get('sort', 'default');
        $extraSort = $request->get('extra_sort', '');

        // Compatibility if extra sort was passed in sort param
        if (in_array($sort, ['price_asc', 'price_desc', 'top_rated']) && empty($extraSort)) {
            $extraSort = $sort;
            $sort = 'default';
        }

        if ($sort === 'newest') {
            $query->latest();
        }

        $products = $query->get();

        // Rating filter in memory if specified
        if ($request->filled('min_rating') && is_numeric($request->min_rating)) {
            $minRating = (float) $request->min_rating;
            $products = $products->filter(function ($p) use ($minRating) {
                return ($p->rating ?? 0) >= $minRating;
            })->values();
        }

        // Apply Primary Sorting
        if ($sort === 'popular') {
            $products = $products->sortByDesc(fn ($p) => ($p->sold ?? 0))->values();
        } elseif ($sort === 'newest') {
            $products = $products->sortByDesc(fn ($p) => $p->created_at)->values();
        } elseif ($sort === 'default') {
            mt_srand((int) date('Ymd'));
            $products = $products->map(function ($product) {
                $noise = mt_rand(1, 1000) / 1000;
                $product->score = (($product->rating ?? 0) * 20) + ($product->sold ?? 0) + $noise;
                return $product;
            })->sortByDesc('score')->values();
            mt_srand();
        }

        // Combine with Extra Sort (Price / Rating)
        if ($extraSort === 'price_asc') {
            if ($sort === 'popular') {
                $products = $products->sort(function ($a, $b) {
                    $soldDiff = ($b->sold ?? 0) <=> ($a->sold ?? 0);
                    return $soldDiff !== 0 ? $soldDiff : ((float)$a->price <=> (float)$b->price);
                })->values();
            } else {
                $products = $products->sortBy(fn ($p) => (float) $p->price)->values();
            }
        } elseif ($extraSort === 'price_desc') {
            if ($sort === 'popular') {
                $products = $products->sort(function ($a, $b) {
                    $soldDiff = ($b->sold ?? 0) <=> ($a->sold ?? 0);
                    return $soldDiff !== 0 ? $soldDiff : ((float)$b->price <=> (float)$a->price);
                })->values();
            } else {
                $products = $products->sortByDesc(fn ($p) => (float) $p->price)->values();
            }
        } elseif ($extraSort === 'top_rated') {
            if ($sort === 'popular') {
                $products = $products->sort(function ($a, $b) {
                    $ratingDiff = ($b->rating ?? 0) <=> ($a->rating ?? 0);
                    return $ratingDiff !== 0 ? $ratingDiff : (($b->sold ?? 0) <=> ($a->sold ?? 0));
                })->values();
            } else {
                $products = $products->sortByDesc(fn ($p) => (float) ($p->rating ?? 0))->values();
            }
        }

        // Fetch categories with active product count
        $categories = Category::withCount(['products' => function ($q) {
            $q->where('is_active', true)->where('stock', '>', 0);
        }])->get();

        return Inertia::render('Storefront/Shop', [
            'allProducts' => $products,
            'searchQuery' => $request->search ?? '',
            'relatedStores' => $relatedStores,
            'categories' => $categories,
            'currentCategory' => $request->category ?? '',
            'currentSort' => $sort,
            'currentExtraSort' => $extraSort,
            'minPrice' => $request->min_price ?? '',
            'maxPrice' => $request->max_price ?? '',
            'minRating' => $request->min_rating ?? '',
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
        $store = Store::withCount(['followers', 'products'])
            ->where('slug', $slug)
            ->firstOrFail();

        // Calculate store rating and sold count across all its products
        $storeStats = Product::where('store_id', $store->id)
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
        $categoryIds = Product::where('store_id', $store->id)->distinct()->pluck('category_id');
        $categories = Category::whereIn('id', $categoryIds)
            ->withCount(['products' => function ($q) use ($store) {
                $q->where('store_id', $store->id)->where('is_active', true);
            }])
            ->get();

        // Query for products
        $query = Product::with(['category'])
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
                'products' => Product::with(['category', 'store'])
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
                    ->get(),
            ];

            // "Produk Terlaris"
            $groupedProducts[] = [
                'title' => 'Produk Terlaris',
                'products' => Product::with(['category', 'store'])
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
                    ->get(),
            ];

            // "Kategori Terbaik" or Specific category
            if ($categories->isNotEmpty()) {
                $firstCat = $categories->first();
                $groupedProducts[] = [
                    'title' => $firstCat->name,
                    'products' => Product::with(['category', 'store'])
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
                        ->get(),
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
            ],
        ]);
    }

    public function toggleFollow(Store $store)
    {
        $user = auth()->user();
        if (! $user) {
            return redirect()->route('login');
        }

        $user->followingStores()->toggle($store->id);
        $isFollowing = $store->followers()->where('user_id', $user->id)->exists();
        $followersCount = $store->followers()->count();

        if (request()->wantsJson()) {
            return response()->json([
                'isFollowing' => $isFollowing,
                'followers_count' => $followersCount,
                'message' => $isFollowing ? 'Berhasil mengikuti toko '.$store->name : 'Berhenti mengikuti toko '.$store->name,
            ]);
        }

        return back()->with('success', $isFollowing ? 'Berhasil mengikuti toko '.$store->name : 'Berhenti mengikuti toko '.$store->name);
    }
}

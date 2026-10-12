<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductReview;
use App\Models\Store;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ShopController extends Controller
{
    // cap jumlah produk yang boleh ditarik ke memori untuk sort/filter in-memory.
    private const MAX_CATALOG_ROWS = 500;

    public function index(Request $request)
    {
        $query = Product::with(['store.user', 'category'])
            ->withSum(['orderItems as sold' => function ($query) {
                $query->whereHas('order', function ($q) {
                    $q->where('shipping_status', 'delivered');
                });
            }], 'quantity')
            ->withAvg('reviews as rating', 'rating')
            ->where('is_active', true)
            ->where('stock', '>', 0)
            ->whereHas('store', function ($q) {
                $q->where('sid_status', 'verified')
                    ->whereHas('user', function ($uq) {
                        $uq->whereIn('status', ['active', 'warning']);
                    });
            });

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

            $relatedStores = Store::withCount(['products', 'followers'])
                ->with('user')
                ->where('sid_status', 'verified')
                ->whereHas('user', function ($uq) {
                    $uq->whereIn('status', ['active', 'warning']);
                })
                ->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhereHas('products', function ($pq) use ($search) {
                            $pq->where('is_active', true)->where('name', 'like', "%{$search}%");
                        });
                })
                ->get();

            // agregasi statistik semua toko dalam dua query agregat, bukan satu query per toko.
            // query pertama menjumlahkan unit terjual lewat order_items (by store_id),
            // query kedua mengambil rata-rata rating lewat product_reviews.
            $storeIds = $relatedStores->pluck('id');

            $soldPerStore = OrderItem::query()
                ->join('orders', 'orders.id', '=', 'order_items.order_id')
                ->whereIn('orders.store_id', $storeIds)
                ->where('orders.shipping_status', 'delivered')
                ->groupBy('orders.store_id')
                ->selectRaw('orders.store_id as store_id, SUM(order_items.quantity) as sold')
                ->pluck('sold', 'store_id');

            $ratingPerStore = ProductReview::query()
                ->join('products', 'products.id', '=', 'product_reviews.product_id')
                ->whereIn('products.store_id', $storeIds)
                ->groupBy('products.store_id')
                ->selectRaw('products.store_id as store_id, AVG(product_reviews.rating) as rating')
                ->pluck('rating', 'store_id');

            foreach ($relatedStores as $store) {
                $averageRating = (float) ($ratingPerStore[$store->id] ?? 0.0);

                $store->average_rating = $averageRating > 0 ? number_format($averageRating, 1) : '0.0';
                $store->total_sold = (int) ($soldPerStore[$store->id] ?? 0);

                $randomNoise = mt_rand(1, 1000) / 1000;
                $store->score = ($averageRating * 20) + $store->total_sold + $randomNoise;
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

        // urutkan di level query kalau bisa, supaya cap 500 mengambil "500 teratas
        // sesuai urutan yang diminta", bukan 500 baris pertama by id. tanpa ini,
        // produk di luar 500 hilang diam-diam saat sort harga/rating.
        // sort default pakai noise deterministik harian yang tidak bisa di SQL -> in-memory.
        $orderDiterapkanDiQuery = true;

        if ($extraSort === 'price_asc') {
            $query->when($sort === 'popular', fn ($q) => $q->orderByDesc('sold'))
                ->orderBy('price', 'asc');
        } elseif ($extraSort === 'price_desc') {
            $query->when($sort === 'popular', fn ($q) => $q->orderByDesc('sold'))
                ->orderBy('price', 'desc');
        } elseif ($extraSort === 'top_rated') {
            $query->when($sort === 'popular', fn ($q) => $q->orderByDesc('sold'))
                ->orderByDesc('rating');
        } elseif ($sort === 'newest') {
            $query->orderByDesc('created_at');
        } elseif ($sort === 'popular') {
            $query->orderByDesc('sold');
        } else {
            $orderDiterapkanDiQuery = false;
        }

        // tie-breaker deterministik saat nilai sort sama
        if ($orderDiterapkanDiQuery) {
            $query->orderByDesc('id');
        }

        $products = $query->limit(self::MAX_CATALOG_ROWS)->get();

        // Rating filter in memory if specified
        if ($request->filled('min_rating') && is_numeric($request->min_rating)) {
            $minRating = (float) $request->min_rating;
            $products = $products->filter(function ($p) use ($minRating) {
                return ($p->rating ?? 0) >= $minRating;
            })->values();
        }

        // sort default (noise deterministik harian) tetap dihitung di memori
        if ($sort === 'default' && $extraSort === '') {
            $dailySeed = date('Ymd');
            $products = $products->map(function ($product) use ($dailySeed) {
                $noise = ((abs(crc32($product->id.'-'.$dailySeed)) % 1000) + 1) / 1000;
                $product->score = (($product->rating ?? 0) * 20) + ($product->sold ?? 0) + $noise;
                return $product;
            })->sortByDesc('score')->values();
        }

        // Fetch categories with active product count
        $categories = Category::withCount(['products' => function ($q) {
            $q->where('is_active', true)
                ->where('stock', '>', 0)
                ->whereHas('store', function ($sq) {
                    $sq->where('sid_status', 'verified')
                        ->whereHas('user', function ($uq) {
                            $uq->whereIn('status', ['active', 'warning']);
                        });
                });
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
            'store.user' => function ($query) {
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
            ->where('is_active', true)
            ->where('slug', $slug)
            ->whereHas('store', function ($q) {
                $q->where('sid_status', 'verified')
                    ->whereHas('user', function ($uq) {
                        $uq->whereIn('status', ['active', 'warning']);
                    });
            })
            ->firstOrFail();

        $product->reviews->each(function ($review) {
            if ($review->is_anonymous) {
                $review->setRelation('user', null);
                $review->makeHidden(['user_id']);
            }
        });

        $relatedProducts = Product::with(['store.user', 'category'])
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
            ->whereHas('store', function ($q) {
                $q->where('sid_status', 'verified')
                    ->whereHas('user', function ($uq) {
                        $uq->whereIn('status', ['active', 'warning']);
                    });
            })
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
            ->where('sid_status', 'verified')
            ->whereHas('user', function ($uq) {
                $uq->whereIn('status', ['active', 'warning']);
            })
            ->firstOrFail();

        // Calculate store rating and sold count across all its products
        $storeStats = Product::where('store_id', $store->id)
            ->withSum(['orderItems as sold' => function ($query) {
                $query->whereHas('order', function ($q) {
                    $q->where('shipping_status', 'delivered');
                });
            }], 'quantity')
            ->get();

        $averageRating = $store->reviews()->avg('rating');
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

        $store->loadMissing('user');
        if ($store->sid_status !== 'verified' || ($store->user && in_array($store->user->status, ['suspended', 'inactive'], true))) {
            abort(404);
        }

        if ((int) $store->user_id === (int) $user->id) {
            if (request()->wantsJson()) {
                return response()->json([
                    'message' => 'Anda tidak dapat mengikuti toko Anda sendiri.',
                ], 422);
            }

            return back()->with('error', 'Anda tidak dapat mengikuti toko Anda sendiri.');
        }

        [$isFollowing, $followersCount] = DB::transaction(function () use ($user, $store) {
            Store::where('id', $store->id)->lockForUpdate()->first();
            $user->followingStores()->toggle($store->id);
            $following = $store->followers()->where('user_id', $user->id)->exists();
            $count = $store->followers()->count();

            return [$following, $count];
        });

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

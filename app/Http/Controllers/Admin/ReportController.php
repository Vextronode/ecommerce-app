<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Store;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController extends Controller
{
    /**
     * Display the Best Selling Products report (1 flagship product per store, sales > 0).
     */
    public function index(Request $request): Response
    {
        $search = trim((string) $request->input('search', ''));
        $period = $request->input('period', 'all');
        $storeId = $request->input('store_id');
        $categoryId = $request->input('category_id');
        $sortBy = $request->input('sort_by', 'sales');
        $perPage = max(5, min((int) $request->input('per_page', 10), 100));

        // Date range filtering
        [$startDate, $endDate] = $this->resolveDateRange($period, $request->input('start_date'), $request->input('end_date'));

        // query 1 top product per store with sales > 0
        $query = $this->buildBestSellingQuery($startDate, $endDate, $search, $storeId, $categoryId, $sortBy);

        $paginated = $query->paginate($perPage)->withQueryString();

        // Calculate rankings based on page offset
        $startRank = ($paginated->currentPage() - 1) * $paginated->perPage();
        $transformed = $paginated->through(function ($product, $index) use ($startRank) {
            $imagePath = $product->image_path;
            if ($imagePath && ! str_starts_with($imagePath, 'http')) {
                $imagePath = '/storage/'.ltrim($imagePath, '/');
            }

            $storeName = $product->store?->name ?? 'Toko Mitra';
            $words = explode(' ', trim($storeName));
            $initials = '';
            foreach ($words as $w) {
                if (! empty($w)) {
                    $initials .= mb_strtoupper(mb_substr($w, 0, 1));
                    if (mb_strlen($initials) >= 2) {
                        break;
                    }
                }
            }
            if (empty($initials)) {
                $initials = 'TK';
            }

            $logoPath = $product->store?->logo_path;
            if ($logoPath && ! str_starts_with($logoPath, 'http')) {
                $logoPath = '/storage/'.ltrim($logoPath, '/');
            }

            $revenue = (float) $product->total_revenue;
            $sales = (int) $product->total_sales;

            return [
                'id' => $product->id,
                'rank' => $startRank + $index + 1,
                'name' => $product->name,
                'slug' => $product->slug,
                'image_path' => $imagePath,
                'category_name' => $product->category?->name ?? 'Umum',
                'price' => (float) $product->price,
                'formatted_price' => 'Rp '.number_format($product->price, 0, ',', '.'),
                'stock' => (int) $product->stock,
                'unit' => $product->unit ?? 'pcs',
                'is_active' => (bool) $product->is_active,
                'store' => [
                    'id' => $product->store?->id,
                    'name' => $storeName,
                    'slug' => $product->store?->slug ?? '',
                    'initials' => $initials,
                    'logo_path' => $logoPath,
                ],
                'total_sales' => $sales,
                'total_revenue' => $revenue,
                'formatted_revenue' => 'Rp '.number_format($revenue, 0, ',', '.'),
                'compact_revenue' => $this->formatCompactCurrency($revenue),
            ];
        });

        // Summary KPI stats for overall reporting
        $stats = $this->calculateSummaryStats($startDate, $endDate, $storeId, $categoryId);

        // Store and Category options for filter dropdown
        $stores = Store::select('id', 'name', 'slug')->orderBy('name')->get();
        $categories = Category::select('id', 'name', 'slug')->orderBy('name')->get();

        return Inertia::render('Admin/Reports/Index', [
            'products' => $transformed,
            'stats' => $stats,
            'stores' => $stores,
            'categories' => $categories,
            'filters' => [
                'search' => $search,
                'period' => $period,
                'store_id' => $storeId ? (int) $storeId : null,
                'category_id' => $categoryId ? (int) $categoryId : null,
                'sort_by' => $sortBy,
                'per_page' => $perPage,
                'start_date' => $request->input('start_date'),
                'end_date' => $request->input('end_date'),
            ],
        ]);
    }

    /**
     * Export the filtered best selling products report as CSV with UTF-8 BOM.
     */
    public function export(Request $request): StreamedResponse
    {
        $search = trim((string) $request->input('search', ''));
        $period = $request->input('period', 'all');
        $storeId = $request->input('store_id');
        $categoryId = $request->input('category_id');
        $sortBy = $request->input('sort_by', 'sales');

        [$startDate, $endDate] = $this->resolveDateRange($period, $request->input('start_date'), $request->input('end_date'));

        $query = $this->buildBestSellingQuery($startDate, $endDate, $search, $storeId, $categoryId, $sortBy);
        $products = $query->get();

        $filename = 'Laporan-Produk-Unggulan-Terlaris-'.now()->format('Ymd-His').'.csv';

        return response()->streamDownload(function () use ($products) {
            $handle = fopen('php://output', 'w');
            // Write UTF-8 BOM for Excel compatibility
            fwrite($handle, "\xEF\xBB\xBF");

            // CSV Header
            fputcsv($handle, [
                'Rank',
                'Nama Produk Unggulan',
                'Kategori',
                'Toko / Merchant',
                'Username Toko',
                'Harga Satuan (Rp)',
                'Stok Tersedia',
                'Total Terjual (Qty)',
                'Total Pendapatan (Rp)',
            ]);

            foreach ($products as $index => $product) {
                fputcsv($handle, [
                    $index + 1,
                    $product->name,
                    $product->category?->name ?? 'Umum',
                    $product->store?->name ?? '-',
                    $product->store?->slug ? '@'.$product->store->slug : '-',
                    (int) $product->price,
                    (int) $product->stock,
                    (int) $product->total_sales,
                    (float) $product->total_revenue,
                ]);
            }

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }

    /**
     * Build the query for top 1 best performing product per store with sales > 0.
     */
    private function buildBestSellingQuery(?Carbon $startDate, ?Carbon $endDate, string $search, $storeId, $categoryId, string $sortBy)
    {
        // Aggregate sales per product (only sales > 0 from paid orders)
        $productSales = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->whereIn('orders.payment_status', ['paid', 'settlement', 'capture', 'success', 'delivered'])
            ->when($startDate, fn ($q) => $q->where('orders.created_at', '>=', $startDate))
            ->when($endDate, fn ($q) => $q->where('orders.created_at', '<=', $endDate))
            ->when($storeId, fn ($q) => $q->where('products.store_id', $storeId))
            ->when($categoryId, fn ($q) => $q->where('products.category_id', $categoryId))
            ->groupBy('products.id', 'products.store_id')
            ->select([
                'products.id as product_id',
                'products.store_id',
                DB::raw('SUM(order_items.quantity) as total_sales'),
                DB::raw('SUM(order_items.price * order_items.quantity) as total_revenue'),
            ])
            ->havingRaw('SUM(order_items.quantity) > 0');

        // Rank products per store so that only 1 top product per store is chosen (store_rank = 1)
        $rankedSales = DB::query()->fromSub($productSales, 'ps')
            ->select([
                'ps.product_id',
                'ps.store_id',
                'ps.total_sales',
                'ps.total_revenue',
                DB::raw('ROW_NUMBER() OVER (PARTITION BY ps.store_id ORDER BY ps.total_sales DESC, ps.total_revenue DESC, ps.product_id ASC) as store_rank'),
            ]);

        $topProductsPerStore = DB::query()->fromSub($rankedSales, 'rs')
            ->where('rs.store_rank', 1);

        // Join with Product model
        $query = Product::query()
            ->joinSub($topProductsPerStore, 'top_sales', 'products.id', '=', 'top_sales.product_id')
            ->with(['store.user', 'category'])
            ->select([
                'products.*',
                'top_sales.total_sales',
                'top_sales.total_revenue',
            ]);

        // Search across product name, slug, category, or store
        if (! empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('products.name', 'like', "%{$search}%")
                    ->orWhere('products.slug', 'like', "%{$search}%")
                    ->orWhereHas('category', fn ($cq) => $cq->where('name', 'like', "%{$search}%"))
                    ->orWhereHas('store', function ($sq) use ($search) {
                        $sq->where('name', 'like', "%{$search}%")
                            ->orWhere('slug', 'like', "%{$search}%");
                    });
            });
        }

        // Sorting across all stores' top products
        if ($sortBy === 'revenue') {
            $query->orderByDesc('top_sales.total_revenue')->orderByDesc('top_sales.total_sales');
        } elseif ($sortBy === 'name') {
            $query->orderBy('products.name', 'asc');
        } else {
            $query->orderByDesc('top_sales.total_sales')->orderByDesc('top_sales.total_revenue');
        }
        $query->orderBy('products.id', 'asc');

        return $query;
    }

    /**
     * Resolve start and end dates based on period keyword.
     */
    private function resolveDateRange(string $period, ?string $customStart, ?string $customEnd): array
    {
        $startDate = null;
        $endDate = null;

        switch ($period) {
            case 'today':
                $startDate = now()->startOfDay();
                $endDate = now()->endOfDay();
                break;
            case 'this_week':
                $startDate = now()->startOfWeek();
                $endDate = now()->endOfWeek();
                break;
            case 'this_month':
                $startDate = now()->startOfMonth();
                $endDate = now()->endOfMonth();
                break;
            case 'this_year':
                $startDate = now()->startOfYear();
                $endDate = now()->endOfYear();
                break;
            case 'custom':
                if ($customStart) {
                    $startDate = Carbon::parse($customStart)->startOfDay();
                }
                if ($customEnd) {
                    $endDate = Carbon::parse($customEnd)->endOfDay();
                }
                break;
            case 'all':
            default:
                $startDate = null;
                $endDate = null;
                break;
        }

        return [$startDate, $endDate];
    }

    /**
     * Calculate summary platform statistics for top cards / quick insights.
     */
    private function calculateSummaryStats(?Carbon $startDate, ?Carbon $endDate, $storeId, $categoryId): array
    {
        $orderItemQuery = OrderItem::whereHas('order', function ($q) use ($startDate, $endDate, $storeId) {
            $q->whereIn('payment_status', ['paid', 'settlement', 'capture', 'success', 'delivered'])
                ->when($startDate, fn ($sub) => $sub->where('orders.created_at', '>=', $startDate))
                ->when($endDate, fn ($sub) => $sub->where('orders.created_at', '<=', $endDate))
                ->when($storeId, fn ($sub) => $sub->where('orders.store_id', $storeId));
        });

        if ($categoryId) {
            $orderItemQuery->whereHas('product', fn ($pq) => $pq->where('category_id', $categoryId));
        }

        $totalRevenue = (float) $orderItemQuery->sum(DB::raw('price * quantity'));
        $totalSalesQty = (int) $orderItemQuery->sum('quantity');
        $totalProducts = Product::when($storeId, fn ($q) => $q->where('store_id', $storeId))
            ->when($categoryId, fn ($q) => $q->where('category_id', $categoryId))
            ->count();

        return [
            'total_revenue' => $totalRevenue,
            'formatted_revenue' => 'Rp '.number_format($totalRevenue, 0, ',', '.'),
            'compact_revenue' => $this->formatCompactCurrency($totalRevenue),
            'total_sales_qty' => $totalSalesQty,
            'total_products' => $totalProducts,
        ];
    }

    /**
     * Helper to format currency in a clean compact format (Rp45.2M, Rp88.5K, etc.)
     */
    private function formatCompactCurrency(float $amount): string
    {
        if ($amount >= 1_000_000_000) {
            return 'Rp '.round($amount / 1_000_000_000, 1).'B';
        }
        if ($amount >= 1_000_000) {
            return 'Rp '.round($amount / 1_000_000, 1).'M';
        }
        if ($amount >= 1_000) {
            return 'Rp '.round($amount / 1_000, 1).'K';
        }

        return 'Rp '.number_format($amount, 0, ',', '.');
    }
}

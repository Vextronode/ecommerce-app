<?php

namespace App\Http\Controllers\Merchant;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AnalyticsController extends Controller
{
    public function index(Request $request)
    {
        $store = $request->user()->store;

        if (! $store) {
            return redirect()->route('merchant.store.setup')->with('error', 'Silakan buat toko terlebih dahulu.');
        }

        $now = Carbon::now();
        $currentYear = $now->year;

        $period = $request->query('period', '12m');
        $startDate = null;

        if ($period === '7d') {
            $startDate = Carbon::now()->subDays(7);
        } elseif ($period === '30d') {
            $startDate = Carbon::now()->subDays(30);
        } elseif ($period === '12m') {
            $startDate = Carbon::now()->subMonths(12);
        }

        // Overview Metrics
        $netAmountExpr = DB::raw('CASE WHEN subtotal > 0 THEN subtotal + shipping_cost ELSE total_amount END');

        $overviewQuery = Order::where('store_id', $store->id)
            ->where('payment_status', 'paid')
            ->where('shipping_status', '!=', 'cancelled');
        $ordersQuery = Order::where('store_id', $store->id);

        if ($startDate) {
            $overviewQuery->where('created_at', '>=', $startDate);
            $ordersQuery->where('created_at', '>=', $startDate);
        }

        $totalPendapatan = (float) (clone $overviewQuery)->sum($netAmountExpr);
        $paidOrdersCount = (clone $overviewQuery)->count();
        $totalOrderan = $ordersQuery->count();

        // Rating Toko Riil: Dihitung dari ulasan produk toko di tabel product_reviews
        $reviewsCount = $store->reviews()->count();
        $ratingShop = $reviewsCount > 0 ? round((float) $store->reviews()->avg('rating'), 1) : 0.0;

        $averageOrder = $paidOrdersCount > 0 ? $totalPendapatan / $paidOrdersCount : 0;

        // Periode pembanding sebelumnya untuk menghitung persentase pertumbuhan asli
        $previousStartDate = null;
        $previousEndDate = $startDate;

        if ($period === '7d') {
            $previousStartDate = Carbon::now()->subDays(14);
        } elseif ($period === '30d') {
            $previousStartDate = Carbon::now()->subDays(60);
        } elseif ($period === '12m') {
            $previousStartDate = Carbon::now()->subMonths(24);
        }

        $prevRevenueQuery = Order::where('store_id', $store->id)
            ->where('payment_status', 'paid')
            ->where('shipping_status', '!=', 'cancelled');
        $prevOrdersQuery = Order::where('store_id', $store->id);

        if ($previousStartDate && $previousEndDate) {
            $prevRevenueQuery->whereBetween('created_at', [$previousStartDate, $previousEndDate]);
            $prevOrdersQuery->whereBetween('created_at', [$previousStartDate, $previousEndDate]);
        }

        $prevRevenue = (float) (clone $prevRevenueQuery)->sum($netAmountExpr);
        $prevPaidOrders = (clone $prevRevenueQuery)->count();
        $prevOrders = $prevOrdersQuery->count();
        $prevAverageOrder = $prevPaidOrders > 0 ? $prevRevenue / $prevPaidOrders : 0;

        $calcGrowth = function ($current, $previous) {
            if ($previous > 0) {
                return round((($current - $previous) / $previous) * 100, 1);
            }
            return $current > 0 ? 100.0 : 0.0;
        };

        $revenueGrowth = $calcGrowth($totalPendapatan, $prevRevenue);
        $ordersGrowth = $calcGrowth($totalOrderan, $prevOrders);
        $averageOrderGrowth = $calcGrowth($averageOrder, $prevAverageOrder);

        // Pertumbuhan rating riil
        $prevRating = 0.0;
        $currRating = 0.0;
        if ($previousStartDate && $previousEndDate) {
            $prevRating = (float) ($store->reviews()->whereBetween('created_at', [$previousStartDate, $previousEndDate])->avg('rating') ?? 0);
        }
        if ($startDate) {
            $currRating = (float) ($store->reviews()->where('created_at', '>=', $startDate)->avg('rating') ?? 0);
        }
        $ratingGrowth = ($prevRating > 0 && $currRating > 0) ? round((($currRating - $prevRating) / $prevRating) * 100, 1) : 0.0;

        // Revenue Trend (portabel lintas basis data: filter pakai rentang tanggal,
        // tidak lagi memakai fungsi YEAR()/MONTH() yang hanya jalan di MySQL).
        // jumlah per bulan dihitung di PHP dari row mentah, bukan lewat SUM() SQL
        // tanpa GROUP BY, sebab MySQL strict (ONLY_FULL_GROUP_BY) menolak campuran
        // agregat dengan kolom non-agregat (error 1140 / SQLSTATE 42000).
        $years = [$currentYear - 2, $currentYear - 1, $currentYear];

        $revenueByMonth = [];
        foreach ($years as $year) {
            $yearStart = "{$year}-01-01 00:00:00";
            $yearEnd = "{$year}-12-31 23:59:59";

            $monthlyRows = Order::where('store_id', $store->id)
                ->whereIn('payment_status', ['paid', 'settlement', 'capture', 'success'])
                ->where('shipping_status', '!=', 'cancelled')
                ->whereBetween('created_at', [$yearStart, $yearEnd])
                ->get(['created_at', 'subtotal', 'shipping_cost', 'total_amount']);

            foreach ($monthlyRows as $row) {
                $monthNumber = (int) Carbon::parse($row->created_at)->format('n');
                $net = $row->subtotal > 0
                    ? (float) $row->subtotal + (float) $row->shipping_cost
                    : (float) $row->total_amount;

                $revenueByMonth[$year][$monthNumber] = ($revenueByMonth[$year][$monthNumber] ?? 0) + $net;
            }
        }

        $revenueTrend = [];
        $months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        for ($i = 1; $i <= 12; $i++) {
            $monthData = ['name' => $months[$i - 1]];
            foreach ($years as $year) {
                $monthData[(string) $year] = (int) ($revenueByMonth[$year][$i] ?? 0);
            }
            $revenueTrend[] = $monthData;
        }

        // Top Categories
        $topCategoriesQuery = OrderItem::join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->join('categories', 'products.category_id', '=', 'categories.id')
            ->where('orders.store_id', $store->id)
            ->whereIn('orders.payment_status', ['paid', 'settlement', 'capture', 'success'])
            ->where('orders.shipping_status', '!=', 'cancelled');

        if ($startDate) {
            $topCategoriesQuery->where('orders.created_at', '>=', $startDate);
        }

        $topCategoriesRaw = $topCategoriesQuery->selectRaw('categories.name, SUM(order_items.quantity) as total_sold')
            ->groupBy('categories.id', 'categories.name')
            ->orderByDesc('total_sold')
            ->limit(3)
            ->get();

        $totalItemsSold = $topCategoriesRaw->sum('total_sold');

        $colors = ['#1f4b45', '#41B9C5', '#b2d8d8', '#e2e8f0', '#f1f5f9'];
        $topCategories = $topCategoriesRaw->map(function ($item, $index) use ($totalItemsSold, $colors) {
            return [
                'name' => $item->name,
                'value' => (int) $item->total_sold,
                'percentage' => $totalItemsSold > 0 ? round(($item->total_sold / $totalItemsSold) * 100) : 0,
                'fill' => $colors[$index % count($colors)],
            ];
        });

        // Orders Trend (portabel: filter pakai rentang tanggal tahun berjalan,
        // agregasi per bulan dihitung dari data terfilter agar aman di semua driver)
        $ordersTrendRows = Order::where('store_id', $store->id)
            ->whereBetween('created_at', ["{$currentYear}-01-01 00:00:00", "{$currentYear}-12-31 23:59:59"])
            ->get(['created_at', 'shipping_status', 'payment_status']);

        $ordersTrendByMonth = [];
        foreach ($ordersTrendRows as $row) {
            $monthNumber = (int) \Illuminate\Support\Carbon::parse($row->created_at)->format('n');
            $ordersTrendByMonth[$monthNumber] ??= ['completed' => 0, 'canceled' => 0];

            $isCanceled = $row->shipping_status === 'cancelled' || in_array($row->payment_status, ['failed', 'refunded'], true);
            $isCompleted = $row->shipping_status === 'delivered' || (in_array($row->payment_status, ['paid', 'settlement', 'capture', 'success'], true) && $row->shipping_status !== 'cancelled');

            if ($isCanceled) {
                $ordersTrendByMonth[$monthNumber]['canceled']++;
            } elseif ($isCompleted) {
                $ordersTrendByMonth[$monthNumber]['completed']++;
            }
        }

        $ordersTrend = [];
        for ($i = 1; $i <= 12; $i++) {
            $ordersTrend[] = [
                'name' => $months[$i - 1],
                'Completed' => $ordersTrendByMonth[$i]['completed'] ?? 0,
                'Canceled' => $ordersTrendByMonth[$i]['canceled'] ?? 0,
            ];
        }

        // Best Selling Products
        $bestSellingQuery = OrderItem::join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->where('orders.store_id', $store->id)
            ->whereIn('orders.payment_status', ['paid', 'settlement', 'capture', 'success'])
            ->where('orders.shipping_status', '!=', 'cancelled');

        if ($startDate) {
            $bestSellingQuery->where('orders.created_at', '>=', $startDate);
        }

        $bestSellingProducts = $bestSellingQuery->selectRaw('products.name, SUM(order_items.quantity) as total_sold, MAX(products.stock) as stock')
            ->groupBy('products.id', 'products.name')
            ->orderByDesc('total_sold')
            ->limit(4)
            ->get()
            ->map(function ($item) {
                return [
                    'name' => $item->name,
                    'sold' => (int) $item->total_sold,
                    'progress' => min(100, max(10, ($item->total_sold / 500) * 100)),
                ];
            });

        return Inertia::render('Merchant/Analytics/Index', [
            'metrics' => [
                'total_revenue' => $totalPendapatan,
                'total_revenue_growth' => $revenueGrowth,
                'total_orders' => $totalOrderan,
                'total_orders_growth' => $ordersGrowth,
                'rating_shop' => $ratingShop,
                'rating_shop_growth' => $reviewsCount > 0 ? $ratingGrowth : 0.0,
                'reviews_count' => $reviewsCount,
                'average_order' => $averageOrder,
                'average_order_growth' => $averageOrderGrowth,
            ],
            'years' => $years,
            'revenueTrend' => $revenueTrend,
            'topCategories' => $topCategories,
            'totalItemsSold' => $totalItemsSold,
            'ordersTrend' => $ordersTrend,
            'bestSellingProducts' => $bestSellingProducts,
            'period' => $period,
        ]);
    }
}

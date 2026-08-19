<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Store;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the admin dashboard with 100% real-time database metrics.
     */
    public function index(Request $request): Response
    {
        // Total Pedagang & Trend
        $totalMerchants = User::where('role', 'pedagang')->count();
        $lastMonthMerchants = User::where('role', 'pedagang')
            ->where('created_at', '<', now()->startOfMonth())
            ->count();
        $merchantsTrend = $lastMonthMerchants > 0
            ? round((($totalMerchants - $lastMonthMerchants) / $lastMonthMerchants) * 100, 1)
            : 0;

        // Total Produk & Trend
        $totalProducts = Product::count();
        $lastMonthProducts = Product::where('created_at', '<', now()->startOfMonth())->count();
        $productsTrend = $lastMonthProducts > 0
            ? round((($totalProducts - $lastMonthProducts) / $lastMonthProducts) * 100, 1)
            : 0;

        // Produk Terjual (Total Qty Sold dari Paid Orders) & Trend
        $totalSold = (int) OrderItem::whereHas('order', function ($q) {
            $q->whereIn('payment_status', ['paid', 'settlement', 'capture', 'success']);
        })->sum('quantity');

        $lastMonthSold = (int) OrderItem::whereHas('order', function ($q) {
            $q->whereIn('payment_status', ['paid', 'settlement', 'capture', 'success'])
                ->where('created_at', '<', now()->startOfMonth());
        })->sum('quantity');

        $soldTrend = $lastMonthSold > 0
            ? round((($totalSold - $lastMonthSold) / $lastMonthSold) * 100, 1)
            : 0;

        // Produk Terlaris (Berdasarkan jumlah terjual aktual dari order yang sukses)
        $topProduct = Product::with(['store', 'category'])
            ->withSum(['orderItems as total_sold' => function ($q) {
                $q->whereHas('order', fn ($o) => $o->whereIn('payment_status', ['paid', 'settlement', 'capture', 'success']));
            }], 'quantity')
            ->having('total_sold', '>', 0)
            ->orderByDesc('total_sold')
            ->first();

        $topProductName = $topProduct ? $topProduct->name : 'Belum ada penjualan';
        $topCategoryName = $topProduct ? ($topProduct->category?->name ?: 'Umum') : '-';

        // Pendaftaran Pedagang (Toko Mitra Terbaru)
        $recentStores = Store::with('user:id,name,email')
            ->latest()
            ->take(6)
            ->get()
            ->map(function ($store) {
                return [
                    'id' => $store->id,
                    'name' => $store->name,
                    'owner_name' => $store->user?->name ?? 'Mitra Pedagang',
                    'date' => $store->created_at ? $store->created_at->diffForHumans() : 'Baru saja',
                    'status' => 'approved',
                ];
            });

        // Grafik Product Sales (Data Real Penjualan 3 Minggu Terakhir)
        $chartData = [];
        $days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

        $startDate = now()->startOfWeek()->subWeeks(2);
        $weeklySales = OrderItem::whereHas('order', function ($q) use ($startDate) {
            $q->whereIn('payment_status', ['paid', 'settlement', 'capture', 'success'])
                ->where('created_at', '>=', $startDate);
        })
            ->selectRaw('DATE(created_at) as date, SUM(quantity) as units')
            ->groupBy('date')
            ->get()
            ->keyBy('date');

        for ($i = 0; $i < 6; $i++) {
            $dayName = $days[$i];
            $dateW1 = now()->startOfWeek()->addDays($i)->format('Y-m-d');
            $dateW2 = now()->startOfWeek()->subWeeks(1)->addDays($i)->format('Y-m-d');
            $dateW3 = now()->startOfWeek()->subWeeks(2)->addDays($i)->format('Y-m-d');

            $valW1 = isset($weeklySales[$dateW1]) ? (int) $weeklySales[$dateW1]->units : 0;
            $valW2 = isset($weeklySales[$dateW2]) ? (int) $weeklySales[$dateW2]->units : 0;
            $valW3 = isset($weeklySales[$dateW3]) ? (int) $weeklySales[$dateW3]->units : 0;

            $chartData[] = [
                'name' => $dayName,
                'minggu1' => $valW1,
                'minggu2' => $valW2,
                'minggu3' => $valW3,
            ];
        }

        // Aktivitas Terbaru Real-Time
        $activities = [];

        // Pendaftaran pedagang terbaru
        $latestStores = Store::with('user')->latest()->take(2)->get();
        foreach ($latestStores as $store) {
            $activities[] = [
                'id' => 'store-'.$store->id,
                'time' => $store->created_at->diffForHumans(),
                'title' => 'Pendaftaran Pedagang',
                'description' => $store->name.' telah menyelesaikan proses pendaftaran sebagai pedagang mitra.',
                'dotColor' => 'teal',
            ];
        }

        // Pesanan/transaksi terbaru
        $latestOrders = Order::with('user')->latest()->take(2)->get();
        foreach ($latestOrders as $order) {
            $activities[] = [
                'id' => 'order-'.$order->id,
                'time' => $order->created_at->diffForHumans(),
                'title' => 'Pesanan Baru #'.$order->order_number,
                'description' => 'Transaksi baru senilai Rp '.number_format($order->total_amount, 0, ',', '.').' dibuat oleh '.($order->user?->name ?: 'Pelanggan').'.',
                'dotColor' => 'amber',
            ];
        }

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'total_merchants' => $totalMerchants,
                'total_products' => $totalProducts,
                'total_sold' => $totalSold,
                'top_product_name' => $topProductName,
                'top_category_name' => $topCategoryName,
                'merchants_trend' => ($merchantsTrend >= 0 ? '+' : '').$merchantsTrend.'%',
                'products_trend' => ($productsTrend >= 0 ? '+' : '').$productsTrend.'%',
                'sold_trend' => ($soldTrend >= 0 ? '+' : '').$soldTrend.'%',
            ],
            'chartData' => $chartData,
            'registrations' => $recentStores,
            'activities' => $activities,
        ]);
    }
}

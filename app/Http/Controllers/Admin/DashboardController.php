<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\Store;
use App\Models\User;
use App\Models\Withdrawal;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the admin dashboard.
     */
    public function index(Request $request): Response
    {
        $totalUsers = User::where('role', 'user')->count();
        $totalMerchants = User::where('role', 'pedagang')->count();
        $totalStores = Store::count();
        $totalProducts = Product::count();
        $totalOrders = Order::count();
        $totalRevenue = Order::where('payment_status', 'paid')->sum('total_amount');
        $pendingWithdrawals = Withdrawal::where('status', 'pending')->count();

        $recentOrders = Order::with(['user:id,name,email', 'items.product:id,name'])
            ->latest()
            ->take(5)
            ->get();

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'total_users' => $totalUsers,
                'total_merchants' => $totalMerchants,
                'total_stores' => $totalStores,
                'total_products' => $totalProducts,
                'total_orders' => $totalOrders,
                'total_revenue' => (float) $totalRevenue,
                'pending_withdrawals' => $pendingWithdrawals,
            ],
            'recent_orders' => $recentOrders,
        ]);
    }
}

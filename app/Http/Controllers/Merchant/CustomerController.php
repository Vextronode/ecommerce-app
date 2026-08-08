<?php

namespace App\Http\Controllers\Merchant;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user()->load('store');
        $storeId = $user->store ? $user->store->id : null;

        if (!$storeId) {
            return redirect()->route('merchant.store.setup');
        }

        $statusFilter = $request->query('status', 'All Status');

        // Total Customers Metric
        $totalCustomers = Order::where('store_id', $storeId)->distinct('user_id')->count('user_id');

        // Total Customers Last Month Metric
        $lastMonthStart = Carbon::now()->subMonth()->startOfMonth();
        $lastMonthEnd = Carbon::now()->subMonth()->endOfMonth();
        
        $totalCustomersLastMonth = Order::where('store_id', $storeId)
            ->where('created_at', '<', Carbon::now()->startOfMonth())
            ->distinct('user_id')
            ->count('user_id');

        $totalCustomersGrowth = $totalCustomersLastMonth > 0 
            ? (($totalCustomers - $totalCustomersLastMonth) / $totalCustomersLastMonth) * 100 
            : ($totalCustomers > 0 ? 100 : 0);

        // New Customers This Month Metric
        $newCustomersThisMonth = Order::where('store_id', $storeId)
            ->select('user_id')
            ->groupBy('user_id')
            ->havingRaw('MIN(created_at) >= ?', [Carbon::now()->startOfMonth()])
            ->get()
            ->count();

        // New Customers Last Month Metric
        $newCustomersLastMonth = Order::where('store_id', $storeId)
            ->select('user_id')
            ->groupBy('user_id')
            ->havingRaw('MIN(created_at) >= ? AND MIN(created_at) <= ?', [$lastMonthStart, $lastMonthEnd])
            ->get()
            ->count();

        $newCustomersGrowth = $newCustomersLastMonth > 0
            ? (($newCustomersThisMonth - $newCustomersLastMonth) / $newCustomersLastMonth) * 100
            : ($newCustomersThisMonth > 0 ? 100 : 0);

        // Fetch Customers List
        $query = User::whereHas('orders', function ($query) use ($storeId) {
            $query->where('store_id', $storeId);
        })
        ->withCount(['orders as store_orders_count' => function ($query) use ($storeId) {
            $query->where('store_id', $storeId);
        }])
        ->withSum(['orders as store_total_spent' => function ($query) use ($storeId) {
            $query->where('store_id', $storeId);
        }], 'total_amount')
        ->addSelect([
            'join_date' => Order::selectRaw('MIN(created_at)')
                ->whereColumn('user_id', 'users.id')
                ->where('store_id', $storeId)
                ->limit(1),
            'latest_phone' => Order::select('customer_phone')
                ->whereColumn('user_id', 'users.id')
                ->where('store_id', $storeId)
                ->orderByDesc('created_at')
                ->limit(1)
        ]);

        // Filter by Status
        if ($statusFilter === 'New') {
            $thirtyDaysAgo = Carbon::now()->subDays(30);
            $query->whereIn('id', function($q) use ($storeId, $thirtyDaysAgo) {
                $q->select('user_id')
                  ->from('orders')
                  ->where('store_id', $storeId)
                  ->groupBy('user_id')
                  ->havingRaw('MIN(created_at) >= ?', [$thirtyDaysAgo]);
            });
        } elseif ($statusFilter === 'Active') {
            $thirtyDaysAgo = Carbon::now()->subDays(30);
            $query->whereIn('id', function($q) use ($storeId, $thirtyDaysAgo) {
                $q->select('user_id')
                  ->from('orders')
                  ->where('store_id', $storeId)
                  ->groupBy('user_id')
                  ->havingRaw('MIN(created_at) < ?', [$thirtyDaysAgo]);
            });
        }

        $customers = $query->paginate(10)->through(function ($user) {
            $joinDate = Carbon::parse($user->join_date);
            $isNew = $joinDate->diffInDays(Carbon::now()) <= 30;
            
            return [
                'id' => $user->id,
                'customer_id' => '#CUS-' . str_pad($user->id, 2, '0', STR_PAD_LEFT),
                'name' => $user->name,
                'avatar' => $user->profile_photo_path ? asset('storage/' . $user->profile_photo_path) : null,
                'email' => $user->email,
                'phone' => $user->latest_phone ?? $user->phone ?? '-',
                'orders_count' => $user->store_orders_count,
                'total_spent' => $user->store_total_spent ?? 0,
                'join_date' => $joinDate->format('M d, Y'),
                'status' => $isNew ? 'New' : 'Active',
            ];
        });

        return Inertia::render('Merchant/Customers/Index', [
            'metrics' => [
                'total_customers' => $totalCustomers,
                'total_customers_growth' => round($totalCustomersGrowth, 1),
                'new_customers' => $newCustomersThisMonth,
                'new_customers_growth' => round($newCustomersGrowth, 1),
            ],
            'customers' => $customers,
            'filters' => [
                'status' => $statusFilter
            ]
        ]);
    }
}

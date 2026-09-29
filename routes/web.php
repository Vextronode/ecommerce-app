<?php

use App\Http\Controllers\Admin\MerchantController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Auth\SocialiteController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DeliveryTrackerController;
use App\Http\Controllers\Merchant\AnalyticsController;
use App\Http\Controllers\Merchant\CustomerController;
use App\Http\Controllers\Merchant\MerchantSetupController;
use App\Http\Controllers\Merchant\OrderController;
use App\Http\Controllers\Merchant\ProductController;
use App\Http\Controllers\Merchant\SettingsController;
use App\Http\Controllers\Merchant\WithdrawalController;
use App\Http\Controllers\MidtransCallbackController;
use App\Http\Controllers\OrderHistoryController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ProductReviewController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ShopController;
use App\Http\Middleware\CheckMerchantSetup;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::redirect('/', '/dashboard');

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['storefront.user'])
    ->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/api/notifications', [\App\Http\Controllers\NotificationController::class, 'index'])->name('notifications.index');
    Route::get('/api/notifications/unread-count', [\App\Http\Controllers\NotificationController::class, 'unreadCount'])->name('notifications.unreadCount');
    Route::post('/api/notifications/mark-all-read', [\App\Http\Controllers\NotificationController::class, 'markAllAsRead'])->name('notifications.markAllAsRead');
    Route::post('/api/notifications/clear-all', [\App\Http\Controllers\NotificationController::class, 'clearAll'])->name('notifications.clearAll');
    Route::post('/api/notifications/fcm-token', [\App\Http\Controllers\NotificationController::class, 'saveFcmToken'])
        ->middleware('throttle:fcm-token')
        ->name('notifications.saveFcmToken');
    Route::post('/api/notifications/{id}/mark-as-read', [\App\Http\Controllers\NotificationController::class, 'markAsRead'])->name('notifications.markAsRead');
    Route::delete('/api/notifications/{id}', [\App\Http\Controllers\NotificationController::class, 'destroy'])->name('notifications.destroy');
});

// Public Storefront Browsing (Guest & User)
Route::middleware(['storefront.user'])->group(function () {
    Route::get('/about', [\App\Http\Controllers\InfoPageController::class, 'about'])->name('about');
    Route::get('/shop', [ShopController::class, 'index'])->name('shop');
    Route::get('/product/{slug}', [ShopController::class, 'show'])->name('product.detail');
    Route::get('/store/{slug}', [ShopController::class, 'storeDetail'])->name('store.detail');
});

// Protected Storefront Actions (Requires Login & Role User)
Route::middleware(['auth', 'role:user'])->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::delete('/profile/other-sessions', [ProfileController::class, 'destroyOtherSessions'])->name('profile.other-sessions.destroy');
    Route::post('/profile/photo', [ProfileController::class, 'updatePhoto'])->name('profile.photo.update');
    Route::get('/checkout', [CheckoutController::class, 'index'])->name('checkout');
    Route::post('/checkout', [CheckoutController::class, 'store'])
        ->middleware('throttle:checkout')
        ->name('checkout.store');
    Route::get('/checkout/calculate-fee', [CheckoutController::class, 'calculateFee'])->name('checkout.calculate-fee');
    Route::get('/checkout/success', [CheckoutController::class, 'success'])->name('checkout.success');
    Route::get('/payment/{order}', [PaymentController::class, 'show'])->name('payment.show');
    Route::get('/payment/{order}/check-status', [PaymentController::class, 'checkStatus'])
        ->middleware('throttle:payment-status')
        ->name('payment.check-status');
    Route::get('/history', [OrderHistoryController::class, 'index'])->name('history.index');
    Route::get('/history/{order}', [OrderHistoryController::class, 'show'])->name('history.show');

    // Product Rating Routes
    Route::get('/history/rating/{order_item}', [ProductReviewController::class, 'create'])->name('history.rating.create');
    Route::post('/history/rating/{order_item_id}', [ProductReviewController::class, 'store'])->name('history.rating.store');

    Route::post('/history/{order}/cancel', [OrderHistoryController::class, 'cancel'])->name('history.cancel');
    Route::post('/history/{order}/complete', [OrderHistoryController::class, 'complete'])->name('history.complete');

    Route::get('/cart', [CartController::class, 'index'])->name('cart');
    Route::post('/cart', [CartController::class, 'store'])->name('cart.store');
    Route::patch('/cart/{cart}', [CartController::class, 'update'])->name('cart.update');
    Route::delete('/cart/{cart}', [CartController::class, 'destroy'])->name('cart.destroy');
    Route::post('/store/{store}/follow', [ShopController::class, 'toggleFollow'])->name('store.follow');
    Route::post('/profile/address', [ProfileController::class, 'storeAddress'])->name('profile.address.store');
    Route::put('/profile/address/{id}', [ProfileController::class, 'updateAddress'])->name('profile.address.update');
    Route::delete('/profile/address/{id}', [ProfileController::class, 'destroyAddress'])->name('profile.address.destroy');
    Route::put('/profile/notifications', [ProfileController::class, 'updateNotifications'])->name('profile.notifications.update');
});

$adminPrefix = config('admin.prefix', 'cibenda-portal');

Route::middleware('guest')->group(function () use ($adminPrefix) {
    Route::get('/pedagang/login', function () {
        return Inertia::render('Merchant/Login');
    })->name('merchant.login.view');

    Route::get("/{$adminPrefix}/login", function () {
        return Inertia::render('Admin/Login');
    })->name('admin.login.view');
});

Route::middleware(['auth', 'verified', 'role:admin'])
    ->prefix($adminPrefix)
    ->group(function () {
        Route::get('/dashboard', [App\Http\Controllers\Admin\DashboardController::class, 'index'])->name('admin.dashboard');

        // Manajemen Pedagang (Merchant Management)
        Route::get('/pedagang', [MerchantController::class, 'index'])->name('admin.merchants.index');
        Route::get('/pedagang/create', [MerchantController::class, 'create'])->name('admin.merchants.create');
        Route::post('/pedagang', [MerchantController::class, 'store'])->name('admin.merchants.store');
        Route::put('/pedagang/{id}', [MerchantController::class, 'update'])->name('admin.merchants.update');
        Route::patch('/pedagang/{id}/status', [MerchantController::class, 'updateStatus'])->name('admin.merchants.status');
        Route::patch('/pedagang/{id}/verification', [MerchantController::class, 'updateVerification'])->name('admin.merchants.verification');
        Route::delete('/pedagang/{id}', [MerchantController::class, 'destroy'])->name('admin.merchants.destroy');

        // Laporan Penjualan (Best Selling Products & Platform Reports)
        Route::get('/laporan', [ReportController::class, 'index'])->name('admin.reports.index');
        Route::get('/laporan/export', [ReportController::class, 'export'])->name('admin.reports.export');
    });

// Obfuscation Masking: Return 404 for obvious guessable admin URLs if admin prefix is customized
if ($adminPrefix !== 'admin') {
    Route::any('/admin{any}', fn () => abort(404))->where('any', '.*');
    Route::any('/cibenda-admin{any}', fn () => abort(404))->where('any', '.*');
    Route::any('/login/admin{any}', fn () => abort(404))->where('any', '.*');
}

Route::get('/auth/google/redirect', [SocialiteController::class, 'redirect'])->name('google.redirect');
Route::get('/auth/google/callback', [SocialiteController::class, 'callback'])->name('google.callback');

// Delivery Tracker Routes (Publicly accessible with invoice number)
Route::get('/tracker/{invoice_number}', [DeliveryTrackerController::class, 'show'])->name('tracker.show');
Route::get('/tracker/{invoice_number}/handover', [DeliveryTrackerController::class, 'handover'])->name('tracker.handover')->middleware('signed');
Route::post('/tracker/{invoice_number}/accept-handover', [DeliveryTrackerController::class, 'acceptHandover'])
    ->name('tracker.acceptHandover')
    ->middleware('throttle:tracker-action');
Route::get('/tracker/{invoice_number}/location', [DeliveryTrackerController::class, 'getLocation'])
    ->name('tracker.getLocation')
    ->middleware('throttle:tracker-location');
Route::post('/tracker/{invoice_number}/location', [DeliveryTrackerController::class, 'updateLocation'])
    ->name('tracker.location')
    ->middleware('throttle:tracker-location');
Route::post('/tracker/{invoice_number}/arrive', [DeliveryTrackerController::class, 'markArrived'])
    ->name('tracker.arrive')
    ->middleware('throttle:tracker-action');
Route::post('/tracker/{invoice_number}/complete', [DeliveryTrackerController::class, 'complete'])
    ->name('tracker.complete');

// Multi-Order Batch Delivery Tracker Routes
Route::get('/tracker/batch/{batch_token}/handover', [DeliveryTrackerController::class, 'batchHandover'])
    ->name('tracker.batchHandover')
    ->middleware('signed');
Route::post('/tracker/batch/{batch_token}/accept', [DeliveryTrackerController::class, 'acceptBatchHandover'])
    ->name('tracker.acceptBatchHandover')
    ->middleware('throttle:tracker-action');
Route::get('/tracker/batch/{batch_token}', [DeliveryTrackerController::class, 'showBatch'])
    ->name('tracker.showBatch');
Route::get('/tracker/batch/{batch_token}/location', [DeliveryTrackerController::class, 'getBatchLocation'])
    ->name('tracker.getBatchLocation')
    ->middleware('throttle:tracker-location');
Route::post('/tracker/batch/{batch_token}/location', [DeliveryTrackerController::class, 'updateBatchLocation'])
    ->name('tracker.updateBatchLocation')
    ->middleware('throttle:tracker-location');
Route::post('/tracker/batch/{batch_token}/{invoice_number}/complete', [DeliveryTrackerController::class, 'completeBatchStop'])
    ->name('tracker.completeBatchStop');

// route dashboard pedagang (auth)
Route::middleware(['auth', 'verified', 'role:pedagang', CheckMerchantSetup::class])
    ->prefix('pedagang')
    ->group(function () {
        Route::get('/analytics', [AnalyticsController::class, 'index'])->name('merchant.analytics.index');

        Route::get('/setup-store', function (Request $request) {
            $user = $request->user()->load('store');

            return Inertia::render('Merchant/SetupStore', [
                'initialStoreName' => $user->store?->name ?? '',
            ]);
        })->name('merchant.store.setup');

        Route::post('/setup-store', [MerchantSetupController::class, 'store'])->name('merchant.store.store');

        Route::get('/dashboard', function (Request $request) {
            $user = $request->user()->load('store');
            $storeId = $user->store ? $user->store->id : null;

            $sales = $storeId ? Order::where('store_id', $storeId)->where('shipping_status', 'delivered')->sum('total_amount') : 0;
            $ordersCount = $storeId ? Order::where('store_id', $storeId)->where('shipping_status', 'delivered')->count() : 0;
            $customersCount = $storeId ? Order::where('store_id', $storeId)->distinct('user_id')->count('user_id') : 0;
            $productsCount = $storeId ? Product::where('store_id', $storeId)->count() : 0;

            // Hitung tren pertumbuhan riil (Bulan Ini vs Bulan Lalu)
            $startThisMonth = now()->startOfMonth();
            $startLastMonth = now()->subMonth()->startOfMonth();
            $endLastMonth = now()->subMonth()->endOfMonth();

            $salesThisMonth = $storeId ? (float) Order::where('store_id', $storeId)->where('shipping_status', 'delivered')->where('created_at', '>=', $startThisMonth)->sum('total_amount') : 0;
            $salesLastMonth = $storeId ? (float) Order::where('store_id', $storeId)->where('shipping_status', 'delivered')->whereBetween('created_at', [$startLastMonth, $endLastMonth])->sum('total_amount') : 0;

            $ordersThisMonth = $storeId ? Order::where('store_id', $storeId)->where('shipping_status', 'delivered')->where('created_at', '>=', $startThisMonth)->count() : 0;
            $ordersLastMonth = $storeId ? Order::where('store_id', $storeId)->where('shipping_status', 'delivered')->whereBetween('created_at', [$startLastMonth, $endLastMonth])->count() : 0;

            $customersThisMonth = $storeId ? Order::where('store_id', $storeId)->where('created_at', '>=', $startThisMonth)->distinct('user_id')->count('user_id') : 0;
            $customersLastMonth = $storeId ? Order::where('store_id', $storeId)->whereBetween('created_at', [$startLastMonth, $endLastMonth])->distinct('user_id')->count('user_id') : 0;

            $productsThisMonth = $storeId ? Product::where('store_id', $storeId)->where('created_at', '>=', $startThisMonth)->count() : 0;
            $productsLastMonth = $storeId ? Product::where('store_id', $storeId)->whereBetween('created_at', [$startLastMonth, $endLastMonth])->count() : 0;

            $calcGrowth = function ($current, $previous) {
                if ($previous > 0) {
                    return round((($current - $previous) / $previous) * 100, 1);
                }
                return $current > 0 ? 100.0 : 0.0;
            };

            $salesGrowth = $calcGrowth($salesThisMonth, $salesLastMonth);
            $ordersGrowth = $calcGrowth($ordersThisMonth, $ordersLastMonth);
            $customersGrowth = $calcGrowth($customersThisMonth, $customersLastMonth);
            $productsGrowth = $calcGrowth($productsThisMonth, $productsLastMonth);

            $pending = $storeId ? Order::where('store_id', $storeId)->where('shipping_status', 'pending')->count() : 0;
            $processing = $storeId ? Order::where('store_id', $storeId)->where('shipping_status', 'processing')->count() : 0;
            $shipped = $storeId ? Order::where('store_id', $storeId)->where('shipping_status', 'shipped')->count() : 0;
            $completed = $storeId ? Order::where('store_id', $storeId)->where('shipping_status', 'delivered')->count() : 0;

            $statusMap = [
                'pending' => 'Menunggu',
                'processing' => 'Diproses',
                'shipped' => 'Dikirim',
                'delivered' => 'Selesai',
                'cancelled' => 'Dibatalkan',
            ];

            $recentOrders = $storeId ? Order::with(['items.product'])->where('store_id', $storeId)->where('shipping_status', 'delivered')->orderBy('created_at', 'desc')->take(5)->get()->map(function ($o) use ($statusMap) {
                $firstItem = $o->items->first();

                return [
                    'invoice_number' => $o->invoice_number,
                    'customer_name' => $o->customer_name,
                    'product_name' => $firstItem ? $firstItem->product_name : 'N/A',
                    'product_image' => $firstItem && $firstItem->product ? $firstItem->product->image_path : null,
                    'date' => $o->created_at->format('d M Y'),
                    'amount' => 'Rp '.number_format($o->total_amount, 0, ',', '.'),
                    'status' => $statusMap[$o->shipping_status] ?? ucfirst($o->shipping_status),
                ];
            }) : [];

            $topSelling = $storeId ? Product::where('store_id', $storeId)
                ->withSum('orderItems', 'quantity')
                ->orderBy('order_items_sum_quantity', 'desc')
                ->take(3)
                ->get()
                ->map(function ($p) {
                    return [
                        'name' => $p->name,
                        'category' => $p->category->name ?? 'Umum',
                        'image' => $p->image_path ?? 'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&q=80&w=400',
                        'sold' => $p->order_items_sum_quantity ?? 0,
                        'price' => 'Rp '.number_format($p->price, 0, ',', '.'),
                        'status' => $p->stock > 0 ? 'Tersedia' : 'Stok Habis',
                        'statusColor' => $p->stock > 0 ? 'text-green-500' : 'text-red-500',
                    ];
                }) : [];

            $chartData = [];
            $monthlyChartData = [];
            if ($storeId) {
                // Weekly Data
                $startDate = now()->startOfWeek()->subWeeks(2);
                $weeklyOrders = Order::where('store_id', $storeId)
                    ->where('shipping_status', 'delivered')
                    ->where('created_at', '>=', $startDate)
                    ->get()
                    ->groupBy(function ($o) {
                        return $o->created_at->format('Y-m-d');
                    })
                    ->map(function ($group) {
                        return (float) $group->sum('total_amount');
                    });

                $days = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
                for ($i = 0; $i < 7; $i++) {
                    $dayName = $days[$i];

                    $dateW1 = now()->startOfWeek()->addDays($i)->format('Y-m-d');
                    $dateW2 = now()->startOfWeek()->subWeeks(1)->addDays($i)->format('Y-m-d');
                    $dateW3 = now()->startOfWeek()->subWeeks(2)->addDays($i)->format('Y-m-d');

                    $chartData[] = [
                        'name' => $dayName,
                        'minggu1' => $weeklyOrders[$dateW1] ?? 0,
                        'minggu2' => $weeklyOrders[$dateW2] ?? 0,
                        'minggu3' => $weeklyOrders[$dateW3] ?? 0,
                    ];
                }

                // Monthly Data
                $monthlyOrders = Order::where('store_id', $storeId)
                    ->where('shipping_status', 'delivered')
                    ->where('created_at', '>=', now()->subMonths(5)->startOfMonth())
                    ->get()
                    ->groupBy(function ($o) {
                        return $o->created_at->format('Y-m');
                    })
                    ->map(function ($group) {
                        return (float) $group->sum('total_amount');
                    });

                $monthNames = [
                    1 => 'Jan', 2 => 'Feb', 3 => 'Mar', 4 => 'Apr', 5 => 'Mei', 6 => 'Jun',
                    7 => 'Jul', 8 => 'Agu', 9 => 'Sep', 10 => 'Okt', 11 => 'Nov', 12 => 'Des'
                ];

                for ($m = 5; $m >= 0; $m--) {
                    $dateObj = now()->subMonths($m);
                    $ym = $dateObj->format('Y-m');
                    $monthLabel = $monthNames[(int) $dateObj->format('n')] . ' ' . $dateObj->format('y');
                    $monthlyChartData[] = [
                        'name' => $monthLabel,
                        'sales' => $monthlyOrders[$ym] ?? 0,
                    ];
                }
            }

            return Inertia::render('Merchant/Dashboard', [
                'merchantInfo' => [
                    'name' => $user->name,
                    'store_name' => $user->store ? $user->store->name : 'Toko Anda',
                ],
                'stats' => [
                    'sales' => (float) $sales,
                    'orders' => $ordersCount,
                    'customers' => $customersCount,
                    'products' => $productsCount,
                    'sales_growth' => $salesGrowth,
                    'orders_growth' => $ordersGrowth,
                    'customers_growth' => $customersGrowth,
                    'products_growth' => $productsGrowth,
                ],
                'chartData' => $chartData,
                'monthlyChartData' => $monthlyChartData,
                'recentOrders' => $recentOrders,
                'topSelling' => $topSelling,
                'orderStatus' => [
                    'pending' => $pending,
                    'processing' => $processing,
                    'shipped' => $shipped,
                    'completed' => $completed,
                ],
            ]);
        })->name('merchant.dashboard');

        Route::get('/products', [ProductController::class, 'index'])->name('merchant.products.index');
        Route::get('/products/create', [ProductController::class, 'create'])->name('merchant.products.create');
        Route::post('/products', [ProductController::class, 'store'])->name('merchant.products.store');
        Route::get('/products/{product:slug}/edit', [ProductController::class, 'edit'])->name('merchant.products.edit');
        Route::post('/products/{product:slug}', [ProductController::class, 'update'])->name('merchant.products.update');
        Route::delete('/products/{product:slug}', [ProductController::class, 'destroy'])->name('merchant.products.destroy');
        Route::get('/orders', [OrderController::class, 'index'])->name('merchant.orders.index');
        Route::post('/orders/batch-handover', [OrderController::class, 'generateBatchHandover'])->name('merchant.orders.batch-handover');
        Route::put('/merchant/orders/{id}/status', [OrderController::class, 'updateStatus'])->name('merchant.orders.update-status');
        Route::get('/customers', [CustomerController::class, 'index'])->name('merchant.customers.index');
        Route::get('/settings', [SettingsController::class, 'index'])->name('merchant.settings.index');
        Route::post('/settings', [SettingsController::class, 'update'])->name('merchant.settings.update');
        Route::put('/settings/notifications', [SettingsController::class, 'updateNotifications'])->name('merchant.settings.notifications.update');
        Route::delete('/settings/sessions', [SettingsController::class, 'destroyOtherSessions'])->name('merchant.settings.sessions.destroy');
        Route::get('/withdrawals', [WithdrawalController::class, 'index'])->name('merchant.withdrawals.index');
        Route::post('/withdrawals', [WithdrawalController::class, 'store'])
            ->name('merchant.withdrawals.store')
            ->middleware('throttle:withdrawals');
        Route::put('/withdrawals/bank', [WithdrawalController::class, 'updateBank'])->name('merchant.withdrawals.update-bank');
    });

Route::post('/api/midtrans/callback', [MidtransCallbackController::class, 'handle'])->name('midtrans.callback');

require __DIR__.'/auth.php';

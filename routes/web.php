<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Auth\SocialiteController;
use App\Http\Controllers\Merchant\MerchantSetupController;
use App\Http\Controllers\Merchant\AnalyticsController;

Route::redirect('/', '/dashboard');

Route::get('/dashboard', [\App\Http\Controllers\DashboardController::class, 'index'])
    ->middleware(['storefront.user'])
    ->name('dashboard');

Route::get('/shop', [\App\Http\Controllers\ShopController::class, 'index'])
    ->middleware(['auth', 'verified', 'role:user'])
    ->name('shop');

Route::middleware(['auth', 'role:user'])->group(function () {
    Route::get('/product/{slug}', [\App\Http\Controllers\ShopController::class, 'show'])->name('product.detail');
    Route::get('/store/{slug}', [\App\Http\Controllers\ShopController::class, 'storeDetail'])->name('store.detail');
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::delete('/profile/other-sessions', [ProfileController::class, 'destroyOtherSessions'])->name('profile.other-sessions.destroy');
    Route::post('/profile/photo', [ProfileController::class, 'updatePhoto'])->name('profile.photo.update');
    Route::get('/checkout', [\App\Http\Controllers\CheckoutController::class, 'index'])->name('checkout');
    Route::post('/checkout', [\App\Http\Controllers\CheckoutController::class, 'store'])->name('checkout.store');
    Route::get('/checkout/success', [\App\Http\Controllers\CheckoutController::class, 'success'])->name('checkout.success');
    Route::get('/payment/{order}', [\App\Http\Controllers\PaymentController::class, 'show'])->name('payment.show');
    Route::get('/payment/{order}/check-status', [\App\Http\Controllers\PaymentController::class, 'checkStatus'])
        ->middleware('throttle:30,1')
        ->name('payment.check-status');
    Route::get('/history', [\App\Http\Controllers\OrderHistoryController::class, 'index'])->name('history.index');
    Route::get('/history/{order}', [\App\Http\Controllers\OrderHistoryController::class, 'show'])->name('history.show');

    // Product Rating Routes
    Route::get('/history/rating/{order_item}', [\App\Http\Controllers\ProductReviewController::class, 'create'])->name('history.rating.create');
    Route::post('/history/rating/{order_item_id}', [\App\Http\Controllers\ProductReviewController::class, 'store'])->name('history.rating.store');

    Route::post('/history/{order}/cancel', [\App\Http\Controllers\OrderHistoryController::class, 'cancel'])->name('history.cancel');
    Route::post('/history/{order}/complete', [\App\Http\Controllers\OrderHistoryController::class, 'complete'])->name('history.complete');


    Route::get('/cart', [\App\Http\Controllers\CartController::class, 'index'])->name('cart');
    Route::post('/cart', [\App\Http\Controllers\CartController::class, 'store'])->name('cart.store');
    Route::patch('/cart/{cart}', [\App\Http\Controllers\CartController::class, 'update'])->name('cart.update');
    Route::delete('/cart/{cart}', [\App\Http\Controllers\CartController::class, 'destroy'])->name('cart.destroy');
    Route::post('/profile/address', [ProfileController::class, 'storeAddress'])->name('profile.address.store');
    Route::put('/profile/address/{id}', [ProfileController::class, 'updateAddress'])->name('profile.address.update');
    Route::delete('/profile/address/{id}', [ProfileController::class, 'destroyAddress'])->name('profile.address.destroy');
    Route::put('/profile/notifications', [ProfileController::class, 'updateNotifications'])->name('profile.notifications.update');
});

Route::middleware(['auth', 'verified', 'role:admin'])
    ->prefix('admin')
    ->group(function () {
        Route::get('/dashboard', function () {
            return Inertia::render('Admin/Dashboard');
        })->name('admin.dashboard');
    });

Route::get('/auth/google/redirect', [SocialiteController::class, 'redirect'])->name('google.redirect');
Route::get('/auth/google/callback', [SocialiteController::class, 'callback'])->name('google.callback');

Route::middleware('guest')->group(function () {
    Route::get('/pedagang/login', function () {
        return Inertia::render('Merchant/Login');
    })->name('merchant.login.view');
});

// route dashboard pedagang (auth)
Route::middleware(['auth', 'verified', 'role:pedagang', \App\Http\Middleware\CheckMerchantSetup::class])
    ->prefix('pedagang')
    ->group(function () {
        Route::get('/analytics', [AnalyticsController::class, 'index'])->name('merchant.analytics.index');

        Route::get('/setup-store', function () {
            return Inertia::render('Merchant/SetupStore');
        })->name('merchant.store.setup');

        Route::post('/setup-store', [MerchantSetupController::class, 'store'])->name('merchant.store.store');

        Route::get('/dashboard', function (Illuminate\Http\Request $request) {
            $user = $request->user()->load('store');
            $storeId = $user->store ? $user->store->id : null;

            $sales = $storeId ? \App\Models\Order::where('store_id', $storeId)->where('shipping_status', 'delivered')->sum('total_amount') : 0;
            $ordersCount = $storeId ? \App\Models\Order::where('store_id', $storeId)->where('shipping_status', 'delivered')->count() : 0;
            $customersCount = $storeId ? \App\Models\Order::where('store_id', $storeId)->distinct('user_id')->count('user_id') : 0;
            $productsCount = $storeId ? \App\Models\Product::where('store_id', $storeId)->count() : 0;

            $pending = $storeId ? \App\Models\Order::where('store_id', $storeId)->where('shipping_status', 'pending')->count() : 0;
            $processing = $storeId ? \App\Models\Order::where('store_id', $storeId)->where('shipping_status', 'processing')->count() : 0;
            $shipped = $storeId ? \App\Models\Order::where('store_id', $storeId)->where('shipping_status', 'shipped')->count() : 0;
            $completed = $storeId ? \App\Models\Order::where('store_id', $storeId)->where('shipping_status', 'delivered')->count() : 0;

            $recentOrders = $storeId ? \App\Models\Order::with(['items.product'])->where('store_id', $storeId)->where('shipping_status', 'delivered')->orderBy('created_at', 'desc')->take(5)->get()->map(function($o) {
                $firstItem = $o->items->first();
                return [
                    'invoice_number' => $o->invoice_number,
                    'customer_name' => $o->customer_name,
                    'product_name' => $firstItem ? $firstItem->product_name : 'N/A',
                    'product_image' => $firstItem && $firstItem->product ? $firstItem->product->image_path : null,
                    'date' => $o->created_at->format('d M Y'),
                    'amount' => 'Rp ' . number_format($o->total_amount, 0, ',', '.'),
                    'status' => ucfirst($o->shipping_status),
                ];
            }) : [];

            $topSelling = $storeId ? \App\Models\Product::where('store_id', $storeId)
                ->withSum('orderItems', 'quantity')
                ->orderBy('order_items_sum_quantity', 'desc')
                ->take(3)
                ->get()
                ->map(function($p) {
                    return [
                        'name' => $p->name,
                        'category' => $p->category->name ?? 'Uncategorized',
                        'image' => $p->image_path ?? 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47',
                        'sold' => $p->order_items_sum_quantity ?? 0,
                        'price' => 'Rp ' . number_format($p->price, 0, ',', '.'),
                        'status' => $p->stock > 0 ? 'In Stock' : 'Out of Stock',
                        'statusColor' => $p->stock > 0 ? 'text-green-500' : 'text-red-500',
                    ];
                }) : [];

            $chartData = [];
            if ($storeId) {
                $startDate = now()->startOfWeek()->subWeeks(2);
                $orders = \App\Models\Order::where('store_id', $storeId)
                    ->where('shipping_status', 'delivered')
                    ->where('created_at', '>=', $startDate)
                    ->selectRaw('DATE(created_at) as date, SUM(total_amount) as sales')
                    ->groupBy('date')
                    ->get()
                    ->keyBy('date');

                $days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
                for ($i = 0; $i < 7; $i++) {
                    $dayName = $days[$i];

                    $dateW1 = now()->startOfWeek()->addDays($i)->format('Y-m-d');
                    $dateW2 = now()->startOfWeek()->subWeeks(1)->addDays($i)->format('Y-m-d');
                    $dateW3 = now()->startOfWeek()->subWeeks(2)->addDays($i)->format('Y-m-d');

                    $chartData[] = [
                        'name' => $dayName,
                        'minggu1' => isset($orders[$dateW1]) ? $orders[$dateW1]->sales : 0,
                        'minggu2' => isset($orders[$dateW2]) ? $orders[$dateW2]->sales : 0,
                        'minggu3' => isset($orders[$dateW3]) ? $orders[$dateW3]->sales : 0,
                    ];
                }
            }

            return Inertia::render('Merchant/Dashboard', [
                'merchantInfo' => [
                    'name' => $user->name,
                    'store_name' => $user->store ? $user->store->name : 'Toko Anda',
                ],
                'stats' => [
                    'sales' => $sales,
                    'orders' => $ordersCount,
                    'customers' => $customersCount,
                    'products' => $productsCount,
                ],
                'chartData' => $chartData,
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

        Route::get('/products', [\App\Http\Controllers\Merchant\ProductController::class, 'index'])->name('merchant.products.index');
        Route::get('/products/create', [\App\Http\Controllers\Merchant\ProductController::class, 'create'])->name('merchant.products.create');
        Route::post('/products', [\App\Http\Controllers\Merchant\ProductController::class, 'store'])->name('merchant.products.store');
        Route::get('/products/{product:slug}/edit', [\App\Http\Controllers\Merchant\ProductController::class, 'edit'])->name('merchant.products.edit');
        Route::post('/products/{product:slug}', [\App\Http\Controllers\Merchant\ProductController::class, 'update'])->name('merchant.products.update');
        Route::delete('/products/{product:slug}', [\App\Http\Controllers\Merchant\ProductController::class, 'destroy'])->name('merchant.products.destroy');
        Route::get('/orders', [\App\Http\Controllers\Merchant\OrderController::class, 'index'])->name('merchant.orders.index');
        Route::put('/merchant/orders/{id}/status', [App\Http\Controllers\Merchant\OrderController::class, 'updateStatus'])->name('merchant.orders.update-status');
        Route::get('/customers', [\App\Http\Controllers\Merchant\CustomerController::class, 'index'])->name('merchant.customers.index');
        Route::get('/settings', [\App\Http\Controllers\Merchant\SettingsController::class, 'index'])->name('merchant.settings.index');
        Route::post('/settings', [\App\Http\Controllers\Merchant\SettingsController::class, 'update'])->name('merchant.settings.update');
        Route::get('/withdrawals', [\App\Http\Controllers\Merchant\WithdrawalController::class, 'index'])->name('merchant.withdrawals.index');
        Route::post('/withdrawals', [\App\Http\Controllers\Merchant\WithdrawalController::class, 'store'])->name('merchant.withdrawals.store');
        Route::put('/withdrawals/bank', [\App\Http\Controllers\Merchant\WithdrawalController::class, 'updateBank'])->name('merchant.withdrawals.update-bank');
    });

Route::post('/api/midtrans/callback', [\App\Http\Controllers\MidtransCallbackController::class, 'handle'])->name('midtrans.callback');

require __DIR__ . '/auth.php';


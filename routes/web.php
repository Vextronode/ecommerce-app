<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Auth\SocialiteController;
use App\Http\Controllers\Merchant\MerchantSetupController;

Route::redirect('/', '/login');

Route::get('/dashboard', [\App\Http\Controllers\DashboardController::class, 'index'])
    ->middleware(['auth', 'verified', 'role:user'])
    ->name('dashboard');

Route::get('/shop', [\App\Http\Controllers\ShopController::class, 'index'])
    ->middleware('storefront.user')
    ->name('shop');

Route::get('/product/{id}', [\App\Http\Controllers\ShopController::class, 'show'])
    ->middleware('storefront.user')
    ->name('product.detail');

Route::middleware(['auth', 'role:user'])->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::post('/profile/photo', [ProfileController::class, 'updatePhoto'])->name('profile.photo.update');
    Route::get('/checkout', [\App\Http\Controllers\CheckoutController::class, 'index'])->name('checkout');
    Route::post('/checkout', [\App\Http\Controllers\CheckoutController::class, 'store'])->name('checkout.store');

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

        Route::get('/setup-store', function () {
            return Inertia::render('Merchant/SetupStore');
        })->name('merchant.store.setup');

        Route::post('/setup-store', [MerchantSetupController::class, 'store'])->name('merchant.store.store');

        Route::get('/dashboard', function (Illuminate\Http\Request $request) {
            $user = $request->user()->load('store');

            return Inertia::render('Merchant/Dashboard', [
                'merchantInfo' => [
                    'name' => $user->name,
                    'store_name' => $user->store ? $user->store->name : 'Toko Anda',
                ],
                'stats' => [
                    'sales' => 0,
                    'orders' => 0,
                    'customers' => 0,
                    'products' => 0,
                ],
                'chartData' => [],
                'recentOrders' => [],
                'topSelling' => [],
                'orderStatus' => [
                    'pending' => 0,
                    'processing' => 0,
                    'shipped' => 0,
                    'completed' => 0,
                ],
            ]);
        })->name('merchant.dashboard');

        Route::get('/products', [\App\Http\Controllers\Merchant\ProductController::class, 'index'])->name('merchant.products.index');
        Route::get('/products/create', [\App\Http\Controllers\Merchant\ProductController::class, 'create'])->name('merchant.products.create');
        Route::post('/products', [\App\Http\Controllers\Merchant\ProductController::class, 'store'])->name('merchant.products.store');
        Route::get('/products/{product:slug}/edit', [\App\Http\Controllers\Merchant\ProductController::class, 'edit'])->name('merchant.products.edit');
        Route::post('/products/{product:slug}', [\App\Http\Controllers\Merchant\ProductController::class, 'update'])->name('merchant.products.update');
        Route::delete('/products/{product:slug}', [\App\Http\Controllers\Merchant\ProductController::class, 'destroy'])->name('merchant.products.destroy');
    });

require __DIR__ . '/auth.php';

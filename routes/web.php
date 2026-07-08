<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Auth\SocialiteController;
use App\Http\Controllers\Merchant\MerchantSetupController;

Route::redirect('/', '/login');

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard/Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::get('/shop', function () {
    return Inertia::render('Storefront/Shop');
})->name('shop');

Route::get('/product/{id}', function ($id) {
    return Inertia::render('Storefront/ProductDetail', [
        'productId' => $id,
    ]);
})->name('product.detail');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::post('/profile/photo', [ProfileController::class, 'updatePhoto'])->name('profile.photo.update');
    Route::get('/checkout', function () {
        return Inertia::render('Checkout/Checkout');
    })->name('checkout');

    Route::get('/cart', function () {
        return Inertia::render('Cart/Cart');
    })->name('cart');
    Route::post('/profile/address', [ProfileController::class, 'storeAddress'])->name('profile.address.store');
    Route::put('/profile/address/{id}', [ProfileController::class, 'updateAddress'])->name('profile.address.update');
    Route::delete('/profile/address/{id}', [ProfileController::class, 'destroyAddress'])->name('profile.address.destroy');
    Route::put('/profile/notifications', [ProfileController::class, 'updateNotifications'])->name('profile.notifications.update');
});

Route::get('/auth/google/redirect', [SocialiteController::class, 'redirect'])->name('google.redirect');
Route::get('/auth/google/callback', [SocialiteController::class, 'callback'])->name('google.callback');

Route::middleware('guest')->group(function () {
    Route::get('/pedagang/login', function () {
        return Inertia::render('Merchant/Login');
    })->name('merchant.login.view');
});

// route dashboard pedagag (auth)
Route::middleware(['auth', 'verified', \App\Http\Middleware\CheckMerchantSetup::class])
    ->prefix('pedagang')
    ->group(function () {

        Route::get('/setup-password', function () {
            return Inertia::render('Merchant/SetupPasswordPopup');
        })->name('merchant.password.setup');

        Route::get('/setup-store', function () {
            return Inertia::render('Merchant/SetupStore');
        })->name('merchant.store.setup');

        Route::post('/setup-store', [MerchantSetupController::class, 'store'])->name('merchant.store.store');

        Route::get('/dashboard', function () {
            return Inertia::render('Merchant/Dashboard');
        })->name('merchant.dashboard');
    });

require __DIR__ . '/auth.php';

<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        // Force HTTPS saat di production (behind Cloudflare Tunnel)
        // Cloudflare handle HTTPS di luar, Laravel perlu tau ini biar semua URL-nya benar
        if (env('APP_ENV') !== 'local') {
            URL::forceScheme('https');
        }

        // Security Rate Limiter for Checkout: max 5 requests per 5 minutes per user/IP
        RateLimiter::for('checkout', function (Request $request) {
            return Limit::perMinutes(5, 5)
                ->by('checkout|'.($request->user()?->id ?: $request->ip()))
                ->response(function (Request $request, array $headers) {
                    if ($request->expectsJson()) {
                        return response()->json([
                            'message' => 'Terlalu banyak permintaan checkout. Silakan tunggu 5 menit sebelum mencoba lagi.',
                        ], 429, $headers);
                    }

                    return redirect()->back()->with('error', 'Terlalu banyak permintaan checkout. Silakan tunggu 5 menit sebelum mencoba lagi.');
                });
        });

        // Dedicated Rate Limiter for Merchant Withdrawals: max 3 requests per 1 minute per merchant
        RateLimiter::for('withdrawals', function (Request $request) {
            return Limit::perMinute(3)->by('withdrawal|'.($request->user()?->id ?: $request->ip()));
        });

        // Dedicated Rate Limiter for Real-time GPS Location Ping (up to 120 per minute)
        RateLimiter::for('tracker-location', function (Request $request) {
            return Limit::perMinute(120)->by('tracker_loc|'.($request->user()?->id ?: $request->ip()));
        });

        // Dedicated Rate Limiter for Tracker Actions (arrive, complete, handover)
        RateLimiter::for('tracker-action', function (Request $request) {
            return Limit::perMinute(30)->by('tracker_act|'.($request->user()?->id ?: $request->ip()));
        });

        // Dedicated Rate Limiter for Payment Status Polling
        RateLimiter::for('payment-status', function (Request $request) {
            return Limit::perMinutes(5, 150)->by('payment_status|'.($request->user()?->id ?: $request->ip()));
        });

        // Dedicated Rate Limiter for FCM Token Sync
        RateLimiter::for('fcm-token', function (Request $request) {
            return Limit::perMinutes(5, 10)->by('fcm_token|'.($request->user()?->id ?: $request->ip()));
        });
    }
}

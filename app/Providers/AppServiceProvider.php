<?php

namespace App\Providers;

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
    }
}

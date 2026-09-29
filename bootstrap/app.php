<?php

use App\Http\Middleware\EnsureUserHasRole;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\RedirectNonUserFromStorefront;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Exceptions\PostTooLargeException;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Middleware\TrustProxies;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpKernel\Exception\HttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        channels: __DIR__.'/../routes/channels.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Trust all proxies (Cloudflare Tunnel, Nginx, etc.)
        // Wajib agar signed URL & HTTPS detection bekerja dengan benar
        $middleware->trustProxies(at: '*');
        // Restrict trusted proxies to Cloudflare IP ranges & local Docker gateways in production to prevent IP spoofing
        if (env('APP_ENV') !== 'local' && env('APP_ENV') !== 'testing') {
            $middleware->trustProxies(at: [
                '173.245.48.0/20',
                '103.21.244.0/22',
                '103.22.200.0/22',
                '103.31.4.0/22',
                '141.101.64.0/18',
                '108.162.192.0/18',
                '190.93.240.0/20',
                '188.114.96.0/20',
                '197.234.240.0/22',
                '198.41.128.0/17',
                '162.158.0.0/15',
                '104.16.0.0/13',
                '104.24.0.0/14',
                '172.64.0.0/13',
                '131.0.72.0/22',
                '2400:cb00::/32',
                '2606:4700::/32',
                '2803:f800::/32',
                '2405:b500::/32',
                '2405:8100::/32',
                '2a06:98c0::/29',
                '2c0f:f248::/32',
                // Internal docker bridge, host gateway, and private subnet ranges
                '127.0.0.1',
                '10.0.0.0/8',
                '172.16.0.0/12',
                '192.168.0.0/16',
            ]);
        } else {
            $middleware->trustProxies(at: '*');
        }

        $middleware->web(append: [
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->validateCsrfTokens(except: [
            'api/midtrans/callback',
            'midtrans/callback',
            'tracker/*/location',
            'tracker/batch/*/location',
        ]);

        $middleware->alias([
            'role' => EnsureUserHasRole::class,
            'storefront.user' => RedirectNonUserFromStorefront::class,
        ]);

        $middleware->redirectGuestsTo(function (Request $request) {
            $adminPrefix = config('admin.prefix', 'cibenda-portal');
            if ($request->is('pedagang') || $request->is('pedagang/*')) {
                return route('merchant.login.view');
            }
            if ($request->is($adminPrefix) || $request->is($adminPrefix.'/*')) {
                return route('admin.login.view');
            }

            return route('login');
        });

        $middleware->redirectUsersTo(function (Request $request) {
            if (auth()->check() && auth()->user()->role === 'pedagang') {
                return '/pedagang/dashboard';
            }
            if (auth()->check() && auth()->user()->role === 'admin') {
                $adminPrefix = config('admin.prefix', 'cibenda-portal');
                return "/{$adminPrefix}/dashboard";
            }

            return '/dashboard';
        });
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn(Request $request) => $request->is('api/*'),
        );

        // Render HTTP errors (404, 403, 500, 503) sebagai halaman Inertia
        $exceptions->render(function (HttpException $e, Request $request) {
            $status = $e->getStatusCode();

            if ($status === 429 && $request->header('X-Inertia')) {
                $retryAfter = $e->getHeaders()['Retry-After'] ?? null;
                $throttleMsg = $retryAfter
                    ? "Terlalu banyak permintaan penarikan. Mohon tunggu {$retryAfter} detik lagi sebelum mencoba kembali."
                    : 'Terlalu banyak permintaan dalam waktu singkat. Mohon tunggu beberapa detik.';
                return redirect()->back()
                    ->with('error', $throttleMsg)
                    ->withErrors(['amount' => $throttleMsg, 'error' => $throttleMsg]);
            }

            if (in_array($status, [404, 403, 500, 503]) && ! $request->is('api/*') && ! $request->expectsJson()) {
                return Inertia::render('Error', ['status' => $status])
                    ->toResponse($request)
                    ->setStatusCode($status);
            }
        });

        $exceptions->render(function (PostTooLargeException $e, Request $request) {
            return redirect()->back()->with('error', 'Ukuran total file terlalu besar! Server menolak.');
        });
    })->create();

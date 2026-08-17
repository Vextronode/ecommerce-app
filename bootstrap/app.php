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
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Trust all proxies (Cloudflare Tunnel, Nginx, etc.)
        // Wajib agar signed URL & HTTPS detection bekerja dengan benar
        $middleware->trustProxies(at: '*');

        $middleware->web(append: [
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->validateCsrfTokens(except: [
            'api/midtrans/callback',
            'midtrans/callback',
        ]);

        $middleware->alias([
            'role' => EnsureUserHasRole::class,
            'storefront.user' => RedirectNonUserFromStorefront::class,
        ]);

        $middleware->redirectUsersTo(function (Request $request) {
            if (auth()->check() && auth()->user()->role === 'pedagang') {
                return '/pedagang/dashboard';
            }

            return '/dashboard';
        });
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*'),
        );

        // Render HTTP errors (404, 403, 500, 503) sebagai halaman Inertia
        $exceptions->render(function (HttpException $e, Request $request) {
            $status = $e->getStatusCode();

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

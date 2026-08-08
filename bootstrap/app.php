<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Http\Exceptions\PostTooLargeException;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Inertia\Inertia;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->validateCsrfTokens(except: [
            'api/midtrans/callback',
            'midtrans/callback',
        ]);

        $middleware->alias([
            'role' => \App\Http\Middleware\EnsureUserHasRole::class,
            'storefront.user' => \App\Http\Middleware\RedirectNonUserFromStorefront::class,
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
            fn(Request $request) => $request->is('api/*'),
        );

        // Render HTTP errors (404, 403, 500, 503) sebagai halaman Inertia
        $exceptions->render(function (HttpException $e, Request $request) {
            $status = $e->getStatusCode();

            if (in_array($status, [404, 403, 500, 503]) && !$request->is('api/*') && !$request->expectsJson()) {
                return Inertia::render('Error', ['status' => $status])
                    ->toResponse($request)
                    ->setStatusCode($status);
            }
        });

        $exceptions->render(function (PostTooLargeException $e, Request $request) {
            return redirect()->back()->with('error', 'Ukuran total file terlalu besar! Server menolak.');
        });
    })->create();

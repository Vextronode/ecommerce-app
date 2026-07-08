<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckMerchantSetup
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        $allowedRoutes = [
            'merchant.password.setup',
            'merchant.store.setup',
            'merchant.store.store',
        ];

        $currentRoute = $request->route() ? $request->route()->getName() : '';

        if (!$user->is_password_changed && !in_array($currentRoute, $allowedRoutes)) {
            return redirect()->route('merchant.password.setup');
        }

        if ($user->is_password_changed && in_array($currentRoute, $allowedRoutes)) {
            return redirect()->route('merchant.dashboard');
        }

        return $next($request);
    }
}

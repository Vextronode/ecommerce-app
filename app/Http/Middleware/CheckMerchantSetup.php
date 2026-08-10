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
        $currentRoute = $request->route() ? $request->route()->getName() : '';

        $setupRoutes = ['merchant.store.setup', 'merchant.store.store'];

        if (! $user->store || ! $user->is_password_changed) {
            if (! in_array($currentRoute, $setupRoutes)) {
                return redirect()->route('merchant.store.setup');
            }

            return $next($request);
        }

        if (in_array($currentRoute, $setupRoutes)) {
            return redirect()->route('merchant.dashboard');
        }

        return $next($request);
    }
}

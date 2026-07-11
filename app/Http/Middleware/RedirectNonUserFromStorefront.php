<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RedirectNonUserFromStorefront
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->role !== 'user') {
            return redirect(match ($user->role) {
                'pedagang' => '/pedagang/dashboard',
                'admin' => '/admin/dashboard',
                default => '/dashboard',
            });
        }

        return $next($request);
    }
}

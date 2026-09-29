<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user || ! in_array($user->role, $roles, true)) {
            return redirect($this->dashboardFor($user?->role));
        }

        return $next($request);
    }

    private function dashboardFor(?string $role): string
    {
        $adminPrefix = config('admin.prefix', 'cibenda-portal');

        return match ($role) {
            'pedagang' => '/pedagang/dashboard',
            'admin' => '/'.$adminPrefix.'/dashboard',
            default => '/dashboard',
        };
    }
}

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

        if ($user && in_array($user->status, ['suspended', 'inactive'], true)) {
            $role = $user->role;
            \Illuminate\Support\Facades\Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            $loginRoute = $role === 'pedagang' ? route('merchant.login.view') : route('login');

            return redirect($loginRoute)->withErrors([
                'email' => 'Akun Anda sedang ditangguhkan atau dinonaktifkan. Silakan hubungi administrator.',
            ]);
        }

        if ($user && $user->role !== 'user') {
            return redirect(match ($user->role) {
                'pedagang' => '/pedagang/dashboard',
                'admin' => '/'.config('admin.prefix', 'cibenda-portal').'/dashboard',
                default => '/dashboard',
            });
        }

        return $next($request);
    }
}

<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RedirectNonUserFromStorefront
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && in_array($user->status, ['suspended', 'inactive'], true)) {
            $role = $user->role;
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            $loginRoute = $role === 'pedagang' ? route('merchant.login.view') : route('login');

            return redirect($loginRoute)->withErrors([
                'email' => 'Akun Anda sedang ditangguhkan atau dinonaktifkan. Silakan hubungi administrator.',
            ]);
        }

        return $next($request);
    }
}

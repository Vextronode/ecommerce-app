<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();
        $request->session()->regenerate();

        $role = $request->user()->role;
        $isPasswordChanged = $request->user()->is_password_changed;

        if ($role === 'pedagang') {
            if (! $isPasswordChanged) {
                return redirect()->intended(route('merchant.store.setup', absolute: false));
            }

            return redirect()->intended('/pedagang/dashboard');
        } elseif ($role === 'admin') {
            return redirect()->intended(route('admin.dashboard', absolute: false));
        }

        return redirect()->intended(route('dashboard', absolute: false));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $adminPrefix = config('admin.prefix', 'cibenda-portal');
        $user = Auth::user();
        $userRole = $user?->role;

        $isMerchant = $userRole === 'pedagang'
            || $request->input('source') === 'merchant'
            || $request->is('pedagang/*')
            || str_contains((string) $request->headers->get('referer'), '/pedagang');
        $isAdmin = $userRole === 'admin'
            || $request->input('source') === 'admin'
            || $request->is($adminPrefix.'/*')
            || str_contains((string) $request->headers->get('referer'), '/'.$adminPrefix);

        $redirectTo = route('login');
        if ($isMerchant) {
            $redirectTo = route('merchant.login.view');
        } elseif ($isAdmin && Route::has('admin.login.view')) {
            $redirectTo = route('admin.login.view');
        }

        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect($redirectTo);
    }
}

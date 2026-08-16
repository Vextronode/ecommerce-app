<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class SocialiteController extends Controller
{
    public function redirect(): RedirectResponse
    {
        // Eksplisit set redirect URL biar tidak auto-generate dari request
        // (penting saat behind reverse proxy seperti Cloudflare Tunnel)
        return Socialite::driver('google')
            ->scopes(['openid', 'profile', 'email'])
            ->redirectUrl(config('services.google.redirect'))
            ->redirect();
    }

    public function callback(): RedirectResponse
    {
        try {
            $googleUser = Socialite::driver('google')
                ->redirectUrl(config('services.google.redirect'))
                ->user();

            $user = User::query()->where('email', $googleUser->email)->first();

            if ($user) {
                if ($user->role !== 'user') {
                    return redirect('/login')->withErrors([
                        'email' => 'Akun ini tidak bisa dipakai untuk login sebagai pembeli.',
                    ]);
                }

                $user->update([
                    'google_id' => $googleUser->id,
                ]);
            } else {
                $user = User::query()->create([
                    'name' => $googleUser->name,
                    'email' => $googleUser->email,
                    'google_id' => $googleUser->id,
                    'password' => bcrypt(Str::random(16)),
                ]);
            }

            Auth::login($user);

            return redirect()->intended(route('dashboard', absolute: false));

        } catch (\Exception $e) {
            return redirect('/login')->withErrors(['email' => 'Gagal login pakai Google.']);
        }
    }
}

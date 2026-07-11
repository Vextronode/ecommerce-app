<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Str;
use Illuminate\Http\RedirectResponse;

class SocialiteController extends Controller
{
    public function redirect(): RedirectResponse
    {
        return Socialite::driver('google')
            ->scopes(['openid', 'profile', 'email'])
            ->redirect();
    }

    public function callback(): RedirectResponse
    {
        try {
            $googleUser = Socialite::driver('google')->user();

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
                    'password' => bcrypt(Str::random(16))
                ]);
            }

            Auth::login($user);

            return redirect()->intended(route('dashboard', absolute: false));

        } catch (\Exception $e) {
            return redirect('/login')->withErrors(['email' => 'Gagal login pakai Google.']);
        }
    }
}

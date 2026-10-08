<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Socialite\Facades\Socialite;

class SocialiteController extends Controller
{
    private const INTENT_KEY = 'socialite.link_intent';

    private const INTENT_TTL_MINUTES = 10;

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
        } catch (\Exception $e) {
            return redirect('/login')->withErrors(['email' => 'Gagal login pakai Google.']);
        }

        $rawUser = is_array($googleUser->user ?? null) ? $googleUser->user : [];
        // fail-closed: provider yang tidak kirim flag verifikasi dianggap belum terverifikasi
        $isEmailVerified = ($rawUser['email_verified'] ?? $rawUser['verified_email'] ?? false) === true;

        if (empty($googleUser->email) || ! $isEmailVerified) {
            return redirect('/login')->withErrors([
                'email' => 'Email akun Google Anda belum terverifikasi.',
            ]);
        }

        $email = $googleUser->email;
        $googleId = (string) $googleUser->id;

        if ($googleId === '') {
            return redirect('/login')->withErrors(['email' => 'Gagal login pakai Google.']);
        }

        // google_id sudah dipakai user lain -> tolak, jangan pernah overwrite
        $ownerOfGoogleId = User::query()->where('google_id', $googleId)->first();
        if ($ownerOfGoogleId && $ownerOfGoogleId->email !== $email) {
            return redirect('/login')->withErrors([
                'email' => 'Akun Google ini sudah tertaut ke akun lain.',
            ]);
        }

        $user = User::query()->where('email', $email)->first();

        if ($user) {
            if ($user->role !== 'user') {
                return redirect('/login')->withErrors([
                    'email' => 'Akun ini tidak bisa dipakai untuk login sebagai pembeli.',
                ]);
            }

            if (in_array($user->status, ['suspended', 'inactive'], true)) {
                return redirect('/login')->withErrors([
                    'email' => 'Akun Anda sedang ditangguhkan atau dinonaktifkan. Silakan hubungi administrator.',
                ]);
            }

            // sudah tertaut ke google_id yang sama -> aman, langsung login
            if ($user->google_id === $googleId) {
                return $this->loginUser($user);
            }

            // akun manual (google_id kosong) -> jangan auto-link, minta konfirmasi password dulu
            if (empty($user->google_id)) {
                $this->startLinkIntent($user, $email, $googleId);

                return redirect()->route('google.link.confirm');
            }

            // punya google_id lain yang bukan miliknya -> tolak
            return redirect('/login')->withErrors([
                'email' => 'Akun ini sudah tertaut ke akun Google lain.',
            ]);
        }

        $cleanName = trim((string) preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', (string) ($googleUser->name ?: 'Pelanggan')));
        $user = User::query()->create([
            'name' => $cleanName ?: 'Pelanggan',
            'email' => $email,
            'google_id' => $googleId,
            'password' => bcrypt(Str::random(16)),
        ]);
        $user->forceFill([
            'role' => 'user',
            'email_verified_at' => now(),
        ])->save();

        return $this->loginUser($user);
    }

    public function confirmLink(Request $request): Response|RedirectResponse
    {
        $intent = $this->resolveIntent($request);
        if ($intent === null) {
            return redirect('/login')->withErrors([
                'email' => 'Sesi taut akun Google tidak valid atau sudah kedaluwarsa. Silakan ulangi login dengan Google.',
            ]);
        }

        return Inertia::render('Auth/ConfirmGoogleLink', [
            'email' => $intent['email'],
            'nonce' => $intent['nonce'],
        ]);
    }

    public function linkConfirmed(Request $request): RedirectResponse
    {
        $intent = $this->resolveIntent($request);
        if ($intent === null) {
            return redirect('/login')->withErrors([
                'email' => 'Sesi taut akun Google tidak valid atau sudah kedaluwarsa. Silakan ulangi login dengan Google.',
            ]);
        }

        $validated = $request->validate([
            'password' => ['required', 'string', 'max:255'],
            'nonce' => ['required', 'string'],
        ]);

        // tolak kalau nonce tidak cocok (intent kedaluwarsa/ditimpa)
        if (! hash_equals((string) $intent['nonce'], (string) $validated['nonce'])) {
            $this->forgetIntent($request);

            return redirect('/login')->withErrors([
                'email' => 'Sesi taut akun Google tidak valid. Silakan ulangi login dengan Google.',
            ]);
        }

        // sekali pakai: konsumsi intent lebih dulu biar tidak bisa di-replay
        $this->forgetIntent($request);

        $user = User::query()->find($intent['user_id']);
        if (! $user || $user->email !== $intent['email']) {
            return redirect('/login')->withErrors(['email' => 'Gagal menautkan akun Google.']);
        }

        // guard role konsisten dengan callback: cegah link Google ke akun non-pembeli
        // (mis. akun yang dipromosikan jadi admin/pedagang di sela window intent)
        if ($user->role !== 'user') {
            return redirect('/login')->withErrors([
                'email' => 'Akun ini tidak bisa dipakai untuk login sebagai pembeli.',
            ]);
        }

        if (in_array($user->status, ['suspended', 'inactive'], true)) {
            return redirect('/login')->withErrors([
                'email' => 'Akun Anda sedang ditangguhkan atau dinonaktifkan. Silakan hubungi administrator.',
            ]);
        }

        if (! Hash::check($validated['password'], (string) $user->password)) {
            throw ValidationException::withMessages([
                'password' => 'Password akun tidak cocok.',
            ]);
        }

        // cegah overwrite: google_id jangan sampai sudah dipakai user lain
        $conflict = User::query()
            ->where('google_id', $intent['google_id'])
            ->where('id', '!=', $user->id)
            ->exists();
        if ($conflict) {
            return redirect('/login')->withErrors([
                'email' => 'Akun Google ini sudah tertaut ke akun lain.',
            ]);
        }

        if (empty($user->google_id)) {
            $user->forceFill(['google_id' => $intent['google_id']])->save();
        }
        if (! $user->email_verified_at) {
            $user->forceFill(['email_verified_at' => now()])->save();
        }

        return $this->loginUser($user);
    }

    /**
     * buat intent link di store server-side, terikat fingerprint klien + ttl, sekali pakai.
     * session cuma nyimpen nonce pointer, jadi salinan session di klien lain tidak bisa dipakai.
     */
    private function startLinkIntent(User $user, string $email, string $googleId): void
    {
        $this->forgetIntent(request());

        $nonce = Str::random(40);
        $payload = [
            'user_id' => $user->id,
            'email' => $email,
            'google_id' => $googleId,
            'nonce' => $nonce,
            'fingerprint' => $this->clientFingerprint(request()),
        ];

        Cache::put($this->intentCacheKey($nonce), $payload, now()->addMinutes(self::INTENT_TTL_MINUTES));
        request()->session()->put(self::INTENT_KEY, $nonce);
    }

    /**
     * ambil intent valid dari server-side store. null kalau kosong, kedaluwarsa, atau fingerprint tidak cocok.
     */
    private function resolveIntent(Request $request): ?array
    {
        $nonce = $request->session()->get(self::INTENT_KEY);
        if (! is_string($nonce) || $nonce === '') {
            return null;
        }

        $intent = Cache::get($this->intentCacheKey($nonce));
        if (! is_array($intent) || ($intent['nonce'] ?? null) !== $nonce) {
            return null;
        }

        if (! hash_equals((string) ($intent['fingerprint'] ?? ''), $this->clientFingerprint($request))) {
            $this->forgetIntent($request);

            return null;
        }

        return $intent;
    }

    /**
     * fingerprint ringan: user agent + ip. cukup buat menolak intent yang disuntik dari klien lain.
     */
    private function clientFingerprint(Request $request): string
    {
        return hash('sha256', (string) $request->userAgent().'|'.(string) $request->ip());
    }

    /**
     * hapus pointer session + entri cache biar intent benar-benar sekali pakai.
     */
    private function forgetIntent(Request $request): void
    {
        $nonce = $request->session()->pull(self::INTENT_KEY);
        if (is_string($nonce) && $nonce !== '') {
            Cache::forget($this->intentCacheKey($nonce));
        }
    }

    private function intentCacheKey(string $nonce): string
    {
        return 'socialite_link_intent:'.$nonce;
    }

    private function loginUser(User $user): RedirectResponse
    {
        Auth::login($user);
        request()->session()->regenerate();

        return redirect()->intended(route('dashboard', absolute: false));
    }
}

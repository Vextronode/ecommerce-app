<?php

namespace App\Http\Controllers\Merchant;

use App\Http\Controllers\Controller;
use App\Models\Store;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Jenssegers\Agent\Agent;

class SettingsController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $store = Store::where('user_id', $user->id)->first();

        if (! $store) {
            return redirect()->route('merchant.store.setup');
        }

        // Ambil daftar sesi aktif perangkat
        $sessions = [];
        try {
            if (Schema::hasTable('sessions')) {
                $sessions = DB::table('sessions')
                    ->where('user_id', $user->id)
                    ->orderBy('last_activity', 'desc')
                    ->get()->map(function ($session) use ($request) {
                        $agent = new Agent;
                        $agent->setUserAgent($session->user_agent);

                        return [
                            'id' => $session->id,
                            'agent' => [
                                'is_desktop' => $agent->isDesktop(),
                                'platform' => $agent->platform(),
                                'browser' => $agent->browser(),
                            ],
                            'ip_address' => $session->ip_address,
                            'is_current_device' => $session->id === $request->session()->getId(),
                            'last_active' => Carbon::createFromTimestamp($session->last_activity)->diffForHumans(),
                        ];
                    })->toArray();
            }
        } catch (\Throwable $e) {
            $sessions = [];
        }

        if (empty($sessions)) {
            $agent = new Agent;
            $agent->setUserAgent($request->userAgent());
            $sessions = [
                [
                    'id' => $request->session()->getId(),
                    'agent' => [
                        'is_desktop' => $agent->isDesktop(),
                        'platform' => $agent->platform() ?: 'Desktop',
                        'browser' => $agent->browser() ?: 'Web Browser',
                    ],
                    'ip_address' => $request->ip() ?: '127.0.0.1',
                    'is_current_device' => true,
                    'last_active' => 'Baru saja',
                ],
            ];
        }

        return Inertia::render('Merchant/Settings/Index', [
            'merchantUser' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => 'Pemilik Toko',
                'profile_photo_path' => $user->profile_photo_path ? Storage::url($user->profile_photo_path) : null,
            ],
            'merchantStore' => [
                'id' => $store->id,
                'name' => $store->name,
                'username' => $store->slug,
                'support_email' => $store->support_email,
                'description' => $store->description,
                'address' => $store->address,
                'latitude' => (float) $store->latitude,
                'longitude' => (float) $store->longitude,
            ],
            'notificationSettings' => $user->notification_settings ?? [
                'pesanan_baru' => true,
                'pembayaran_berhasil' => true,
                'pengiriman_pesanan' => true,
                'ulasan_baru' => true,
                'stok_menipis' => true,
                'penarikan_saldo' => true,
            ],
            'sessions' => $sessions,
            'isOAuth' => ! is_null($user->google_id),
        ]);
    }

    public function update(Request $request)
    {
        $user = User::find(Auth::id());
        $store = Store::where('user_id', $user->id)->firstOrFail();

        foreach (['name', 'store_name'] as $field) {
            if ($request->has($field) && is_string($request->input($field))) {
                $request->merge([$field => strip_tags(trim($request->input($field)))]);
            }
        }

        if ($request->filled('username')) {
            $slug = Str::slug((string) $request->username);
            if ($slug === '') {
                return back()->withErrors([
                    'username' => 'Username / URL slug toko minimal 3 karakter huruf atau angka.',
                ])->withInput();
            }
            $request->merge([
                'username' => $slug,
            ]);
        }

        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'phone' => ['nullable', 'string', 'max:20'],
            'photo' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],

            'store_name' => ['required', 'string', 'max:255', Rule::unique('stores', 'name')->ignore($store->id)],
            'username' => ['nullable', 'string', 'min:3', 'max:100', Rule::unique('stores', 'slug')->ignore($store->id)],
            'support_email' => ['nullable', 'string', 'lowercase', 'email', 'max:255'],
            'store_description' => ['nullable', 'string', 'max:2000'],
            'store_address' => ['nullable', 'string', 'max:1000'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
        ], [
            'name.required' => 'Nama lengkap pemilik wajib diisi.',
            'store_name.required' => 'Nama toko wajib diisi.',
            'store_name.unique' => 'Nama toko sudah digunakan toko lain.',
            'username.min' => 'Username / URL slug toko minimal 3 karakter.',
            'username.unique' => 'Username / URL slug toko sudah digunakan toko lain.',
        ]);

        $user->name = strip_tags(trim($request->name));
        $user->email = $request->email;
        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }
        $user->phone = $request->phone ? strip_tags(trim($request->phone)) : null;

        if ($request->hasFile('photo')) {
            if ($user->profile_photo_path) {
                Storage::disk('public')->delete($user->profile_photo_path);
            }
            if ($store->logo_path && $store->logo_path !== $user->profile_photo_path) {
                Storage::disk('public')->delete($store->logo_path);
            }

            $path = $request->file('photo')->store('profile-photos', 'public');
            $user->profile_photo_path = $path;
            $store->logo_path = $path;
        }

        $user->save();

        $store->name = strip_tags(trim($request->store_name));
        if (! empty($request->username)) {
            $store->slug = $request->username;
        }
        $store->support_email = $request->support_email;
        $store->description = $request->store_description ? strip_tags(trim($request->store_description)) : null;

        $existingAddress = $store->address;
        $submittedAddress = strip_tags(trim($request->store_address ?? ''));
        $addressNotice = null;

        if (! empty($submittedAddress)) {
            $store->address = $submittedAddress;
        } elseif (! empty($existingAddress)) {
            $store->address = $existingAddress;
            $addressNotice = 'Alamat toko tidak dapat dibiarkan kosong, sehingga tetap menggunakan alamat sebelumnya.';
        } else {
            $store->address = null;
        }

        if ($request->filled('latitude') && $request->filled('longitude')) {
            $store->latitude = $request->latitude;
            $store->longitude = $request->longitude;
        }

        $store->save();

        $successMessage = $addressNotice
            ? "Pengaturan toko diperbarui. {$addressNotice}"
            : 'Pengaturan profil dan toko berhasil diperbarui.';

        return redirect()->back()->with('success', $successMessage);
    }

    /**
     * Tandai panduan tutorial merchant baru telah diselesaikan.
     */
    public function completeTour(Request $request)
    {
        $user = $request->user();
        if ($user && $user->store) {
            $user->store->update(['has_completed_tour' => true]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Panduan merchant berhasil diselesaikan.',
        ]);
    }

    /**
     * Reset status tutorial merchant (untuk fitur ulangi panduan).
     */
    public function resetTour(Request $request)
    {
        $user = $request->user();
        if ($user && $user->store) {
            $user->store->update(['has_completed_tour' => false]);
        }

        return redirect()->route('merchant.dashboard')
            ->with('success', 'Status panduan onboarding berhasil direset.');
    }

    /**
     * Update preferensi notifikasi pedagang.
     */
    public function updateNotifications(Request $request)
    {
        $validated = $request->validate([
            'pesanan_baru' => 'sometimes|boolean',
            'pembayaran_berhasil' => 'sometimes|boolean',
            'pengiriman_pesanan' => 'sometimes|boolean',
            'ulasan_baru' => 'sometimes|boolean',
            'stok_menipis' => 'sometimes|boolean',
            'penarikan_saldo' => 'sometimes|boolean',
        ]);

        $user = $request->user();
        $current = $user->notification_settings ?? [];
        $user->update([
            'notification_settings' => array_merge($current, $validated),
        ]);

        return back()->with('success', 'Preferensi notifikasi toko berhasil diperbarui.');
    }

    /**
     * Hapus semua sesi login di perangkat lain untuk keamanan merchant.
     */
    public function destroyOtherSessions(Request $request)
    {
        $user = $request->user();

        if (is_null($user->google_id)) {
            $request->validate([
                'password' => ['required', 'string'],
            ], [
                'password.required' => 'Kata sandi saat ini wajib diisi untuk verifikasi keamanan.',
            ]);

            if (! Hash::check($request->password, $user->password)) {
                return back()->withErrors(['password' => 'Kata sandi saat ini tidak cocok.']);
            }
        }

        try {
            if (Schema::hasTable('sessions')) {
                DB::table('sessions')
                    ->where('user_id', $user->id)
                    ->where('id', '!=', $request->session()->getId())
                    ->delete();
            }
        } catch (\Throwable $e) {
            // Ignore
        }

        $user->setRememberToken(Str::random(60));
        $user->save();

        if ($request->filled('password')) {
            try {
                Auth::logoutOtherDevices($request->password);
            } catch (\Throwable $e) {
                // Ignore
            }
        }

        return back()->with('success', 'Berhasil keluar dari semua sesi di perangkat lain.');
    }
}

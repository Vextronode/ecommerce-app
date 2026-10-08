<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Jenssegers\Agent\Agent;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        $userId = $request->user()->getAuthIdentifier();

        $sessions = DB::table('sessions')
            ->where('user_id', $userId)
            ->orderBy('last_activity', 'desc')
            ->get()->map(function ($session) use ($request) {
                $agent = new Agent;
                $agent->setUserAgent($session->user_agent);

                return (object) [
                    'id' => $session->id,
                    'agent' => (object) [
                        'is_desktop' => $agent->isDesktop(),
                        'platform' => $agent->platform(),
                        'browser' => $agent->browser(),
                    ],
                    'ip_address' => $session->ip_address,
                    'is_current_device' => $session->id === $request->session()->getId(),
                    'last_active' => Carbon::createFromTimestamp($session->last_activity)->diffForHumans(),
                ];
            });

        $orderCounts = [
            'unpaid' => Order::where('user_id', $userId)->where('payment_status', 'pending')->where('payment_method', '!=', 'cod')->where('shipping_status', '!=', 'cancelled')->count(),
            'processing' => Order::where('user_id', $userId)->where('shipping_status', 'processing')->count(),
            'shipped' => Order::where('user_id', $userId)->where('shipping_status', 'shipped')->count(),
            'rating' => OrderItem::whereHas('order', function ($query) use ($userId) {
                $query->where('user_id', $userId)->where('shipping_status', 'delivered');
            })->doesntHave('review')->count(),
        ];

        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
            'addresses' => $request->user()->addresses()->orderBy('is_primary', 'desc')->get(),
            'notificationSettings' => $request->user()->notification_settings ?? [],
            'sessions' => $sessions,
            'isOAuth' => ! is_null($request->user()->google_id),
            'orderCounts' => $orderCounts,
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return Redirect::route('profile.edit');
    }

    /**
     * Logout from other browser sessions.
     */
    public function destroyOtherSessions(Request $request): RedirectResponse
    {
        $user = $request->user();

        DB::table('sessions')
            ->where('user_id', $user->getAuthIdentifier())
            ->where('id', '!=', $request->session()->getId())
            ->delete();

        $user->setRememberToken(\Illuminate\Support\Str::random(60));
        $user->save();

        return Redirect::route('profile.edit')->with('status', 'Sesion lainnya berhasil dihapus.');
    }

    public function destroy(Request $request): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        if ($user->role !== 'user' || $user->store()->exists()) {
            return back()->withErrors([
                'password' => 'Akun pedagang atau pengurus tidak dapat dihapus secara mandiri.',
            ]);
        }

        $hasActiveOrders = Order::where('user_id', $user->id)
            ->whereIn('shipping_status', ['pending', 'processing', 'shipped'])
            ->exists();

        if ($hasActiveOrders) {
            return back()->withErrors([
                'password' => 'Akun tidak dapat dihapus selama masih ada pesanan yang sedang berlangsung.',
            ]);
        }

        if (is_null($user->google_id)) {
            $request->validate([
                'password' => ['required', 'current_password'],
            ]);
        }

        if ($user->profile_photo_path) {
            Storage::disk('public')->delete($user->profile_photo_path);
        }

        try {
            if (\Illuminate\Support\Facades\Schema::hasTable('sessions')) {
                DB::table('sessions')->where('user_id', $user->id)->delete();
            }
        } catch (\Throwable $e) {
        }

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }

    /**
     * Update the user's profile photo.
     */
    public function updatePhoto(Request $request): RedirectResponse
    {
        $request->validate([
            'photo' => ['required', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
        ]);

        $user = $request->user();

        if ($request->hasFile('photo')) {
            if ($user->profile_photo_path) {
                Storage::disk('public')->delete($user->profile_photo_path);
            }

            $path = $request->file('photo')->store('profile-photos', 'public');

            $user->update([
                'profile_photo_path' => $path,
            ]);

            if ($user->store) {
                if ($user->store->logo_path && $user->store->logo_path !== $path) {
                    Storage::disk('public')->delete($user->store->logo_path);
                }
                $user->store->update(['logo_path' => $path]);
            }
        }

        return back();
    }

    public function storeAddress(Request $request)
    {
        if ($request->user()->addresses()->count() >= 20) {
            return back()->with('error', 'Maksimal 20 alamat tersimpan per akun.');
        }

        $validated = $request->validate([
            'recipient_name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'full_address' => 'required|string|max:1000',
            'label' => 'required|string|in:Rumah,Kantor',
            'is_primary' => 'boolean',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
        ]);

        $validated['recipient_name'] = strip_tags(trim($validated['recipient_name']));
        $validated['phone'] = strip_tags(trim($validated['phone']));
        $validated['full_address'] = strip_tags(trim($validated['full_address']));

        $hasExistingAddresses = $request->user()->addresses()->exists();
        if (! $hasExistingAddresses) {
            $validated['is_primary'] = true;
        } elseif (! empty($validated['is_primary'])) {
            $request->user()->addresses()->update(['is_primary' => false]);
        }

        $request->user()->addresses()->create($validated);

        return back();
    }

    public function updateAddress(Request $request, $id)
    {
        $address = $request->user()->addresses()->findOrFail($id);

        $validated = $request->validate([
            'recipient_name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'full_address' => 'required|string|max:1000',
            'label' => 'required|string|in:Rumah,Kantor',
            'is_primary' => 'boolean',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
        ]);

        $validated['recipient_name'] = strip_tags(trim($validated['recipient_name']));
        $validated['phone'] = strip_tags(trim($validated['phone']));
        $validated['full_address'] = strip_tags(trim($validated['full_address']));

        if ($request->is_primary) {
            $request->user()->addresses()->update(['is_primary' => false]);
        }

        $address->update($validated);

        return back();
    }

    public function destroyAddress(Request $request, $id)
    {
        $address = $request->user()->addresses()->findOrFail($id);
        $wasPrimary = (bool) $address->is_primary;
        $address->delete();

        if ($wasPrimary) {
            $nextAddress = $request->user()->addresses()->latest('id')->first();
            if ($nextAddress) {
                $nextAddress->update(['is_primary' => true]);
            }
        }

        return back();
    }

    public function updateNotifications(Request $request)
    {
        $validated = $request->validate([
            'menunggu_pembayaran' => 'sometimes|boolean',
            'menunggu_konfirmasi' => 'sometimes|boolean',
            'pesanan_diproses' => 'sometimes|boolean',
            'pesanan_dikirim' => 'sometimes|boolean',
            'pesanan_selesai' => 'sometimes|boolean',
            'pengingat' => 'sometimes|boolean',
        ]);

        $user = $request->user();
        $current = $user->notification_settings ?? [];
        $user->update([
            'notification_settings' => array_merge($current, $validated),
        ]);

        return back();
    }
}

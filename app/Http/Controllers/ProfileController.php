<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        $sessions = \Illuminate\Support\Facades\DB::table('sessions')
            ->where('user_id', $request->user()->getAuthIdentifier())
            ->orderBy('last_activity', 'desc')
            ->get()->map(function ($session) use ($request) {
                $agent = new \Jenssegers\Agent\Agent();
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
                    'last_active' => \Carbon\Carbon::createFromTimestamp($session->last_activity)->diffForHumans(),
                ];
            });

        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
            'addresses' => $request->user()->addresses()->orderBy('is_primary', 'desc')->get(),
            'notificationSettings' => $request->user()->notification_settings ?? [],
            'sessions' => $sessions,
            'isOAuth' => !is_null($request->user()->google_id),
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
        \Illuminate\Support\Facades\DB::table('sessions')
            ->where('user_id', $request->user()->getAuthIdentifier())
            ->where('id', '!=', $request->session()->getId())
            ->delete();

        return Redirect::route('profile.edit')->with('status', 'Sesion lainnya berhasil dihapus.');
    }
    public function destroy(Request $request): RedirectResponse
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        if (is_null($user->google_id)) {
            $request->validate([
                'password' => ['required', 'current_password'],
            ]);
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
            // clear storage untuk foto lama biar storage ga full
            if ($user->profile_photo_path) {
                Storage::disk('public')->delete($user->profile_photo_path);
            }

            $path = $request->file('photo')->store('profile-photos', 'public');

            $user->update([
                'profile_photo_path' => $path,
            ]);
        }

        return back();
    }

    public function storeAddress(Request $request)
    {
        $validated = $request->validate([
            'recipient_name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'full_address' => 'required|string',
            'label' => 'required|string|in:Rumah,Kantor',
            'is_primary' => 'boolean',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
        ]);

        if ($request->is_primary) {
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
            'full_address' => 'required|string',
            'label' => 'required|string|in:Rumah,Kantor',
            'is_primary' => 'boolean',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
        ]);

        if ($request->is_primary) {
            $request->user()->addresses()->update(['is_primary' => false]);
        }

        $address->update($validated);

        return back();
    }

    public function destroyAddress(Request $request, $id)
    {
        $address = $request->user()->addresses()->findOrFail($id);
        $address->delete();

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

        $request->user()->update([
            'notification_settings' => $validated,
        ]);

        return back();
    }
}

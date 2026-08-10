<?php

namespace App\Http\Controllers\Merchant;

use App\Http\Controllers\Controller;
use App\Models\Store;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class SettingsController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $store = Store::where('user_id', $user->id)->first();

        if (! $store) {
            return redirect()->route('merchant.store.setup');
        }

        return Inertia::render('Merchant/Settings/Index', [
            'merchantUser' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => 'Owner shop',
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
        ]);
    }

    public function update(Request $request)
    {
        $user = User::find(Auth::id());
        $store = Store::where('user_id', $user->id)->firstOrFail();

        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'phone' => ['nullable', 'string', 'max:20'],
            'photo' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],

            'store_name' => ['required', 'string', 'max:255', Rule::unique('stores', 'name')->ignore($store->id)],
            'username' => ['nullable', 'string', 'max:100', Rule::unique('stores', 'slug')->ignore($store->id)],
            'support_email' => ['nullable', 'string', 'lowercase', 'email', 'max:255'],
            'store_description' => ['nullable', 'string'],
            'store_address' => ['nullable', 'string'],
            'latitude' => ['nullable', 'numeric'],
            'longitude' => ['nullable', 'numeric'],
        ], [
            'name.required' => 'Nama lengkap pemilik wajib diisi.',
            'store_name.required' => 'Nama toko wajib diisi.',
            'store_name.unique' => 'Nama toko sudah digunakan toko lain.',
            'username.unique' => 'Username / URL slug toko sudah digunakan toko lain.',
        ]);

        $user->name = $request->name;
        $user->email = $request->email;
        $user->phone = $request->phone;

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

        $store->name = $request->store_name;
        if (! empty($request->username)) {
            $store->slug = Str::slug($request->username);
        }
        $store->support_email = $request->support_email;
        $store->description = $request->store_description;
        $store->address = $request->store_address;

        if ($request->filled('latitude') && $request->filled('longitude')) {
            $store->latitude = $request->latitude;
            $store->longitude = $request->longitude;
        }

        $store->save();

        return redirect()->back()->with('success', 'Pengaturan profil dan toko berhasil diperbarui.');
    }
}

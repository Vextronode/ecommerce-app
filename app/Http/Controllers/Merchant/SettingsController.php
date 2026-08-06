<?php

namespace App\Http\Controllers\Merchant;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use App\Models\Store;
use App\Models\User;

class SettingsController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $store = Store::where('user_id', $user->id)->first();

        if (!$store) {
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
                'support_email' => $store->support_email,
                'description' => $store->description,
                'address' => $store->address,
            ]
        ]);
    }

    public function update(Request $request)
    {
        $user = User::find(Auth::id());
        $store = Store::where('user_id', $user->id)->firstOrFail();

        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:users,email,'.$user->id],
            'phone' => ['nullable', 'string', 'max:20'],
            'photo' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
            
            'store_name' => ['required', 'string', 'max:255'],
            'support_email' => ['nullable', 'string', 'lowercase', 'email', 'max:255'],
            'store_description' => ['nullable', 'string'],
            'store_address' => ['nullable', 'string'],
        ]);

        $user->name = $request->name;
        $user->email = $request->email;
        $user->phone = $request->phone;

        if ($request->hasFile('photo')) {
            if ($user->profile_photo_path) {
                Storage::disk('public')->delete($user->profile_photo_path);
            }
            $path = $request->file('photo')->store('profile-photos', 'public');
            $user->profile_photo_path = $path;
        }

        $user->save();

        $store->name = $request->store_name;
        $store->support_email = $request->support_email;
        $store->description = $request->store_description;
        $store->address = $request->store_address;

        $store->save();

        return redirect()->back()->with('success', 'Settings updated successfully.');
    }
}

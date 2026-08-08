<?php

namespace App\Http\Controllers\Merchant;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class MerchantSetupController extends Controller
{
    public function store(Request $request)
    {
        $user = $request->user();
        $store = $user->store;

        // Validasi input dari form setup store
        $request->validate([
            'store_name' => [
                'required',
                'string',
                'min:3',
                'max:255',
                Rule::unique('stores', 'name')->ignore($store?->id),
            ],
            'password' => ['required', 'confirmed', Password::defaults()],
        ], [
            'store_name.required' => 'Nama toko wajib diisi.',
            'store_name.min' => 'Nama toko minimal 3 karakter.',
            'store_name.unique' => 'Nama toko ini sudah digunakan oleh pedagang lain.',
            'password.required' => 'Password baru wajib diisi.',
            'password.confirmed' => 'Konfirmasi password tidak sesuai.',
        ]);

        // Update password user dan ganti status "is_password_changed" jadi true
        $user->forceFill([
            'password' => Hash::make($request->password),
            'is_password_changed' => true,
        ])->save();

        if ($store) {
            // Update nama toko yang sudah ada
            $store->update([
                'name' => $request->store_name,
                'slug' => Str::slug($request->store_name . '-' . $user->id),
            ]);
        } else {
            // Buat entitas store baru jika belum ada
            $user->store()->create([
                'name' => $request->store_name,
                'slug' => Str::slug($request->store_name . '-' . $user->id),
                'subdistrict' => 'Cibenda',
                'sid_status' => 'verified',
            ]);
        }

        return redirect()->route('merchant.dashboard')->with('success', 'Profil toko dan password berhasil diperbarui.');
    }
}

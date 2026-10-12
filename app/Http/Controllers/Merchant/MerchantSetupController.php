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

        if ($request->has('store_name') && is_string($request->store_name)) {
            $request->merge(['store_name' => strip_tags(trim($request->store_name))]);
        }

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

        $user->forceFill([
            'password' => Hash::make($request->password),
            'remember_token' => Str::random(60),
            'is_password_changed' => true,
        ])->save();

        $baseSlug = Str::slug($request->store_name) ?: 'toko-'.$user->id;
        $slug = $baseSlug.'-'.$user->id;
        $count = 1;
        while (\App\Models\Store::where('slug', $slug)->when($store, fn ($q) => $q->where('id', '!=', $store->id))->exists()) {
            $slug = $baseSlug.'-'.$user->id.'-'.$count++;
        }

        if ($store) {
            $store->update([
                'name' => $request->store_name,
                'slug' => $slug,
            ]);
        } else {
            $store = $user->store()->create([
                'name' => $request->store_name,
                'slug' => $slug,
                'subdistrict' => 'Cibenda',
            ]);
            // store dari pedagang udah lolos verifikasi sid sebelum akun dibuat admin, jadi langsung verified
            $store->forceFill(['sid_status' => 'verified'])->save();
        }

        return redirect()->route('merchant.dashboard')->with('success', 'Profil toko dan password berhasil diperbarui.');
    }
}

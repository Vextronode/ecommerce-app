<?php

namespace App\Http\Controllers\Merchant;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;

class MerchantSetupController extends Controller
{
    public function store(Request $request)
    {
        // validasi input dari react
        $request->validate([
            'store_name' => ['required', 'string', 'max:255', 'unique:stores,name'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $user = $request->user();

        // update pw user dan ganti status "is_password_changed" jadi true
        $user->forceFill([
            'password' => Hash::make($request->password),
            'is_password_changed' => true,
        ])->save();

        // save nama store karena table dan relasi udah siap!
        $user->store()->create([
            'name' => $request->store_name,
            // Generate slug dari nama toko + random string biar pasti unik
            'slug' => Str::slug($request->store_name . '-' . uniqid()),
        ]);

        return redirect()->route('merchant.dashboard');
    }
}

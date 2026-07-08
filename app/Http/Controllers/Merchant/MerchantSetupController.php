<?php

namespace App\Http\Controllers\Merchant;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class MerchantSetupController extends Controller
{
    public function store(Request $request)
    {
        // validasi input dari react
        $request->validate([
            'store_name' => ['required', 'string', 'max:255'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $user = $request->user();

        // update pw user dan ganti status "is_password_changed" jadi true
        $user->forceFill([
            'password' => Hash::make($request->password),
            'is_password_changed' => true,
        ])->save();

        // save nama store nanti kalo udah ada table dan relasi
        // $user->store()->create([
        //     'name' => $request->store_name,
        // ]);

        return redirect()->route('merchant.dashboard');
    }
}

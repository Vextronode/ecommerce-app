<?php

namespace App\Http\Middleware;

use App\Models\Cart;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                    'profile_photo_path' => $request->user()->profile_photo_path,
                    'phone' => $request->user()->phone,
                    'gender' => $request->user()->gender,
                    'dob' => $request->user()->dob,
                    'role' => $request->user()->role,
                    'is_password_changed' => $request->user()->is_password_changed,
                ] : null,
            ],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
            'cart_count' => $request->user()
                ? Cart::where('user_id', $request->user()->id)->count()
                : 0,
            'cart_preview' => fn () => $request->user() ? [
                'items' => Cart::with(['product.skus'])
                    ->where('user_id', $request->user()->id)
                    ->latest()
                    ->take(4)
                    ->get()
                    ->map(function ($cart) {
                        $matchingSku = $cart->product ? $cart->product->skus->where('variant_name', $cart->preparation_option)->first() : null;
                        return [
                            'id' => $cart->id,
                            'name' => $cart->product->name ?? 'Produk',
                            'price' => (float) ($matchingSku ? $matchingSku->price : ($cart->product->price ?? 0)),
                            'quantity' => $cart->quantity,
                            'variant_name' => $cart->preparation_option,
                            'img' => $cart->product->image_path ?? 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=200',
                        ];
                    }),
                'total_count' => Cart::where('user_id', $request->user()->id)->count(),
            ] : null,
        ];
    }
}

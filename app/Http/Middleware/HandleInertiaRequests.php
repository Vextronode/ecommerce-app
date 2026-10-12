<?php

namespace App\Http\Middleware;

use App\Models\Cart;
use App\Models\Category;
use App\Models\ChatMessage;
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
    public function handle(Request $request, \Closure $next)
    {
        $response = parent::handle($request, $next);

        if (isset($response->headers)) {
            $response->headers->set('X-Content-Type-Options', 'nosniff');
            $response->headers->set('X-Frame-Options', 'SAMEORIGIN');
            $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
            $response->headers->set('Permissions-Policy', 'camera=(self), microphone=(), geolocation=(self)');
        }

        return $response;
    }

    public function share(Request $request): array
    {
        $user = $request->user();

        if ($user) {
            $lastSeen = $user->last_seen_at instanceof \Carbon\Carbon
                ? $user->last_seen_at
                : ($user->last_seen_at ? \Carbon\Carbon::parse($user->last_seen_at) : null);

            if (!$lastSeen || $lastSeen->lt(now()->subMinutes(2))) {
                $user->forceFill(['last_seen_at' => now()])->saveQuietly();
            }
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'profile_photo_path' => $user->profile_photo_path,
                    'phone' => $user->phone,
                    'gender' => $user->gender,
                    'dob' => $user->dob,
                    'role' => $user->role,
                ] : null,
            ],
            'unread_chats_count' => fn () => $user
                ? ($user->role === 'pedagang' && $user->store
                    ? ChatMessage::whereHas('chatRoom', function ($q) use ($user) {
                        $q->where('store_id', $user->store->id);
                    })->where('sender_type', 'user')->where('is_read', false)->count()
                    : ChatMessage::whereHas('chatRoom', function ($q) use ($user) {
                        $q->where('user_id', $user->id);
                    })->where('sender_type', 'merchant')->where('is_read', false)->count()
                ) : 0,
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
                'warning' => $request->session()->get('warning'),
            ],
            'merchant_store' => fn () => ($request->user() && $request->user()->role === 'pedagang')
                ? ($request->user()->store ? [
                    'id' => $request->user()->store->id,
                    'name' => $request->user()->store->name,
                    'address' => $request->user()->store->address,
                    'has_address' => ! empty(trim($request->user()->store->address ?? '')),
                    'has_completed_tour' => (bool) ($request->user()->store->has_completed_tour ?? false),
                ] : null)
                : null,
            // lazy supaya query count tidak jalan di setiap request halaman apa pun
            'cart_count' => fn () => $request->user()
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
                            'img' => $cart->product->image_path ?? 'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&q=80&w=400',
                        ];
                    }),
                'total_count' => Cart::where('user_id', $request->user()->id)->count(),
            ] : null,
            'global_categories' => fn () => Category::select('id', 'name', 'slug')->get(),
        ];
    }
}

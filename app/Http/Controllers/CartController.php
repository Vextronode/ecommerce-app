<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class CartController extends Controller
{
    public function index()
    {
        $carts = Cart::with(['product.store', 'product.skus'])
            ->where('user_id', auth()->id())
            ->whereHas('product')
            ->latest()
            ->get();

        $groupedCart = $carts->groupBy(function ($cart) {
            return $cart->product->store_id ?? 0;
        })->map(function ($group) {
            $store = $group->first()->product->store;

            return [
                'id' => $store->id ?? 0,
                'storeName' => $store->name ?? 'Cibenda Mart',
                'items' => $group->map(function ($cart) {

                    $matchingSku = $cart->product->skus->where('variant_name', $cart->preparation_option)->first();

                    return [
                        'id' => $cart->id,
                        'product_id' => $cart->product->id,
                        'name' => $cart->product->name,
                        'weight' => $cart->product->unit ?? 'pcs',

                        'price' => $matchingSku ? $matchingSku->price : $cart->product->price,
                        'stock' => $matchingSku ? $matchingSku->stock : $cart->product->stock,
                        'qty' => $cart->quantity,

                        'img' => $cart->product->image_path ?? 'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&q=80&w=400',
                        'prepOption' => $cart->preparation_option,

                        'sku' => $matchingSku ? [
                            'variant_name' => $matchingSku->variant_name,
                        ] : null,
                    ];
                }),
            ];
        })->values();

        $cartProductIds = $carts->pluck('product_id')->toArray();
        $cartCategoryIds = $carts->pluck('product.category_id')->filter()->unique()->toArray();

        $recommendations = Product::with(['category', 'store'])
            ->withSum(['orderItems as sold' => function ($query) {
                $query->whereHas('order', function ($q) {
                    $q->where('shipping_status', 'delivered');
                });
            }], 'quantity')
            ->withAvg('reviews as rating', 'rating')
            ->where('is_active', true)
            ->where('stock', '>', 0)
            ->whereHas('store', function ($q) {
                $q->where('sid_status', 'verified')
                    ->whereHas('user', function ($uq) {
                        $uq->whereIn('status', ['active', 'warning']);
                    });
            })
            ->whereNotIn('id', $cartProductIds)
            ->when(count($cartCategoryIds) > 0, function ($query) use ($cartCategoryIds) {
                $query->whereIn('category_id', $cartCategoryIds);
            })
            ->inRandomOrder()
            ->take(6)
            ->get()
            ->map(function ($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'slug' => $product->slug,
                    'category' => $product->category,
                    'category_name' => $product->category?->name ?? 'Produk',
                    'price' => $product->price,
                    'rating' => $product->rating ? (float) $product->rating : 0.0,
                    'sold' => $product->sold ?? 0,
                    'img' => $product->image_path ?? 'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&q=80&w=400',
                ];
            });

        return Inertia::render('Cart/Cart', [
            'cartData' => $groupedCart,
            'recommendations' => $recommendations,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'preparation_option' => 'nullable|string',
        ]);

        $cart = DB::transaction(function () use ($validated) {
            $product = Product::query()
                ->where('id', $validated['product_id'])
                ->where('is_active', true)
                ->with(['skus', 'store.user'])
                ->lockForUpdate()
                ->firstOrFail();

            $store = $product->store;
            if (! $store || $store->sid_status !== 'verified' || ($store->user && in_array($store->user->status, ['suspended', 'inactive'], true))) {
                throw ValidationException::withMessages([
                    'product_id' => 'Toko penjual sedang tidak aktif atau belum terverifikasi.',
                ]);
            }

            if ((int) $store->user_id === (int) auth()->id()) {
                throw ValidationException::withMessages([
                    'product_id' => 'Anda tidak dapat membeli produk dari toko Anda sendiri.',
                ]);
            }

            $prepOption = $validated['preparation_option'] ?? '';
            $availableStock = $product->stock;

            if ($product->skus->isNotEmpty()) {
                $matchingSku = $product->skus->where('variant_name', $prepOption)->first();
                if (! $matchingSku) {
                    throw ValidationException::withMessages([
                        'preparation_option' => 'Silakan pilih varian produk yang valid.',
                    ]);
                }
                $availableStock = $matchingSku->stock;
            } elseif (! empty($prepOption)) {
                $prepOption = '';
            }

            $cart = Cart::query()
                ->where('user_id', auth()->id())
                ->where('product_id', $product->id)
                ->where('preparation_option', $prepOption)
                ->lockForUpdate()
                ->first();

            $newQuantity = ($cart?->quantity ?? 0) + $validated['quantity'];

            if ($newQuantity > $availableStock) {
                throw ValidationException::withMessages([
                    'quantity' => "Stok {$product->name}".($prepOption ? " ({$prepOption})" : '').' tidak mencukupi.',
                ]);
            }

            return Cart::updateOrCreate(
                [
                    'user_id' => auth()->id(),
                    'product_id' => $product->id,
                    'preparation_option' => $prepOption,
                ],
                [
                    'quantity' => $newQuantity,
                ]
            );
        });

        if ($request->boolean('checkout')) {
            return redirect()->route('checkout', ['items' => [$cart->id]]);
        }

        return redirect()->back();
    }

    public function update(Request $request, Cart $cart)
    {
        if ($cart->user_id !== auth()->id()) {
            abort(403);
        }

        $validated = $request->validate(['quantity' => 'required|integer|min:1']);

        DB::transaction(function () use ($cart, $validated) {
            // urutan penguncian product dulu baru cart, konsisten dengan store() dan checkout.
            $product = Product::where('id', $cart->product_id)
                ->with(['skus', 'store.user'])
                ->lockForUpdate()
                ->first();

            $lockedCart = Cart::where('id', $cart->id)->lockForUpdate()->firstOrFail();

            $store = $product?->store;
            if (! $product || ! $product->is_active || ! $store || $store->sid_status !== 'verified' || ($store->user && in_array($store->user->status, ['suspended', 'inactive'], true))) {
                throw ValidationException::withMessages([
                    'quantity' => 'Produk atau toko tidak tersedia.',
                ]);
            }

            $availableStock = $product->stock;
            if ($product->skus->isNotEmpty()) {
                $matchingSku = $product->skus->where('variant_name', $lockedCart->preparation_option)->first();
                if (! $matchingSku) {
                    throw ValidationException::withMessages([
                        'quantity' => 'Varian produk sudah tidak valid.',
                    ]);
                }
                $availableStock = $matchingSku->stock;
            }

            if ($validated['quantity'] > $availableStock) {
                throw ValidationException::withMessages([
                    'quantity' => 'Quantity melebihi stok tersedia.',
                ]);
            }

            $lockedCart->update(['quantity' => $validated['quantity']]);
        });

        return redirect()->back();
    }

    public function destroy(Cart $cart)
    {
        if ($cart->user_id !== auth()->id()) {
            abort(403);
        }

        $cart->delete();

        return redirect()->back();
    }
}

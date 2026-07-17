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

                        'img' => $cart->product->image_path ?? 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=200',
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

        $recommendations = \App\Models\Product::withSum(['orderItems as sold' => function ($query) {
                $query->whereHas('order', function ($q) {
                    $q->where('shipping_status', 'delivered');
                });
            }], 'quantity')
            ->where('is_active', true)
            ->where('stock', '>', 0)
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
                    'price' => $product->price,
                    'rating' => 5.0,
                    'sold' => $product->sold ?? 0,
                    'img' => $product->image_path ?? 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&q=80&w=200',
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
                ->lockForUpdate()
                ->firstOrFail();

            $cart = Cart::query()
                ->where('user_id', auth()->id())
                ->where('product_id', $product->id)
                ->where('preparation_option', $validated['preparation_option'] ?? '')
                ->lockForUpdate()
                ->first();

            $newQuantity = ($cart?->quantity ?? 0) + $validated['quantity'];

            if ($newQuantity > $product->stock) {
                throw ValidationException::withMessages([
                    'quantity' => "Stok {$product->name} tidak mencukupi.",
                ]);
            }

            return Cart::updateOrCreate(
                [
                    'user_id' => auth()->id(),
                    'product_id' => $product->id,
                    'preparation_option' => $validated['preparation_option'] ?? '',
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

        $cart->load('product');

        if (!$cart->product || !$cart->product->is_active || $validated['quantity'] > $cart->product->stock) {
            throw ValidationException::withMessages([
                'quantity' => 'Quantity melebihi stok tersedia.',
            ]);
        }

        $cart->update(['quantity' => $validated['quantity']]);

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

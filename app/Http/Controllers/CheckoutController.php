<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CheckoutController extends Controller
{
    public function index(Request $request)
    {
        // tangkep array ID dari URL (yang dikirim dari router.get React)
        $selectedItems = $request->query('items', []);

        // kalau iseng nembak URL /checkout tapi gak bawa item, tendang balik
        if (empty($selectedItems)) {
            return redirect()->route('cart')->with('error', 'Pilih minimal satu barang untuk checkout.');
        }

        // tarik data keranjang HANYA yang ID nya ada di array $selectedItems
        $carts = Cart::with(['product.store'])
            ->where('user_id', auth()->id())
            ->whereIn('id', $selectedItems)
            ->get();

        if ($carts->isEmpty()) {
            return redirect()->route('cart')->with('error', 'Barang tidak ditemukan di keranjang.');
        }

        $cartItems = $carts->map(function ($cart) {
            return [
                'id' => $cart->id,
                'product_id' => $cart->product->id,
                'name' => $cart->product->name,
                'location' => $cart->product->store ? $cart->product->store->name . ' - ' . $cart->product->store->address : 'Cibenda Mart',
                'price' => $cart->product->price,
                'qty' => $cart->quantity,
                'img' => $cart->product->image_path ?? 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&q=80&w=200',
            ];
        });

        return Inertia::render('Checkout/Checkout', [
            'initialCartItems' => $cartItems,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'cart_ids' => 'required|array',
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'address' => 'required|string',
            'delivery_method' => 'required|string',
            'payment_method' => 'required|string',
            'total_amount' => 'required|numeric',
        ]);

        // simpan data pesanan utama
        $order = \App\Models\Order::create([
            'user_id' => auth()->id(),
            'shipping_name' => $validated['name'],
            'shipping_phone' => $validated['phone'],
            'shipping_address' => $validated['address'],
            'delivery_method' => $validated['delivery_method'],
            'payment_method' => $validated['payment_method'],
            'total_amount' => $validated['total_amount'],
            'status' => 'pending',
        ]);

        // pindahin barang dari keranjang ke order_items
        $carts = Cart::whereIn('id', $validated['cart_ids'])->with('product')->get();

        foreach ($carts as $cart) {
            // masukin ke tabel riwayat pesanan
            \App\Models\OrderItem::create([
                'order_id' => $order->id,
                'product_id' => $cart->product_id,
                'quantity' => $cart->quantity,
                'price' => $cart->product->price,
            ]);
            if ($cart->product->stock > 0) {
                $cart->product->decrement('stock', $cart->quantity);
            }
        }

        Cart::whereIn('id', $validated['cart_ids'])->delete();

        return redirect()->route('shop')->with('success', 'Pesanan berhasil dibuat!');
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class CheckoutController extends Controller
{
    private const DELIVERY_FEES = [
        'coastal' => 25000,
        'standard' => 15000,
    ];

    private const ADMIN_FEE = 2000;

    public function index(Request $request)
    {
        // tangkep array ID dari URL (yang dikirim dari router.get React)
        $selectedItems = array_filter((array) $request->query('items', []));

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

        if ($carts->count() !== count($selectedItems)) {
            return redirect()->route('cart')->with('error', 'Ada item keranjang yang tidak valid.');
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
            'cart_ids' => ['required', 'array', 'min:1'],
            'cart_ids.*' => ['integer', 'distinct'],
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'address' => 'required|string',
            'delivery_method' => ['required', 'string', 'in:coastal,standard'],
            'payment_method' => ['required', 'string', 'in:va,card,ewallet'],
        ]);

        $order = DB::transaction(function () use ($validated) {
            $carts = Cart::query()
                ->where('user_id', auth()->id())
                ->whereIn('id', $validated['cart_ids'])
                ->with('product')
                ->lockForUpdate()
                ->get();

            if ($carts->count() !== count($validated['cart_ids'])) {
                throw ValidationException::withMessages([
                    'cart_ids' => 'Ada item keranjang yang tidak valid.',
                ]);
            }

            $subtotal = 0;

            foreach ($carts as $cart) {
                $product = $cart->product()->lockForUpdate()->first();

                if (!$product || !$product->is_active) {
                    throw ValidationException::withMessages([
                        'cart_ids' => "Produk {$cart->product_id} sudah tidak tersedia.",
                    ]);
                }

                if ($cart->quantity > $product->stock) {
                    throw ValidationException::withMessages([
                        'cart_ids' => "Stok {$product->name} tidak mencukupi.",
                    ]);
                }

                $subtotal += $product->price * $cart->quantity;
                $cart->setRelation('product', $product);
            }

            $deliveryFee = self::DELIVERY_FEES[$validated['delivery_method']];
            $totalAmount = $subtotal + $deliveryFee + self::ADMIN_FEE;

            $order = Order::create([
                'user_id' => auth()->id(),
                'shipping_name' => $validated['name'],
                'shipping_phone' => $validated['phone'],
                'shipping_address' => $validated['address'],
                'delivery_method' => $validated['delivery_method'],
                'payment_method' => $validated['payment_method'],
                'total_amount' => $totalAmount,
                'status' => 'pending',
            ]);

            foreach ($carts as $cart) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $cart->product_id,
                    'quantity' => $cart->quantity,
                    'price' => $cart->product->price,
                ]);

                $cart->product->decrement('stock', $cart->quantity);
                $cart->delete();
            }

            return $order;
        });

        return redirect()->route('shop')->with('success', 'Pesanan berhasil dibuat!');
    }
}

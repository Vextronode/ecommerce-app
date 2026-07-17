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
        $selectedItems = array_filter((array) $request->query('items', []));

        if (empty($selectedItems)) {
            return redirect()->route('cart')->with('error', 'Pilih minimal satu barang untuk checkout.');
        }

        $carts = Cart::with(['product.store', 'product.skus'])
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
            $matchingSku = $cart->product->skus->where('variant_name', $cart->preparation_option)->first();

            return [
                'id' => $cart->id,
                'product_id' => $cart->product->id,
                'name' => $cart->product->name,
                'location' => $cart->product->store ? $cart->product->store->name . ' - ' . $cart->product->store->address : 'Cibenda Mart',

                // Set harga dari SKU kalau ada
                'price' => $matchingSku ? $matchingSku->price : $cart->product->price,

                'qty' => $cart->quantity,
                'img' => $cart->product->image_path ?? 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&q=80&w=200',

                'preparation_option' => $cart->preparation_option,
                'unit' => $cart->product->unit ?? 'pcs',
            ];
        });

        return Inertia::render('Checkout/Checkout', [
            'initialCartItems' => $cartItems,
            'addresses' => $request->user()->addresses()->orderBy('is_primary', 'desc')->latest()->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'cart_ids' => ['required', 'array', 'min:1'],
            'cart_ids.*' => ['integer', 'distinct'],
            'address_id' => ['nullable', 'integer'],
            'name' => 'required_without:address_id|string|max:255',
            'phone' => 'required_without:address_id|string|max:20',
            'address' => 'required_without:address_id|string',
            'delivery_method' => ['required', 'string', 'in:coastal,standard'],
            'payment_method' => ['required', 'string', 'in:va,card,ewallet,cod'],
        ]);

        if (!empty($validated['address_id'])) {
            $address = $request->user()->addresses()->findOrFail($validated['address_id']);
            $validated['name'] = $address->recipient_name;
            $validated['phone'] = $address->phone;
            $validated['address'] = $address->full_address;
        }

        $orders = DB::transaction(function () use ($validated, $request) {
            $carts = Cart::query()
                ->where('user_id', auth()->id())
                ->whereIn('id', $validated['cart_ids'])
                ->with(['product.skus', 'product.store'])
                ->lockForUpdate()
                ->get();

            if ($carts->count() !== count($validated['cart_ids'])) {
                throw ValidationException::withMessages([
                    'cart_ids' => 'Ada item keranjang yang tidak valid.',
                ]);
            }

            // Group carts by store_id
            $cartsByStore = $carts->groupBy(function ($cart) {
                // If product has no store, maybe assign a default or error
                return $cart->product->store_id;
            });

            $createdOrders = [];

            foreach ($cartsByStore as $storeId => $storeCarts) {
                $subtotal = 0;

                foreach ($storeCarts as $cart) {
                    $product = $cart->product()->lockForUpdate()->first();

                    if (!$product || !$product->is_active) {
                        throw ValidationException::withMessages([
                            'cart_ids' => "Produk {$cart->product_id} sudah tidak tersedia.",
                        ]);
                    }

                    $matchingSku = $product->skus->where('variant_name', $cart->preparation_option)->first();
                    $availableStock = $matchingSku ? $matchingSku->stock : $product->stock;
                    $itemPrice = $matchingSku ? $matchingSku->price : $product->price;

                    if ($cart->quantity > $availableStock) {
                        throw ValidationException::withMessages([
                            'cart_ids' => "Stok {$product->name} tidak mencukupi.",
                        ]);
                    }

                    $subtotal += $itemPrice * $cart->quantity;
                    $cart->setRelation('product', $product);
                }

                $deliveryFee = self::DELIVERY_FEES[$validated['delivery_method']];
                $adminFee = $validated['payment_method'] === 'cod' ? 0 : self::ADMIN_FEE;
                $totalAmount = $subtotal + $deliveryFee + $adminFee;

                $order = Order::create([
                    'store_id' => $storeId,
                    'user_id' => auth()->id(),
                    'invoice_number' => 'ORD-' . date('YmdHis') . '-' . strtoupper(substr(uniqid(), -4)),
                    'customer_name' => $validated['name'],
                    'customer_phone' => $validated['phone'],
                    'shipping_address' => $validated['address'],
                    'delivery_method' => $validated['delivery_method'],
                    'subtotal' => $subtotal,
                    'shipping_cost' => $deliveryFee,
                    'total_amount' => $totalAmount,
                    'payment_method' => $validated['payment_method'],
                    'payment_status' => 'pending',
                    'shipping_status' => 'pending',
                ]);

                foreach ($storeCarts as $cart) {
                    $matchingSku = $cart->product->skus->where('variant_name', $cart->preparation_option)->first();
                    $itemPrice = $matchingSku ? $matchingSku->price : $cart->product->price;

                    OrderItem::create([
                        'order_id' => $order->id,
                        'product_id' => $cart->product_id,
                        'product_name' => $cart->product->name,
                        'price' => $itemPrice,
                        'quantity' => $cart->quantity,
                        'unit' => $cart->product->unit ?? 'pcs',
                        'variant_name' => $cart->preparation_option,
                    ]);

                    if ($matchingSku) {
                        $matchingSku->decrement('stock', $cart->quantity);
                    } else {
                        $cart->product->decrement('stock', $cart->quantity);
                    }

                    $cart->delete();
                }

                $createdOrders[] = $order;
            }

            return $createdOrders;
        });

        // Redirect to success page, passing the first order ID (if any) to view details if needed
        $firstOrderId = count($orders) > 0 ? $orders[0]->id : null;
        
        return redirect()->route('checkout.success', ['order_id' => $firstOrderId]);
    }

    public function success(\Illuminate\Http\Request $request)
    {
        return Inertia::render('Checkout/Success', [
            'order_id' => $request->query('order_id')
        ]);
    }
}

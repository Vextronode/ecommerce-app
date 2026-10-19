<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\ChatNegotiation;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Services\MidtransService;
use App\Services\OrderNotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class CheckoutController extends Controller
{
    private const DELIVERY_FEES = [
        'coastal' => 25000,
        'standard' => 15000,
    ];

    private const ADMIN_FEE = 2000;

    private function haversineDistance($lat1, $lon1, $lat2, $lon2)
    {
        $earthRadius = 6371; // km
        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);

        $a = sin($dLat / 2) * sin($dLat / 2) +
             cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
             sin($dLon / 2) * sin($dLon / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;
    }

    private function calculateShippingCost($store, $addressLat, $addressLon, $method)
    {
        if ($method === 'self_pickup') {
            return 0;
        }

        if ($method === 'local_delivery') {
            if (! $store || ! $store->latitude || ! $store->longitude || ! $addressLat || ! $addressLon) {
                return 15000;
            }

            $distance = $this->haversineDistance((float) $store->latitude, (float) $store->longitude, (float) $addressLat, (float) $addressLon);

            $baseFee = 5000;
            if ($distance <= 2) {
                return $baseFee;
            } else {
                $extraDistance = ceil($distance - 2);

                return $baseFee + ($extraDistance * 2000);
            }
        }

        return 15000;
    }

    public function index(Request $request)
    {
        $selectedItems = array_filter((array) $request->query('items', []));

        if (empty($selectedItems)) {
            return redirect()->route('cart')->with('error', 'Pilih minimal satu barang untuk checkout.');
        }

        $carts = Cart::with(['product.store', 'product.skus', 'negotiation'])
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
            $store = $cart->product->store;
            $effectivePrice = $matchingSku ? (float) $matchingSku->price : (float) $cart->product->price;
            $isNegotiated = false;

            if ($cart->negotiation) {
                if ($cart->negotiation->status === 'accepted' && ! $cart->negotiation->isExpired() && $cart->negotiation->purchased_at === null) {
                    $effectivePrice = $cart->negotiation->agreed_price;
                    $isNegotiated = true;
                }
            }

            return [
                'id' => $cart->id,
                'product_id' => $cart->product->id,
                'name' => $cart->product->name,
                'store_id' => $cart->product->store_id,
                'store_name' => $store ? $store->name : 'Cibenda Mart',
                'store_address' => $store ? $store->address : '',
                'location' => $store ? $store->name.' - '.$store->address : 'Cibenda Mart',
                'store_lat' => $store ? $store->latitude : null,
                'store_lon' => $store ? $store->longitude : null,
                'price' => $effectivePrice,
                'original_price' => $matchingSku ? (float) $matchingSku->price : (float) $cart->product->price,
                'is_negotiated' => $isNegotiated,
                'qty' => $cart->quantity,
                'img' => $cart->product->image_path ?? 'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&q=80&w=400',
                'preparation_option' => $cart->preparation_option,
                'unit' => $cart->product->unit ?? 'pcs',
            ];
        });

        return Inertia::render('Checkout/Checkout', [
            'initialCartItems' => $cartItems,
            'addresses' => $request->user()->addresses()->orderBy('is_primary', 'desc')->latest()->get(),
        ]);
    }

    public function store(Request $request, MidtransService $midtransService)
    {
        foreach (['name', 'phone', 'address'] as $field) {
            if ($request->has($field) && is_string($request->input($field))) {
                $cleaned = strip_tags(trim($request->input($field)));
                $request->merge([$field => $cleaned !== '' ? $cleaned : null]);
            }
        }

        $validated = $request->validate([
            'cart_ids' => ['required', 'array', 'min:1'],
            'cart_ids.*' => ['integer', 'distinct'],
            'address_id' => ['nullable', 'integer', 'required_if:delivery_method,local_delivery'],
            'name' => ['required_without:address_id', 'nullable', 'string', 'max:255'],
            'phone' => ['required_without:address_id', 'nullable', 'string', 'max:20'],
            'address' => ['required_without:address_id', 'nullable', 'string', 'max:1000'],
            'delivery_method' => ['required', 'string', 'in:local_delivery,self_pickup'],
            'payment_method' => ['required', 'string', 'in:va,qris,gopay,cod'],
            'payment_channel' => ['required', 'string', 'in:bca_va,bni_va,bri_va,permata_va,mandiri_bill,qris,gopay,cod'],
        ]);

        $allowedChannelsByMethod = [
            'va' => ['bca_va', 'bni_va', 'bri_va', 'permata_va', 'mandiri_bill'],
            'qris' => ['qris'],
            'gopay' => ['gopay'],
            'cod' => ['cod'],
        ];

        if (! in_array($validated['payment_channel'], $allowedChannelsByMethod[$validated['payment_method']] ?? [], true)) {
            throw ValidationException::withMessages([
                'payment_channel' => 'Saluran pembayaran tidak sesuai dengan metode pembayaran yang dipilih.',
            ]);
        }

        $addressLat = null;
        $addressLon = null;

        if (! empty($validated['address_id'])) {
            $address = $request->user()->addresses()->findOrFail($validated['address_id']);
            $validated['name'] = strip_tags(trim((string) $address->recipient_name));
            $validated['phone'] = strip_tags(trim((string) $address->phone));
            $validated['address'] = strip_tags(trim((string) $address->full_address));
            $addressLat = $address->latitude;
            $addressLon = $address->longitude;

            if ($validated['delivery_method'] === 'local_delivery' && ($addressLat === null || $addressLon === null)) {
                throw ValidationException::withMessages([
                    'address_id' => 'Alamat pengiriman harus memiliki titik koordinat peta untuk kurir lokal.',
                ]);
            }
        } else {
            $validated['name'] = strip_tags(trim((string) ($validated['name'] ?? '')));
            $validated['phone'] = strip_tags(trim((string) ($validated['phone'] ?? '')));
            $validated['address'] = strip_tags(trim((string) ($validated['address'] ?? '')));
        }

        $orders = DB::transaction(function () use ($validated, $addressLat, $addressLon) {
            // urutan penguncian kanonik: product (urut id) dulu, baru cart.
            // daftar cart dibaca tanpa lock lebih dulu hanya untuk tahu product mana
            // yang harus dikunci, lalu cart baru dikunci setelah product.
            $cartRows = Cart::query()
                ->where('user_id', auth()->id())
                ->whereIn('id', $validated['cart_ids'])
                ->get(['id', 'product_id']);

            if ($cartRows->count() !== count($validated['cart_ids'])) {
                throw ValidationException::withMessages([
                    'cart_ids' => 'Ada item keranjang yang tidak valid.',
                ]);
            }

            $productIds = $cartRows->pluck('product_id')->unique()->sort()->values()->all();

            $lockedProducts = Product::query()
                ->whereIn('id', $productIds)
                ->with('skus')
                ->orderBy('id')
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            $carts = Cart::query()
                ->where('user_id', auth()->id())
                ->whereIn('id', $validated['cart_ids'])
                ->with(['product.store.user', 'negotiation'])
                ->lockForUpdate()
                ->get();

            if ($carts->count() !== count($validated['cart_ids'])) {
                throw ValidationException::withMessages([
                    'cart_ids' => 'Ada item keranjang yang tidak valid.',
                ]);
            }

            // Group carts by store_id
            $cartsByStore = $carts->groupBy(function ($cart) {
                return $cart->product->store_id;
            });

            $createdOrders = [];
            $adminFeeApplied = false;

            foreach ($cartsByStore as $storeId => $storeCarts) {
                $subtotal = 0;
                $store = $storeCarts->first()->product->store;

                if (! $store || $store->sid_status !== 'verified' || ($store->user && in_array($store->user->status, ['suspended', 'inactive'], true))) {
                    throw ValidationException::withMessages([
                        'cart_ids' => 'Toko penjual sedang tidak aktif atau tidak dapat menerima pesanan saat ini.',
                    ]);
                }

                if ((int) $store->user_id === (int) auth()->id()) {
                    throw ValidationException::withMessages([
                        'cart_ids' => 'Anda tidak dapat membeli produk dari toko Anda sendiri.',
                    ]);
                }

                foreach ($storeCarts as $cart) {
                    $product = $lockedProducts->get($cart->product_id);

                    if (! $product || ! $product->is_active) {
                        throw ValidationException::withMessages([
                            'cart_ids' => "Produk {$cart->product_id} sudah tidak tersedia.",
                        ]);
                    }

                    $matchingSku = $product->skus->where('variant_name', $cart->preparation_option)->first();
                    if ($product->skus->isNotEmpty() && ! $matchingSku) {
                        throw ValidationException::withMessages([
                            'cart_ids' => "Varian untuk {$product->name} sudah tidak valid. Silakan pilih ulang di keranjang.",
                        ]);
                    }

                    $availableStock = $matchingSku ? $matchingSku->stock : $product->stock;
                    $itemPrice = $matchingSku ? (float) $matchingSku->price : (float) $product->price;

                    if ($cart->negotiation_id) {
                        $lockedNegotiation = ChatNegotiation::where('id', $cart->negotiation_id)
                            ->where('user_id', auth()->id())
                            ->where('product_id', $product->id)
                            ->lockForUpdate()
                            ->first();

                        if (! $lockedNegotiation || $lockedNegotiation->status !== 'accepted' || $lockedNegotiation->isExpired() || $lockedNegotiation->purchased_at !== null) {
                            throw ValidationException::withMessages([
                                'cart_ids' => "Penawaran harga untuk {$product->name} sudah tidak berlaku atau kadaluarsa. Silakan periksa kembali keranjang Anda.",
                            ]);
                        }

                        if ($cart->quantity !== $lockedNegotiation->quantity) {
                            throw ValidationException::withMessages([
                                'cart_ids' => "Jumlah barang pada penawaran ({$lockedNegotiation->quantity} pcs) tidak sesuai dengan jumlah di keranjang ({$cart->quantity} pcs).",
                            ]);
                        }

                        $itemPrice = $lockedNegotiation->agreed_price;
                        $cart->setRelation('negotiation', $lockedNegotiation);
                    }

                    if ($cart->quantity > $availableStock) {
                        throw ValidationException::withMessages([
                            'cart_ids' => "Stok {$product->name} tidak mencukupi.",
                        ]);
                    }

                    $subtotal += $itemPrice * $cart->quantity;
                    // pakai instance product yang sudah dikunci, bukan relasi lazy
                    $cart->setRelation('product', $product);
                }

                $deliveryFee = $this->calculateShippingCost($store, $addressLat, $addressLon, $validated['delivery_method']);
                $adminFee = ($validated['payment_method'] === 'cod' || $adminFeeApplied) ? 0 : self::ADMIN_FEE;
                $adminFeeApplied = true;
                $totalAmount = $subtotal + $deliveryFee + $adminFee;

                $order = Order::create([
                    'store_id' => $storeId,
                    'user_id' => auth()->id(),
                    'invoice_number' => 'ORD-'.date('YmdHis').'-'.strtoupper(Str::random(6)),
                    'customer_name' => $validated['name'],
                    'customer_phone' => $validated['phone'],
                    'shipping_address' => $validated['address'],
                    'shipping_latitude' => $addressLat,
                    'shipping_longitude' => $addressLon,
                    'delivery_method' => $validated['delivery_method'],
                    'subtotal' => $subtotal,
                    'shipping_cost' => $deliveryFee,
                    'total_amount' => $totalAmount,
                    'payment_method' => $validated['payment_method'],
                    'payment_channel' => $validated['payment_channel'],
                    'payment_status' => 'pending',
                    'shipping_status' => 'pending',
                ]);

                // shipping_pin ga masuk fillable, jadi set lewat forceFill biar ga bisa diisi mass-assign dari luar
                $order->forceFill([
                    'shipping_pin' => str_pad((string) random_int(0, 9999), 4, '0', STR_PAD_LEFT),
                ])->save();

                foreach ($storeCarts as $cart) {
                    $matchingSku = $cart->product->skus->where('variant_name', $cart->preparation_option)->first();
                    $itemPrice = $matchingSku ? (float) $matchingSku->price : (float) $cart->product->price;

                    $negotiation = $cart->relationLoaded('negotiation') ? $cart->negotiation : null;
                    if ($negotiation) {
                        $itemPrice = $negotiation->agreed_price;
                    }

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
                    }
                    $cart->product->decrement('stock', $cart->quantity);

                    if ($negotiation) {
                        $negotiation->update([
                            'status' => 'purchased',
                            'purchased_at' => now(),
                            'order_id' => $order->id,
                        ]);
                    }

                    $cart->delete();
                }

                $createdOrders[] = $order;
            }

            return $createdOrders;
        });

        // If non-COD, Charge via Midtrans Core API
        if ($validated['payment_method'] !== 'cod' && count($orders) > 0) {
            try {
                $chargeResult = $midtransService->chargeCoreApi(
                    $orders,
                    $validated['payment_channel'],
                    $validated['name'],
                    $validated['phone'],
                    $request->user()?->email
                );

                $parentTrxId = $chargeResult['order_id'] ?? null;

                foreach ($orders as $order) {
                    // payment_payload ga masuk fillable, set terpisah via forceFill biar aman
                    $order->update([
                        'parent_transaction_id' => $parentTrxId,
                        'payment_type' => $chargeResult['payment_type'],
                        'payment_channel' => $chargeResult['payment_channel'],
                        'va_number' => $chargeResult['va_number'],
                        'bill_key' => $chargeResult['bill_key'],
                        'biller_code' => $chargeResult['biller_code'],
                        'qr_code_url' => $chargeResult['qr_code_url'],
                        'payment_expiry_time' => $chargeResult['expiry_time'],
                    ]);
                    $order->forceFill([
                        'payment_payload' => $chargeResult['raw_payload'],
                    ])->save();
                }
            } catch (\Exception $e) {
                Log::error('Midtrans Core API Charge Error: '.$e->getMessage());

                DB::transaction(function () use ($orders) {
                    foreach ($orders as $order) {
                        $lockedOrder = Order::where('id', $order->id)->lockForUpdate()->first();
                        if ($lockedOrder && $lockedOrder->shipping_status !== 'cancelled') {
                            $lockedOrder->update([
                                'payment_status' => 'failed',
                                'shipping_status' => 'cancelled',
                            ]);
                            $lockedOrder->restoreStock();
                        }
                    }
                });

                return redirect()->route('cart')->with('error', 'Gagal memproses pembayaran dengan gerbang pembayaran. Stok telah dikembalikan, silakan coba lagi.');
            }
        }

        // Trigger automatic order creation notification for buyer & seller
        foreach ($orders as $order) {
            OrderNotificationService::orderCreated($order);
            try {
                broadcast(new \App\Events\OrderStatusUpdated($order));
            } catch (\Throwable $e) {
                Log::warning('Order created broadcast error: ' . $e->getMessage());
            }
        }

        $firstOrderId = count($orders) > 0 ? $orders[0]->id : null;
        $allOrderIds = collect($orders)->pluck('id')->implode(',');

        if ($validated['payment_method'] !== 'cod' && $firstOrderId) {
            return redirect()->route('payment.show', [
                'order' => $firstOrderId,
            ]);
        }

        return redirect()->route('checkout.success', [
            'order_ids' => $allOrderIds,
            'order_id' => $firstOrderId,
        ]);
    }

    public function success(Request $request, MidtransService $midtransService)
    {
        $orderIdsParam = is_string($request->query('order_ids')) ? $request->query('order_ids') : '';
        $orderId = is_scalar($request->query('order_id')) ? $request->query('order_id') : null;
        $ordersList = collect([]);

        if ($orderIdsParam !== '') {
            $ids = array_filter(explode(',', $orderIdsParam), fn ($id) => ctype_digit((string) $id));
            if (! empty($ids)) {
                $ordersList = Order::with(['items.product', 'store'])
                    ->where('user_id', auth()->id())
                    ->whereIn('id', $ids)
                    ->get();
            }
        } elseif ($orderId && ctype_digit((string) $orderId)) {
            $primaryOrder = Order::with(['items.product', 'store'])
                ->where('user_id', auth()->id())
                ->find($orderId);

            if ($primaryOrder) {
                if ($primaryOrder->parent_transaction_id) {
                    $ordersList = Order::with(['items.product', 'store'])
                        ->where('user_id', auth()->id())
                        ->where('parent_transaction_id', $primaryOrder->parent_transaction_id)
                        ->get();
                } else {
                    $ordersList = collect([$primaryOrder]);
                }
            }
        }

        if ($ordersList->isEmpty()) {
            return redirect()->route('history.index');
        }

        $unpaidOrder = $ordersList->first(function ($ord) {
            return $ord->payment_status === 'pending' && $ord->payment_method !== 'cod' && $ord->shipping_status !== 'cancelled';
        });

        if ($unpaidOrder) {
            return redirect()->route('payment.show', ['order' => $unpaidOrder->id]);
        }

        $formattedOrders = $ordersList->map(function (Order $ord) {
            return [
                'id' => $ord->id,
                'invoice_number' => $ord->invoice_number,
                'customer_name' => $ord->customer_name,
                'customer_phone' => $ord->customer_phone,
                'shipping_address' => $ord->shipping_address,
                'delivery_method' => $ord->delivery_method,
                'shipping_status' => $ord->shipping_status,
                'payment_method' => $ord->payment_method,
                'payment_channel' => $ord->payment_channel,
                'payment_status' => $ord->payment_status,
                'subtotal' => (float) $ord->subtotal,
                'shipping_cost' => (float) $ord->shipping_cost,
                'total_amount' => (float) $ord->total_amount,
                'created_at' => $ord->created_at?->toISOString(),
                'store' => $ord->store ? [
                    'id' => $ord->store->id,
                    'name' => $ord->store->name,
                    'address' => $ord->store->address,
                ] : null,
                'items' => $ord->items->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'product_name' => $item->product_name,
                        'quantity' => $item->quantity,
                        'price' => (float) $item->price,
                        'unit' => $item->unit,
                        'variant_name' => $item->variant_name,
                        'product' => $item->product ? [
                            'image_path' => $item->product->image_path,
                        ] : null,
                    ];
                })->values(),
            ];
        })->values();

        return Inertia::render('Checkout/Success', [
            'orders' => $formattedOrders,
            'order' => $formattedOrders->first(),
        ]);
    }

    public function calculateFee(Request $request)
    {
        $addressLat = null;
        $addressLon = null;

        if ($request->has('address_id') && is_scalar($request->query('address_id'))) {
            $address = $request->user()->addresses()->find($request->query('address_id'));
            if ($address) {
                $addressLat = $address->latitude;
                $addressLon = $address->longitude;
            }
        }

        $cartIds = array_filter((array) $request->query('cart_ids', []), fn ($id) => is_scalar($id) && ctype_digit((string) $id));
        $method = is_string($request->query('delivery_method')) ? $request->query('delivery_method') : 'local_delivery';

        if (empty($cartIds)) {
            return response()->json([
                'delivery_fee' => 0,
                'stores_breakdown' => [],
            ]);
        }

        $carts = Cart::with(['product.store'])
            ->where('user_id', auth()->id())
            ->whereIn('id', $cartIds)
            ->get();

        $cartsByStore = $carts->groupBy(function ($cart) {
            return $cart->product->store_id;
        });

        $totalDeliveryFee = 0;
        $storesBreakdown = [];

        foreach ($cartsByStore as $storeId => $storeCarts) {
            $store = $storeCarts->first()->product->store;
            $fee = $this->calculateShippingCost($store, $addressLat, $addressLon, $method);
            $totalDeliveryFee += $fee;

            $distanceKm = null;
            if ($store && $store->latitude && $store->longitude && $addressLat && $addressLon) {
                $distanceKm = round($this->haversineDistance(
                    (float) $store->latitude,
                    (float) $store->longitude,
                    (float) $addressLat,
                    (float) $addressLon
                ), 1);
            }

            $storesBreakdown[] = [
                'store_id' => $storeId,
                'store_name' => $store ? $store->name : 'Toko Mitra',
                'store_address' => $store ? $store->address : '',
                'distance_km' => $distanceKm,
                'delivery_fee' => $fee,
                'items_count' => $storeCarts->sum('quantity'),
            ];
        }

        return response()->json([
            'delivery_fee' => $totalDeliveryFee,
            'stores_breakdown' => $storesBreakdown,
        ]);
    }
}

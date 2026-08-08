<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;
use App\Services\MidtransService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
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

    public function store(Request $request, MidtransService $midtransService)
    {
        $validated = $request->validate([
            'cart_ids' => ['required', 'array', 'min:1'],
            'cart_ids.*' => ['integer', 'distinct'],
            'address_id' => ['nullable', 'integer'],
            'name' => 'required_without:address_id|string|max:255',
            'phone' => 'required_without:address_id|string|max:20',
            'address' => 'required_without:address_id|string',
            'delivery_method' => ['required', 'string', 'in:coastal,standard'],
            'payment_method' => ['required', 'string', 'in:va,qris,gopay,cod'],
            'payment_channel' => ['required', 'string', 'in:bca_va,bni_va,bri_va,permata_va,mandiri_bill,qris,gopay,cod'],
        ]);

        if (!empty($validated['address_id'])) {
            $address = $request->user()->addresses()->findOrFail($validated['address_id']);
            $validated['name'] = $address->recipient_name;
            $validated['phone'] = $address->phone;
            $validated['address'] = $address->full_address;
        }

        $orders = DB::transaction(function () use ($validated) {
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
                    'payment_channel' => $validated['payment_channel'],
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
                    }
                    $cart->product->decrement('stock', $cart->quantity);

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
                    $order->update([
                        'parent_transaction_id' => $parentTrxId,
                        'payment_type' => $chargeResult['payment_type'],
                        'payment_channel' => $chargeResult['payment_channel'],
                        'va_number' => $chargeResult['va_number'],
                        'bill_key' => $chargeResult['bill_key'],
                        'biller_code' => $chargeResult['biller_code'],
                        'qr_code_url' => $chargeResult['qr_code_url'],
                        'payment_expiry_time' => $chargeResult['expiry_time'],
                        'payment_payload' => $chargeResult['raw_payload'],
                    ]);
                }
            } catch (\Exception $e) {
                Log::error('Midtrans Core API Charge Error: ' . $e->getMessage());
            }
        }

        $firstOrderId = count($orders) > 0 ? $orders[0]->id : null;

        if ($validated['payment_method'] !== 'cod' && $firstOrderId) {
            return redirect()->route('payment.show', [
                'order' => $firstOrderId,
            ]);
        }

        return redirect()->route('checkout.success', [
            'order_id' => $firstOrderId,
        ]);
    }

    public function success(Request $request, MidtransService $midtransService)
    {
        $orderId = $request->query('order_id');
        $order = null;

        if ($orderId) {
            $order = Order::with(['items.product', 'store'])->find($orderId);

            if ($order && $order->payment_status === 'pending' && $order->payment_method !== 'cod') {
                return redirect()->route('payment.show', ['order' => $order->id]);
            }
        }

        return Inertia::render('Checkout/Success', [
            'order' => $order,
        ]);
    }

    /**
     * Real-time payment status check endpoint with multi-order synchronization
     */
    public function checkStatus(Request $request, $id, MidtransService $midtransService)
    {
        $order = Order::where('id', $id)
            ->where('user_id', auth()->id())
            ->firstOrFail();

        if ($order->payment_status === 'pending' && $order->payment_method !== 'cod') {
            $midtransOrderId = $order->parent_transaction_id ?? $order->payment_payload['order_id'] ?? $order->invoice_number;

            if ($midtransOrderId) {
                try {
                    $statusResp = $midtransService->getTransactionStatus($midtransOrderId);

                    if ($statusResp) {
                        $trxStatus = is_object($statusResp) ? ($statusResp->transaction_status ?? null) : ($statusResp['transaction_status'] ?? null);
                        $fraudStatus = is_object($statusResp) ? ($statusResp->fraud_status ?? null) : ($statusResp['fraud_status'] ?? null);

                        $siblingOrders = Order::where('parent_transaction_id', $midtransOrderId)
                            ->orWhere('id', $order->id)
                            ->get();

                        DB::transaction(function () use ($siblingOrders, $trxStatus, $fraudStatus) {
                            foreach ($siblingOrders as $sib) {
                                $lockedSib = Order::where('id', $sib->id)->lockForUpdate()->first();
                                if (!$lockedSib) continue;

                                if ($trxStatus === 'settlement' || ($trxStatus === 'capture' && $fraudStatus === 'accept')) {
                                    $lockedSib->update(['payment_status' => 'paid']);
                                } elseif (in_array($trxStatus, ['cancel', 'deny', 'expire'])) {
                                    $lockedSib->update(['payment_status' => 'failed']);
                                    $lockedSib->restoreStock();
                                }
                            }
                        });

                        $order->refresh();
                    }
                } catch (\Exception $e) {
                    // Ignore API connection exceptions
                }
            }
        }

        return response()->json([
            'order_id' => $order->id,
            'payment_status' => $order->payment_status,
            'is_paid' => $order->payment_status === 'paid',
        ]);
    }
}

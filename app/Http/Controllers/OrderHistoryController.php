<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Services\MidtransService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class OrderHistoryController extends Controller
{
    public function index(Request $request)
    {
        $status = $request->query('status', 'all');

        $ratingItems = [];
        $orders = [];

        if ($status === 'rating') {
            // Ambil semua item pesanan dari pesanan yang sudah 'delivered'
            $items = OrderItem::with(['product', 'order.store', 'review'])
                ->whereHas('order', function ($query) {
                    $query->where('user_id', auth()->id())
                        ->where('shipping_status', 'delivered');
                })
                ->latest()
                ->get();

            $ratingItems = $items->map(function ($item) {
                return [
                    'id' => $item->id,
                    'product_id' => $item->product_id,
                    'product_slug' => $item->product ? $item->product->slug : null,
                    'product_name' => $item->product_name,
                    'variant_name' => $item->variant_name,
                    'quantity' => $item->quantity,
                    'price' => $item->price,
                    'image' => $item->product ? ($item->product->image_path ?? 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&q=80&w=200') : 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&q=80&w=200',
                    'store_name' => $item->order->store->name ?? 'Toko',
                    'rating' => $item->review ? $item->review->rating : null,
                ];
            });
        } else {
            $query = Order::with(['items.product', 'store'])
                ->where('user_id', auth()->id())
                ->latest();

            if ($status !== 'all') {
                if ($status === 'unpaid') {
                    $query->where('payment_status', 'pending');
                } elseif ($status === 'cancelled') {
                    $query->where('shipping_status', 'cancelled');
                } else {
                    $query->where('shipping_status', $status);
                }
            }

            $orders = $query->get()->map(function ($order) {
                // Auto sync payment status from Midtrans if pending and non-COD
                if ($order->payment_status === 'pending' && $order->payment_method !== 'cod') {
                    $midtransOrderId = $order->parent_transaction_id ?? $order->payment_payload['order_id'] ?? $order->invoice_number;
                    if ($midtransOrderId) {
                        try {
                            $midtransService = app(MidtransService::class);
                            $statusResp = $midtransService->getTransactionStatus($midtransOrderId);

                            if ($statusResp) {
                                $trxStatus = is_object($statusResp) ? ($statusResp->transaction_status ?? null) : ($statusResp['transaction_status'] ?? null);
                                $fraudStatus = is_object($statusResp) ? ($statusResp->fraud_status ?? null) : ($statusResp['fraud_status'] ?? null);

                                if ($trxStatus === 'settlement' || ($trxStatus === 'capture' && $fraudStatus === 'accept')) {
                                    $order->update(['payment_status' => 'paid']);
                                    $order->payment_status = 'paid';
                                } elseif (in_array($trxStatus, ['cancel', 'deny', 'expire'])) {
                                    $order->update(['payment_status' => 'failed']);
                                    $order->payment_status = 'failed';
                                    $order->restoreStock();
                                }
                            }
                        } catch (\Exception $e) {
                            // ignore network failure
                        }
                    }
                }

                return [
                    'id' => $order->id,
                    'invoice_number' => $order->invoice_number,
                    'store_name' => $order->store->name ?? 'Toko',
                    'status' => $this->mapStatusToLabel($order),
                    'total_amount' => $order->total_amount,
                    'items' => $order->items->map(function ($item) {
                        return [
                            'id' => $item->id,
                            'product_id' => $item->product_id,
                            'product_name' => $item->product_name,
                            'variant_name' => $item->variant_name,
                            'quantity' => $item->quantity,
                            'price' => $item->price,
                            'product_slug' => $item->product ? $item->product->slug : null,
                            'image' => $item->product ? ($item->product->image_path ?? 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&q=80&w=200') : 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&q=80&w=200',
                        ];
                    }),
                ];
            });
        }

        return Inertia::render('History/Index', [
            'orders' => $orders,
            'ratingItems' => $ratingItems,
            'currentStatus' => $status,
        ]);
    }

    private function mapStatusToLabel($order)
    {
        if ($order->shipping_status === 'cancelled') {
            return 'Dibatalkan';
        }

        switch ($order->shipping_status) {
            case 'pending':
                if ($order->payment_method === 'cod' || $order->payment_status === 'paid') {
                    return 'Menunggu Konfirmasi';
                }

                return 'Belum Bayar';
            case 'processing':
                return 'Dikemas';
            case 'shipped':
                return 'Dikirim';
            case 'delivered':
                return 'Selesai';
            default:
                return 'Belum Bayar';
        }
    }

    public function show($id)
    {
        $order = Order::with(['items.product', 'store'])->where('user_id', auth()->id())->findOrFail($id);

        $orderData = [
            'id' => $order->id,
            'invoice_number' => $order->invoice_number,
            'store_name' => $order->store->name ?? 'Toko',
            'store_phone' => $order->store->user->phone ?? '',
            'status' => $this->mapStatusToLabel($order),
            'shipping_status' => $order->shipping_status,
            'payment_status' => $order->payment_status,
            'created_at' => $order->created_at->format('d M Y, H:i'),
            'updated_at' => $order->updated_at->toISOString(),
            'total_amount' => $order->total_amount,
            'subtotal' => $order->subtotal,
            'shipping_cost' => $order->shipping_cost,
            'customer_name' => $order->customer_name,
            'customer_phone' => $order->customer_phone,
            'shipping_address' => $order->shipping_address,
            'delivery_method' => $order->delivery_method,
            'payment_method' => $order->payment_method,
            'shipping_pin' => $order->shipping_pin,
            'items' => $order->items->map(function ($item) {
                return [
                    'id' => $item->id,
                    'product_id' => $item->product_id,
                    'product_name' => $item->product_name,
                    'variant_name' => $item->variant_name,
                    'quantity' => $item->quantity,
                    'price' => $item->price,
                    'product_slug' => $item->product ? $item->product->slug : null,
                    'image' => $item->product ? ($item->product->image_path ?? 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&q=80&w=200') : 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&q=80&w=200',
                ];
            }),
        ];

        return Inertia::render('History/Show', [
            'order' => $orderData,
        ]);
    }

    /**
     * Cancel an unpaid pending order (Protected state machine)
     */
    public function cancel($id)
    {
        return DB::transaction(function () use ($id) {
            $order = Order::where('user_id', auth()->id())->lockForUpdate()->findOrFail($id);

            // Buyers can only self-cancel if the order is still pending and unpaid
            if ($order->shipping_status !== 'pending' || $order->payment_status === 'paid') {
                return back()->with('error', 'Pesanan yang sedang dikemas, dikirim, atau telah dibayar tidak dapat dibatalkan langsung. Silakan hubungi penjual.');
            }

            $order->update([
                'shipping_status' => 'cancelled',
                'payment_status' => 'failed',
            ]);

            // Thread-safe stock restoration
            $order->restoreStock();

            return back()->with('success', 'Pesanan berhasil dibatalkan.');
        });
    }

    /**
     * Complete order and safely credit store balance
     */
    public function complete($id)
    {
        return DB::transaction(function () use ($id) {
            $order = Order::where('user_id', auth()->id())->lockForUpdate()->findOrFail($id);

            if ($order->shipping_status !== 'shipped') {
                return back()->with('error', 'Pesanan belum dapat diselesaikan.');
            }

            $order->update([
                'shipping_status' => 'delivered',
                'payment_status' => 'paid',
            ]);

            // Idempotent and thread-safe balance credit to store
            $order->creditStoreBalance();

            return back()->with('success', 'Pesanan berhasil diselesaikan.');
        });
    }
}

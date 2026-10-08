<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Services\PaymentSyncService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class OrderHistoryController extends Controller
{
    public function index(Request $request)
    {
        $rawStatus = $request->query('status', 'all');
        $allowedStatuses = ['all', 'unpaid', 'pending', 'processing', 'shipped', 'delivered', 'cancelled', 'rating'];
        $status = is_string($rawStatus) && in_array($rawStatus, $allowedStatuses, true) ? $rawStatus : 'all';

        $ratingItems = [];
        $orders = [];

        if ($status === 'rating') {
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
                    'image' => $item->product ? ($item->product->image_path ?? 'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&q=80&w=400') : 'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&q=80&w=400',
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
                    $query->where('payment_status', 'pending')
                        ->where('payment_method', '!=', 'cod')
                        ->where('shipping_status', '!=', 'cancelled');
                } elseif ($status === 'pending') {
                    $query->where('shipping_status', 'pending')
                        ->where(function ($q) {
                            $q->where('payment_method', 'cod')
                                ->orWhere('payment_status', 'paid');
                        });
                } elseif ($status === 'cancelled') {
                    $query->where(function ($q) {
                        $q->where('shipping_status', 'cancelled')
                            ->orWhere('payment_status', 'failed');
                    });
                } else {
                    $query->where('shipping_status', $status);
                }
            }

            $syncedMidtransIds = [];

            $orders = $query->get()->map(function ($order) use (&$syncedMidtransIds) {
                if (
                    $order->payment_status === 'pending' &&
                    $order->payment_method !== 'cod' &&
                    $order->shipping_status !== 'cancelled' &&
                    count($syncedMidtransIds) < 5
                ) {
                    $midtransOrderId = $order->parent_transaction_id ?? $order->payment_payload['order_id'] ?? $order->invoice_number;
                    if ($midtransOrderId) {
                        if (! in_array($midtransOrderId, $syncedMidtransIds, true)) {
                            $syncedMidtransIds[] = $midtransOrderId;
                            app(PaymentSyncService::class)->syncByMidtransOrderId($midtransOrderId);
                        }
                        $order->refresh();
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
                            'image' => $item->product ? ($item->product->image_path ?? 'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&q=80&w=400') : 'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&q=80&w=400',
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
        if ($order->shipping_status === 'cancelled' || $order->payment_status === 'failed') {
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
        $order = Order::with(['items.product', 'store.user'])->where('user_id', auth()->id())->findOrFail($id);

        if ($order->payment_status === 'pending' && $order->payment_method !== 'cod' && $order->shipping_status !== 'cancelled') {
            $midtransOrderId = $order->parent_transaction_id ?? $order->payment_payload['order_id'] ?? $order->invoice_number;
            if ($midtransOrderId) {
                app(PaymentSyncService::class)->syncByMidtransOrderId($midtransOrderId);
                $order->refresh();
            }
        }

        if ($order->shipping_status === 'shipped' && $order->delivery_method === 'local_delivery' && $order->updated_at && $order->updated_at->diffInHours(now()) >= 4) {
            $order->autoCompleteDelivery();
            $order->refresh();
        }

        $orderData = [
            'id' => $order->id,
            'invoice_number' => $order->invoice_number,
            'store_name' => $order->store->name ?? 'Toko',
            'store_phone' => $order->store?->user?->phone ?? '',
            'status' => $this->mapStatusToLabel($order),
            'shipping_status' => $order->shipping_status,
            'payment_status' => $order->payment_status,
            'is_arrived' => $order->isArrived(),
            'can_buyer_complete' => $order->canBuyerComplete(),
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
            'shipping_pin' => $order->shipping_status === 'shipped' ? $order->shipping_pin : null,

            'items' => $order->items->map(function ($item) {
                return [
                    'id' => $item->id,
                    'product_id' => $item->product_id,
                    'product_name' => $item->product_name,
                    'variant_name' => $item->variant_name,
                    'quantity' => $item->quantity,
                    'price' => $item->price,
                    'product_slug' => $item->product ? $item->product->slug : null,
                    'image' => $item->product ? ($item->product->image_path ?? 'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&q=80&w=400') : 'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&q=80&w=400',
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
        $midtransOrderIdToCancel = null;

        $response = DB::transaction(function () use ($id, &$midtransOrderIdToCancel) {
            $order = Order::where('user_id', auth()->id())->lockForUpdate()->findOrFail($id);

            // Buyers can only self-cancel if the order is still pending and unpaid
            if ($order->shipping_status !== 'pending' || $order->payment_status === 'paid') {
                return back()->with('error', 'Pesanan yang sedang dikemas, dikirim, atau telah dibayar tidak dapat dibatalkan langsung. Silakan hubungi penjual.');
            }

            $ordersToCancel = collect([$order]);
            if (! empty($order->parent_transaction_id)) {
                $ordersToCancel = Order::where('user_id', auth()->id())
                    ->where('parent_transaction_id', $order->parent_transaction_id)
                    ->where('shipping_status', 'pending')
                    ->where('payment_status', '!=', 'paid')
                    ->lockForUpdate()
                    ->get();
            }

            foreach ($ordersToCancel as $targetOrder) {
                $targetOrder->update([
                    'shipping_status' => 'cancelled',
                    'payment_status' => 'failed',
                ]);

                $targetOrder->restoreStock();

                \App\Services\OrderNotificationService::orderCancelled($targetOrder, 'Dibatalkan oleh pembeli');

                try {
                    broadcast(new \App\Events\OrderStatusUpdated($targetOrder))->toOthers();
                } catch (\Throwable $e) {}
            }

            if ($order->payment_method !== 'cod') {
                $midtransOrderIdToCancel = $order->parent_transaction_id ?? $order->payment_payload['order_id'] ?? $order->invoice_number;
            }

            return back()->with('success', 'Pesanan berhasil dibatalkan.');
        });

        if ($midtransOrderIdToCancel) {
            app(\App\Services\MidtransService::class)->cancelTransaction($midtransOrderIdToCancel);
        }

        return $response;
    }

    /**
     * Complete order and safely credit store balance.
     * Buyer can complete non-COD paid orders once courier arrives at destination or after 4 hours have passed.
     */
    public function complete($id)
    {
        return DB::transaction(function () use ($id) {
            $order = Order::where('user_id', auth()->id())->lockForUpdate()->findOrFail($id);

            if ($order->shipping_status !== 'shipped') {
                return back()->with('error', 'Pesanan belum dapat diselesaikan.');
            }

            if (! $order->canBuyerComplete()) {
                if ($order->payment_method === 'cod') {
                    return back()->with('error', 'Pesanan COD hanya dapat diselesaikan melalui verifikasi PIN dengan kurir atau konfirmasi pembayaran dari penjual.');
                }

                return back()->with('error', 'Pesanan belum dapat diselesaikan. Harap tunggu kurir tiba di lokasi pengiriman Anda atau sistem akan menyelesaikan otomatis dalam 4 jam.');
            }

            $order->update(['shipping_status' => 'delivered']);
            $order->creditStoreBalance();

            \App\Services\OrderNotificationService::orderDelivered($order);

            try {
                broadcast(new \App\Events\OrderStatusUpdated($order))->toOthers();
            } catch (\Throwable $e) {}

            return back()->with('success', 'Pesanan berhasil dikonfirmasi selesai.');
        });
    }
}


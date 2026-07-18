<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
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
            $items = \App\Models\OrderItem::with(['product', 'order.store', 'review'])
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
                } else if ($status === 'cancelled') {
                    $query->where('shipping_status', 'cancelled');
                } else {
                    $query->where('shipping_status', $status);
                }
            }

            $orders = $query->get()->map(function ($order) {
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
                    })
                ];
            });
        }

        return Inertia::render('History/Index', [
            'orders' => $orders,
            'ratingItems' => $ratingItems,
            'currentStatus' => $status
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
            'status' => $this->mapStatusToLabel($order),
            'shipping_status' => $order->shipping_status,
            'payment_status' => $order->payment_status,
            'created_at' => $order->created_at->format('d M Y, H:i'),
            'total_amount' => $order->total_amount,
            'subtotal' => $order->subtotal,
            'shipping_cost' => $order->shipping_cost,
            'customer_name' => $order->customer_name,
            'customer_phone' => $order->customer_phone,
            'shipping_address' => $order->shipping_address,
            'delivery_method' => $order->delivery_method,
            'payment_method' => $order->payment_method,
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
            })
        ];

        return Inertia::render('History/Show', [
            'order' => $orderData
        ]);
    }

    public function cancel($id)
    {
        $order = Order::where('user_id', auth()->id())->findOrFail($id);

        if ($order->shipping_status !== 'pending' && $order->shipping_status !== 'processing') {
            return back()->with('error', 'Pesanan tidak dapat dibatalkan.');
        }

        $paymentStatus = $order->payment_method === 'cod' ? 'failed' : 'refunded';

        $order->restoreStock();

        $order->update([
            'shipping_status' => 'cancelled',
            'payment_status' => $paymentStatus
        ]);

        return back()->with('success', 'Pesanan berhasil dibatalkan.');
    }

    public function complete($id)
    {
        $order = Order::where('user_id', auth()->id())->findOrFail($id);

        if ($order->shipping_status !== 'shipped') {
            return back()->with('error', 'Pesanan belum dapat diselesaikan.');
        }

        $order->update([
            'shipping_status' => 'delivered',
            'payment_status' => 'paid'
        ]);

        return back()->with('success', 'Pesanan berhasil diselesaikan.');
    }
}

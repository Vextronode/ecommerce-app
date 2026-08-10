<?php

namespace App\Http\Controllers\Merchant;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\URL;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $store = $request->user()->store;

        if (! $store) {
            return redirect()->route('merchant.store.setup');
        }

        $search = $request->query('search');
        $status = $request->query('status', 'all');

        $orders = Order::with(['user', 'items'])
            ->where('store_id', $store->id)
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('invoice_number', 'like', "%{$search}%")
                        ->orWhere('customer_name', 'like', "%{$search}%");
                });
            })
            ->when($status !== 'all', function ($query) use ($status) {
                $query->where('shipping_status', $status);
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        $orders->getCollection()->transform(function ($order) {
            if ($order->delivery_method === 'local_delivery' && in_array($order->shipping_status, ['processing', 'pending'])) {
                $order->handover_url = URL::signedRoute(
                    'tracker.handover',
                    ['invoice_number' => $order->invoice_number],
                    now()->addHours(24) // Valid for 24 hours
                );
            }

            return $order;
        });

        $totalOrders = Order::where('store_id', $store->id)->where('shipping_status', 'delivered')->count();
        $pendingShipping = Order::where('store_id', $store->id)->where('shipping_status', 'pending')->count();
        $pendingPayment = Order::where('store_id', $store->id)->where('payment_status', 'pending')->count();

        return Inertia::render('Merchant/Order/Index', [
            'orders' => $orders,
            'stats' => [
                'totalOrders' => $totalOrders,
                'pendingShipping' => $pendingShipping,
                'pendingPayment' => $pendingPayment,
            ],
            'filters' => [
                'search' => $search ?? '',
                'status' => $status,
            ],
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'shipping_status' => 'required|in:pending,processing,shipped,delivered,cancelled',
        ]);

        $store = $request->user()->store;

        return DB::transaction(function () use ($request, $id, $store) {
            $order = Order::where('id', $id)->lockForUpdate()->firstOrFail();

            if ($order->store_id !== $store->id) {
                abort(403, 'Anda tidak punya akses ke pesanan ini.');
            }

            if (in_array($order->shipping_status, ['cancelled', 'delivered'])) {
                return redirect()->route('merchant.orders.index')->with('error', 'Status pesanan ini sudah tidak bisa diubah lagi.');
            }

            $newStatus = $request->shipping_status;

            // Security Guard (Vuln 8)
            if ($order->payment_method !== 'cod' && $order->payment_status !== 'paid' && in_array($newStatus, ['processing', 'shipped', 'delivered'])) {
                return redirect()->route('merchant.orders.index')->with('error', 'Pesanan non-COD belum dibayar oleh pembeli.');
            }

            $updateData = ['shipping_status' => $newStatus];

            if ($newStatus === 'shipped') {
                if (empty($order->shipping_pin)) {
                    $updateData['shipping_pin'] = str_pad(rand(0, 9999), 4, '0', STR_PAD_LEFT);
                }
            }

            if ($newStatus === 'delivered') {
                if ($order->payment_method === 'cod') {
                    $updateData['payment_status'] = 'paid';
                }
                $order->update($updateData);

                // Only credit store balance if payment is actually paid
                if ($order->payment_status === 'paid' || ($updateData['payment_status'] ?? '') === 'paid') {
                    $order->creditStoreBalance();
                }
            } elseif ($newStatus === 'cancelled') {
                $updateData['payment_status'] = $order->payment_status === 'paid' ? 'refunded' : 'failed';
                $order->update($updateData);
                // Idempotent stock restoration
                $order->restoreStock();
            } else {
                $order->update($updateData);
            }

            return redirect()->route('merchant.orders.index')->with('success', 'Status pesanan berhasil diperbarui!');
        });
    }
}

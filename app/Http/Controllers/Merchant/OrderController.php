<?php

namespace App\Http\Controllers\Merchant;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $store = $request->user()->store;

        if (!$store) {
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

        $totalOrders = Order::where('store_id', $store->id)->count();
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

        $order = Order::findOrFail($id);

        $store = $request->user()->store;
        if ($order->store_id !== $store->id) {
            abort(403, 'Anda tidak punya akses ke pesanan ini.');
        }

        $order->update([
            'shipping_status' => $request->shipping_status,
        ]);

        return back()->with('success', 'Status pesanan berhasil diperbarui!');
    }
}

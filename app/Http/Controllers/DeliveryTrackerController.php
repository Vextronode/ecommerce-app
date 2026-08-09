<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class DeliveryTrackerController extends Controller
{
    public function show($invoice_number)
    {
        $order = Order::with(['store', 'items.product'])
            ->where('invoice_number', $invoice_number)
            ->firstOrFail();

        // Only allow tracking for local delivery
        if ($order->delivery_method !== 'local_delivery') {
            abort(404, 'Tracking hanya tersedia untuk Kurir Toko.');
        }

        // Determine role securely on server
        $role = 'driver';
        $isBuyer = auth()->check() && auth()->id() === $order->user_id;
        $isMerchant = auth()->check() && auth()->user()->store && auth()->user()->store->id === $order->store_id;

        if ($isBuyer) {
            $role = 'user'; // Force buyer role if logged in as the buyer
        }

        // Allow merchant to act as driver for self-delivery
        if ($isMerchant && request()->query('role') === 'driver') {
            $role = 'driver';
        }

        return Inertia::render('Delivery/Tracker', [
            'role' => $role,
            'order' => [
                'id' => $order->id,
                'invoice_number' => $order->invoice_number,
                'status' => $order->shipping_status,
                'customer_name' => $order->customer_name,
                'customer_phone' => $order->customer_phone,
                'shipping_address' => $order->shipping_address,
                'shipping_latitude' => $order->shipping_latitude,
                'shipping_longitude' => $order->shipping_longitude,
                'store_name' => $order->store->name,
                'store_phone' => $order->store->support_email, // Assuming no phone field, maybe use email or user's phone
                'store_latitude' => $order->store->latitude,
                'store_longitude' => $order->store->longitude,
                'subtotal' => $order->subtotal,
                'shipping_cost' => $order->shipping_cost,
                'total_amount' => $order->total_amount,
                'payment_method' => $order->payment_method,
                'payment_status' => $order->payment_status,
                'items' => $order->items->map(function($item) {
                    return [
                        'name' => $item->product_name,
                        'qty' => $item->quantity,
                        'price' => $item->price
                    ];
                })
            ]
        ]);
    }

    public function complete(Request $request, $invoice_number)
    {
        $request->validate([
            'pin' => 'required|string|size:4'
        ]);

        return DB::transaction(function () use ($request, $invoice_number) {
            $order = Order::where('invoice_number', $invoice_number)->lockForUpdate()->firstOrFail();

            if ($order->shipping_status !== 'shipped') {
                return back()->with('error', 'Status pesanan tidak valid untuk diselesaikan.');
            }

            if ($order->shipping_pin !== $request->pin) {
                return back()->with('error', 'PIN tidak valid. Silakan tanya pembeli untuk 4-digit PIN.');
            }

            $updateData = [
                'shipping_status' => 'delivered'
            ];

            if ($order->payment_method === 'cod') {
                $updateData['payment_status'] = 'paid';
            }

            $order->update($updateData);

            if ($order->payment_status === 'paid' || ($updateData['payment_status'] ?? '') === 'paid') {
                $order->creditStoreBalance();
            }

            return back()->with('success', 'Pengiriman berhasil diselesaikan!');
        });
    }

    public function updateLocation(Request $request, $invoice_number)
    {
        $request->validate([
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
        ]);

        \Illuminate\Support\Facades\Cache::put("driver_loc_{$invoice_number}", [
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
        ], 3600); // 1 hour

        return response()->json(['success' => true]);
    }

    public function getLocation($invoice_number)
    {
        $loc = \Illuminate\Support\Facades\Cache::get("driver_loc_{$invoice_number}");
        return response()->json($loc ?: null);
    }

    public function handover(Request $request, $invoice_number)
    {
        if (!$request->hasValidSignature()) {
            abort(401, 'Link QR Code kadaluarsa atau tidak valid.');
        }

        $order = Order::where('invoice_number', $invoice_number)->firstOrFail();

        // Update status to shipped
        if (in_array($order->shipping_status, ['pending', 'processing'])) {
            $updateData = ['shipping_status' => 'shipped'];
            if (empty($order->shipping_pin)) {
                $updateData['shipping_pin'] = str_pad(rand(0, 9999), 4, '0', STR_PAD_LEFT);
            }
            $order->update($updateData);
        }

        return redirect()->route('tracker.show', ['invoice_number' => $invoice_number]);
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DeliveryTrackerController extends Controller
{
    /**
     * Display live tracking page.
     */
    public function show($invoice_number)
    {
        $order = Order::with(['store', 'items.product'])
            ->where('invoice_number', $invoice_number)
            ->firstOrFail();

        // Only allow tracking for local delivery
        if ($order->delivery_method !== 'local_delivery') {
            abort(404, 'Tracking hanya tersedia untuk Kurir Toko.');
        }

        // Determine role securely:
        // Default is 'user' (Spectator / Viewer mode - no GPS broadcast)
        $role = 'user';
        $isMerchant = auth()->check() && auth()->user()->store && auth()->user()->store->id === $order->store_id;

        // Driver role is only given to:
        // 1. Courier who accepted handover via QR scan in current session
        // 2. Merchant who explicitly chose "Saya Antar Sendiri" (?role=driver)
        if (session("driver_authorized_{$invoice_number}") === true) {
            $role = 'driver';
        } elseif ($isMerchant && request()->query('role') === 'driver') {
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
                'store_phone' => $order->store->support_email,
                'store_latitude' => $order->store->latitude,
                'store_longitude' => $order->store->longitude,
                'subtotal' => $order->subtotal,
                'shipping_cost' => $order->shipping_cost,
                'total_amount' => $order->total_amount,
                'payment_method' => $order->payment_method,
                'payment_status' => $order->payment_status,
                'items' => $order->items->map(function ($item) {
                    return [
                        'name' => $item->product_name,
                        'qty' => $item->quantity,
                        'price' => $item->price,
                    ];
                }),
            ],
        ]);
    }

    /**
     * Courier scans QR code -> Displays confirmation screen before starting delivery.
     */
    public function handover(Request $request, $invoice_number)
    {
        if (! $request->hasValidSignature()) {
            abort(401, 'Link QR Code kadaluarsa atau tidak valid.');
        }

        $order = Order::with(['store', 'items.product', 'user'])
            ->where('invoice_number', $invoice_number)
            ->firstOrFail();

        // Calculate estimated distance between store and buyer if coordinates exist
        $estimatedDistanceKm = null;
        if ($order->store?->latitude && $order->store?->longitude && $order->shipping_latitude && $order->shipping_longitude) {
            $lat1 = deg2rad($order->store->latitude);
            $lon1 = deg2rad($order->store->longitude);
            $lat2 = deg2rad($order->shipping_latitude);
            $lon2 = deg2rad($order->shipping_longitude);

            $dlat = $lat2 - $lat1;
            $dlon = $lon2 - $lon1;

            $a = sin($dlat / 2) ** 2 + cos($lat1) * cos($lat2) * sin($dlon / 2) ** 2;
            $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
            $estimatedDistanceKm = round(6371 * $c, 1);
        }

        return Inertia::render('Delivery/HandoverConfirm', [
            'order' => [
                'id' => $order->id,
                'invoice_number' => $order->invoice_number,
                'shipping_status' => $order->shipping_status,
                'customer_name' => $order->customer_name,
                'customer_phone' => $order->customer_phone,
                'shipping_address' => $order->shipping_address,
                'shipping_latitude' => $order->shipping_latitude,
                'shipping_longitude' => $order->shipping_longitude,
                'store_name' => $order->store?->name ?? 'Toko',
                'store_support_email' => $order->store?->support_email ?? '',
                'store_latitude' => $order->store?->latitude,
                'store_longitude' => $order->store?->longitude,
                'subtotal' => $order->subtotal,
                'shipping_cost' => $order->shipping_cost,
                'total_amount' => $order->total_amount,
                'payment_method' => $order->payment_method,
                'payment_status' => $order->payment_status,
                'items' => $order->items->map(function ($item) {
                    return [
                        'product_name' => $item->product_name,
                        'quantity' => $item->quantity,
                        'price' => $item->price,
                        'unit' => $item->unit,
                        'variant_name' => $item->variant_name,
                    ];
                }),
            ],
            'estimatedDistanceKm' => $estimatedDistanceKm,
        ]);
    }

    /**
     * Courier clicks "Ya, Mulai Antar" -> Update order to shipped, notify buyer, authorize driver session.
     */
    public function acceptHandover(Request $request, $invoice_number)
    {
        $order = Order::where('invoice_number', $invoice_number)->firstOrFail();

        // Update status to shipped if currently processing or pending
        if (in_array($order->shipping_status, ['pending', 'processing'])) {
            $updateData = ['shipping_status' => 'shipped'];
            if (empty($order->shipping_pin)) {
                $updateData['shipping_pin'] = str_pad(rand(0, 9999), 4, '0', STR_PAD_LEFT);
            }
            $order->update($updateData);

            // Automatically notify buyer (triggers push notification and sound on buyer's device!)
            \App\Services\OrderNotificationService::orderShipped($order);
        }

        // Authorize this device session as the driver
        session(["driver_authorized_{$invoice_number}" => true]);

        return redirect()->route('tracker.show', ['invoice_number' => $invoice_number]);
    }

    /**
     * Complete delivery by entering the 4-digit PIN.
     */
    public function complete(Request $request, $invoice_number)
    {
        $request->validate([
            'pin' => 'required|string|size:4',
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
                'shipping_status' => 'delivered',
            ];

            if ($order->payment_method === 'cod') {
                $updateData['payment_status'] = 'paid';
            }

            $order->update($updateData);

            if ($order->payment_status === 'paid' || ($updateData['payment_status'] ?? '') === 'paid') {
                $order->creditStoreBalance();
            }

            \App\Services\OrderNotificationService::orderDelivered($order);

            return back()->with('success', 'Pengiriman berhasil diselesaikan!');
        });
    }

    /**
     * Driver broadcasts GPS coordinate.
     */
    public function updateLocation(Request $request, $invoice_number)
    {
        $request->validate([
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
        ]);

        Cache::put("driver_loc_{$invoice_number}", [
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
        ], 3600); // 1 hour

        return response()->json(['success' => true]);
    }

    /**
     * Spectator (Buyer & Merchant) fetches driver GPS coordinate.
     */
    public function getLocation($invoice_number)
    {
        $loc = Cache::get("driver_loc_{$invoice_number}");

        return response()->json($loc ?: null);
    }
}

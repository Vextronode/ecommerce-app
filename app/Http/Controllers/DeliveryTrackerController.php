<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\RateLimiter;
use Inertia\Inertia;

class DeliveryTrackerController extends Controller
{
    /**
     * Display single live tracking page.
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

        if (request()->query('role') === 'driver') {
            session(["driver_authorized_{$invoice_number}" => true]);
            $role = 'driver';
        } elseif (session("driver_authorized_{$invoice_number}") === true) {
            $role = 'driver';
        } elseif ($isMerchant && request()->query('role') === 'driver') {
            $role = 'driver';
        }

        $cachedLoc = Cache::get("driver_loc_{$invoice_number}");

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
                'driver_latitude' => $cachedLoc['latitude'] ?? null,
                'driver_longitude' => $cachedLoc['longitude'] ?? null,
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
     * Courier scans single QR code -> Displays confirmation screen before starting delivery.
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
        $estimatedDistanceKm = $this->calculateHaversineDistance(
            $order->store?->latitude,
            $order->store?->longitude,
            $order->shipping_latitude,
            $order->shipping_longitude
        );

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
     * Courier clicks "Ya, Mulai Antar" (Single Order).
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

            \App\Services\OrderNotificationService::orderShipped($order);
            try {
                broadcast(new \App\Events\OrderStatusUpdated($order))->toOthers();
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::warning('OrderStatusUpdated broadcast error: ' . $e->getMessage());
            }
        }

        // Authorize this device session as the driver
        session(["driver_authorized_{$invoice_number}" => true]);

        return redirect()->route('tracker.show', ['invoice_number' => $invoice_number]);
    }

    /**
     * Courier scans Master QR Code -> Displays Multi-Order Confirmation Screen.
     */
    public function batchHandover(Request $request, $batch_token)
    {
        if (! $request->hasValidSignature()) {
            abort(401, 'Link Master QR Code kadaluarsa atau tidak valid.');
        }

        $batchData = Cache::get("delivery_batch_{$batch_token}");
        $orders = null;

        if ($batchData && isset($batchData['order_ids'])) {
            $orders = Order::with(['store', 'items.product', 'user'])
                ->whereIn('id', $batchData['order_ids'])
                ->get();
        } else {
            $orders = Order::with(['store', 'items.product', 'user'])
                ->where('delivery_batch_token', $batch_token)
                ->get();
        }

        if ($orders->isEmpty()) {
            abort(404, 'Daftar pengiriman gabungan tidak ditemukan.');
        }

        $store = $orders->first()->store;
        $storeLat = $store?->latitude;
        $storeLon = $store?->longitude;

        // Calculate distance for each stop and sort from nearest to farthest
        $stops = $orders->map(function ($order) use ($storeLat, $storeLon) {
            $distKm = $this->calculateHaversineDistance(
                $storeLat,
                $storeLon,
                $order->shipping_latitude,
                $order->shipping_longitude
            );

            return [
                'id' => $order->id,
                'invoice_number' => $order->invoice_number,
                'shipping_status' => $order->shipping_status,
                'customer_name' => $order->customer_name,
                'customer_phone' => $order->customer_phone,
                'shipping_address' => $order->shipping_address,
                'shipping_latitude' => $order->shipping_latitude,
                'shipping_longitude' => $order->shipping_longitude,
                'distance_km' => $distKm,
                'subtotal' => $order->subtotal,
                'shipping_cost' => $order->shipping_cost,
                'total_amount' => $order->total_amount,
                'payment_method' => $order->payment_method,
                'payment_status' => $order->payment_status,
                'items_count' => $order->items->sum('quantity'),
                'items' => $order->items->map(function ($item) {
                    return [
                        'name' => $item->product_name,
                        'qty' => $item->quantity,
                        'price' => $item->price,
                    ];
                }),
            ];
        })->sortBy('distance_km')->values()->all();

        // Assign sequential stop numbers (1, 2, 3...)
        foreach ($stops as $index => &$stop) {
            $stop['stop_number'] = $index + 1;
        }

        $totalCodAmount = $orders->where('payment_method', 'cod')->where('payment_status', 'pending')->sum('total_amount');
        $totalItemsCount = $orders->sum(function ($o) {
            return $o->items->sum('quantity');
        });

        return Inertia::render('Delivery/BatchHandoverConfirm', [
            'batchToken' => $batch_token,
            'store' => [
                'id' => $store?->id,
                'name' => $store?->name ?? 'Toko',
                'support_email' => $store?->support_email ?? '',
                'latitude' => $storeLat,
                'longitude' => $storeLon,
            ],
            'stops' => $stops,
            'totalOrders' => count($stops),
            'totalItems' => $totalItemsCount,
            'totalCodAmount' => $totalCodAmount,
        ]);
    }

    /**
     * Courier accepts all orders in the batch -> Sets status shipped & redirects to BatchTracker.
     */
    public function acceptBatchHandover(Request $request, $batch_token)
    {
        $batchData = Cache::get("delivery_batch_{$batch_token}");
        $orderIds = $batchData['order_ids'] ?? [];

        return DB::transaction(function () use ($batch_token, $orderIds) {
            $query = Order::query();
            if (!empty($orderIds)) {
                $query->whereIn('id', $orderIds);
            } else {
                $query->where('delivery_batch_token', $batch_token);
            }

            $orders = $query->lockForUpdate()->get();

            if ($orders->isEmpty()) {
                return redirect()->route('dashboard')->with('error', 'Pesanan gabungan tidak ditemukan.');
            }

            foreach ($orders as $order) {
                if (in_array($order->shipping_status, ['pending', 'processing'])) {
                    $updateData = [
                        'shipping_status' => 'shipped',
                        'delivery_batch_token' => $batch_token,
                    ];
                    if (empty($order->shipping_pin)) {
                        $updateData['shipping_pin'] = str_pad(rand(0, 9999), 4, '0', STR_PAD_LEFT);
                    }
                    $order->update($updateData);

                    // Notify each buyer individually
                    \App\Services\OrderNotificationService::orderShipped($order);
                    try {
                        broadcast(new \App\Events\OrderStatusUpdated($order))->toOthers();
                    } catch (\Throwable $e) {
                        \Illuminate\Support\Facades\Log::warning('OrderStatusUpdated broadcast error: ' . $e->getMessage());
                    }
                }

                // Authorize this courier session for each invoice in the batch
                session(["driver_authorized_{$order->invoice_number}" => true]);
            }

            // Authorize batch session
            session(["driver_authorized_batch_{$batch_token}" => true]);

            return redirect()->route('tracker.showBatch', ['batch_token' => $batch_token]);
        });
    }

    /**
     * Display Multi-Stop Batch Delivery Tracker Page.
     */
    public function showBatch($batch_token)
    {
        $batchData = Cache::get("delivery_batch_{$batch_token}");
        $orderIds = $batchData['order_ids'] ?? [];

        $query = Order::with(['store', 'items.product', 'user']);
        if (!empty($orderIds)) {
            $query->whereIn('id', $orderIds);
        } else {
            $query->where('delivery_batch_token', $batch_token);
        }

        $orders = $query->get();
        if ($orders->isEmpty()) {
            abort(404, 'Daftar pengiriman gabungan tidak ditemukan.');
        }

        $store = $orders->first()->store;
        $storeLat = $store?->latitude;
        $storeLon = $store?->longitude;

        // Determine role
        if (request()->query('role') === 'driver') {
            session(["driver_authorized_batch_{$batch_token}" => true]);
            $role = 'driver';
        } elseif (session("driver_authorized_batch_{$batch_token}") === true) {
            $role = 'driver';
        } else {
            $role = 'user';
        }

        $cachedBatchLoc = Cache::get("driver_loc_batch_{$batch_token}");

        // Sort stops nearest to farthest
        $stops = $orders->map(function ($order) use ($storeLat, $storeLon) {
            $distKm = $this->calculateHaversineDistance(
                $storeLat,
                $storeLon,
                $order->shipping_latitude,
                $order->shipping_longitude
            );

            return [
                'id' => $order->id,
                'invoice_number' => $order->invoice_number,
                'status' => $order->shipping_status,
                'customer_name' => $order->customer_name,
                'customer_phone' => $order->customer_phone,
                'shipping_address' => $order->shipping_address,
                'shipping_latitude' => $order->shipping_latitude,
                'shipping_longitude' => $order->shipping_longitude,
                'shipping_pin' => $order->shipping_pin,
                'distance_km' => $distKm,
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
            ];
        })->sortBy('distance_km')->values()->all();

        foreach ($stops as $index => &$stop) {
            $stop['stop_number'] = $index + 1;
        }

        // Build Google Maps Multi-Waypoint Navigation URL
        $validStops = array_values(array_filter($stops, function ($s) {
            return $s['shipping_latitude'] && $s['shipping_longitude'];
        }));

        $googleMapsUrl = '#';
        if (count($validStops) > 0) {
            $origin = $storeLat && $storeLon ? "{$storeLat},{$storeLon}" : "{$validStops[0]['shipping_latitude']},{$validStops[0]['shipping_longitude']}";
            $destinationStop = end($validStops);
            $destination = "{$destinationStop['shipping_latitude']},{$destinationStop['shipping_longitude']}";

            $waypointStops = array_slice($validStops, 0, count($validStops) - 1);
            $waypoints = implode('|', array_map(function ($s) {
                return "{$s['shipping_latitude']},{$s['shipping_longitude']}";
            }, $waypointStops));

            $googleMapsUrl = 'https://www.google.com/maps/dir/?api=1&origin='.urlencode($origin).'&destination='.urlencode($destination);
            if (! empty($waypoints)) {
                $googleMapsUrl .= '&waypoints='.urlencode($waypoints);
            }
        }

        return Inertia::render('Delivery/BatchTracker', [
            'role' => $role,
            'batchToken' => $batch_token,
            'initialDriverPos' => ($cachedBatchLoc && isset($cachedBatchLoc['latitude'], $cachedBatchLoc['longitude']))
                ? [(float) $cachedBatchLoc['latitude'], (float) $cachedBatchLoc['longitude']]
                : null,
            'store' => [
                'name' => $store?->name,
                'address' => $store?->address,
                'latitude' => $storeLat,
                'longitude' => $storeLon,
            ],
            'stops' => $stops,
            'googleMapsUrl' => $googleMapsUrl,
        ]);
    }

    /**
     * Complete an individual stop within a batch.
     */
    public function completeBatchStop(Request $request, $batch_token, $invoice_number)
    {
        $request->validate([
            'pin' => 'required|string|size:4',
        ]);

        // Security / Rate Limiting: Max 5 attempts per minute per IP to prevent PIN brute force
        $throttleKey = 'pin_verify_' . $invoice_number . '_' . $request->ip();
        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            $seconds = RateLimiter::availableIn($throttleKey);
            return back()->with('error', "Terlalu banyak percobaan PIN yang salah. Silakan coba lagi dalam {$seconds} detik.");
        }

        return DB::transaction(function () use ($request, $invoice_number, $throttleKey) {
            $order = Order::where('invoice_number', $invoice_number)->lockForUpdate()->firstOrFail();

            if ($order->shipping_status === 'delivered') {
                return back()->with('success', 'Pesanan ini sudah selesai diantar.');
            }

            if ($order->shipping_status !== 'shipped') {
                return back()->with('error', 'Pesanan belum dalam status pengiriman.');
            }

            if ($order->shipping_pin !== $request->pin) {
                RateLimiter::hit($throttleKey, 60);
                return back()->with('error', 'PIN tidak valid. Silakan tanya pembeli untuk 4-digit PIN pengiriman.');
            }

            RateLimiter::clear($throttleKey);

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
            try {
                broadcast(new \App\Events\OrderStatusUpdated($order))->toOthers();
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::warning('OrderStatusUpdated broadcast error: ' . $e->getMessage());
            }

            return back()->with('success', "Pesanan #{$invoice_number} berhasil diselesaikan!");
        });
    }

    /**
     * Driver broadcasts multi-stop batch GPS coordinate.
     */
    public function updateBatchLocation(Request $request, $batch_token)
    {
        $request->validate([
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
        ]);

        $locData = [
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
            'updated_at' => now()->toIso8601String(),
        ];

        Cache::put("driver_loc_batch_{$batch_token}", $locData, 86400);

        // Also sync location to each individual invoice in the batch for single-order tracking
        $batchData = Cache::get("delivery_batch_{$batch_token}");
        $invoices = $batchData['invoices'] ?? [];
        foreach ($invoices as $inv) {
            Cache::put("driver_loc_{$inv}", [
                'latitude' => $request->latitude,
                'longitude' => $request->longitude,
            ], 86400);
        }

        try {
            broadcast(new \App\Events\DriverLocationBroadcasted(
                $batch_token,
                null,
                (float) $request->latitude,
                (float) $request->longitude
            ))->toOthers();
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning('DriverLocationBroadcasted broadcast error: ' . $e->getMessage());
        }

        return response()->json(['success' => true]);
    }

    /**
     * Spectator fetches batch GPS coordinate.
     */
    public function getBatchLocation($batch_token)
    {
        $loc = Cache::get("driver_loc_batch_{$batch_token}");

        return response()->json($loc ?: null);
    }

    /**
     * Complete single delivery by entering the 4-digit PIN.
     */
    public function complete(Request $request, $invoice_number)
    {
        $request->validate([
            'pin' => 'required|string|size:4',
        ]);

        $throttleKey = 'pin_verify_' . $invoice_number . '_' . $request->ip();
        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            $seconds = RateLimiter::availableIn($throttleKey);
            return back()->with('error', "Terlalu banyak percobaan PIN salah. Coba lagi dalam {$seconds} detik.");
        }

        return DB::transaction(function () use ($request, $invoice_number, $throttleKey) {
            $order = Order::where('invoice_number', $invoice_number)->lockForUpdate()->firstOrFail();

            if ($order->shipping_status !== 'shipped') {
                return back()->with('error', 'Status pesanan tidak valid untuk diselesaikan.');
            }

            if ($order->shipping_pin !== $request->pin) {
                RateLimiter::hit($throttleKey, 60);
                return back()->with('error', 'PIN tidak valid. Silakan tanya pembeli untuk 4-digit PIN.');
            }

            RateLimiter::clear($throttleKey);

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
            try {
                broadcast(new \App\Events\OrderStatusUpdated($order))->toOthers();
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::warning('OrderStatusUpdated broadcast error: ' . $e->getMessage());
            }

            return back()->with('success', 'Pengiriman berhasil diselesaikan!');
        });
    }

    /**
     * Driver broadcasts single GPS coordinate.
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
        ], 86400);

        try {
            broadcast(new \App\Events\DriverLocationBroadcasted(
                null,
                $invoice_number,
                (float) $request->latitude,
                (float) $request->longitude
            ))->toOthers();
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning('DriverLocationBroadcasted broadcast error: ' . $e->getMessage());
        }

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

    /**
     * Helper to compute Haversine distance in KM.
     */
    private function calculateHaversineDistance($lat1, $lon1, $lat2, $lon2): ?float
    {
        if (!$lat1 || !$lon1 || !$lat2 || !$lon2) {
            return null;
        }

        $rLat1 = deg2rad($lat1);
        $rLon1 = deg2rad($lon1);
        $rLat2 = deg2rad($lat2);
        $rLon2 = deg2rad($lon2);

        $dlat = $rLat2 - $rLat1;
        $dlon = $rLon2 - $rLon1;

        $a = sin($dlat / 2) ** 2 + cos($rLat1) * cos($rLat2) * sin($dlon / 2) ** 2;
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return round(6371 * $c, 1);
    }

    /**
     * Helper to build Google Maps Multi-Waypoint Navigation URL.
     */
    private function buildGoogleMapsMultiStopUrl($storeLat, $storeLon, $stops): ?string
    {
        $validStops = array_filter($stops, function ($stop) {
            return !empty($stop['shipping_latitude']) && !empty($stop['shipping_longitude']);
        });

        if (empty($validStops) || !$storeLat || !$storeLon) {
            return null;
        }

        $lastStop = end($validStops);
        $waypoints = array_slice($validStops, 0, -1);

        $origin = "{$storeLat},{$storeLon}";
        $destination = "{$lastStop['shipping_latitude']},{$lastStop['shipping_longitude']}";

        $waypointCoords = array_map(function ($s) {
            return "{$s['shipping_latitude']},{$s['shipping_longitude']}";
        }, $waypoints);

        $waypointParam = !empty($waypointCoords) ? '&waypoints=' . implode('|', $waypointCoords) : '';

        return "https://www.google.com/maps/dir/?api=1&origin={$origin}&destination={$destination}{$waypointParam}";
    }
}

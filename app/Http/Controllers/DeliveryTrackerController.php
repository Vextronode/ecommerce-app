<?php

namespace App\Http\Controllers;

use App\Events\DriverLocationBroadcasted;
use App\Events\OrderStatusUpdated;
use App\Models\Order;
use App\Services\OrderNotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
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

        // Determine role & authorization:
        $isDriver = session("driver_authorized_{$invoice_number}") === true;
        $isBuyer = auth()->check() && (int) auth()->id() === (int) $order->user_id;
        $isMerchant = auth()->check() && (int) auth()->user()->store?->id === (int) $order->store_id;
        $canViewFullPII = $isDriver || $isBuyer || $isMerchant;

        $role = $isDriver ? 'driver' : 'user';

        // PII Masking: If unauthenticated/unauthorized public viewer, obscure customer phone and address
        $displayCustomerName = $canViewFullPII
            ? $order->customer_name
            : (strlen($order->customer_name) > 3 ? Str::mask($order->customer_name, '*', 2, -1) : $order->customer_name);

        $displayPhone = $canViewFullPII
            ? $order->customer_phone
            : ($order->customer_phone ? Str::mask($order->customer_phone, '*', 4, -3) : null);

        $displayAddress = $canViewFullPII
            ? $order->shipping_address
            : ($order->shipping_address ? preg_replace('/^([^,]+,[^,]+),?.*/', '$1, [Alamat Disamarkan]', $order->shipping_address) : '');

        $cachedLoc = Cache::get("driver_loc_{$invoice_number}");

        return Inertia::render('Delivery/Tracker', [
            'role' => $role,
            'order' => [
                'id' => $order->id,
                'invoice_number' => $order->invoice_number,
                'status' => $order->shipping_status,
                'is_arrived' => $order->isArrived(),
                'customer_name' => $displayCustomerName,
                'customer_phone' => $displayPhone,
                'shipping_address' => $displayAddress,
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

        // Establish 30-minute handover eligibility session upon physical signed QR code scan
        session(["handover_scanned_{$invoice_number}" => now()->addMinutes(30)->timestamp]);

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
        $scannedAt = session("handover_scanned_{$invoice_number}");
        if (! $scannedAt || now()->timestamp > $scannedAt) {
            abort(403, 'Sesi serah terima QR Code tidak valid atau telah kadaluarsa. Silakan scan ulang QR Code toko.');
        }
        session()->forget("handover_scanned_{$invoice_number}");

        $order = Order::where('invoice_number', $invoice_number)->firstOrFail();

        // Update status to shipped if currently processing or pending
        if (in_array($order->shipping_status, ['pending', 'processing'])) {
            $updateData = ['shipping_status' => 'shipped'];
            if (empty($order->shipping_pin)) {
                $updateData['shipping_pin'] = str_pad((string) random_int(0, 9999), 4, '0', STR_PAD_LEFT);
            }

            $order->update($updateData);

            OrderNotificationService::orderShipped($order);
            try {
                broadcast(new OrderStatusUpdated($order))->toOthers();
            } catch (\Throwable $e) {
                Log::warning('OrderStatusUpdated broadcast error: ' . $e->getMessage());
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

        // Establish 30-minute batch handover eligibility session upon physical signed Master QR code scan
        session(["batch_handover_scanned_{$batch_token}" => now()->addMinutes(30)->timestamp]);

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

        // Calculate distance for each stop and optimize visiting sequence (Nearest-Neighbor TSP)
        $rawStops = $orders->map(function ($order) use ($storeLat, $storeLon) {
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
        })->values()->all();

        $stops = $this->optimizeStopSequence($storeLat, $storeLon, $rawStops);

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
        $scannedAt = session("batch_handover_scanned_{$batch_token}");
        if (! $scannedAt || now()->timestamp > $scannedAt) {
            abort(403, 'Sesi serah terima Master QR Code tidak valid atau telah kadaluarsa. Silakan scan ulang Master QR Code.');
        }
        session()->forget("batch_handover_scanned_{$batch_token}");

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
                        $updateData['shipping_pin'] = str_pad((string) random_int(0, 9999), 4, '0', STR_PAD_LEFT);
                    }

                    $order->update($updateData);

                    // Notify each buyer individually
                    OrderNotificationService::orderShipped($order);
                    try {
                        broadcast(new OrderStatusUpdated($order))->toOthers();
                    } catch (\Throwable $e) {
                        Log::warning('OrderStatusUpdated broadcast error: ' . $e->getMessage());
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

        // Determine role: Only genuine authorized batch driver session is driver
        $isBatchDriver = session("driver_authorized_batch_{$batch_token}") === true;
        $role = $isBatchDriver ? 'driver' : 'user';

        $cachedBatchLoc = Cache::get("driver_loc_batch_{$batch_token}");

        // Optimize multi-stop route sequence (Nearest-Neighbor TSP from driver/store origin)
        $rawStops = $orders->map(function ($order) use ($storeLat, $storeLon, $isBatchDriver) {
            $distKm = $this->calculateHaversineDistance(
                $storeLat,
                $storeLon,
                $order->shipping_latitude,
                $order->shipping_longitude
            );

            $isOwnOrder = auth()->check() && (int) auth()->id() === (int) $order->user_id;
            $canViewFullPII = $isBatchDriver || $isOwnOrder;

            $displayCustomerName = $canViewFullPII
                ? $order->customer_name
                : (strlen($order->customer_name) > 3 ? Str::mask($order->customer_name, '*', 2, -1) : $order->customer_name);

            $displayPhone = $canViewFullPII
                ? $order->customer_phone
                : ($order->customer_phone ? Str::mask($order->customer_phone, '*', 4, -3) : null);

            $displayAddress = $canViewFullPII
                ? $order->shipping_address
                : ($order->shipping_address ? preg_replace('/^([^,]+,[^,]+),?.*/', '$1, [Alamat Disamarkan]', $order->shipping_address) : '');

            return [
                'id' => $order->id,
                'invoice_number' => $order->invoice_number,
                'shipping_status' => $order->shipping_status,
                'customer_name' => $displayCustomerName,
                'customer_phone' => $displayPhone,
                'shipping_address' => $displayAddress,
                'shipping_latitude' => $order->shipping_latitude,
                'shipping_longitude' => $order->shipping_longitude,
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
        })->values()->all();

        $originLat = ($cachedBatchLoc && isset($cachedBatchLoc['latitude'])) ? $cachedBatchLoc['latitude'] : $storeLat;
        $originLon = ($cachedBatchLoc && isset($cachedBatchLoc['longitude'])) ? $cachedBatchLoc['longitude'] : $storeLon;
        $stops = $this->optimizeStopSequence($originLat, $originLon, $rawStops);

        foreach ($stops as $index => &$stop) {
            $stop['stop_number'] = $index + 1;
        }

        $googleMapsUrl = $this->buildGoogleMapsMultiStopUrl($storeLat, $storeLon, $stops) ?? '#';

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

        if (session("driver_authorized_batch_{$batch_token}") !== true) {
            return back()->with('error', 'Hanya kurir yang diotorisasi yang dapat menyelesaikan pesanan.');
        }

        // Security / Rate Limiting: Max 5 attempts per invoice (locked across all IPs) to prevent PIN brute force
        $throttleKey = 'pin_verify_' . $invoice_number;
        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            $seconds = RateLimiter::availableIn($throttleKey);
            $minutes = ceil($seconds / 60);
            $timeText = $seconds < 60 ? "{$seconds} detik" : "{$minutes} menit ({$seconds} detik)";
            $errMsg = "Terlalu banyak percobaan PIN salah. Akses diblokir selama {$timeText}. Silakan coba lagi nanti.";
            return back()->with('error', $errMsg)->withErrors(['pin' => $errMsg]);
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
                RateLimiter::hit($throttleKey, 300);
                $retriesLeft = RateLimiter::retriesLeft($throttleKey, 5);
                if ($retriesLeft > 0) {
                    $errMsg = "PIN tidak valid. Silakan tanya pembeli untuk 4-digit PIN pengiriman. Sisa percobaan: {$retriesLeft} kali lagi.";
                } else {
                    $seconds = RateLimiter::availableIn($throttleKey);
                    $minutes = ceil($seconds / 60);
                    $timeText = $seconds < 60 ? "{$seconds} detik" : "{$minutes} menit ({$seconds} detik)";
                    $errMsg = "PIN salah. Terlalu banyak percobaan salah. Form diblokir selama {$timeText}.";
                }
                return back()->with('error', $errMsg)->withErrors(['pin' => $errMsg]);
            }

            RateLimiter::clear($throttleKey);

            $updateData = [
                'shipping_status' => 'delivered',
            ];

            if ($order->payment_method === 'cod') {
                $updateData['payment_status'] = 'paid';
            }

            $order->update($updateData);

            // Security & Financial Integrity: Only credit digital store escrow balance for online payment (non-COD).
            // For COD, the merchant/driver has already collected the physical cash directly from the customer.
            if (($order->payment_status === 'paid' || ($updateData['payment_status'] ?? '') === 'paid') && $order->payment_method !== 'cod') {
                $order->creditStoreBalance();
            }

            Cache::forget("driver_loc_{$invoice_number}");

            OrderNotificationService::orderDelivered($order);
            try {
                broadcast(new OrderStatusUpdated($order))->toOthers();
            } catch (\Throwable $e) {
                Log::warning('OrderStatusUpdated broadcast error: ' . $e->getMessage());
            }

            return back()->with('success', "Pesanan #{$invoice_number} berhasil diselesaikan!");
        });
    }

    /**
     * Driver broadcasts multi-stop batch GPS coordinate.
     */
    public function updateBatchLocation(Request $request, $batch_token)
    {
        if (session("driver_authorized_batch_{$batch_token}") !== true) {
            return response()->json(['error' => 'Tidak diotorisasi sebagai kurir pengiriman gabungan.'], 403);
        }

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
            Log::warning('DriverLocationBroadcasted broadcast error: ' . $e->getMessage());
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
        if (session("driver_authorized_{$invoice_number}") !== true) {
            return back()->with('error', 'Hanya kurir yang diotorisasi yang dapat menyelesaikan pesanan via PIN.');
        }

        $request->validate([
            'pin' => 'required|string|size:4',
        ]);

        // Security / Rate Limiting: Max 5 attempts per invoice (locked across all IPs) to prevent PIN brute force
        $throttleKey = 'pin_verify_' . $invoice_number;
        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            $seconds = RateLimiter::availableIn($throttleKey);
            $minutes = ceil($seconds / 60);
            $timeText = $seconds < 60 ? "{$seconds} detik" : "{$minutes} menit ({$seconds} detik)";
            $errMsg = "Terlalu banyak percobaan PIN salah. Akses diblokir selama {$timeText}. Silakan coba lagi nanti.";
            return back()->with('error', $errMsg)->withErrors(['pin' => $errMsg]);
        }

        return DB::transaction(function () use ($request, $invoice_number, $throttleKey) {
            $order = Order::where('invoice_number', $invoice_number)->lockForUpdate()->firstOrFail();

            if ($order->shipping_status !== 'shipped') {
                return back()->with('error', 'Status pesanan tidak valid untuk diselesaikan.');
            }

            if ($order->shipping_pin !== $request->pin) {
                RateLimiter::hit($throttleKey, 300);
                $retriesLeft = RateLimiter::retriesLeft($throttleKey, 5);
                if ($retriesLeft > 0) {
                    $errMsg = "PIN tidak valid. Silakan tanya pembeli untuk 4-digit PIN. Sisa percobaan: {$retriesLeft} kali lagi.";
                } else {
                    $seconds = RateLimiter::availableIn($throttleKey);
                    $minutes = ceil($seconds / 60);
                    $timeText = $seconds < 60 ? "{$seconds} detik" : "{$minutes} menit ({$seconds} detik)";
                    $errMsg = "PIN salah. Terlalu banyak percobaan salah. Form diblokir selama {$timeText}.";
                }
                return back()->with('error', $errMsg)->withErrors(['pin' => $errMsg]);
            }

            RateLimiter::clear($throttleKey);

            $updateData = [
                'shipping_status' => 'delivered',
            ];

            if ($order->payment_method === 'cod') {
                $updateData['payment_status'] = 'paid';
            }

            $order->update($updateData);

            // Security & Financial Integrity: Only credit digital store escrow balance for online payment (non-COD).
            // For COD, the merchant/driver has already collected the physical cash directly from the customer.
            if (($order->payment_status === 'paid' || ($updateData['payment_status'] ?? '') === 'paid') && $order->payment_method !== 'cod') {
                $order->creditStoreBalance();
            }

            Cache::forget("driver_loc_{$invoice_number}");

            OrderNotificationService::orderDelivered($order);
            try {
                broadcast(new OrderStatusUpdated($order))->toOthers();
            } catch (\Throwable $e) {
                Log::warning('OrderStatusUpdated broadcast error: ' . $e->getMessage());
            }

            return back()->with('success', 'Pengiriman berhasil diselesaikan!');
        });
    }

    /**
     * Courier marks that they have arrived at the buyer's delivery destination.
     * This activates the buyer's "Pesanan Diterima" button and starts the 4-hour countdown.
     */
    public function markArrived(Request $request, $invoice_number)
    {
        if (session("driver_authorized_{$invoice_number}") !== true) {
            return back()->with('error', 'Hanya kurir yang diotorisasi yang dapat mengonfirmasi kedatangan.');
        }

        $order = Order::where('invoice_number', $invoice_number)->firstOrFail();

        if ($order->shipping_status !== 'shipped') {
            return back()->with('error', 'Status pesanan belum dalam pengiriman.');
        }

        $order->markAsArrived();

        OrderNotificationService::orderArrived($order);

        try {
            broadcast(new OrderStatusUpdated($order))->toOthers();
        } catch (\Throwable $e) {
            Log::warning('OrderStatusUpdated broadcast error: ' . $e->getMessage());
        }

        return back()->with('success', 'Konfirmasi tiba di lokasi pembeli berhasil! Pembeli telah diberi tahu.');
    }

    /**
     * Driver broadcasts single GPS coordinate.
     */
    public function updateLocation(Request $request, $invoice_number)
    {
        if (session("driver_authorized_{$invoice_number}") !== true) {
            return response()->json(['error' => 'Tidak diotorisasi sebagai kurir.'], 403);
        }

        $request->validate([
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
        ]);

        Cache::put("driver_loc_{$invoice_number}", [
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
        ], 86400);

        try {
            broadcast(new DriverLocationBroadcasted(
                null,
                $invoice_number,
                (float) $request->latitude,
                (float) $request->longitude
            ))->toOthers();
        } catch (\Throwable $e) {
            Log::warning('DriverLocationBroadcasted broadcast error: ' . $e->getMessage());
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
        $validStops = array_values(array_filter($stops, function ($stop) {
            return !empty($stop['shipping_latitude']) && !empty($stop['shipping_longitude']);
        }));

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

        return "https://www.google.com/maps/dir/?api=1&origin=" . urlencode($origin) . "&destination=" . urlencode($destination) . $waypointParam;
    }

    /**
     * Optimize multi-stop route sequence using Nearest-Neighbor TSP algorithm.
     * Starts from the origin (store/driver) and iteratively chains to the closest unvisited stop,
     * preventing erratic zig-zagging across the map.
     */
    private function optimizeStopSequence($originLat, $originLon, array $stops): array
    {
        if (count($stops) <= 1) {
            return $stops;
        }

        $unvisited = $stops;
        $optimized = [];
        $currentLat = $originLat;
        $currentLon = $originLon;

        while (!empty($unvisited)) {
            $nearestIdx = null;
            $shortestDist = null;

            foreach ($unvisited as $idx => $stop) {
                $dist = $this->calculateHaversineDistance(
                    $currentLat,
                    $currentLon,
                    $stop['shipping_latitude'],
                    $stop['shipping_longitude']
                );

                if ($shortestDist === null || ($dist !== null && $dist < $shortestDist)) {
                    $shortestDist = $dist;
                    $nearestIdx = $idx;
                }
            }

            if ($nearestIdx === null) {
                $next = array_shift($unvisited);
            } else {
                $next = $unvisited[$nearestIdx];
                unset($unvisited[$nearestIdx]);
                $unvisited = array_values($unvisited);
            }

            $optimized[] = $next;
            if (!empty($next['shipping_latitude']) && !empty($next['shipping_longitude'])) {
                $currentLat = $next['shipping_latitude'];
                $currentLon = $next['shipping_longitude'];
            }
        }

        return $optimized;
    }
}

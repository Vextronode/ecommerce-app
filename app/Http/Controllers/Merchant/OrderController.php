<?php

namespace App\Http\Controllers\Merchant;

use App\Events\OrderStatusUpdated;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\OrderNotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;
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

        $orders = Order::with(['user', 'items.product.images'])
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
            $isEligibleForHandover = $order->payment_method === 'cod' || $order->payment_status === 'paid';
            if ($order->delivery_method === 'local_delivery' && $isEligibleForHandover && in_array($order->shipping_status, ['processing', 'pending'])) {
                $order->handover_url = URL::signedRoute(
                    'tracker.handover',
                    ['invoice_number' => $order->invoice_number],
                    now()->addHours(24) // Valid for 24 hours
                );
            }

            // Defense-in-depth: Strip raw payment gateway tokens, delivery PIN, and internal financial audit timestamps
            $order->makeHidden([
                'payment_payload',
                'shipping_pin',
                'va_number',
                'bill_key',
                'biller_code',
                'qr_code_url',
                'parent_transaction_id',
                'payment_type',
                'payment_channel',
                'payment_expiry_time',
                'balance_credited_at',
                'stock_restored_at',
            ]);

            return $order;
        });

        $totalOrders = Order::where('store_id', $store->id)->where('shipping_status', 'delivered')->count();
        $pendingShipping = Order::where('store_id', $store->id)
            ->whereIn('shipping_status', ['pending', 'processing'])
            ->where(function ($q) {
                $q->where('payment_method', 'cod')
                    ->orWhere('payment_status', 'paid');
            })
            ->count();
        $pendingPayment = Order::where('store_id', $store->id)
            ->where('payment_status', 'pending')
            ->where('payment_method', '!=', 'cod')
            ->where('shipping_status', '!=', 'cancelled')
            ->count();

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

    /**
     * Generate Master QR Code for Multi-Order Batch Delivery.
     */
    public function generateBatchHandover(Request $request)
    {
        $request->validate([
            'order_ids' => 'required|array|min:2|max:20',
            'order_ids.*' => 'required|integer',
        ]);

        $store = $request->user()->store;
        if (! $store) {
            return response()->json(['error' => 'Toko tidak ditemukan.'], 403);
        }

        $orderIds = $request->order_ids;

        // Security / IDOR Guard: Ensure ALL requested orders belong to this merchant's store and are paid (or COD)
        $orders = Order::whereIn('id', $orderIds)
            ->where('store_id', $store->id)
            ->where('delivery_method', 'local_delivery')
            ->whereIn('shipping_status', ['processing', 'pending'])
            ->where(function ($q) {
                $q->where('payment_method', 'cod')
                    ->orWhere('payment_status', 'paid');
            })
            ->get();

        if ($orders->count() < 2) {
            return response()->json([
                'error' => 'Minimal harus memilih 2 pesanan Kurir Toko yang berstatus Diproses.',
            ], 422);
        }

        $batchToken = 'BAT-' . strtoupper(Str::random(12));
        $validOrderIds = $orders->pluck('id')->toArray();
        $validInvoices = $orders->pluck('invoice_number')->toArray();

        // Save batch info in Cache (24 hours expiry)
        Cache::put("delivery_batch_{$batchToken}", [
            'batch_token' => $batchToken,
            'store_id' => $store->id,
            'order_ids' => $validOrderIds,
            'invoices' => $validInvoices,
            'created_at' => now()->toIso8601String(),
        ], now()->addHours(24));

        // Update database if column exists
        if (Schema::hasColumn('orders', 'delivery_batch_token')) {
            Order::whereIn('id', $validOrderIds)->update([
                'delivery_batch_token' => $batchToken,
            ]);
        }

        // Generate tamper-proof signed URL
        $signedBatchUrl = URL::signedRoute('tracker.batchHandover', [
            'batch_token' => $batchToken,
        ], now()->addHours(24));

        return response()->json([
            'success' => true,
            'batch_token' => $batchToken,
            'batch_url' => $signedBatchUrl,
            'orders_count' => count($validOrderIds),
            'invoices' => $validInvoices,
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'shipping_status' => 'required|in:pending,processing,shipped,cancelled',
        ]);

        $store = $request->user()->store;

        $midtransOrderIdToCancel = null;
        $midtransOrderIdToRefund = null;

        $response = DB::transaction(function () use ($request, $id, $store, &$midtransOrderIdToCancel, &$midtransOrderIdToRefund) {
            $order = Order::where('id', $id)->lockForUpdate()->firstOrFail();

            if ($order->store_id !== $store->id) {
                abort(403, 'Anda tidak punya akses ke pesanan ini.');
            }

            if (in_array($order->shipping_status, ['cancelled', 'delivered'])) {
                return redirect()->route('merchant.orders.index')->with('error', 'Status pesanan ini sudah tidak bisa diubah lagi.');
            }

            $newStatus = $request->shipping_status;

            if ($order->shipping_status === 'shipped' && in_array($newStatus, ['pending', 'processing'], true)) {
                return redirect()->route('merchant.orders.index')->with('error', 'Pesanan yang sedang dikirim tidak dapat dikembalikan ke status sebelumnya.');
            }

            // order non-COD yang sudah dibayar & sedang dikirim tidak boleh dibatalkan sepihak;
            // barang sudah di jalan, jadi refund harus lewat alur pengembalian/rekonsiliasi admin
            if ($newStatus === 'cancelled' && $order->shipping_status === 'shipped' && $order->payment_method !== 'cod' && $order->payment_status === 'paid') {
                return redirect()->route('merchant.orders.index')->with('error', 'Pesanan yang sudah dikirim tidak dapat dibatalkan langsung. Ajukan pengembalian dana lewat admin.');
            }

            // Security Guard: Non-COD orders must be paid before being processed or shipped
            if ($order->payment_method !== 'cod' && $order->payment_status !== 'paid' && in_array($newStatus, ['processing', 'shipped'])) {
                return redirect()->route('merchant.orders.index')->with('error', 'Pesanan non-COD belum dibayar oleh pembeli.');
            }

            // Guard stok: order yang stoknya sudah habis ga boleh diproses atau dikirim
            if (in_array($newStatus, ['processing', 'shipped']) && ! $order->canFulfillStock()) {
                return redirect()->route('merchant.orders.index')->with('error', 'Stok produk untuk pesanan ini tidak mencukupi. Hubungi admin untuk rekonsiliasi.');
            }

            $updateData = ['shipping_status' => $newStatus];

            if ($newStatus === 'shipped') {
                $newPin = null;
                if (empty($order->shipping_pin)) {
                    $newPin = str_pad((string) random_int(0, 9999), 4, '0', STR_PAD_LEFT);
                }
                $order->update($updateData);
                if ($newPin !== null) {
                    // shipping_pin ga masuk fillable, set lewat forceFill
                    $order->forceFill(['shipping_pin' => $newPin])->save();
                }
                OrderNotificationService::orderShipped($order);
            } elseif ($newStatus === 'cancelled') {
                $wasPaidNonCod = $order->payment_status === 'paid' && $order->payment_method !== 'cod';
                $wasUnpaidNonCod = $order->payment_status !== 'paid' && $order->payment_method !== 'cod';
                $updateData['payment_status'] = $order->payment_status === 'paid' ? 'refunded' : 'failed';
                $order->update($updateData);
                if ($wasPaidNonCod) {
                    // dana sudah masuk gateway; tarik escrow lokal lalu minta refund riil ke gateway
                    $order->reversePendingBalance();
                    $midtransOrderIdToRefund = $order->parent_transaction_id ?? $order->payment_payload['order_id'] ?? $order->invoice_number;
                }
                // Idempotent stock restoration
                $order->restoreStock();
                OrderNotificationService::orderCancelled($order, 'Dibatalkan oleh penjual');

                if ($wasUnpaidNonCod) {
                    $hasActiveSiblings = ! empty($order->parent_transaction_id)
                        && Order::where('parent_transaction_id', $order->parent_transaction_id)
                            ->where('id', '!=', $order->id)
                            ->where('shipping_status', '!=', 'cancelled')
                            ->exists();

                    if (! $hasActiveSiblings) {
                        $midtransOrderIdToCancel = $order->parent_transaction_id ?? $order->payment_payload['order_id'] ?? $order->invoice_number;
                    }
                }
            } elseif ($newStatus === 'processing') {
                $order->update($updateData);
                OrderNotificationService::orderProcessing($order);
            } else {
                $order->update($updateData);
            }

            try {
                broadcast(new OrderStatusUpdated($order));
            } catch (\Throwable $e) {
                Log::warning('OrderStatusUpdated broadcast error: ' . $e->getMessage());
            }

            return redirect()->route('merchant.orders.index')->with('success', 'Status pesanan berhasil diperbarui!');
        });

        $midtrans = app(\App\Services\MidtransService::class);

        if ($midtransOrderIdToCancel) {
            $midtrans->cancelTransaction($midtransOrderIdToCancel);
        }

        if ($midtransOrderIdToRefund) {
            // panggilan network di luar transaksi & lock, sama seperti pola cancel.
            // bila gateway tidak menjawab, jangan diamkan: tandai order butuh rekonsiliasi.
            $refundResult = $midtrans->refundTransaction($midtransOrderIdToRefund);

            if ($refundResult === null) {
                $order = Order::find($id);

                if ($order) {
                    $payload = $order->payment_payload ?? [];
                    $payload['needs_reconciliation'] = true;
                    $order->forceFill(['payment_payload' => $payload])->save();
                }

                Log::warning('Refund gateway gagal untuk order #'.$id.' (midtrans id: '.$midtransOrderIdToRefund.'). Ditandai needs_reconciliation.');

                return redirect()->route('merchant.orders.index')->with('error', 'Pesanan dibatalkan, tapi pengembalian dana ke gateway belum terkonfirmasi. Admin akan menindaklanjuti rekonsiliasi.');
            }
        }

        return $response;
    }
}

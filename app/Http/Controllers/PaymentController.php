<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Services\MidtransService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PaymentController extends Controller
{
    /**
     * Display the dedicated Shopee-style payment page.
     */
    public function show(Request $request, $orderId, MidtransService $midtransService)
    {
        $order = Order::with(['items.product', 'store'])
            ->where('user_id', auth()->id())
            ->findOrFail($orderId);

        // If order is COD or already paid, redirect directly to Order Success Page
        if ($order->payment_method === 'cod' || $order->payment_status === 'paid') {
            return redirect()->route('checkout.success', ['order_id' => $order->id]);
        }

        // Check real-time status with Midtrans in case status was updated
        if ($order->payment_status === 'pending') {
            $midtransOrderId = $order->parent_transaction_id ?? $order->payment_payload['order_id'] ?? $order->invoice_number;

            if ($midtransOrderId) {
                try {
                    $statusResp = Cache::remember("midtrans_status_{$midtransOrderId}", 3, function () use ($midtransService, $midtransOrderId) {
                        return $midtransService->getTransactionStatus($midtransOrderId);
                    });

                    if ($statusResp) {
                        $trxStatus = is_object($statusResp) ? ($statusResp->transaction_status ?? null) : ($statusResp['transaction_status'] ?? null);
                        $fraudStatus = is_object($statusResp) ? ($statusResp->fraud_status ?? null) : ($statusResp['fraud_status'] ?? null);

                        $siblingOrders = Order::where('parent_transaction_id', $midtransOrderId)
                            ->orWhere('id', $order->id)
                            ->get();

                        DB::transaction(function () use ($siblingOrders, $trxStatus, $fraudStatus) {
                            foreach ($siblingOrders as $sib) {
                                $lockedSib = Order::where('id', $sib->id)->lockForUpdate()->first();
                                if (!$lockedSib) continue;

                                if ($trxStatus === 'settlement' || ($trxStatus === 'capture' && $fraudStatus === 'accept')) {
                                    $lockedSib->update(['payment_status' => 'paid']);
                                } elseif (in_array($trxStatus, ['cancel', 'deny', 'expire'])) {
                                    if ($lockedSib->payment_status !== 'paid') {
                                        $lockedSib->update(['payment_status' => 'failed']);
                                        $lockedSib->restoreStock();
                                    }
                                }
                            }
                        });

                        $order->refresh();

                        if ($order->payment_status === 'paid') {
                            return redirect()->route('checkout.success', ['order_id' => $order->id]);
                        }
                    }
                } catch (\Exception $e) {
                    // Ignore API network errors
                }
            }
        }

        // Build structured payment info
        $deeplinkUrl = null;
        if (!empty($order->payment_payload['actions']) && is_array($order->payment_payload['actions'])) {
            foreach ($order->payment_payload['actions'] as $action) {
                $act = (array) $action;
                if (in_array($act['name'] ?? '', ['deeplink-redirect', 'mobile-deeplink-redirect'])) {
                    $deeplinkUrl = $act['url'] ?? null;
                    break;
                }
            }
        }

        $paymentInfo = [
            'method' => $order->payment_method,
            'channel' => $order->payment_channel,
            'type' => $order->payment_type,
            'va_number' => $order->va_number,
            'bill_key' => $order->bill_key,
            'biller_code' => $order->biller_code,
            'qr_code_url' => $order->qr_code_url,
            'deeplink_url' => $deeplinkUrl,
            'expiry_time' => $order->payment_expiry_time?->toISOString(),
            'is_expired' => $order->payment_expiry_time ? $order->payment_expiry_time->isPast() : false,
        ];

        return Inertia::render('Payment/Show', [
            'order' => $order,
            'paymentInfo' => $paymentInfo,
        ]);
    }

    /**
     * Check payment status via AJAX with caching & sibling sync
     */
    public function checkStatus(Request $request, $orderId, MidtransService $midtransService)
    {
        $order = Order::where('id', $orderId)
            ->where('user_id', auth()->id())
            ->firstOrFail();

        if ($order->payment_status === 'pending' && $order->payment_method !== 'cod') {
            $midtransOrderId = $order->parent_transaction_id ?? $order->payment_payload['order_id'] ?? $order->invoice_number;

            if ($midtransOrderId) {
                try {
                    $statusResp = Cache::remember("midtrans_status_{$midtransOrderId}", 3, function () use ($midtransService, $midtransOrderId) {
                        return $midtransService->getTransactionStatus($midtransOrderId);
                    });

                    if ($statusResp) {
                        $trxStatus = is_object($statusResp) ? ($statusResp->transaction_status ?? null) : ($statusResp['transaction_status'] ?? null);
                        $fraudStatus = is_object($statusResp) ? ($statusResp->fraud_status ?? null) : ($statusResp['fraud_status'] ?? null);

                        $siblingOrders = Order::where('parent_transaction_id', $midtransOrderId)
                            ->orWhere('id', $order->id)
                            ->get();

                        DB::transaction(function () use ($siblingOrders, $trxStatus, $fraudStatus) {
                            foreach ($siblingOrders as $sib) {
                                $lockedSib = Order::where('id', $sib->id)->lockForUpdate()->first();
                                if (!$lockedSib) continue;

                                if ($trxStatus === 'settlement' || ($trxStatus === 'capture' && $fraudStatus === 'accept')) {
                                    $lockedSib->update(['payment_status' => 'paid']);
                                } elseif (in_array($trxStatus, ['cancel', 'deny', 'expire'])) {
                                    if ($lockedSib->payment_status !== 'paid') {
                                        $lockedSib->update(['payment_status' => 'failed']);
                                        $lockedSib->restoreStock();
                                    }
                                }
                            }
                        });

                        $order->refresh();
                    }
                } catch (\Exception $e) {
                    // Ignore API connection exceptions
                }
            }
        }

        return response()->json([
            'order_id' => $order->id,
            'payment_status' => $order->payment_status,
            'is_paid' => $order->payment_status === 'paid',
            'redirect_url' => route('checkout.success', ['order_id' => $order->id]),
        ]);
    }
}

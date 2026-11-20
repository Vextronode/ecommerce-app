<?php

namespace App\Http\Controllers;

use App\Http\Resources\PaymentOrderResource;
use App\Models\Order;
use App\Models\PlatformSetting;
use App\Services\MidtransService;
use App\Services\PaymentSyncService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class PaymentController extends Controller
{
    /**
     * Display the dedicated Shopee-style payment page.
     */
    public function show(Request $request, int|string $orderId, PaymentSyncService $paymentSyncService): Response|RedirectResponse
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
                $paymentSyncService->syncByMidtransOrderId($midtransOrderId);
                $order->refresh();

                if ($order->payment_status === 'paid') {
                    return redirect()->route('checkout.success', ['order_id' => $order->id]);
                }
            }
        }

        $deeplinkUrl = null;
        if (! empty($order->payment_payload['actions']) && is_array($order->payment_payload['actions'])) {
            foreach ($order->payment_payload['actions'] as $action) {
                $act = (array) $action;
                if (in_array($act['name'] ?? '', ['deeplink-redirect', 'mobile-deeplink-redirect'], true)) {
                    $candidateUrl = (string) ($act['url'] ?? '');
                    if (preg_match('/^(https?:\/\/|gojek:\/\/|shopeeid:\/\/)/i', $candidateUrl)) {
                        $deeplinkUrl = $candidateUrl;
                    }
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
            'order' => (new PaymentOrderResource($order))->resolve(),
            'paymentInfo' => $paymentInfo,
            'isOnlinePaymentEnabled' => PlatformSetting::isEnabled('enable_online_payment', true),
        ]);
    }

    /**
     * Check payment status via AJAX with caching & sibling sync
     */
    public function checkStatus(Request $request, int|string $orderId, PaymentSyncService $paymentSyncService): JsonResponse
    {
        $order = Order::where('id', $orderId)
            ->where('user_id', auth()->id())
            ->firstOrFail();

        if ($order->payment_status === 'pending' && $order->payment_method !== 'cod') {
            $midtransOrderId = $order->parent_transaction_id ?? $order->payment_payload['order_id'] ?? $order->invoice_number;

            if ($midtransOrderId) {
                $paymentSyncService->syncByMidtransOrderId($midtransOrderId);
                $order->refresh();
            }
        }

        return response()->json([
            'order_id' => $order->id,
            'payment_status' => $order->payment_status,
            'is_paid' => $order->payment_status === 'paid',
            'redirect_url' => route('checkout.success', ['order_id' => $order->id]),
            'is_online_payment_enabled' => PlatformSetting::isEnabled('enable_online_payment', true),
        ]);
    }

    /**
     * Switch pending online order to Cash on Delivery (COD).
     * In multi-order checkouts (same parent_transaction_id), switches all pending orders in that checkout to COD.
     */
    public function switchToCod(Request $request, int|string $orderId, MidtransService $midtransService): RedirectResponse
    {
        return DB::transaction(function () use ($orderId, $midtransService) {
            $order = Order::where('id', $orderId)
                ->where('user_id', auth()->id())
                ->lockForUpdate()
                ->firstOrFail();

            if ($order->payment_status !== 'pending' || $order->payment_method === 'cod') {
                return redirect()->route('history.index');
            }

            $parentTransactionId = $order->parent_transaction_id;
            $midtransOrderId = $parentTransactionId ?? $order->payment_payload['order_id'] ?? $order->invoice_number;

            // Kumpulkan semua pesanan dalam checkout gabungan yang masih pending
            $relatedOrders = collect([$order]);
            if (! empty($parentTransactionId)) {
                $relatedOrders = Order::where('user_id', auth()->id())
                    ->where('parent_transaction_id', $parentTransactionId)
                    ->where('payment_status', 'pending')
                    ->where('shipping_status', 'pending')
                    ->lockForUpdate()
                    ->get();
            }

            if ($midtransOrderId) {
                try {
                    $midtransService->cancelTransaction($midtransOrderId);
                } catch (\Throwable $e) {
                    Log::warning("Gagal membatalkan transaksi Midtrans saat switch ke COD: {$midtransOrderId} - ".$e->getMessage());
                }
            }

            foreach ($relatedOrders as $targetOrder) {
                $targetOrder->update([
                    'payment_method' => 'cod',
                    'payment_channel' => 'cod',
                ]);
            }

            $message = count($relatedOrders) > 1
                ? 'Seluruh pesanan dalam transaksi ini berhasil dialihkan ke Bayar di Tempat (COD).'
                : 'Metode pembayaran berhasil dialihkan ke Bayar di Tempat (COD).';

            return redirect()->route('checkout.success', ['order_id' => $order->id])
                ->with('success', $message);
        });
    }
}

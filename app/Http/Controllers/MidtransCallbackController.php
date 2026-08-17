<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Services\MidtransService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class MidtransCallbackController extends Controller
{
    public function handle(Request $request, MidtransService $midtransService)
    {
        $notificationData = $request->all();

        Log::info('Midtrans Webhook Received', $notificationData);

        // Verify Midtrans SHA-512 Signature Key
        if (! $midtransService->verifySignatureKey($notificationData)) {
            Log::warning('Midtrans Webhook Invalid Signature Key', $notificationData);

            return response()->json(['message' => 'Invalid signature key'], 403);
        }

        $orderId = $notificationData['order_id'] ?? null;
        $transactionStatus = $notificationData['transaction_status'] ?? null;
        $fraudStatus = $notificationData['fraud_status'] ?? null;
        $incomingGross = (float) ($notificationData['gross_amount'] ?? 0);

        if (! $orderId) {
            return response()->json(['message' => 'Order ID is missing'], 400);
        }

        // Find all orders (single or multi-store split orders)
        $orders = Order::where('invoice_number', $orderId)
            ->orWhere('parent_transaction_id', $orderId)
            ->orWhereJsonContains('payment_payload->order_id', $orderId)
            ->get();

        if ($orders->isEmpty()) {
            Log::warning('Midtrans Webhook Order Not Found: '.$orderId);

            return response()->json(['message' => 'Order not found'], 404);
        }

        // Security Check: Validate Gross Amount vs Database Total Amount
        $expectedGross = (float) $orders->sum('total_amount');
        if (abs($incomingGross - $expectedGross) > 1.0) {
            Log::critical("SECURITY ALERT: Midtrans Gross Amount Mismatch! Expected: {$expectedGross}, Received: {$incomingGross} for Order ID: {$orderId}");

            return response()->json(['message' => 'Gross amount mismatch'], 400);
        }

        // Process Status Updates Atomically
        DB::transaction(function () use ($orders, $transactionStatus, $fraudStatus) {
            foreach ($orders as $order) {
                // Lock row
                $lockedOrder = Order::where('id', $order->id)->lockForUpdate()->first();
                if (! $lockedOrder) {
                    continue;
                }

                if ($transactionStatus === 'capture') {
                    if ($fraudStatus === 'accept' && $lockedOrder->payment_status !== 'paid') {
                        $lockedOrder->update(['payment_status' => 'paid']);
                        if ($lockedOrder->store) {
                            $lockedOrder->store->increment('pending_balance', $lockedOrder->total_amount);
                        }
                        \App\Services\OrderNotificationService::paymentReceived($lockedOrder);
                    }
                } elseif ($transactionStatus === 'settlement') {
                    if ($lockedOrder->payment_status !== 'paid') {
                        $lockedOrder->update(['payment_status' => 'paid']);
                        if ($lockedOrder->store) {
                            $lockedOrder->store->increment('pending_balance', $lockedOrder->total_amount);
                        }
                        \App\Services\OrderNotificationService::paymentReceived($lockedOrder);
                    }
                } elseif (in_array($transactionStatus, ['cancel', 'deny', 'expire'])) {
                    if ($lockedOrder->payment_status !== 'paid') {
                        $lockedOrder->update(['payment_status' => 'failed']);
                        // Idempotent and thread-safe stock restoration
                        $lockedOrder->restoreStock();
                        \App\Services\OrderNotificationService::orderCancelled($lockedOrder, 'Pembayaran tidak berhasil atau kadaluarsa');
                    }
                } elseif ($transactionStatus === 'pending') {
                    if ($lockedOrder->payment_status !== 'paid') {
                        $lockedOrder->update(['payment_status' => 'pending']);
                    }
                }
            }
        });

        return response()->json(['message' => 'Notification processed successfully']);
    }
}

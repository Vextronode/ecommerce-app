<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Services\MidtransService;
use App\Services\PaymentSyncService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class MidtransCallbackController extends Controller
{
    public function handle(Request $request, MidtransService $midtransService, PaymentSyncService $paymentSyncService): JsonResponse
    {
        $notificationData = $request->all();

        $logData = $notificationData;
        if (isset($logData['signature_key'])) {
            $logData['signature_key'] = substr((string) $logData['signature_key'], 0, 8) . '...[MASKED]';
        }

        Log::info('Midtrans Webhook Received', $logData);

        // Verify Midtrans SHA-512 Signature Key
        if (! $midtransService->verifySignatureKey($notificationData)) {
            Log::warning('Midtrans Webhook Invalid Signature Key', $logData);

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

        // Process Status Updates Atomically via PaymentSyncService
        foreach ($orders as $order) {
            $paymentSyncService->applyPaymentStatus($order->id, $transactionStatus, $fraudStatus);
        }

        return response()->json(['message' => 'Notification processed successfully']);
    }
}

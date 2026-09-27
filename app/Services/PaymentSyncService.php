<?php

namespace App\Services;

use App\Events\OrderStatusUpdated;
use App\Models\Order;
use App\Models\Store;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PaymentSyncService
{
    protected MidtransService $midtransService;

    public function __construct(MidtransService $midtransService)
    {
        $this->midtransService = $midtransService;
    }

    /**
     * Fetch status from Midtrans API and synchronize all related orders (including split store orders).
     */
    public function syncByMidtransOrderId(string $midtransOrderId): void
    {
        if (empty($midtransOrderId)) {
            return;
        }

        try {
            // Cache status check briefly (3 seconds) to prevent spamming Midtrans API
            $statusResp = Cache::remember("midtrans_status_{$midtransOrderId}", 3, function () use ($midtransOrderId) {
                return $this->midtransService->getTransactionStatus($midtransOrderId);
            });

            if (! $statusResp) {
                return;
            }

            $trxStatus = is_object($statusResp) ? ($statusResp->transaction_status ?? null) : ($statusResp['transaction_status'] ?? null);
            $fraudStatus = is_object($statusResp) ? ($statusResp->fraud_status ?? null) : ($statusResp['fraud_status'] ?? null);

            $orders = Order::where('parent_transaction_id', $midtransOrderId)
                ->orWhere('invoice_number', $midtransOrderId)
                ->orWhereJsonContains('payment_payload->order_id', $midtransOrderId)
                ->get();

            foreach ($orders as $order) {
                $this->applyPaymentStatus($order->id, $trxStatus, $fraudStatus);
            }
        } catch (\Throwable $e) {
            Log::warning("PaymentSyncService::syncByMidtransOrderId failed for {$midtransOrderId}: " . $e->getMessage());
        }
    }

    /**
     * Atomically apply payment status update and credit store escrow (pending_balance).
     */
    public function applyPaymentStatus(int $orderId, ?string $transactionStatus, ?string $fraudStatus = null): void
    {
        if (! $transactionStatus) {
            return;
        }

        DB::transaction(function () use ($orderId, $transactionStatus, $fraudStatus) {
            $lockedOrder = Order::where('id', $orderId)->lockForUpdate()->first();
            if (! $lockedOrder) {
                return;
            }

            $isPaidStatus = ($transactionStatus === 'settlement' || ($transactionStatus === 'capture' && $fraudStatus === 'accept'));

            if ($isPaidStatus) {
                if ($lockedOrder->payment_status !== 'paid') {
                    $lockedOrder->update(['payment_status' => 'paid']);

                    // Safely increment store escrow pending_balance
                    if ($lockedOrder->store_id) {
                        $store = Store::where('id', $lockedOrder->store_id)->lockForUpdate()->first();
                        if ($store) {
                            $store->increment('pending_balance', $lockedOrder->total_amount);
                            Log::info("Escrow Credited: Added Rp {$lockedOrder->total_amount} to pending_balance for Store #{$store->id} (Order #{$lockedOrder->invoice_number})");
                        }
                    }

                    OrderNotificationService::paymentReceived($lockedOrder);

                    try {
                        broadcast(new OrderStatusUpdated($lockedOrder))->toOthers();
                    } catch (\Throwable $e) {
                        Log::warning('OrderStatusUpdated broadcast error in PaymentSyncService: ' . $e->getMessage());
                    }
                }
            } elseif (in_array($transactionStatus, ['cancel', 'deny', 'expire'])) {
                if ($lockedOrder->payment_status !== 'paid') {
                    $lockedOrder->update(['payment_status' => 'failed']);
                    $lockedOrder->restoreStock();

                    OrderNotificationService::orderCancelled($lockedOrder, 'Pembayaran kadaluarsa atau dibatalkan');

                    try {
                        broadcast(new OrderStatusUpdated($lockedOrder))->toOthers();
                    } catch (\Throwable $e) {
                        Log::warning('OrderStatusUpdated broadcast error in PaymentSyncService: ' . $e->getMessage());
                    }
                }
            } elseif ($transactionStatus === 'pending') {
                if ($lockedOrder->payment_status !== 'paid') {
                    $lockedOrder->update(['payment_status' => 'pending']);
                }
            }
        });
    }
}


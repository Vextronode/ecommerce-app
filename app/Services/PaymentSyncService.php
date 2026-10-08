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
                if (! in_array($lockedOrder->payment_status, ['paid', 'refunded'], true)) {
                    $wasCancelled = $lockedOrder->shipping_status === 'cancelled';
                    $shouldCreditEscrow = $lockedOrder->store_id && $lockedOrder->escrow_credited_at === null;

                    $updateFields = ['payment_status' => 'paid'];
                    if ($wasCancelled) {
                        $updateFields['shipping_status'] = 'pending';
                    }

                    // escrow_credited_at ga masuk fillable, jadi set lewat forceFill biar webhook retry idempoten
                    if ($shouldCreditEscrow) {
                        $updateFields['escrow_credited_at'] = now();
                        $lockedOrder->forceFill($updateFields)->save();
                    } else {
                        $lockedOrder->update($updateFields);
                    }

                    if ($wasCancelled && $lockedOrder->stock_restored_at !== null) {
                        $lockedOrder->deductRestoredStock();
                    }

                    if ($shouldCreditEscrow) {
                        $store = Store::where('id', $lockedOrder->store_id)->lockForUpdate()->first();
                        if ($store) {
                            $netAmount = $lockedOrder->merchantNetAmount();
                            $store->increment('pending_balance', $netAmount);
                            Log::info("Escrow Credited: Added Rp {$netAmount} to pending_balance for Store #{$store->id} (Order #{$lockedOrder->invoice_number})");
                        }
                    }

                    OrderNotificationService::paymentReceived($lockedOrder);

                    try {
                        broadcast(new OrderStatusUpdated($lockedOrder))->toOthers();
                    } catch (\Throwable $e) {
                        Log::warning('OrderStatusUpdated broadcast error in PaymentSyncService: ' . $e->getMessage());
                    }
                }
            } elseif (in_array($transactionStatus, ['refund', 'partial_refund'], true)) {
                if ($lockedOrder->payment_status !== 'refunded') {
                    $wasPaid = $lockedOrder->payment_status === 'paid';
                    $isFullRefund = $transactionStatus === 'refund';
                    $wasDelivered = $lockedOrder->balance_credited_at !== null;

                    $updateFields = ['payment_status' => 'refunded'];
                    // partial refund ga batalin seluruh order
                    if ($isFullRefund) {
                        $updateFields['shipping_status'] = 'cancelled';
                    }
                    $lockedOrder->update($updateFields);

                    if ($wasPaid) {
                        // tarik balik dari escrow kalau belum dipindah, atau dari available kalau udah delivered
                        if (! $lockedOrder->reversePendingBalance()) {
                            $lockedOrder->reverseCreditedBalance();
                        }
                    }

                    // stok cuma dibalikin kalau full refund & order belum delivered
                    if ($isFullRefund && ! $wasDelivered) {
                        $lockedOrder->restoreStock();
                    }
                }
            } elseif (in_array($transactionStatus, ['cancel', 'deny', 'expire'], true)) {
                if (! in_array($lockedOrder->payment_status, ['paid', 'refunded', 'failed'], true)) {
                    $updateFields = ['payment_status' => 'failed'];
                    if ($lockedOrder->shipping_status === 'pending') {
                        $updateFields['shipping_status'] = 'cancelled';
                    }
                    $lockedOrder->update($updateFields);
                    $lockedOrder->restoreStock();

                    OrderNotificationService::orderCancelled($lockedOrder, 'Pembayaran kadaluarsa atau dibatalkan');

                    try {
                        broadcast(new OrderStatusUpdated($lockedOrder))->toOthers();
                    } catch (\Throwable $e) {
                        Log::warning('OrderStatusUpdated broadcast error in PaymentSyncService: ' . $e->getMessage());
                    }
                }
            } elseif ($transactionStatus === 'pending') {
                if (! in_array($lockedOrder->payment_status, ['paid', 'refunded', 'failed'], true) && $lockedOrder->shipping_status !== 'cancelled') {
                    $lockedOrder->update(['payment_status' => 'pending']);
                }
            }
        });
    }
}


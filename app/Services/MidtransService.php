<?php

namespace App\Services;

use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use Midtrans\Config;
use Midtrans\CoreApi;
use Midtrans\Transaction;

class MidtransService
{
    public function __construct()
    {
        Config::$serverKey = config('services.midtrans.server_key');
        Config::$clientKey = config('services.midtrans.client_key');
        Config::$isProduction = config('services.midtrans.is_production', false);
        Config::$isSanitized = config('services.midtrans.is_sanitized', true);
        Config::$is3ds = config('services.midtrans.is_3ds', true);
    }

    /**
     * Charge transaction via Midtrans Core API
     */
    public function chargeCoreApi(
        array $orders,
        string $paymentChannel,
        string $customerName,
        string $customerPhone,
        ?string $customerEmail = null
    ): array {
        $transactionId = count($orders) === 1
            ? $orders[0]->invoice_number
            : 'TRX-'.date('YmdHis').'-'.strtoupper(\Illuminate\Support\Str::random(6));

        $itemDetails = $this->buildItemDetails($orders);
        $grossAmount = array_sum(array_map(fn ($item) => $item['price'] * $item['quantity'], $itemDetails));

        $basePayload = [
            'transaction_details' => [
                'order_id' => $transactionId,
                'gross_amount' => (int) $grossAmount,
            ],
            'item_details' => $itemDetails,
            'customer_details' => [
                'first_name' => $customerName,
                'phone' => $customerPhone,
                'email' => $customerEmail ?? auth()->user()?->email ?? 'customer@cibendamart.id',
            ],
        ];

        $channelPayload = $this->buildChannelPayload($paymentChannel, $transactionId);
        $fullPayload = array_merge($basePayload, $channelPayload);

        Log::info("Midtrans Core API Charge Request for {$transactionId}", [
            'channel' => $paymentChannel,
            'gross_amount' => (int) $grossAmount,
            'items_count' => count($itemDetails),
        ]);

        $response = CoreApi::charge($fullPayload);
        $respArr = (array) $response;

        Log::info("Midtrans Core API Charge Response for {$transactionId}", [
            'status_code' => $respArr['status_code'] ?? null,
            'transaction_status' => $respArr['transaction_status'] ?? null,
            'payment_type' => $respArr['payment_type'] ?? null,
        ]);

        return $this->parseChargeResponse($response, $paymentChannel);
    }

    /**
     * Build item details array including shipping and fee discrepancies
     */
    private function buildItemDetails(array $orders): array
    {
        $itemDetails = [];
        $grossAmount = 0;

        foreach ($orders as $order) {
            $grossAmount += (int) $order->total_amount;

            foreach ($order->items as $item) {
                $itemDetails[] = [
                    'id' => 'ITEM-'.$item->id,
                    'price' => (int) $item->price,
                    'quantity' => (int) $item->quantity,
                    'name' => mb_strimwidth($item->product_name.($item->variant_name ? " ({$item->variant_name})" : ''), 0, 45, '...'),
                ];
            }

            if ($order->shipping_cost > 0) {
                $storeName = $order->store ? $order->store->name : 'Toko';
                $itemDetails[] = [
                    'id' => 'SHIP-'.$order->id,
                    'price' => (int) $order->shipping_cost,
                    'quantity' => 1,
                    'name' => mb_strimwidth('Ongkir ('.$storeName.')', 0, 45, '...'),
                ];
            }
        }

        $itemsSum = array_sum(array_map(fn ($item) => $item['price'] * $item['quantity'], $itemDetails));
        if ($grossAmount > $itemsSum) {
            $itemDetails[] = [
                'id' => 'ADMIN-FEE',
                'price' => (int) ($grossAmount - $itemsSum),
                'quantity' => 1,
                'name' => 'Biaya Layanan',
            ];
        }

        return $itemDetails;
    }

    /**
     * Build payment channel specific payloads
     */
    private function buildChannelPayload(string $channel, string $transactionId): array
    {
        return match ($channel) {
            'bca_va' => [
                'payment_type' => 'bank_transfer',
                'bank_transfer' => [
                    'bank' => 'bca',
                ],
            ],
            'bni_va' => [
                'payment_type' => 'bank_transfer',
                'bank_transfer' => [
                    'bank' => 'bni',
                ],
            ],
            'bri_va' => [
                'payment_type' => 'bank_transfer',
                'bank_transfer' => [
                    'bank' => 'bri',
                ],
            ],
            'permata_va' => [
                'payment_type' => 'bank_transfer',
                'bank_transfer' => [
                    'bank' => 'permata',
                ],
            ],
            'mandiri_bill' => [
                'payment_type' => 'echannel',
                'echannel' => [
                    'bill_info1' => 'Pembayaran Belanja:',
                    'bill_info2' => 'Pesanan '.mb_strimwidth($transactionId, 0, 10, ''),
                ],
            ],
            'qris' => [
                'payment_type' => 'qris',
                'qris' => [
                    'acquirer' => 'gopay',
                ],
            ],
            'gopay' => [
                'payment_type' => 'gopay',
                'gopay' => [
                    'enable_callback' => true,
                    'callback_url' => url('/checkout/success'),
                ],
            ],
            default => [
                'payment_type' => 'qris',
            ],
        };
    }

    /**
     * Parse Core API response into a standardized clean structure
     */
    private function parseChargeResponse(object|array $response, string $paymentChannel): array
    {
        $resp = (array) $response;

        $statusCode = $resp['status_code'] ?? '500';
        $transactionStatus = $resp['transaction_status'] ?? 'pending';
        $paymentType = $resp['payment_type'] ?? 'bank_transfer';
        $transactionId = $resp['transaction_id'] ?? null;
        $orderId = $resp['order_id'] ?? null;

        $vaNumber = null;
        $billKey = null;
        $billerCode = null;
        $qrCodeUrl = null;
        $deeplinkUrl = null;

        // Virtual Account (BCA, BNI, BRI)
        if (! empty($resp['va_numbers']) && is_array($resp['va_numbers'])) {
            $vaObj = (array) $resp['va_numbers'][0];
            $vaNumber = $vaObj['va_number'] ?? null;
        }

        //  Permata VA
        if (empty($vaNumber) && ! empty($resp['permata_va_number'])) {
            $vaNumber = $resp['permata_va_number'];
        }

        //  Mandiri Bill (echannel)
        if (! empty($resp['bill_key'])) {
            $billKey = $resp['bill_key'];
            $billerCode = $resp['biller_code'] ?? '70012';
        }

        //  QRIS & GoPay Actions (QR Code URL & Deeplink)
        if (! empty($resp['actions']) && is_array($resp['actions'])) {
            foreach ($resp['actions'] as $action) {
                $act = (array) $action;
                $actionName = $act['name'] ?? '';
                $actionUrl = $act['url'] ?? '';

                if ($actionName === 'generate-qr-code') {
                    $qrCodeUrl = $actionUrl;
                } elseif (in_array($actionName, ['deeplink-redirect', 'mobile-deeplink-redirect'])) {
                    $deeplinkUrl = $actionUrl;
                }
            }
        }

        // Fallback for QR Code URL if returned directly
        if (empty($qrCodeUrl) && ! empty($resp['qr_string'])) {
            // Use QR code generator API URL if raw qr_string is given
            $qrCodeUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data='.urlencode($resp['qr_string']);
        }

        //  Expiry Time
        $expiryTime = null;
        if (! empty($resp['expiry_time'])) {
            try {
                $expiryTime = Carbon::parse($resp['expiry_time']);
            } catch (\Exception $e) {
                $expiryTime = now()->addHours(24);
            }
        } else {
            $expiryTime = now()->addHours(24);
        }

        return [
            'status_code' => $statusCode,
            'transaction_status' => $transactionStatus,
            'payment_type' => $paymentType,
            'payment_channel' => $paymentChannel,
            'order_id' => $orderId,
            'transaction_id' => $transactionId,
            'va_number' => $vaNumber,
            'bill_key' => $billKey,
            'biller_code' => $billerCode,
            'qr_code_url' => $qrCodeUrl,
            'deeplink_url' => $deeplinkUrl,
            'expiry_time' => $expiryTime,
            'raw_payload' => $resp,
        ];
    }

    /**
     * Verify Signature Key from Midtrans Webhook Notification
     */
    public function verifySignatureKey(array $notificationData): bool
    {
        $orderId = (string) ($notificationData['order_id'] ?? '');
        $statusCode = (string) ($notificationData['status_code'] ?? '');
        $grossAmount = (string) ($notificationData['gross_amount'] ?? '');
        $serverKey = (string) config('services.midtrans.server_key', '');
        $inputSignature = (string) ($notificationData['signature_key'] ?? '');

        if ($serverKey === '' || $inputSignature === '' || $orderId === '') {
            return false;
        }

        $calculatedSignature = hash('sha512', $orderId.$statusCode.$grossAmount.$serverKey);

        return hash_equals($calculatedSignature, $inputSignature);
    }

    /**
     * Fetch real-time transaction status from Midtrans API
     */
    public function getTransactionStatus(string $orderId)
    {
        try {
            return Transaction::status($orderId);
        } catch (\Exception $e) {
            Log::warning("Midtrans getTransactionStatus error for {$orderId}: ".$e->getMessage());

            return null;
        }
    }

    /**
     * Cancel transaction on Midtrans
     */
    public function cancelTransaction(string $orderId)
    {
        try {
            return Transaction::cancel($orderId);
        } catch (\Exception $e) {
            Log::warning("Midtrans cancelTransaction error for {$orderId}: ".$e->getMessage());

            return null;
        }
    }

    /**
     * buat pengembalian dana ke pembeli lewat gateway.
     * dipakai saat merchant membatalkan order non-COD yang sudah dibayar, supaya
     * status internal 'refunded' selalu diikuti dana riil yang benar-benar kembali.
     * kembalikan null bila gateway tidak menjawab supaya pemanggil bisa menandai
     * order butuh rekonsiliasi daripada menipu buku keuangan.
     */
    public function refundTransaction(string $orderId, ?float $amount = null, string $reason = 'Pembatalan pesanan oleh penjual')
    {
        $params = $amount !== null
            ? ['refund_key' => 'REFUND-'.$orderId.'-'.now()->timestamp, 'amount' => (int) round($amount), 'reason' => $reason]
            : ['refund_key' => 'REFUND-'.$orderId.'-'.now()->timestamp, 'reason' => $reason];

        try {
            return Transaction::refund($orderId, $params);
        } catch (\Exception $e) {
            Log::warning("Midtrans refundTransaction error for {$orderId}: ".$e->getMessage());

            return null;
        }
    }
}

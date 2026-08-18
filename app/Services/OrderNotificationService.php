<?php

namespace App\Services;

use App\Models\Order;
use App\Notifications\PushNotification;
use Illuminate\Support\Facades\Log;

class OrderNotificationService
{
    /**
     * Notify buyer and seller when an order is created.
     */
    public static function orderCreated(Order $order): void
    {
        try {
            $order->loadMissing(['user', 'store.user']);

            // 1. Notify Buyer (Menunggu Pembayaran / Pesanan Masuk)
            if ($order->user) {
                $userSettings = $order->user->notification_settings ?? [];
                $isAllowed = $userSettings['menunggu_pembayaran'] ?? true;

                if ($isAllowed) {
                    $title = $order->payment_method === 'cod'
                        ? 'Pesanan COD Dibuat'
                        : 'Menunggu Pembayaran';
                    $message = "Pesanan #{$order->invoice_number} sebesar Rp" . number_format($order->total_amount, 0, ',', '.') . " telah berhasil dibuat.";
                    $actionUrl = $order->payment_method === 'cod'
                        ? route('history.show', $order->id, false)
                        : route('payment.show', $order->id, false);

                    $order->user->notify(new PushNotification($title, $message, 'order', $actionUrl));
                }
            }

            // 2. Notify Store Owner via In-App Bell & Web Push (Pesanan Baru Masuk)
            $storeOwner = $order->store?->user;
            if ($storeOwner) {
                $title = 'Pesanan Baru Masuk!';
                $message = "Toko {$order->store->name} menerima pesanan baru #{$order->invoice_number} dari {$order->customer_name}.";
                $actionUrl = '/pedagang/orders';

                $storeOwner->notify(new PushNotification($title, $message, 'order', $actionUrl));
            }

            // 3. Send Email Notification to Store Owner (Laravel Mailable)
            $storeEmail = $order->store?->support_email ?: $storeOwner?->email;
            if ($storeEmail) {
                try {
                    \Illuminate\Support\Facades\Mail::to($storeEmail)->send(new \App\Mail\NewOrderMerchantMail($order));
                } catch (\Throwable $mailEx) {
                    Log::warning('OrderNotificationService: Failed to send merchant email: ' . $mailEx->getMessage());
                }
            }
        } catch (\Throwable $e) {
            Log::error('OrderNotificationService::orderCreated error: ' . $e->getMessage());
        }
    }

    /**
     * Notify buyer and seller when payment is confirmed/paid.
     */
    public static function paymentReceived(Order $order): void
    {
        try {
            $order->loadMissing(['user', 'store.user']);

            // 1. Notify Buyer (Menunggu Konfirmasi)
            if ($order->user) {
                $userSettings = $order->user->notification_settings ?? [];
                $isAllowed = $userSettings['menunggu_konfirmasi'] ?? true;

                if ($isAllowed) {
                    $title = 'Pembayaran Diterima!';
                    $message = "Pembayaran untuk pesanan #{$order->invoice_number} berhasil diverifikasi. Toko akan segera menyiapkan pesanan Anda.";
                    $actionUrl = route('history.show', $order->id, false);

                    $order->user->notify(new PushNotification($title, $message, 'payment', $actionUrl));
                }
            }

            // 2. Notify Store Owner
            $storeOwner = $order->store?->user;
            if ($storeOwner) {
                $title = 'Pembayaran Pesanan Terverifikasi!';
                $message = "Pesanan #{$order->invoice_number} telah dibayar lunas. Silakan proses dan kemas produk.";
                $actionUrl = '/pedagang/orders';

                $storeOwner->notify(new PushNotification($title, $message, 'order', $actionUrl));
            }
        } catch (\Throwable $e) {
            Log::error('OrderNotificationService::paymentReceived error: ' . $e->getMessage());
        }
    }

    /**
     * Notify buyer when merchant changes status to 'processing'.
     */
    public static function orderProcessing(Order $order): void
    {
        try {
            $order->loadMissing(['user', 'store']);

            if ($order->user) {
                $userSettings = $order->user->notification_settings ?? [];
                $isAllowed = $userSettings['pesanan_diproses'] ?? true;

                if ($isAllowed) {
                    $title = 'Pesanan Sedang Diproses';
                    $storeName = $order->store?->name ?? 'Penjual';
                    $message = "{$storeName} sedang menyiapkan dan mengemas pesanan Anda #{$order->invoice_number}.";
                    $actionUrl = route('history.show', $order->id, false);

                    $order->user->notify(new PushNotification($title, $message, 'order', $actionUrl));
                }
            }
        } catch (\Throwable $e) {
            Log::error('OrderNotificationService::orderProcessing error: ' . $e->getMessage());
        }
    }

    /**
     * Notify buyer when status changes to 'shipped'.
     */
    public static function orderShipped(Order $order): void
    {
        try {
            $order->loadMissing(['user', 'store']);

            if ($order->user) {
                $userSettings = $order->user->notification_settings ?? [];
                $isAllowed = $userSettings['pesanan_dikirim'] ?? true;

                if ($isAllowed) {
                    $title = 'Pesanan Sedang Dikirim!';
                    $pinText = !empty($order->shipping_pin) ? " PIN Serah Terima: {$order->shipping_pin}." : "";
                    $message = "Pesanan #{$order->invoice_number} sedang diantar ke alamat Anda.{$pinText}";
                    $actionUrl = $order->delivery_method === 'local_delivery'
                        ? route('tracker.show', $order->invoice_number, false)
                        : route('history.show', $order->id, false);

                    $order->user->notify(new PushNotification($title, $message, 'order', $actionUrl));
                }
            }
        } catch (\Throwable $e) {
            Log::error('OrderNotificationService::orderShipped error: ' . $e->getMessage());
        }
    }

    /**
     * Notify buyer when status changes to 'delivered'.
     */
    public static function orderDelivered(Order $order): void
    {
        try {
            $order->loadMissing(['user', 'store', 'items']);

            if ($order->user) {
                $userSettings = $order->user->notification_settings ?? [];
                $isAllowed = $userSettings['pesanan_selesai'] ?? true;

                if ($isAllowed) {
                    $title = 'Pesanan Selesai / Telah Tiba';
                    $message = "Pesanan #{$order->invoice_number} telah sampai di tujuan. Yuk, berikan penilaian untuk membantu UMKM!";
                    $actionUrl = route('history.index', ['status' => 'rating'], false);

                    $order->user->notify(new PushNotification($title, $message, 'order', $actionUrl));
                }
            }
        } catch (\Throwable $e) {
            Log::error('OrderNotificationService::orderDelivered error: ' . $e->getMessage());
        }
    }

    /**
     * Notify buyer when order is cancelled.
     */
    public static function orderCancelled(Order $order, string $reason = ''): void
    {
        try {
            $order->loadMissing(['user', 'store']);

            if ($order->user) {
                $title = 'Pesanan Dibatalkan';
                $reasonText = $reason ? " Alasan: {$reason}." : "";
                $message = "Pesanan #{$order->invoice_number} telah dibatalkan.{$reasonText}";
                $actionUrl = route('history.show', $order->id, false);

                $order->user->notify(new PushNotification($title, $message, 'order', $actionUrl));
            }
        } catch (\Throwable $e) {
            Log::error('OrderNotificationService::orderCancelled error: ' . $e->getMessage());
        }
    }
}

<?php

use App\Jobs\SyncSidSellerApplicationsJob;
use App\Models\ChatNegotiation;
use App\Models\Order;
use App\Models\PlatformSetting;
use Illuminate\Console\Command;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    /** @var Command $this */
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Auto-Prune: Hapus notifikasi lama (> 60 hari) secara otomatis agar database tetap bersih & ringan
Schedule::call(function () {
    DB::table('notifications')
        ->where('created_at', '<', now()->subDays(60))
        ->delete();
})->daily()->name('prune-old-notifications')->withoutOverlapping()->onOneServer();

// Auto-Complete: Selesaikan pesanan kurir lokal non-COD yang sudah dibayar & dikirim > 4 jam jika belum dikonfirmasi (Shopee-style, ORD-03)
Schedule::call(function () {
    Order::where('shipping_status', 'shipped')
        ->where('delivery_method', 'local_delivery')
        ->where('payment_method', '!=', 'cod')
        ->where('payment_status', 'paid')
        ->where(function ($q) {
            $q->where('shipped_at', '<=', now()->subHours(4))
                ->orWhere(function ($fallback) {
                    $fallback->whereNull('shipped_at')
                        ->where('updated_at', '<=', now()->subHours(4));
                });
        })
        ->chunk(50, function ($orders) {
            foreach ($orders as $order) {
                $order->autoCompleteDelivery();
            }
        });
})->everyFifteenMinutes()->name('auto-complete-shipped-orders')->withoutOverlapping()->onOneServer();

// Rekonsiliasi: cek withdrawal nyangkut processing ke Midtrans IRIS & benerin statusnya otomatis
Schedule::command('withdrawals:reconcile')
    ->everyFifteenMinutes()
    ->withoutOverlapping()
    ->onOneServer()
    ->name('reconcile-withdrawals');

// Alert: kabarin admin kalau ada withdrawal nyangkut processing lebih dari 30 menit
Schedule::command('withdrawals:alert-stuck --threshold=30')
    ->everyFifteenMinutes()
    ->withoutOverlapping()
    ->onOneServer()
    ->name('alert-stuck-withdrawals');

// Auto-Expire: Ubah status tawaran negosiasi yang melewati batas waktu kedaluwarsa menjadi 'expired' (NEG-01)
Schedule::call(function () {
    ChatNegotiation::whereIn('status', ['pending', 'countered'])
        ->whereNotNull('expires_at')
        ->where('expires_at', '<=', now())
        ->update(['status' => 'expired']);
})->everyFifteenMinutes()->name('expire-abandoned-negotiations')->withoutOverlapping()->onOneServer();

// Sinkronisasi otomatis permohonan pedagang dari SIDUTama (SID, SID-01)
Schedule::job(new SyncSidSellerApplicationsJob)
    ->everyTwoMinutes()
    ->when(fn () => PlatformSetting::isEnabled('enable_sid_sync', true))
    ->withoutOverlapping()
    ->onOneServer()
    ->name('sync-sid-seller-applications');

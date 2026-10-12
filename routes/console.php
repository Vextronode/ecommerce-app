<?php

use Illuminate\Console\Command;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    /** @var Command $this */
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Auto-Prune: Hapus notifikasi lama (> 60 hari) secara otomatis agar database tetap bersih & ringan
\Illuminate\Support\Facades\Schedule::call(function () {
    \Illuminate\Support\Facades\DB::table('notifications')
        ->where('created_at', '<', now()->subDays(60))
        ->delete();
})->daily()->name('prune-old-notifications')->withoutOverlapping()->onOneServer();

// Auto-Complete: Selesaikan pesanan kurir lokal non-COD yang sudah dibayar & dikirim > 4 jam jika belum dikonfirmasi (Shopee-style)
\Illuminate\Support\Facades\Schedule::call(function () {
    \App\Models\Order::where('shipping_status', 'shipped')
        ->where('delivery_method', 'local_delivery')
        ->where('payment_method', '!=', 'cod')
        ->where('payment_status', 'paid')
        ->where('updated_at', '<=', now()->subHours(4))
        ->chunk(50, function ($orders) {
            foreach ($orders as $order) {
                $order->autoCompleteDelivery();
            }
        });
})->everyFifteenMinutes()->name('auto-complete-shipped-orders')->withoutOverlapping()->onOneServer();

// Rekonsiliasi: cek withdrawal nyangkut processing ke Midtrans IRIS & benerin statusnya otomatis
\Illuminate\Support\Facades\Schedule::command('withdrawals:reconcile')
    ->everyFifteenMinutes()
    ->withoutOverlapping()
    ->onOneServer()
    ->name('reconcile-withdrawals');

// Alert: kabarin admin kalau ada withdrawal nyangkut processing lebih dari 30 menit
\Illuminate\Support\Facades\Schedule::command('withdrawals:alert-stuck --threshold=30')
    ->everyFifteenMinutes()
    ->withoutOverlapping()
    ->onOneServer()
    ->name('alert-stuck-withdrawals');


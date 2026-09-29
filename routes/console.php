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
})->daily()->name('prune-old-notifications');

// Auto-Complete: Selesaikan pesanan dikirim yang sudah > 4 jam jika pembeli/kurir belum konfirmasi PIN (Shopee-style)
\Illuminate\Support\Facades\Schedule::call(function () {
    \App\Models\Order::where('shipping_status', 'shipped')
        ->where('updated_at', '<=', now()->subHours(4))
        ->chunk(50, function ($orders) {
            foreach ($orders as $order) {
                $order->autoCompleteDelivery();
            }
        });
})->everyFifteenMinutes()->name('auto-complete-shipped-orders');


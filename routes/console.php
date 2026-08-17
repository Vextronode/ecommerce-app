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

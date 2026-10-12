<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * index pendukung query pelaporan dan dashboard.
     * pola query utama: filter store_id + shipping_status + rentang created_at,
     * dan pencarian order milik pembeli (user_id).
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // composite utama untuk dashboard pedagang, analytics, dan laporan penjualan
            $table->index(['store_id', 'shipping_status', 'created_at'], 'orders_store_status_created_idx');

            // daftar riwayat pembeli dan hitung pelanggan unik
            $table->index(['user_id', 'created_at'], 'orders_user_created_idx');

            // filter status pembayaran di laporan dan rekonsiliasi
            $table->index('payment_status', 'orders_payment_status_idx');

            // scheduler auto-complete memfilter shipping_status + rentang updated_at
            $table->index(['shipping_status', 'updated_at'], 'orders_status_updated_idx');
        });

        Schema::table('withdrawals', function (Blueprint $table) {
            // listing riwayat dan rekonsiliasi penarikan nyangkut
            $table->index(['store_id', 'status'], 'withdrawals_store_status_idx');

            // rekonsiliasi dan alert menyaring status + payout_sent_at
            $table->index(['status', 'payout_sent_at'], 'withdrawals_status_payout_sent_idx');
        });

        Schema::table('notifications', function (Blueprint $table) {
            // prune notifikasi lama yang berjalan tiap hari
            $table->index('created_at', 'notifications_created_at_idx');
        });

        Schema::table('products', function (Blueprint $table) {
            // listing katalog toko dengan filter produk aktif
            $table->index(['store_id', 'is_active'], 'products_store_active_idx');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex('orders_store_status_created_idx');
            $table->dropIndex('orders_user_created_idx');
            $table->dropIndex('orders_payment_status_idx');
            $table->dropIndex('orders_status_updated_idx');
        });

        Schema::table('withdrawals', function (Blueprint $table) {
            $table->dropIndex('withdrawals_store_status_idx');
            $table->dropIndex('withdrawals_status_payout_sent_idx');
        });

        Schema::table('notifications', function (Blueprint $table) {
            $table->dropIndex('notifications_created_at_idx');
        });

        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex('products_store_active_idx');
        });
    }
};

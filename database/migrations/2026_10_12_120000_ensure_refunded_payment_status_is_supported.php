<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * nilai 'refunded' ditulis kode di dua jalur (webhook refund PaymentSyncService dan
     * cancel order paid non-COD di Merchant/OrderController). migrasi 2026_07_22 hanya
     * melonggarkan kolom ke varchar untuk driver mysql, sehingga instalasi yang belum
     * menjalankannya (dan skema enum mysql) menolak 'refunded'. migrasi ini memastikan
     * kolom bertipe varchar lintas driver supaya nilai refunded sah.
     */
    public function up(): void
    {
        if (Schema::hasColumn('orders', 'payment_status') && DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE orders MODIFY COLUMN payment_status VARCHAR(50) NOT NULL DEFAULT 'pending'");
        }
    }

    public function down(): void
    {
        // tidak dikembalikan ke enum: menyempitkan kolom berisiko memotong data refunded yang sudah ada
    }
};

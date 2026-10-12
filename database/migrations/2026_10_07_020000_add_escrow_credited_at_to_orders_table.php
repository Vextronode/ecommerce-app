<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * nambah escrow_credited_at buat misahin penanda saldo escrow (pending_balance)
     * dari balance_credited_at yang dipakai saat pindah ke available_balance
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->timestamp('escrow_credited_at')->nullable()->after('balance_credited_at');
        });

        // order lama yang udah credit escrow dianggap escrow_credited_at-nya terisi.
        // order paid yang belum dipindah ke available (balance_credited_at null) juga escrow-nya udah masuk pending_balance
        \Illuminate\Support\Facades\DB::table('orders')
            ->whereNotNull('balance_credited_at')
            ->update(['escrow_credited_at' => \Illuminate\Support\Facades\DB::raw('balance_credited_at')]);

        \Illuminate\Support\Facades\DB::table('orders')
            ->whereNull('escrow_credited_at')
            ->whereIn('payment_status', ['paid', 'settlement'])
            ->whereNotNull('store_id')
            ->whereNull('balance_credited_at')
            ->update(['escrow_credited_at' => \Illuminate\Support\Facades\DB::raw('updated_at')]);
    }

    /**
     * hapus kolom escrow_credited_at kalau di-rollback
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn('escrow_credited_at');
        });
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * nambah payout_sent_at buat nandain kapan request payout dikirim ke gateway
     * supaya retry job ga nembak payout dobel
     */
    public function up(): void
    {
        Schema::table('withdrawals', function (Blueprint $table) {
            $table->timestamp('payout_sent_at')->nullable()->after('status');
        });
    }

    /**
     * hapus kolom payout_sent_at kalau di-rollback
     */
    public function down(): void
    {
        Schema::table('withdrawals', function (Blueprint $table) {
            $table->dropColumn('payout_sent_at');
        });
    }
};

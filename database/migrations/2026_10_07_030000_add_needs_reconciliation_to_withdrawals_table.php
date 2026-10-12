<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('withdrawals', function (Blueprint $table) {
            // nandain withdrawal yang butuh dicek manual ke gateway, karena status akhirnya ambigu
            // (payout mungkin udah terkirim walau kita tandai failed / masih processing)
            $table->boolean('needs_reconciliation')->default(false)->after('payout_sent_at')->index();
        });
    }

    public function down(): void
    {
        Schema::table('withdrawals', function (Blueprint $table) {
            $table->dropColumn('needs_reconciliation');
        });
    }
};

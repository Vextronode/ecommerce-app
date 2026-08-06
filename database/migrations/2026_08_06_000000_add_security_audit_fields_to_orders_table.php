<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->timestamp('balance_credited_at')->nullable()->after('payment_status');
            $table->timestamp('stock_restored_at')->nullable()->after('balance_credited_at');
            $table->string('parent_transaction_id')->nullable()->index()->after('invoice_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'balance_credited_at',
                'stock_restored_at',
                'parent_transaction_id',
            ]);
        });
    }
};

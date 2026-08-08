<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('payment_type')->nullable()->after('payment_method');
            $table->string('payment_channel')->nullable()->after('payment_type');
            $table->string('va_number')->nullable()->after('payment_channel');
            $table->string('bill_key')->nullable()->after('va_number');
            $table->string('biller_code')->nullable()->after('bill_key');
            $table->text('qr_code_url')->nullable()->after('biller_code');
            $table->timestamp('payment_expiry_time')->nullable()->after('qr_code_url');
            $table->json('payment_payload')->nullable()->after('payment_expiry_time');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'payment_type',
                'payment_channel',
                'va_number',
                'bill_key',
                'biller_code',
                'qr_code_url',
                'payment_expiry_time',
                'payment_payload',
            ]);
        });
    }
};

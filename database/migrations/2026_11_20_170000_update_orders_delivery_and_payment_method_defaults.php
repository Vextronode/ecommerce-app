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
            // Standarisasi nilai default delivery_method dan payment_method ke format standar aplikasi (CHK-03)
            $table->string('delivery_method')->default('local_delivery')->change();
            $table->string('payment_method')->default('cod')->change();

            // Standarisasi tipe kolom payment_status lintas driver database (CHK-04)
            $table->string('payment_status', 50)->default('pending')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('delivery_method')->default('Standard')->change();
            $table->string('payment_method')->default('COD')->change();
        });
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();

            // 👇 Wajib ada biar ketahuan ini pesanan toko siapa dan siapa yang beli
            $table->foreignId('store_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('invoice_number')->unique();

            // Info Customer & Pengiriman
            $table->string('customer_name'); // Gua ganti dari shipping_name biar lebih umum
            $table->string('customer_phone');
            $table->text('shipping_address');
            $table->string('delivery_method')->default('Standard');

            // Info Harga
            $table->decimal('subtotal', 12, 2)->default(0);
            $table->decimal('shipping_cost', 12, 2)->default(0);
            $table->decimal('total_amount', 12, 2);

            // Status Pembayaran & Pengiriman (Dipisah biar manajemen status di Dashboard lebih gampang)
            $table->string('payment_method')->default('COD');
            $table->enum('payment_status', ['pending', 'paid', 'failed'])->default('pending');
            $table->enum('shipping_status', ['pending', 'processing', 'shipped', 'delivered', 'cancelled'])->default('pending');

            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};

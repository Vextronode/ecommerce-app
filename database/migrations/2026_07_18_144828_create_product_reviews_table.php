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
        Schema::create('product_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('store_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('order_item_id')->constrained()->cascadeOnDelete();
            
            $table->integer('rating')->default(5); // Nilai Produk
            $table->text('comment')->nullable(); // Tulis ulasannya
            $table->boolean('is_anonymous')->default(false); // Sembunyikan username
            
            $table->integer('seller_rating')->nullable(); // Pelayanan Penjual
            $table->integer('shipping_rating')->nullable(); // Kecepatan Jasa Kirim
            $table->integer('courier_rating')->nullable(); // Pelayanan Kurir
            
            $table->json('images')->nullable(); // Tambahkan 2 foto dan video

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_reviews');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->onDelete('cascade');

            // 👇 Dibikin nullable dan nullOnDelete.
            // Kalau produk dihapus Kang Asep, ID-nya doang yang null, tapi baris pesanan ini tetep ada!
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete();

            // 👇 Snapshot Data (Penting banget buat nota/histori)
            $table->string('product_name');
            $table->decimal('price', 12, 2); // Harga di-lock saat transaksi
            $table->integer('quantity');
            $table->string('unit')->default('pcs'); // Misal: kg, gram, ekor
            $table->string('variant_name')->nullable(); // Misal: Fillet, Utuh

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};

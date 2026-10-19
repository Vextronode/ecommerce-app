<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('chat_negotiations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('chat_room_id')->constrained('chat_rooms')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('store_id')->constrained('stores')->cascadeOnDelete();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->foreignId('product_sku_id')->nullable()->constrained('product_skus')->nullOnDelete();

            $table->decimal('original_price', 12, 2);
            $table->decimal('offered_price', 12, 2);
            $table->unsignedInteger('quantity')->default(1);
            $table->unsignedInteger('po_days')->nullable();
            $table->string('note', 500)->nullable();

            $table->enum('status', [
                'pending',
                'countered',
                'accepted',
                'rejected',
                'expired',
                'purchased',
            ])->default('pending');

            $table->enum('last_action_by', ['user', 'merchant'])->default('user');
            $table->decimal('counter_price', 12, 2)->nullable();

            $table->timestamp('expires_at');
            $table->timestamp('purchased_at')->nullable();
            $table->foreignId('order_id')->nullable()->constrained('orders')->nullOnDelete();
            $table->timestamps();

            $table->index(['chat_room_id', 'status']);
            $table->index(['user_id', 'status']);
            $table->index(['store_id', 'status']);
            $table->index(['product_id', 'status']);
            $table->index('expires_at');
        });

        Schema::table('chat_messages', function (Blueprint $table) {
            $table->string('message_type', 30)->default('text')->after('sender_type');
            $table->foreignId('negotiation_id')->nullable()->after('product_id')->constrained('chat_negotiations')->nullOnDelete();
        });

        Schema::table('carts', function (Blueprint $table) {
            $table->foreignId('negotiation_id')->nullable()->after('preparation_option')->constrained('chat_negotiations')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('carts', function (Blueprint $table) {
            $table->dropForeign(['negotiation_id']);
            $table->dropColumn('negotiation_id');
        });

        Schema::table('chat_messages', function (Blueprint $table) {
            $table->dropForeign(['negotiation_id']);
            $table->dropColumn(['message_type', 'negotiation_id']);
        });

        Schema::dropIfExists('chat_negotiations');
    }
};


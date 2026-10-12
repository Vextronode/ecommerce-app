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
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'last_seen_at')) {
                $table->timestamp('last_seen_at')->nullable()->after('phone');
            }
        });

        Schema::create('chat_rooms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('store_id')->constrained('stores')->onDelete('cascade');
            $table->timestamp('last_message_at')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'store_id']);
            $table->index('last_message_at');
        });

        Schema::create('chat_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('chat_room_id')->constrained('chat_rooms')->onDelete('cascade');
            $table->foreignId('sender_id')->constrained('users')->onDelete('cascade');
            $table->enum('sender_type', ['user', 'merchant']);
            $table->text('message');
            $table->foreignId('product_id')->nullable()->constrained('products')->nullOnDelete();
            $table->boolean('is_read')->default(false);
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            $table->index(['chat_room_id', 'created_at']);
            $table->index(['chat_room_id', 'is_read']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('chat_messages');
        Schema::dropIfExists('chat_rooms');

        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'last_seen_at')) {
                $table->dropColumn('last_seen_at');
            }
        });
    }
};

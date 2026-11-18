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
        Schema::create('seller_applications', function (Blueprint $table) {
            $table->id();
            $table->uuid('business_ref')->unique()->index();
            $table->string('status', 30)->default('pending')->index(); // pending, accepted, rejected, cancelled
            $table->timestamp('requested_at')->index();
            $table->timestamp('decided_at')->nullable();
            $table->text('note')->nullable();

            // Personal & Business Data (Nullable to comply with GDPR/UU PDP on cancellation)
            $table->string('nik', 16)->nullable()->index();
            $table->string('name', 255)->nullable();
            $table->string('business_name', 255)->nullable();
            $table->string('business_activity', 255)->nullable();
            $table->string('category', 50)->nullable()->index(); // kelontong, kuliner, non_kuliner
            $table->string('category_label', 100)->nullable();
            $table->string('email', 255)->nullable()->index();
            $table->string('phone', 25)->nullable();
            $table->text('address')->nullable();
            $table->string('letter_number', 100)->nullable()->index();
            $table->timestamp('issued_at')->nullable();
            $table->timestamp('expires_at')->nullable();

            // Relations to created entities
            $table->foreignId('store_id')->nullable()->constrained('stores')->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();

            $table->json('raw_payload')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('seller_applications');
    }
};

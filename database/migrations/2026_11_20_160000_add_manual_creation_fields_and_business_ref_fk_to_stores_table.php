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
        Schema::table('stores', function (Blueprint $table) {
            if (! Schema::hasColumn('stores', 'is_manual_creation')) {
                $table->boolean('is_manual_creation')->default(false)->after('business_ref');
            }
            if (! Schema::hasColumn('stores', 'manual_creation_reason')) {
                $table->text('manual_creation_reason')->nullable()->after('is_manual_creation');
            }
        });

        // Foreign key constraint dari stores.business_ref ke seller_applications.business_ref (SID-02)
        try {
            Schema::table('stores', function (Blueprint $table) {
                $table->foreign('business_ref')
                    ->references('business_ref')
                    ->on('seller_applications')
                    ->nullOnDelete();
            });
        } catch (Throwable $e) {
            // Abaikan jika FK sudah ada atau tidak didukung oleh driver tertentu
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('stores', function (Blueprint $table) {
            try {
                $table->dropForeign(['business_ref']);
            } catch (Throwable $e) {
            }

            if (Schema::hasColumn('stores', 'manual_creation_reason')) {
                $table->dropColumn('manual_creation_reason');
            }
            if (Schema::hasColumn('stores', 'is_manual_creation')) {
                $table->dropColumn('is_manual_creation');
            }
        });
    }
};

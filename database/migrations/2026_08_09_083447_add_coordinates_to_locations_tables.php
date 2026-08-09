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
        if (!Schema::hasColumn('stores', 'latitude')) {
            Schema::table('stores', function (Blueprint $table) {
                $table->decimal('latitude', 10, 8)->nullable()->after('address');
                $table->decimal('longitude', 11, 8)->nullable()->after('latitude');
            });
        }

        Schema::table('addresses', function (Blueprint $table) {
            $table->decimal('latitude', 10, 8)->nullable()->after('full_address');
            $table->decimal('longitude', 11, 8)->nullable()->after('latitude');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->decimal('shipping_latitude', 10, 8)->nullable()->after('shipping_address');
            $table->decimal('shipping_longitude', 11, 8)->nullable()->after('shipping_latitude');
            $table->string('shipping_pin', 4)->nullable()->after('shipping_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('stores', function (Blueprint $table) {
            $table->dropColumn(['latitude', 'longitude']);
        });

        Schema::table('addresses', function (Blueprint $table) {
            $table->dropColumn(['latitude', 'longitude']);
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['shipping_latitude', 'shipping_longitude', 'shipping_pin']);
        });
    }
};

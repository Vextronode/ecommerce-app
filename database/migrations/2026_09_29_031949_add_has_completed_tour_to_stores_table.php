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
            $table->boolean('has_completed_tour')->default(false)->after('sid_status');
        });

        // Mark existing merchants who already have an address as having completed the tour
        \Illuminate\Support\Facades\DB::table('stores')
            ->whereNotNull('address')
            ->where('address', '!=', '')
            ->update(['has_completed_tour' => true]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('stores', function (Blueprint $table) {
            $table->dropColumn('has_completed_tour');
        });
    }
};

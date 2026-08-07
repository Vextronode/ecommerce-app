<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'status')) {
                $table->string('status')->default('active')->after('role')->index();
            }
        });

        Schema::table('stores', function (Blueprint $table) {
            if (!Schema::hasColumn('stores', 'sid_status')) {
                $table->string('sid_status')->default('verified')->after('description')->index();
            }
            if (!Schema::hasColumn('stores', 'subdistrict')) {
                $table->string('subdistrict')->nullable()->after('address');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'status')) {
                $table->dropColumn('status');
            }
        });

        Schema::table('stores', function (Blueprint $table) {
            $columnsToDrop = [];
            if (Schema::hasColumn('stores', 'sid_status')) {
                $columnsToDrop[] = 'sid_status';
            }
            if (Schema::hasColumn('stores', 'subdistrict')) {
                $columnsToDrop[] = 'subdistrict';
            }
            if (!empty($columnsToDrop)) {
                $table->dropColumn($columnsToDrop);
            }
        });
    }
};

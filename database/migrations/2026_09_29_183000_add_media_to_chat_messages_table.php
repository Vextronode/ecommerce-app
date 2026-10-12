<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('chat_messages', function (Blueprint $table) {
            $table->string('media_path')->nullable()->after('product_id');
            $table->string('media_type', 50)->nullable()->after('media_path');
            $table->text('message')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('chat_messages', function (Blueprint $table) {
            $table->dropColumn(['media_path', 'media_type']);
        });
    }
};

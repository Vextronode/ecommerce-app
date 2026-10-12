<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // satu order_item hanya boleh punya satu ulasan.
        // bereskan duplikat lama dulu (simpan baris id terkecil) supaya index unik bisa dipasang.
        $duplikat = DB::table('product_reviews')
            ->select('order_item_id')
            ->groupBy('order_item_id')
            ->havingRaw('count(*) > 1')
            ->pluck('order_item_id');

        foreach ($duplikat as $orderItemId) {
            $keepId = DB::table('product_reviews')
                ->where('order_item_id', $orderItemId)
                ->min('id');

            DB::table('product_reviews')
                ->where('order_item_id', $orderItemId)
                ->where('id', '!=', $keepId)
                ->delete();
        }

        Schema::table('product_reviews', function (Blueprint $table) {
            $table->unique('order_item_id');
        });
    }

    public function down(): void
    {
        Schema::table('product_reviews', function (Blueprint $table) {
            $table->dropUnique(['order_item_id']);
        });
    }
};

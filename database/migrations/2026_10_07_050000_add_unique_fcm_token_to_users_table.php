<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // token fcm itu kredensial perangkat: satu token hanya boleh dimiliki satu akun.
        // bersihkan duplikat dulu (simpan baris id terkecil, sisanya di-null-kan) supaya unique index tidak gagal di db yang sudah terisi.
        $dupTokens = DB::table('users')
            ->select('fcm_token')
            ->whereNotNull('fcm_token')
            ->groupBy('fcm_token')
            ->havingRaw('count(*) > 1')
            ->pluck('fcm_token');

        foreach ($dupTokens as $token) {
            $keepId = DB::table('users')->where('fcm_token', $token)->min('id');
            DB::table('users')
                ->where('fcm_token', $token)
                ->where('id', '!=', $keepId)
                ->update(['fcm_token' => null]);
        }

        Schema::table('users', function (Blueprint $table) {
            $table->unique('fcm_token');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['fcm_token']);
        });
    }
};

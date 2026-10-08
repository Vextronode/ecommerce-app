<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // bersihkan duplikat google_id (simpan baris dengan id terkecil, sisanya di-null-kan)
        // supaya unique index tidak gagal di database yang sudah terisi.
        $dupGoogleIds = DB::table('users')
            ->select('google_id')
            ->whereNotNull('google_id')
            ->groupBy('google_id')
            ->havingRaw('count(*) > 1')
            ->pluck('google_id');

        foreach ($dupGoogleIds as $googleId) {
            $keepId = DB::table('users')->where('google_id', $googleId)->min('id');
            DB::table('users')
                ->where('google_id', $googleId)
                ->where('id', '!=', $keepId)
                ->update(['google_id' => null]);
        }

        Schema::table('users', function (Blueprint $table) {
            $table->unique('google_id');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['google_id']);
        });
    }
};

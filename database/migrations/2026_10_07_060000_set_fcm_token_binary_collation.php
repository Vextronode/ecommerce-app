<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // token fcm itu base64url (case-sensitive). collation default mysql/mariadb
    // (utf8mb4_unicode_ci) bikin perbandingan token case-insensitive, sehingga token
    // beda huruf besar-kecil bisa dianggap sama dan salah ke-null-kan. paksa binary.
    // panjang kolom disamakan dengan definisi asli (string default = 255) supaya
    // sumber kebenaran skema tidak pecah.
    public function up(): void
    {
        $driver = Schema::getConnection()->getDriverName();

        if (in_array($driver, ['mysql', 'mariadb'], true)) {
            DB::statement('ALTER TABLE users MODIFY fcm_token VARCHAR(255) COLLATE utf8mb4_bin NULL');
        }
    }

    public function down(): void
    {
        $driver = Schema::getConnection()->getDriverName();

        if (! in_array($driver, ['mysql', 'mariadb'], true)) {
            return;
        }

        // balik ke unicode_ci bisa melanggar unique index kalau ada dua token yang
        // cuma beda huruf besar-kecil (sah di collation bin). dedupe case-insensitive
        // dulu (simpan id terkecil) baru ubah collation, supaya rollback tidak gagal.
        $duplikatCase = DB::table('users')
            ->selectRaw('lower(fcm_token) as token_lower')
            ->whereNotNull('fcm_token')
            ->groupBy('token_lower')
            ->havingRaw('count(*) > 1')
            ->pluck('token_lower');

        foreach ($duplikatCase as $tokenLower) {
            $keepId = DB::table('users')
                ->whereRaw('lower(fcm_token) = ?', [$tokenLower])
                ->min('id');

            DB::table('users')
                ->whereRaw('lower(fcm_token) = ?', [$tokenLower])
                ->where('id', '!=', $keepId)
                ->update(['fcm_token' => null]);
        }

        DB::statement('ALTER TABLE users MODIFY fcm_token VARCHAR(255) COLLATE utf8mb4_unicode_ci NULL');
    }
};

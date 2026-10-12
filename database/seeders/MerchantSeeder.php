<?php

namespace Database\Seeders;

use App\Models\Store;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * membuat akun pedagang beserta tokonya untuk data demo katalog pangandaran.
 *
 * tiap pedagang mendapat satu toko lengkap (alamat, koordinat pangandaran,
 * rekening bank, saldo escrow, sid_status verified) supaya halaman publik
 * storefront, dashboard, dan analitik punya data nyata untuk diuji.
 */
class MerchantSeeder extends Seeder
{
    /**
     * daftar pedagang. urutan menentukan urutan pembuatan toko.
     * kata kunci produk sengaja tidak ada di sini; itu urusan CatalogSeeder.
     */
    public const MERCHANTS = [
        [
            'name' => 'Haji Ujang Seafood',
            'email' => 'haji.ujang@cibendamart.com',
            'store' => 'Haji Ujang Seafood Segar Pangandaran',
            'subdistrict' => 'Pangandaran',
            'address' => 'Jl. Pantai Timur No. 12, Pangandaran',
            'latitude' => -7.69850000,
            'longitude' => 108.66030000,
            'description' => 'Hasil laut segar tangkapan pagi dari perairan Pangandaran dan Cikidang.',
        ],
        [
            'name' => 'Ibu Lilis Sayur',
            'email' => 'ibu.lilis@cibendamart.com',
            'store' => 'Kebun Segar Ibu Lilis',
            'subdistrict' => 'Cijulang',
            'address' => 'Jl. Raya Cijulang No. 45, Ciamis',
            'latitude' => -7.72420000,
            'longitude' => 108.49870000,
            'description' => 'Sayuran organik dan hasil kebun dataran tinggi Cijulang, dipetik setiap pagi.',
        ],
        [
            'name' => 'Kang Asep Daging',
            'email' => 'kang.asep@cibendamart.com',
            'store' => 'Ayam & Daging Kang Asep',
            'subdistrict' => 'Cijulang',
            'address' => 'Jl. Pasar Salebu No. 3, Cijulang',
            'latitude' => -7.70910000,
            'longitude' => 108.48520000,
            'description' => 'Ayam kampung, daging sapi, dan frozen food halal dengan rantai dingin terjaga.',
        ],
        [
            'name' => 'Bu Siti Sembako',
            'email' => 'bu.siti@cibendamart.com',
            'store' => 'Toko Sembako Barokah',
            'subdistrict' => 'Padaherang',
            'address' => 'Jl. Pasar Padaherang No. 88, Pangandaran',
            'latitude' => -7.55680000,
            'longitude' => 108.58430000,
            'description' => 'Sembako harian, bumbu dapur, dan kebutuhan rumah tangga lengkap.',
        ],
        [
            'name' => 'Bu Endah Rempah',
            'email' => 'bu.endah@cibendamart.com',
            'store' => 'Bumbu Dapur Bumi Parahiyangan',
            'subdistrict' => 'Kalipucang',
            'address' => 'Jl. Kalipucang No. 21, Pangandaran',
            'latitude' => -7.65040000,
            'longitude' => 108.70520000,
            'description' => 'Rempah segar dan bumbu giling tradisional khas Parahiyangan.',
        ],
        [
            'name' => 'Kang Dedi Garmin',
            'email' => 'kang.dedi@cibendamart.com',
            'store' => 'Kios Fashion Pantai',
            'subdistrict' => 'Pangandaran',
            'address' => 'Jl. Pantai Barat No. 7, Pangandaran',
            'latitude' => -7.70120000,
            'longitude' => 108.65510000,
            'description' => 'Kaos pantai, gamis santai, dan aksesori buatan lokal pesisir Pangandaran.',
        ],
    ];

    public function run(): void
    {
        foreach (self::MERCHANTS as $data) {
            $user = User::updateOrCreate(
                ['email' => $data['email']],
                [
                    'name' => $data['name'],
                    'email' => $data['email'],
                    'password' => Hash::make('password123'),
                    'role' => 'pedagang',
                    'status' => 'active',
                    'is_password_changed' => true,
                    'email_verified_at' => now(),
                ]
            );

            $store = Store::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'user_id' => $user->id,
                    'name' => $data['store'],
                    'slug' => Str::slug($data['store']),
                    'description' => $data['description'],
                    'address' => $data['address'],
                    'subdistrict' => $data['subdistrict'],
                    'latitude' => $data['latitude'],
                    'longitude' => $data['longitude'],
                    'support_email' => $data['email'],
                    'bank_name' => 'Bank Jabar Banten',
                    'bank_account_number' => (string) random_int(1000000000, 9999999999),
                    'bank_account_holder' => $data['name'],
                    'has_completed_tour' => true,
                ]
            );

            $store->forceFill([
                'sid_status' => 'verified',
                'available_balance' => 0,
                'pending_balance' => 0,
            ])->save();
        }
    }
}

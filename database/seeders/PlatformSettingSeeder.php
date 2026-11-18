<?php

namespace Database\Seeders;

use App\Models\PlatformSetting;
use Illuminate\Database\Seeder;

class PlatformSettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            [
                'key' => 'enable_tax',
                'value' => '0',
                'type' => PlatformSetting::TYPE_BOOLEAN,
                'group' => PlatformSetting::GROUP_FINANCE,
                'label' => 'Aktifkan Pajak (PPN)',
                'description' => 'Status pungutan pajak platform. Wajib nonaktif (Mode 0: Tanpa Pajak) selama belum ada penetapan resmi PKP atau penunjukan DJP.',
            ],
            [
                'key' => 'tax_percentage',
                'value' => '0',
                'type' => PlatformSetting::TYPE_NUMBER,
                'group' => PlatformSetting::GROUP_FINANCE,
                'label' => 'Persentase Pajak PPN (%)',
                'description' => 'Besaran persentase tarif pajak efektif sesuai ketentuan regulasi perpajakan yang berlaku.',
            ],
            [
                'key' => 'enable_service_fee',
                'value' => '0',
                'type' => PlatformSetting::TYPE_BOOLEAN,
                'group' => PlatformSetting::GROUP_FINANCE,
                'label' => 'Aktifkan Biaya Layanan',
                'description' => 'Menambahkan biaya penanganan/layanan platform per transaksi pesanan.',
            ],
            [
                'key' => 'service_fee_amount',
                'value' => '1000',
                'type' => PlatformSetting::TYPE_NUMBER,
                'group' => PlatformSetting::GROUP_FINANCE,
                'label' => 'Nominal Biaya Layanan (Rp)',
                'description' => 'Nominal tetap (flat) biaya penanganan per transaksi untuk kas operasional Pemerintah Desa Cibenda.',
            ],
            [
                'key' => 'enable_online_payment',
                'value' => '1',
                'type' => PlatformSetting::TYPE_BOOLEAN,
                'group' => PlatformSetting::GROUP_FEATURE_FLAGS,
                'label' => 'Pembayaran Online (Virtual Payment Gateway)',
                'description' => 'Jika dimatikan (mode darurat/mitra belum siap), sistem otomatis mengunci opsi checkout ke Bayar di Tempat (COD) saja.',
            ],
            [
                'key' => 'enable_negotiation',
                'value' => '1',
                'type' => PlatformSetting::TYPE_BOOLEAN,
                'group' => PlatformSetting::GROUP_FEATURE_FLAGS,
                'label' => 'Fitur Tawar-Menawar Harga (Chat)',
                'description' => 'Mengizinkan pembeli dan pedagang melakukan tawar menawar harga produk melalui ruang obrolan.',
            ],
            [
                'key' => 'enable_sid_sync',
                'value' => '1',
                'type' => PlatformSetting::TYPE_BOOLEAN,
                'group' => PlatformSetting::GROUP_FEATURE_FLAGS,
                'label' => 'Sinkronisasi Otomatis SIDUTama',
                'description' => 'Menjalankan sinkronisasi background berkala data SKU & status permohonan dengan server Desa Cibenda.',
            ],
            [
                'key' => 'enable_withdrawal',
                'value' => '1',
                'type' => PlatformSetting::TYPE_BOOLEAN,
                'group' => PlatformSetting::GROUP_FEATURE_FLAGS,
                'label' => 'Pencairan Saldo Pedagang (Withdrawal)',
                'description' => 'Jika dimatikan sementara, pedagang tidak dapat melakukan request penarikan saldo ke rekening bank.',
            ],
            [
                'key' => 'enable_local_delivery',
                'value' => '1',
                'type' => PlatformSetting::TYPE_BOOLEAN,
                'group' => PlatformSetting::GROUP_FEATURE_FLAGS,
                'label' => 'Pengiriman Kurir Lokal',
                'description' => 'Dapat dimatikan saat kondisi darurat/cuaca buruk di pesisir Pangandaran sehingga transaksi beralih ke Ambil di Tempat (Pick-up).',
            ],
        ];

        foreach ($settings as $setting) {
            PlatformSetting::updateOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }
    }
}

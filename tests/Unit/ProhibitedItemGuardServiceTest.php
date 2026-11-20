<?php

namespace Tests\Unit;

use App\Services\ProhibitedItemGuardService;
use Tests\TestCase;

class ProhibitedItemGuardServiceTest extends TestCase
{
    private ProhibitedItemGuardService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new ProhibitedItemGuardService;
    }

    public function test_detects_tobacco_and_vape_keywords(): void
    {
        $slangWords = [
            'Rokok Surya 12 Batang' => 'tobacco_and_vape',
            'roko' => 'tobacco_and_vape',
            'roko surya 16' => 'tobacco_and_vape',
            'udud' => 'tobacco_and_vape',
            'ngudud santai' => 'tobacco_and_vape',
            'bako mole asli' => 'tobacco_and_vape',
            'tingwe tembakau' => 'tobacco_and_vape',
            'Liquid Pod Saltnic Mangga Dingin' => 'tobacco_and_vape',
            'Device VAPE Starter Kit' => 'tobacco_and_vape',
            'vep pod' => 'tobacco_and_vape',
            'likuid mangga' => 'tobacco_and_vape',
            'sampoerna mild' => 'tobacco_and_vape',
            'marlboro merah' => 'tobacco_and_vape',
        ];

        foreach ($slangWords as $text => $expectedCat) {
            $check = $this->service->check($text);
            $this->assertNotNull($check, "Gagal mendeteksi rokok/slang: {$text}");
            $this->assertSame($expectedCat, $check['category_key']);
        }
    }

    public function test_detects_subsidized_goods_variations(): void
    {
        // Variasi lpg 3kg
        $variations = [
            'Tabung LPG 3kg Isi Ulang',
            'Gas 3 kg Hijau Melon',
            'Tabung gas melon murah',
            'LPG-3-KG Subsidi',
            'Pupuk Urea Bersubsidi 50kg',
            'Beras Bansos Bantuan Pangan',
        ];

        foreach ($variations as $text) {
            $check = $this->service->check($text);
            $this->assertNotNull($check, "Gagal mendeteksi: {$text}");
            $this->assertSame('subsidized_goods', $check['category_key']);
        }
    }

    public function test_detects_protected_pangandaran_marine_and_wildlife(): void
    {
        $marineItems = [
            'Jual Benih Bening Lobster Segar Tangkapan Nelayan',
            'Telur Penyu Hijau Pantai Pangandaran',
            'Hiasan Terumbu Karang Hidup',
            'Ikan Kerapu Hasil Bom Ikan',
            'Potas Ikan untuk Berburu',
        ];

        foreach ($marineItems as $text) {
            $check = $this->service->check($text);
            $this->assertNotNull($check, "Gagal mendeteksi: {$text}");
            $this->assertSame('protected_wildlife_and_marine', $check['category_key']);
        }
    }

    public function test_detects_alcoholic_beverages_and_miras(): void
    {
        $alcoholicItems = [
            'Minuman Anggur Merah Cap Orang Tua',
            'Tuak Manis Asli Cijulang',
            'Ciu Bekonang Murni',
            'Bir Bintang Dingin Kaleng',
            'Minuman Oplosan Segar',
        ];

        foreach ($alcoholicItems as $text) {
            $check = $this->service->check($text);
            $this->assertNotNull($check, "Gagal mendeteksi: {$text}");
            $this->assertSame('alcoholic_beverages', $check['category_key']);
        }
    }

    public function test_detects_narcotics_and_illegal_drugs(): void
    {
        $drugs = [
            'Ganja Kering Super',
            'Paket Sabu Hemat',
            'Obat Penenang Tramadol 50mg',
            'Obat Aborsi Cytotec Misoprostol Asli',
            'Pil Biru Viagra Herbal Kuat',
        ];

        foreach ($drugs as $text) {
            $check = $this->service->check($text);
            $this->assertNotNull($check, "Gagal mendeteksi: {$text}");
            $this->assertSame('narcotics_and_drugs', $check['category_key']);
        }
    }

    public function test_detects_weapons_and_counterfeit(): void
    {
        $illegalItems = [
            'Petasan Cabe Rawit Ledak Keras',
            'Pistol Senjata Api Rakitan',
            'Pisau Tempur Taktis Berburu',
            'Uang Palsu Mirip Asli Pecahan 100rb',
            'Baju Bekas Impor Thrift Balpres',
        ];

        foreach ($illegalItems as $text) {
            $check = $this->service->check($text);
            $this->assertNotNull($check, "Gagal mendeteksi: {$text}");
        }
    }

    public function test_does_not_trigger_false_positives_for_legitimate_village_products(): void
    {
        $legitimateItems = [
            'Brokoli Hijau Segar',
            'Bakso Sapi Urat Pangandaran',
            'Kacang Tanah Kupas Gurih',
            'Kecap Asin Asli Cijulang',
            'Gula Merah Kelapa Pangandaran',
            'Ikan Asin Jambal Roti Khas Pangandaran',
            'Ayam Potong Segar Bersih',
            'Sayur Bayam dan Kangkung Organik',
            'Pisau Dapur Stainless Steel Anti Karat',
            'Cangkul Tani Baja Kuat',
            'Arit Rumput Gagang Kayu',
            'Piring Keramik Cantik Motif Garis',
            'Kamera Pemantau Kebun',
        ];

        foreach ($legitimateItems as $cleanText) {
            $check = $this->service->check($cleanText);
            $this->assertNull(
                $check,
                "False positive terdeteksi pada produk legal '{$cleanText}': ".($check['message'] ?? '')
            );
            $this->assertTrue($this->service->isClean($cleanText));
        }
    }
}

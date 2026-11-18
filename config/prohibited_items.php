<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Daftar Kategori & Kata Kunci Produk Terlarang (Cibenda Mart S&K)
    |--------------------------------------------------------------------------
    |
    | Berdasarkan Lampiran Syarat & Ketentuan Platform Cibenda Mart:
    | - Bagian 2: Produk Terlarang Berdasarkan Peraturan Perundang-undangan
    | - Bagian 3: Produk Terlarang Berdasarkan Kebijakan Pengelola
    |
    | Filter ini mendeteksi kata baku, typo, variasi ejaan, serta istilah/slang
    | daerah (misal: "roko", "udud", "bako", "gas ijo", "ciu", "amer") untuk
    | mencegah manipulasi dan penyamaran produk terlarang.
    |
    */

    'enabled' => env('PROHIBITED_ITEMS_GUARD_ENABLED', true),

    'categories' => [
        'narcotics_and_drugs' => [
            'label' => 'Narkotika, Psikotropika, dan Obat Keras',
            'reference' => 'UU 35/2009 & Peraturan BPOM 8/2020',
            'keywords' => [
                // Narkotika & Psikotropika
                'ganja', 'marijuana', 'weed', 'sabu', 'sabu-sabu', 'shabu', 'ekstasi', 'inex',
                'heroin', 'putaw', 'kokain', 'tembakau gorila', 'tembakau gorilla',
                'tembakau sintetis', 'sinte',
                // Obat Keras & Penenang (Daftar G / Resep)
                'tramadol', 'tramal', 'dumolid', 'alprazolam', 'kamlet', 'calmlet',
                'diazepam', 'somadril', 'zenith', 'trihexyphenidyl', 'trihex',
                'heximer', 'eximer', 'pil koplo', 'koplo', 'pil sapi', 'pil anjing',
                // Obat Aborsi & Terlarang
                'obat aborsi', 'cytotec', 'gastrul', 'misoprostol', 'obat bius',
                'obat penenang', 'obat disfungsi ereksi', 'viagra', 'cialis',
                'obat kuat ilegal', 'perangsang',
            ],
        ],

        'protected_wildlife_and_marine' => [
            'label' => 'Satwa, Biota Laut Dilindungi, dan Konservasi Pesisir',
            'reference' => 'UU 5/1990 jo. UU 32/2024 & Regulasi Kelautan/Perikanan',
            'keywords' => [
                'penyu', 'telur penyu', 'daging penyu', 'sisik penyu',
                'karang hidup', 'karang laut', 'terumbu karang',
                // Perikanan Pesisir Pangandaran
                'benih bening lobster', 'benih lobster', 'benur lobster', 'benur', 'bbl',
                'ikan bom', 'bom ikan', 'potas ikan', 'potasium ikan', 'racun ikan',
                // Satwa Langka
                'cula badak', 'gading gajah', 'trenggiling', 'sisik trenggiling',
                'burung hantu', 'burung elang', 'cenderawasih', 'kukang', 'kucing hutan',
            ],
        ],

        'tobacco_and_vape' => [
            'label' => 'Produk Tembakau dan Rokok Elektronik',
            'reference' => 'PP 28/2024 Pasal 434 (Larangan Penjualan Online)',
            'keywords' => [
                // Rokok Konvensional & Slang (Sunda/Jawa/Umum)
                'rokok', 'roko', 'udud', 'ngudud', 'bako', 'tingwe',
                'tembakau', 'tembako', 'tembakau iris', 'cerutu', 'cigar',
                'cigg', 'ciggs', 'shisha', 'sisha', 'hookah',
                // Merk Rokok Umum
                'sampoerna', 'gudang garam', 'djarum', 'marlboro', 'surya 16',
                'surya 12', 'magnum filter', 'esse change', 'esse pop',
                'la lights', 'la bold', 'dji sam soe',
                // Vape & Rokok Elektrik
                'rokok elektrik', 'rokok elektronik', 'vape', 'vep', 'vepe',
                'vapor', 'vapour', 'vaping', 'liquid vape', 'liquid pod', 'likuid',
                'salt nic', 'saltnic', 'freebase', 'pod system', 'cartridge pod',
                'coil vape', 'disposable pod', 'vape pod', 'relx', 'juul',
                'caliburn', 'oxva', 'ursa nano',
            ],
        ],

        'alcoholic_beverages' => [
            'label' => 'Minuman Beralkohol / Miras',
            'reference' => 'Regulasi Pengawasan Minuman Beralkohol',
            'keywords' => [
                'miras', 'minuman keras', 'minol', 'alkohol', 'minuman beralkohol',
                'arak', 'tuak', 'ciu', 'ciu bekonang', 'anggur merah', 'amer',
                'anggur kolesom', 'kolesom', 'intisari', 'cap orang tua',
                'bir', 'beer', 'vodka', 'whiskey', 'whisky', 'soju', 'rum',
                'gin', 'tequila', 'brandy', 'singaraja', 'oplosan', 'minuman oplosan',
            ],
        ],

        'weapons_and_explosives' => [
            'label' => 'Senjata Api, Amunisi, dan Bahan Peledak',
            'reference' => 'UU Darurat 12/1951',
            'keywords' => [
                'senjata api', 'senpi', 'pistol', 'revolver', 'senapan angin',
                'senapan gas', 'airsoft gun', 'airsoft', 'peluru', 'mesiu',
                'bubuk mesiu', 'bahan peledak', 'dinamit', 'petasan', 'mercon',
                'kembang api ledak', 'bom', 'molotov',
            ],
        ],

        'subsidized_goods' => [
            'label' => 'Barang Bersubsidi Pemerintah',
            'reference' => 'Kebijakan Pengelola Cibenda Mart (Ketepatan Sasaran Subsidi & Keselamatan)',
            'keywords' => [
                // Gas & LPG
                'lpg', 'gas lpg', 'tabung lpg', 'elpiji', 'tabung elpiji',
                'lpg 3 kg', 'lpg 3kg', 'gas 3 kg', 'gas 3kg', 'gas melon',
                'tabung melon', 'gas ijo', 'tabung ijo', 'lpg ijo',
                // Pupuk & Pangan Subsidi
                'pupuk subsidi', 'pupuk bersubsidi', 'urea bersubsidi', 'pupuk urea subsidi',
                'pupuk phonska subsidi', 'phonska subsidi', 'za subsidi',
                'beras bansos', 'beras bantuan pemerintah', 'beras bantuan pangan',
                'beras sphp',
            ],
        ],

        'fuels_and_dangerous_chemicals' => [
            'label' => 'Bahan Bakar Eceran dan Bahan Kimia Berbahaya',
            'reference' => 'Kebijakan Pengelola Cibenda Mart (Keselamatan Pengantaran)',
            'keywords' => [
                'bensin eceran', 'pertalite eceran', 'solar eceran', 'minyak tanah eceran',
                'pertamax eceran', 'sianida', 'potasium sianida', 'air keras',
                'asam sulfat pekat', 'kloroform',
            ],
        ],

        'combat_weapons' => [
            'label' => 'Senjata Tajam Non-Alat Kerja',
            'reference' => 'Kebijakan Pengelola Cibenda Mart',
            'keywords' => [
                'pisau tempur', 'pisau komando', 'pisau lipat tempur', 'celurit tempur',
                'celurit hias', 'karambit tempur', 'samurai hias', 'katana',
                'keris pusaka', 'pedang hias', 'knuckle', 'buku jari baja',
            ],
        ],

        'counterfeit_and_illegal' => [
            'label' => 'Barang Tiruan, Impor Ilegal, Dokumen Negara, dan Konten Terlarang',
            'reference' => 'UU 20/2016, UU 44/2008, UU 27/2022, dan Permendag',
            'keywords' => [
                'uang palsu', 'upal', 'pakaian bekas impor', 'baju bekas impor',
                'thrift impor', 'balpres', 'bal pres', 'jual ktp', 'jual sim',
                'jual kk', 'jual rekening', 'rekening bodong', 'buku tabungan bodong',
                'pornografi', 'sex toys', 'alat bantu seks', 'dildo', 'vagina palsu',
                'kondom duri', 'chip judi', 'chip domino', 'chip higgs', 'koin judi',
                'voucher judi', 'slot gacor', 'zeus gacor', 'akun judi', 'togel',
            ],
        ],
    ],
];

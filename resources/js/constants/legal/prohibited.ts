export interface NationalProhibitedItem {
    no: number;
    title: string;
    desc: string;
    ref: string;
}

export interface LocalProhibitedItem {
    title: string;
    desc: string;
}

export interface RestrictedItem {
    category: string;
    examples: string;
    requirement: string;
}

export interface SanctionTier {
    stage: string;
    title: string;
    desc: string;
}

export const PROHIBITED_METADATA = {
    title: "Daftar Produk Terlarang dan Dibatasi",
    subtitle: "Standar Kepatuhan Hukum & Keamanan",
    organizer: "Pemerintah Desa Cibenda, Kecamatan Parigi, Kabupaten Pangandaran",
    version: "1.0",
    effectiveDate: "November 2026",
    intro:
        "Demi menjamin keamanan konsumen, keselamatan kurir pengantaran lokal, dan kepatuhan terhadap peraturan perundang-undangan Negara Republik Indonesia, Pemerintah Desa Cibenda menetapkan pedoman katalog barang yang boleh dan tidak boleh dijual di Cibenda Mart.",
    reporting: {
        email: "halo@cibendamart.id",
        whatsapp: "0812-3456-7890",
    },
};

export const NATIONAL_PROHIBITED_ITEMS: NationalProhibitedItem[] = [
    { no: 1, title: "Narkotika, Psikotropika, & Prekursor", desc: "Ganja, sabu, obat penenang tanpa resep dokter.", ref: "UU 35/2009 & UU 5/1997" },
    { no: 2, title: "Obat Keras & Antibiotik", desc: "Obat keras daftar G, antibiotik, obat disfungsi ereksi tanpa izin klinik.", ref: "Peraturan BPOM 8/2020" },
    { no: 3, title: "Satwa & Tumbuhan Dilindungi", desc: "Penyu dan telur penyu, karang laut hidup, burung dilindungi, cangkang/sisik.", ref: "UU 5/1990 jo. UU 32/2024" },
    { no: 4, title: "Benih Bening Lobster (BBL)", desc: "Benih lobster dalam bentuk apa pun dilarang diperjualbelikan bebas.", ref: "Regulasi KKP & Karantina Ikan" },
    { no: 5, title: "Hasil Tangkapan Ikan Terlarang", desc: "Ikan/hasil laut hasil penangkapan menggunakan bom, racun, atau potasium.", ref: "UU 31/2004 jo. UU 45/2009" },
    { no: 6, title: "Bahan Peledak & Senjata Api", desc: "Senapan modifikasi, amunisi, petasan, mercon berbahaya.", ref: "UU Darurat 12/1951" },
    { no: 7, title: "Produk Tembakau & Rokok Elektronik", desc: "Rokok batang, cerutu, tembakau iris, vape, cairan liquid rokok elektrik.", ref: "PP 28/2024 Pasal 434" },
    { no: 8, title: "Minuman Beralkohol", desc: "Arak, tuak, ciu, bir, anggur fermentasi beralkohol.", ref: "Permendag Bidang Pengawasan Miras" },
    { no: 9, title: "Barang Tiruan / Pelanggar HKI", desc: "Barang bermerek tiruan (KW/palsu), software/media bajakan.", ref: "UU 20/2016 & UU 28/2014" },
    { no: 10, title: "Pakaian Bekas Impor (Thrift Impor)", desc: "Baju/celana bekas impor dalam bentuk bal maupun eceran.", ref: "Permendag Larangan Impor Barang Bekas" },
    { no: 11, title: "Barang Hasil Tindak Pidana", desc: "Barang curian, barang selundupan, atau penadahan.", ref: "KUHP" },
    { no: 12, title: "Pangan Kedaluwarsa & Rusak", desc: "Produk makanan/minuman yang lewat masa kedaluwarsa atau kaleng kembung/rusak.", ref: "UU 8/1999 Perlindungan Konsumen" },
    { no: 13, title: "Konten Pornografi & Perjudian", desc: "Materi asusila, alat judi, voucher atau chip judi online.", ref: "UU 44/2008 & UU ITE 1/2024" },
    { no: 14, title: "Dokumen Negara & Data Pribadi", desc: "KTP, SIM, KK, ijazah palsu, basis data nomor telepon/rekening orang lain.", ref: "UU Administrasi Kependudukan & UU PDP" },
    { no: 15, title: "Uang Palsu & Alat Tukar Tidak Sah", desc: "Uang tiruan, uang mainan yang menyerupai Rupiah asli.", ref: "UU 7/2011 tentang Mata Uang" },
];

export const LOCAL_PROHIBITED_ITEMS: LocalProhibitedItem[] = [
    {
        title: "Barang Bersubsidi Pemerintah",
        desc: "Tabung gas LPG 3 kg (melon), pupuk bersubsidi (Urea/NPK subsidi), dan beras bantuan pangan pemerintah (bansos). Komoditas ini wajib disalurkan melalui jalur resmi dan dilarang dikomersialkan di platform terbuka.",
    },
    {
        title: "Bahan Bakar Minyak (BBM) Eceran",
        desc: "Bensin, solar, dan minyak tanah eceran dalam botol/jeriken demi mencegah bahaya kebakaran fatal dalam logistik kurir lokal.",
    },
    {
        title: "Bahan Kimia Berbahaya",
        desc: "Bahan kimia beracun, korosif, atau mudah meledak tanpa izin distributor resmi.",
    },
    {
        title: "Senjata Tajam Non-Alat Kerja",
        desc: "Pisau lipat tempur, celurit hias tawuran, karambit tempur, dan senjata tajam lain yang bukan perkakas pertanian/perikanan/dapur.",
    },
];

export const RESTRICTED_ITEMS: RestrictedItem[] = [
    {
        category: "Pangan Olahan Industri Rumah Tangga (P-IRT)",
        examples: "Keripik pisang, abon ikan Pangandaran, ikan asin, ikan asap jambal roti, kue kering, sambal kemasan.",
        requirement: "Wajib memiliki nomor SPP-IRT (Sertifikat Produksi Pangan Industri Rumah Tangga) yang masih aktif dan label kemasan sesuai ketentuan.",
    },
    {
        category: "Pangan Olahan Berisiko Tinggi",
        examples: "Produk olahan susu, makanan kaleng pabrikan, minuman botol bersegel, frozen food olahan pabrik.",
        requirement: "Wajib mengantongi Izin Edar resmi BPOM (MD/ML).",
    },
    {
        category: "Pangan Segar Laut & Pertanian",
        examples: "Ikan laut segar, udang, cumi, sayuran, buah-buahan lokal.",
        requirement: "Wajib layak konsumsi, segar, higienis, dan sesuai dengan timbangan atau berat bersih yang dicantumkan.",
    },
    {
        category: "Klaim Halal Produk",
        examples: "Semua produk pangan yang mencantumkan label atau teks 'Halal'.",
        requirement: "Hanya boleh dicantumkan apabila toko telah memiliki Sertifikat Halal resmi dari BPJPH dan mencantumkan nomor sertifikat pada deskripsi produk.",
    },
    {
        category: "Perkakas Tajam untuk Kerja",
        examples: "Golok kebun, arit pertanian, parang kelapa, pisau dapur.",
        requirement: "Hanya dijual untuk fungsi perkakas kerja dan mutlak dilarang dijual kepada pembeli yang belum dewasa (di bawah 18 tahun).",
    },
    {
        category: "Barang Bekas Layak Pakai Lokal",
        examples: "Peralatan rumah tangga, perabot, buku, atau pakaian bekas pemakaian pribadi dalam negeri.",
        requirement: "Wajib mencantumkan foto asli kondisi barang, minus fisik, dan riwayat pemakaian secara jujur.",
    },
];

export const SANCTION_TIERS: SanctionTier[] = [
    {
        stage: "Pelanggaran 1",
        title: "Teguran & Takedown",
        desc: "Peringatan tertulis dan penurunan produk dari katalog platform.",
    },
    {
        stage: "Pelanggaran 2",
        title: "Suspend Toko 30 Hari",
        desc: "Penonaktifan sementara toko dan seluruh katalog barang dagangan.",
    },
    {
        stage: "Pelanggaran 3 / Berat",
        title: "Penutupan Permanen",
        desc: "Akun pedagang diblokir permanen dan dapat diteruskan ke aparat penegak hukum.",
    },
];

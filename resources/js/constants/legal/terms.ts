export interface TermArticle {
    id: string;
    number: number;
    title: string;
    type: "numbered" | "paragraphs" | "bullets" | "reference_refund";
    items?: string[];
    paragraphs?: string[];
}

export const TERMS_METADATA = {
    title: "Syarat dan Ketentuan Penggunaan Platform Cibenda Mart",
    organizer: "Pemerintah Desa Cibenda, Kecamatan Parigi, Kabupaten Pangandaran, Jawa Barat",
    version: "1.0",
    effectiveDate: "November 2026",
    preamble:
        "Syarat dan Ketentuan ini merupakan perjanjian yang sah dan mengikat antara Pemerintah Desa Cibenda selaku Pengelola Platform Cibenda Mart dengan setiap Pengguna (Pembeli, Pedagang, dan Kurir). Dengan mendaftar, masuk, atau bertransaksi di Platform, Pengguna menyatakan telah membaca, memahami, dan menyetujui seluruh ketentuan ini beserta kebijakan terkait.",
    contact: {
        entity: "Pengelola Cibenda Mart - Pemerintah Desa Cibenda",
        address: "Jl. Raya Cibenda No. 123, Desa Cibenda, Kecamatan Parigi, Kabupaten Pangandaran, Jawa Barat",
        email: "halo@cibendamart.id",
        whatsapp: "0812-3456-7890",
        hours: "Senin - Jumat, 08.00 - 16.00 WIB",
    },
};

export const TERMS_ARTICLES: TermArticle[] = [
    {
        id: "pasal-1",
        number: 1,
        title: "Definisi",
        type: "numbered",
        items: [
            "Platform adalah sistem elektronik Cibenda Mart berupa situs web dan aplikasi web progresif (PWA) beserta seluruh fiturnya.",
            "Pengelola adalah Pemerintah Desa Cibenda selaku penyelenggara perdagangan melalui sistem elektronik yang mengoperasikan Platform.",
            "Pengguna adalah setiap orang yang mengakses atau menggunakan Platform, meliputi Pembeli, Pedagang, dan Kurir.",
            "Pembeli adalah Pengguna yang melakukan pemesanan dan pembayaran atas Produk.",
            "Pedagang adalah pelaku usaha yang telah diverifikasi Pengelola untuk membuka Toko dan menjual Produk melalui Platform.",
            "Kurir adalah petugas pengantar yang ditugaskan Pedagang untuk mengantarkan Pesanan.",
            "Produk adalah barang yang ditawarkan Pedagang melalui Platform.",
            "Pesanan adalah permintaan pembelian Produk yang dibuat Pembeli melalui Platform.",
            "Rekening Penampung adalah mekanisme penahanan dana pembayaran Pembeli sampai Pesanan dinyatakan selesai.",
            "Saldo Penjualan adalah catatan hak tagih Pedagang atas hasil penjualan yang telah diterima Pengelola.",
            "Mitra Pembayaran adalah penyedia jasa pembayaran berizin yang bekerja sama dengan Pengelola untuk memproses pembayaran dan pencairan dana.",
            "SID adalah Sistem Informasi Desa Cibenda yang digunakan untuk penerbitan Surat Keterangan Usaha dan verifikasi Pedagang.",
        ],
    },
    {
        id: "pasal-2",
        number: 2,
        title: "Kedudukan Pengelola",
        type: "numbered",
        items: [
            "Pengelola menyediakan Platform sebagai sarana yang mempertemukan Pembeli dan Pedagang. Pengelola bukan penjual Produk dan bukan pihak dalam perjanjian jual beli antara Pembeli dan Pedagang.",
            "Tanggung jawab atas mutu, keamanan, keaslian, kelayakan konsumsi, kehalalan, dan perizinan Produk berada pada Pedagang.",
            "Pengelola bertanggung jawab atas penyelenggaraan Platform, pengelolaan Rekening Penampung, mediasi sengketa, dan penindakan atas pelanggaran sesuai Syarat dan Ketentuan ini.",
            "Pengelola bukan bank dan bukan penerbit uang elektronik. Saldo Penjualan bukan simpanan dan tidak dapat digunakan untuk berbelanja, ditransfer kepada Pengguna lain, maupun diisi ulang.",
        ],
    },
    {
        id: "pasal-3",
        number: 3,
        title: "Akun Pengguna",
        type: "numbered",
        items: [
            "Pengguna wajib telah berusia 18 (delapan belas) tahun atau telah menikah. Pengguna yang belum memenuhi syarat tersebut hanya dapat menggunakan Platform di bawah pengawasan orang tua atau wali.",
            "Pengguna dapat mendaftar menggunakan alamat surel atau akun Google, dan wajib memberikan data yang benar, lengkap, dan terbaru.",
            "Pengguna bertanggung jawab atas kerahasiaan kata sandi dan seluruh aktivitas pada akunnya.",
            "Satu akun hanya untuk satu orang dan tidak dapat dipindahtangankan.",
        ],
    },
    {
        id: "pasal-4",
        number: 4,
        title: "Pedagang",
        type: "numbered",
        items: [
            "Pedagang wajib berdomisili atau memiliki kegiatan usaha di Desa Cibenda dan sekitarnya, serta memiliki Surat Keterangan Usaha yang diterbitkan melalui SID.",
            "Akun Pedagang dibuat oleh Pengelola setelah permohonan pendaftaran dari SID diverifikasi.",
            "Hak dan kewajiban Pedagang diatur lebih lanjut dalam Perjanjian Kemitraan Pedagang.",
            "Pedagang wajib memenuhi perizinan Produk yang berlaku, termasuk izin edar pangan, sertifikat halal sesuai ketentuan peraturan perundang-undangan, dan standar wajib lainnya.",
        ],
    },
    {
        id: "pasal-5",
        number: 5,
        title: "Produk, Harga, dan Informasi",
        type: "numbered",
        items: [
            "Pedagang wajib menyajikan informasi Produk secara benar, jelas, dan jujur, termasuk nama, foto, deskripsi, satuan, berat, varian, stok, dan harga.",
            "Harga yang tercantum dinyatakan dalam Rupiah. Sebelum melakukan pembayaran, Pembeli akan melihat seluruh komponen biaya (harga produk, ongkos kirim, dan biaya layanan apabila diberlakukan).",
            "Produk pra-pesan (pre-order) wajib mencantumkan estimasi waktu penyiapan.",
            "Pedagang dilarang menjual Produk yang tercantum dalam Daftar Produk Terlarang dan Dibatasi tanpa memenuhi persyaratannya.",
        ],
    },
    {
        id: "pasal-6",
        number: 6,
        title: "Tawar-Menawar Harga",
        type: "numbered",
        items: [
            "Pembeli dapat mengajukan penawaran harga atas Produk melalui fitur obrolan, sepanjang fitur tersebut diaktifkan oleh Pengelola.",
            "Pedagang dapat menerima, menolak, atau mengajukan penawaran balik.",
            "Setiap penawaran dan penawaran balik berlaku selama 24 (dua puluh empat) jam sejak diajukan dan gugur dengan sendirinya setelah melewati jangka waktu tersebut.",
            "Harga yang telah disepakati oleh kedua belah pihak menjadi harga transaksi yang mengikat untuk jumlah Produk yang disepakati.",
        ],
    },
    {
        id: "pasal-7",
        number: 7,
        title: "Pemesanan dan Pembayaran",
        type: "numbered",
        items: [
            "Pesanan yang memuat Produk dari beberapa Toko akan dipisahkan menjadi Pesanan tersendiri untuk setiap Toko.",
            "Metode pembayaran meliputi Virtual Account bank, QRIS, dompet digital, dan Bayar di Tempat (COD).",
            "Pembayaran non-tunai wajib diselesaikan paling lama 24 (dua puluh empat) jam. Pesanan yang tidak dibayar dalam batas waktu tersebut otomatis batal.",
            "Biaya layanan, apabila diberlakukan, merupakan pendapatan operasional Pengelola dan ditampilkan secara terpisah sebelum pembayaran.",
            "Pengelola sewaktu-waktu dapat menonaktifkan sementara metode pembayaran atau pengiriman tertentu demi keamanan atau pemeliharaan sistem. Pesanan yang sudah dibayar tidak terpengaruh oleh penonaktifan tersebut.",
        ],
    },
    {
        id: "pasal-8",
        number: 8,
        title: "Rekening Penampung (Escrow)",
        type: "numbered",
        items: [
            "Pembayaran non-tunai dari Pembeli ditahan dalam Rekening Penampung dan tidak langsung diteruskan kepada Pedagang.",
            "Dana menjadi Saldo Penjualan Pedagang yang dapat dicairkan setelah Pesanan dinyatakan selesai.",
            "Pembayaran COD diterima langsung oleh Pedagang atau Kurir dan tidak melalui Rekening Penampung.",
            "Pencairan Saldo Penjualan dilakukan ke rekening bank Pedagang yang terdaftar melalui Mitra Pembayaran resmi.",
        ],
    },
    {
        id: "pasal-9",
        number: 9,
        title: "Pembatalan Pesanan",
        type: "numbered",
        items: [
            "Pembeli dapat membatalkan Pesanan secara mandiri selama Pesanan belum dibayar dan belum diproses Pedagang.",
            "Pesanan yang sudah dibayar hanya dapat dibatalkan atas persetujuan Pedagang atau melalui mekanisme pengembalian dana.",
            "Pengelola berhak membatalkan Pesanan apabila Pedagang tidak memproses Pesanan dalam waktu 1×24 jam, stok habis, atau ada indikasi pelanggaran.",
            "Dana atas Pesanan yang dibatalkan dikembalikan sesuai Kebijakan Pengembalian Dana dan Barang.",
        ],
    },
    {
        id: "pasal-10",
        number: 10,
        title: "Pengiriman dan Penyerahan",
        type: "numbered",
        items: [
            "Pembeli dapat memilih pengiriman oleh Kurir lokal Toko atau mengambil sendiri Pesanan di lokasi Toko.",
            "Ongkos kirim dihitung berdasarkan jarak antara lokasi Toko dan alamat Pembeli, serta menjadi hak Pedagang.",
            "Penyerahan Pesanan dikonfirmasi menggunakan kode atau kode QR serah terima. Pembeli dilarang memberikan kode tersebut sebelum fisik barang diterima.",
            "Pesanan non-tunai yang telah berstatus dikirim dan tidak dikonfirmasi Pembeli dalam waktu 4 (empat) jam dinyatakan selesai secara otomatis oleh sistem. Hak mengajukan komplain tetap berlaku sesuai Kebijakan Refund.",
        ],
    },
    {
        id: "pasal-11",
        number: 11,
        title: "Pengembalian Dana dan Barang",
        type: "reference_refund",
        paragraphs: [
            "Syarat, batas waktu, bukti, dan tata cara pengembalian dana atau barang diatur dalam Kebijakan Pengembalian Dana dan Barang (Refund & Retur) yang merupakan bagian tidak terpisahkan dari Syarat dan Ketentuan ini.",
        ],
    },
    {
        id: "pasal-12",
        number: 12,
        title: "Obrolan, Ulasan, dan Konten Pengguna",
        type: "numbered",
        items: [
            "Pengguna bertanggung jawab penuh atas pesan, gambar, dan ulasan yang diunggah. Dilarang mengunggah konten bermuatan pornografi, perjudian, ujaran kebencian, pencemaran nama baik, atau tautan berbahaya.",
            "Ulasan hanya dapat diberikan oleh Pembeli atas Pesanan yang telah selesai dan wajib mencerminkan fakta pengalaman sebenarnya.",
            "Pengelola berhak menurunkan ulasan atau konten yang melanggar tanpa pemberitahuan sebelumnya.",
        ],
    },
    {
        id: "pasal-13",
        number: 13,
        title: "Larangan",
        type: "bullets",
        paragraphs: ["Pengguna dilarang keras melakukan tindakan berikut:"],
        items: [
            "Melakukan transaksi fiktif, memanipulasi harga, stok, atau ulasan;",
            "Melakukan penipuan, pemalsuan identitas, atau penyalahgunaan akun pihak lain;",
            "Mengarahkan transaksi ke luar Platform atas Produk yang ditemukan melalui Platform;",
            "Mengganggu, meretas, atau menyusup ke sistem menggunakan bot atau program otomatis tidak sah;",
            "Menyalahgunakan fitur pembatalan, refund, atau negosiasi harga.",
        ],
    },
    {
        id: "pasal-14",
        number: 14,
        title: "Pajak",
        type: "numbered",
        items: [
            "Setiap pihak bertanggung jawab atas kewajiban perpajakannya masing-masing sesuai ketentuan peraturan perundang-undangan. Pedagang bertanggung jawab atas pajak penghasilan dan PPN atas produknya jika berstatus PKP.",
            "Pengelola hanya memungut atau memotong pajak apabila telah diwajibkan atau ditunjuk resmi oleh Direktorat Jenderal Pajak (DJP). Selama belum ada surat penunjukan resmi, platform beroperasi tanpa pembebanan pajak tambahan pada checkout pembeli (Mode 0).",
        ],
    },
    {
        id: "pasal-15",
        number: 15,
        title: "Pelindungan Data Pribadi",
        type: "numbered",
        items: [
            "Pengelola memproses data pribadi Pengguna sesuai Undang-Undang Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi sebagaimana diatur secara rinci dalam Kebijakan Privasi Platform CibendaMart.",
            "Data Pedagang yang diperoleh dari SID hanya diproses untuk keperluan verifikasi dan pengelolaan Toko.",
            "Data pribadi dibagikan kepada pihak ketiga (Mitra Pembayaran, provider map/notifikasi) hanya sebatas yang diperlukan untuk menjalankan layanan pesanan.",
        ],
    },
    {
        id: "pasal-16",
        number: 16,
        title: "Penangguhan dan Penghentian Akun",
        type: "numbered",
        items: [
            "Pengelola berhak memberikan peringatan, menurunkan produk, menangguhkan, atau menutup permanen akun Pengguna yang terbukti melanggar ketentuan.",
            "Apabila akun Pedagang ditutup, saldo penjualan yang sah tetap menjadi hak Pedagang dan akan dicairkan setelah dikurangi kewajiban pengembalian dana yang belum tuntas.",
        ],
    },
    {
        id: "pasal-17",
        number: 17,
        title: "Batasan Tanggung Jawab",
        type: "numbered",
        items: [
            "Pengelola berupaya menjaga ketersediaan sistem, namun tidak menjamin platform bebas sepenuhnya dari gangguan teknis atau pemeliharaan server.",
            "Pengelola tidak bertanggung jawab atas kerugian tidak langsung yang timbul akibat kelalaian pembeli menjaga kerahasiaan akun atau perselisihan mutu fisik produk di luar mediasi platform.",
        ],
    },
    {
        id: "pasal-18",
        number: 18,
        title: "Keadaan Kahar (Force Majeure)",
        type: "paragraphs",
        paragraphs: [
            "Pengelola dan Pedagang dibebaskan dari tanggung jawab atas keterlambatan pelaksanaan kewajiban akibat keadaan di luar kendali wajar (bencana alam, gempa, tsunami pesisir Pangandaran, cuaca ekstrem, kebakaran, gangguan telekomunikasi nasional, atau kebijakan pembatasan pemerintah).",
        ],
    },
    {
        id: "pasal-19",
        number: 19,
        title: "Penyelesaian Sengketa",
        type: "numbered",
        items: [
            "Perselisihan antara Pembeli dan Pedagang diselesaikan terlebih dahulu melalui musyawarah mufakat.",
            "Jika tidak tercapai kesepakatan, para pihak dapat meminta mediasi kepada Pengelola Pemerintah Desa Cibenda. Pengelola akan memeriksa bukti secara objektif untuk penyaluran dana escrow.",
            "Keputusan mediasi tidak menghapus hak para pihak menempuh penyelesaian melalui BPSK atau Pengadilan Negeri yang berwenang.",
        ],
    },
    {
        id: "pasal-20",
        number: 20,
        title: "Perubahan Syarat dan Ketentuan",
        type: "paragraphs",
        paragraphs: [
            "Pengelola berhak mengubah Syarat dan Ketentuan ini sewaktu-waktu. Perubahan material akan diumumkan melalui Platform paling lambat 7 (tujuh) hari sebelum diberlakukan secara efektif.",
        ],
    },
    {
        id: "pasal-21",
        number: 21,
        title: "Hukum yang Berlaku dan Bahasa",
        type: "paragraphs",
        paragraphs: [
            "Syarat dan Ketentuan ini diatur dan ditafsirkan berdasarkan hukum Negara Republik Indonesia dan disusun dalam Bahasa Indonesia.",
        ],
    },
    {
        id: "pasal-22",
        number: 22,
        title: "Kontak Resmi Pengelola",
        type: "paragraphs",
        paragraphs: [
            "Pertanyaan, pengaduan, atau keperluan mediasi resmi dapat disampaikan langsung ke kantor Pemerintah Desa Cibenda melalui kanal resmi di bawah ini.",
        ],
    },
];

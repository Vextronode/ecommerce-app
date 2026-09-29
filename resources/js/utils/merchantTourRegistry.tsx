import React from "react";
import {
    Store,
    TrendingUp,
    BarChart3,
    Truck,
    MapPin,
    Package,
    Plus,
    Filter,
    Layers,
    Image as ImageIcon,
    FileText,
    Users,
    Wallet,
    Landmark,
    ShieldCheck,
    Settings,
    Clock,
    Star,
    CheckCircle2,
} from "lucide-react";
import { TourStepItem, MerchantTourTabKey } from "@/types/tour";

interface TourContext {
    merchantName?: string;
    storeName?: string;
}

export const merchantTourRegistry: Record<
    MerchantTourTabKey,
    (ctx?: TourContext) => TourStepItem[]
> = {
    // 1. Dashboard Tab
    dashboard: (ctx) => [
        {
            stepNumber: 1,
            targetId: "tour-merchant-header",
            preferredPlacement: "below",
            scrollBlock: "start",
            badge: "Misi 1: Sambutan Mitra",
            title: `Selamat Datang, ${ctx?.merchantName || "Juragan"}!`,
            subtitle: `Ruang Kendali Toko ${ctx?.storeName || "Mitra Cibenda"}`,
            icon: <Store className="w-5 h-5 text-brand-orange" />,
            description:
                "Ruang sapaan dan identitas utama toko Anda. Seluruh aktivitas perniagaan desa berpusat dari dashboard ini.",
            bulletPoints: [
                "Identitas nama toko & status operasional harian",
                "Akses cepat ke profil merchant dan notifikasi transaksi",
            ],
            tips: "Dashboard ini diperbarui otomatis saat ada pesanan baru masuk.",
        },
        {
            stepNumber: 2,
            targetId: "tour-stat-cards",
            preferredPlacement: "below",
            scrollBlock: "start",
            badge: "Misi 2: Finansial & Omset",
            title: "Ringkasan Finansial & Metrik Penjualan",
            subtitle: "Omset, Pesanan, Pelanggan, dan Produk",
            icon: <TrendingUp className="w-5 h-5 text-emerald-500" />,
            description:
                "4 kartu ringkasan ini menyajikan total penjualan bersih, pesanan sukses, pelanggan setia, dan produk aktif di etalase Anda.",
            bulletPoints: [
                "Total Penjualan: Omset bersih yang siap ditarik ke rekening",
                "Total Pesanan: Akumulasi transaksi selesai dari pelanggan",
            ],
            tips: "Klik menu Penarikan Dana di sidebar untuk mencairkan saldo Anda.",
        },
        {
            stepNumber: 3,
            targetId: "tour-sales-chart",
            preferredPlacement: "right",
            scrollBlock: "start",
            badge: "Misi 3: Analisis Grafik",
            title: "Grafik Tren Penjualan Toko",
            subtitle: "Pantau Pola Transaksi Harian & Bulanan",
            icon: <BarChart3 className="w-5 h-5 text-blue-500" />,
            description:
                "Grafik interaktif ini memperlihatkan pergerakan omset untuk membantu Anda merencanakan persediaan barang tani & laut.",
            bulletPoints: [
                "Beralih antara grafik mingguan dan bulanan dengan mudah",
                "Membantu memprediksi hari dengan lonjakan pesanan tertinggi",
            ],
            tips: "Gunakan data ini untuk menentukan jadwal pasokan produk.",
        },
        {
            stepNumber: 4,
            targetId: "tour-order-status",
            preferredPlacement: "left",
            scrollBlock: "center",
            badge: "Misi 4: Alur Logistik",
            title: "Status Pesanan & Pengiriman Kurir",
            subtitle: "Pending, Diproses, Dikirim, dan Selesai",
            icon: <Truck className="w-5 h-5 text-indigo-500" />,
            description:
                "Pesanan terbagi dalam 4 tahapan status jelas. Serah terima ke Kurir Desa dilindungi kode PIN aman.",
            bulletPoints: [
                "Segera proses pesanan baru agar pembeli merasa tenang",
                "Fitur Batch Handover untuk serah terima paket kurir sekaligus",
            ],
            tips: "Pastikan memverifikasi PIN saat kurir menjemput barang.",
        },
    ],

    // 2. Kelola Produk (Index)
    products_index: () => [
        {
            stepNumber: 1,
            targetId: "tour-product-header",
            preferredPlacement: "below",
            scrollBlock: "start",
            badge: "Etalase Toko",
            title: "Katalog & Daftar Produk Jualan",
            subtitle: "Manajemen Komoditas Tani, Laut, & Olahan",
            icon: <Package className="w-5 h-5 text-brand-orange" />,
            description:
                "Di halaman ini Anda dapat melihat dan mengelola seluruh produk yang Anda jual di CibendaMart.",
            bulletPoints: [
                "Pantau stok terkini dari masing-masing komoditas",
                "Ubah tampilan antara tabel list atau kartu grid produk",
            ],
            tips: "Periksa stok berkala untuk mencegah pembeli memesan produk yang habis.",
        },
        {
            stepNumber: 2,
            targetId: "tour-product-create-btn",
            preferredPlacement: "below",
            scrollBlock: "start",
            badge: "Aksi Produk",
            title: "Tombol Tambah Produk Baru",
            subtitle: "Proteksi Wajib Alamat Fisik Toko",
            icon: <Plus className="w-5 h-5 text-emerald-500" />,
            description:
                "Gunakan tombol ini untuk menerbitkan produk baru. Tombol ini otomatis mengarahkan ke Pengaturan jika alamat toko belum dilengkapi.",
            bulletPoints: [
                "Kunci proteksi: Alamat toko wajib terisi sebelum upload produk",
                "Mendukung penetapan varian satuan dan harga grosir/eceran",
            ],
            tips: "Siapkan foto produk yang jelas dan terang sebelum mengunggah.",
        },
        {
            stepNumber: 3,
            targetId: "tour-product-filters",
            preferredPlacement: "below",
            scrollBlock: "start",
            badge: "Filter Cerdas",
            title: "Penyaringan Kategori & Indikator Stok",
            subtitle: "Deteksi Stok Kritis, Menipis, dan Habis",
            icon: <Filter className="w-5 h-5 text-blue-500" />,
            description:
                "Temukan produk dengan cepat menggunakan filter kategori dan status ketersediaan barang.",
            bulletPoints: [
                "Status Kritis: Stok tersisa 1 hingga 5 item",
                "Status Menipis: Stok tersisa 6 hingga 10 item",
            ],
            tips: "Prioritaskan restok untuk produk yang berstatus Kritis.",
        },
        {
            stepNumber: 4,
            targetId: "tour-product-list",
            preferredPlacement: "above",
            scrollBlock: "center",
            badge: "Katalog Toko",
            title: "Tabel Informasi Produk",
            subtitle: "Aksi Edit, Varian, dan Hapus Produk",
            icon: <Layers className="w-5 h-5 text-purple-500" />,
            description:
                "Setiap baris menampilkan gambar, nama komoditas, kategori, harga, stok, dan tombol aksi pengeditan cepat.",
            bulletPoints: [
                "Klik tombol Edit untuk memperbarui harga atau stok harian",
                "Perubahan stok tersinkronisasi realtime ke seluruh pembeli",
            ],
        },
    ],

    // 3. Tambah Produk (Create)
    products_create: () => [
        {
            stepNumber: 1,
            targetId: "tour-product-create-header",
            preferredPlacement: "below",
            scrollBlock: "start",
            badge: "Formulir Baru",
            title: "Langkah Tambah Produk Baru",
            subtitle: "Lengkapi Rincian Barang Jualan",
            icon: <Package className="w-5 h-5 text-brand-orange" />,
            description:
                "Isi informasi produk dengan lengkap dan jelas agar pembeli mudah menemukan barang jualan Anda.",
            bulletPoints: [
                "Pilih kategori yang tepat sesuai komoditas Anda",
                "Tentukan harga jujur dan ketersediaan stok riil",
            ],
        },
        {
            stepNumber: 2,
            targetId: "tour-product-image-upload",
            preferredPlacement: "below",
            scrollBlock: "start",
            badge: "Foto Produk",
            title: "Unggah Foto Produk Berkualitas",
            subtitle: "Maksimal 5 Foto Jelas & Menarik",
            icon: <ImageIcon className="w-5 h-5 text-blue-500" />,
            description:
                "Unggah foto asli dari produk Anda (hasil tani, laut, atau kebun). Foto pertama akan menjadi sampul utama.",
            bulletPoints: [
                "Format yang didukung: JPG, PNG, WEBP (maks. 2MB per foto)",
                "Foto asli meningkatkan kepercayaan pembeli hingga 80%",
            ],
            tips: "Gunakan pencahayaan alami agar warna produk tampak segar.",
        },
        {
            stepNumber: 3,
            targetId: "tour-product-form-details",
            preferredPlacement: "above",
            scrollBlock: "center",
            badge: "Rincian & Varian",
            title: "Nama, Kategori, Harga & Varian",
            subtitle: "Opsi Pre-Order dan Satuan Jual",
            icon: <FileText className="w-5 h-5 text-emerald-500" />,
            description:
                "Tentukan nama produk, kategori, harga dasar, satuan (kg, ikat, bungkus), serta opsi Pre-Order (PO) jika produk membutuhkan waktu panen/olah.",
            bulletPoints: [
                "Gunakan nama produk yang jelas dan spesifik",
                "Aktifkan Pre-Order jika barang dipanen berdasarkan pesanan",
            ],
        },
        {
            stepNumber: 4,
            targetId: "tour-product-preview",
            preferredPlacement: "right",
            scrollBlock: "start",
            badge: "Pratinjau Langsung",
            title: "Live Preview Kartu Produk",
            subtitle: "Tampilan yang Akan Dilihat Pembeli",
            icon: <Store className="w-5 h-5 text-purple-500" />,
            description:
                "Kartu preview ini langsung mencerminkan tampilan produk Anda di aplikasi pembeli sebelum disimpan.",
            bulletPoints: [
                "Pastikan foto, harga, dan badge Pre-Order sudah tepat",
                "Klik tombol Simpan di bawah untuk menerbitkan produk",
            ],
        },
    ],

    // 4. Edit Produk (Edit)
    products_edit: () => [
        {
            stepNumber: 1,
            targetId: "tour-product-edit-header",
            preferredPlacement: "below",
            scrollBlock: "start",
            badge: "Pembaruan Produk",
            title: "Edit Produk & Harga",
            subtitle: "Sesuaikan Rincian Barang Jualan",
            icon: <Package className="w-5 h-5 text-brand-orange" />,
            description:
                "Perbarui harga, stok, atau deskripsi produk mengikuti perubahan pasokan harian Anda.",
            bulletPoints: [
                "Perubahan harga dan stok berlaku instan di etalase pembeli",
                "Anda dapat menambah foto baru atau menghapus foto lama",
            ],
        },
        {
            stepNumber: 2,
            targetId: "tour-product-image-upload",
            preferredPlacement: "below",
            scrollBlock: "start",
            badge: "Foto Produk",
            title: "Kelola Galeri Foto",
            subtitle: "Ganti atau Tambah Foto Produk",
            icon: <ImageIcon className="w-5 h-5 text-blue-500" />,
            description:
                "Hapus foto yang kurang sesuai dan unggah foto terbaru dari produk jualan Anda.",
            bulletPoints: [
                "Klik tombol hapus pada kartu foto untuk menghapus",
                "Unggah foto baru untuk memperbarui sampul",
            ],
        },
        {
            stepNumber: 3,
            targetId: "tour-product-form-details",
            preferredPlacement: "above",
            scrollBlock: "center",
            badge: "Stok & Varian",
            title: "Penyesuaian Stok & Spesifikasi",
            subtitle: "Perbarui Stok Riil di Gudang/Toko",
            icon: <FileText className="w-5 h-5 text-emerald-500" />,
            description:
                "Pastikan angka stok selalu sesuai dengan fisik barang agar tidak terjadi pesanan yang tidak dapat dipenuhi.",
            bulletPoints: [
                "Ubah stok jadi 0 jika barang sementara tidak tersedia",
                "Klik Simpan Perubahan untuk mengonfirmasi pembaruan",
            ],
        },
    ],

    // 5. Pesanan (Orders)
    orders: () => [
        {
            stepNumber: 1,
            targetId: "tour-orders-header",
            preferredPlacement: "below",
            scrollBlock: "start",
            badge: "Manajemen Pesanan",
            title: "Pusat Pengelolaan Pesanan Toko",
            subtitle: "Pantau dan Proses Transaksi Pelanggan",
            icon: <Truck className="w-5 h-5 text-brand-orange" />,
            description:
                "Kelola semua pesanan yang masuk ke toko Anda secara realtime dengan alur logistik desa terintegrasi.",
            bulletPoints: [
                "Notifikasi instan saat ada pembeli menyelesaikan pembayaran",
                "Pelacakan status pengiriman kurir desa secara transparan",
            ],
        },
        {
            stepNumber: 2,
            targetId: "tour-orders-summary",
            preferredPlacement: "below",
            scrollBlock: "start",
            badge: "Status Pesanan",
            title: "Ringkasan Tahapan Pesanan",
            subtitle: "Menunggu, Diproses, dan Selesai",
            icon: <TrendingUp className="w-5 h-5 text-emerald-500" />,
            description:
                "Kartu ringkasan ini memisahkan pesanan berdasarkan status operasional yang perlu Anda tindak lanjuti.",
            bulletPoints: [
                "Segera proses pesanan berstatus Menunggu Konfirmasi",
                "Kemas barang dengan rapi untuk menjaga kesegaran produk",
            ],
            tips: "Gunakan es gel atau kardus bersekat untuk produk laut dan sayur segar.",
        },
        {
            stepNumber: 3,
            targetId: "tour-orders-table",
            preferredPlacement: "above",
            scrollBlock: "center",
            badge: "Daftar Pesanan",
            title: "Tabel Transaksi & Detail Pembeli",
            subtitle: "Lihat Invoice, Alamat, dan Nomor Kontak",
            icon: <FileText className="w-5 h-5 text-blue-500" />,
            description:
                "Daftar lengkap transaksi berisi nomor invoice, nama pembeli, rincian barang, total bayar, dan tombol update status.",
            bulletPoints: [
                "Klik nomor invoice untuk melihat rincian barang belanjaan",
                "Gunakan tombol aksi untuk mengubah status pesanan",
            ],
        },
        {
            stepNumber: 4,
            targetId: "tour-orders-batch-handover",
            preferredPlacement: "above",
            scrollBlock: "center",
            badge: "Logistik Kurir",
            title: "Fitur Batch Handover & Verifikasi PIN",
            subtitle: "Serahkan Banyak Paket Sekaligus ke Kurir Desa",
            icon: <ShieldCheck className="w-5 h-5 text-purple-500" />,
            description:
                "Fitur Batch Handover memungkinkan Anda menyerahkan beberapa paket sekaligus kepada satu kurir desa dalam satu kode aman.",
            bulletPoints: [
                "Kurir desa memindai atau memasukkan kode serah terima",
                "Verifikasi PIN menjamin paket aman dan tidak tertukar",
            ],
        },
    ],

    // 6. Pelanggan (Customers)
    customers: () => [
        {
            stepNumber: 1,
            targetId: "tour-customers-header",
            preferredPlacement: "below",
            scrollBlock: "start",
            badge: "Basis Pelanggan",
            title: "Kelola & Analisis Pelanggan",
            subtitle: "Bangun Hubungan Erat dengan Warga Pembeli",
            icon: <Users className="w-5 h-5 text-brand-orange" />,
            description:
                "Ketahui siapa saja pelanggan setia yang sering berbelanja produk tani dan laut di toko Anda.",
            bulletPoints: [
                "Pantau tren pertumbuhan pelanggan baru setiap bulan",
                "Analisis total nilai belanja dari masing-masing pelanggan",
            ],
        },
        {
            stepNumber: 2,
            targetId: "tour-customers-stats",
            preferredPlacement: "below",
            scrollBlock: "start",
            badge: "Pertumbuhan",
            title: "Statistik Total & Pelanggan Baru",
            subtitle: "Pertumbuhan Pasar Digital Toko Anda",
            icon: <TrendingUp className="w-5 h-5 text-emerald-500" />,
            description:
                "Melihat seberapa banyak pelanggan baru yang bergabung dan membeli produk Anda dalam 30 hari terakhir.",
            bulletPoints: [
                "Total Pelanggan: Akumulasi seluruh pembeli unik",
                "Pelanggan Baru: Pembeli yang bertransaksi pertama kali",
            ],
        },
        {
            stepNumber: 3,
            targetId: "tour-customers-table",
            preferredPlacement: "above",
            scrollBlock: "center",
            badge: "Riwayat Pembeli",
            title: "Daftar Pelanggan & Riwayat Pesanan",
            subtitle: "Kontak dan Total Transaksi Pelanggan",
            icon: <FileText className="w-5 h-5 text-blue-500" />,
            description:
                "Tabel ini memuat nama pelanggan, email/nomor telepon, total pesanan yang pernah dibuat, serta tanggal transaksi terakhir.",
            bulletPoints: [
                "Ketahui pelanggan prioritas yang loyal pada toko Anda",
                "Gunakan informasi ini untuk menjaga kualitas produk tetap prima",
            ],
        },
    ],

    // 7. Laporan & Analisis (Analytics)
    analytics: () => [
        {
            stepNumber: 1,
            targetId: "tour-analytics-header",
            preferredPlacement: "below",
            scrollBlock: "start",
            badge: "Laporan Bisnis",
            title: "Ikhtisar Analisis Kinerja Usaha",
            subtitle: "Data Performa Toko Berbasis Angka Nyata",
            icon: <BarChart3 className="w-5 h-5 text-brand-orange" />,
            description:
                "Halaman analisis menyajikan data mendalam tentang omset, tren pesanan, rating toko, dan komoditas terlaris.",
            bulletPoints: [
                "Pilih periode analisis (1 bulan, 6 bulan, atau 12 bulan)",
                "Bantu Anda membuat keputusan bisnis yang lebih terukur",
            ],
        },
        {
            stepNumber: 2,
            targetId: "tour-analytics-overview",
            preferredPlacement: "below",
            scrollBlock: "start",
            badge: "Metrik Kunci",
            title: "Kartu Indikator Kinerja Utama",
            subtitle: "Pendapatan, Pesanan, Nilai Keranjang, dan Rating",
            icon: <TrendingUp className="w-5 h-5 text-emerald-500" />,
            description:
                "4 indikator utama memperlihatkan omset total, pertumbuhan pesanan, rata-rata belanja per transaksi, dan kepuasan pembeli.",
            bulletPoints: [
                "Rating Toko: Rata-rata bintang kepuasan ulasan pembeli",
                "Rata-rata Pesanan: Nilai belanja tipikal per transaksi",
            ],
        },
        {
            stepNumber: 3,
            targetId: "tour-analytics-revenue-chart",
            preferredPlacement: "right",
            scrollBlock: "start",
            badge: "Grafik Pendapatan",
            title: "Tren Pendapatan Bulanan",
            subtitle: "Pantau Kenaikan dan Penurunan Omset",
            icon: <BarChart3 className="w-5 h-5 text-blue-500" />,
            description:
                "Grafik visual omset bersih bulanan yang membantu Anda melihat stabilitas pendapatan toko dari waktu ke waktu.",
            bulletPoints: [
                "Mendeteksi tren musiman hasil tani atau tangkapan laut",
                "Bandingkan performa bulan ini dengan bulan sebelumnya",
            ],
        },
        {
            stepNumber: 4,
            targetId: "tour-analytics-best-sellers",
            preferredPlacement: "above",
            scrollBlock: "center",
            badge: "Produk Unggulan",
            title: "Peringkat Produk Terlaris",
            subtitle: "Komoditas Favorit Pilihan Pelanggan",
            icon: <Star className="w-5 h-5 text-amber-500" />,
            description:
                "Daftar produk dengan jumlah penjualan dan kontribusi omset tertinggi di toko Anda.",
            bulletPoints: [
                "Pastikan ketersediaan stok produk unggulan selalu aman",
                "Gunakan produk terlaris sebagai daya tarik utama toko",
            ],
        },
    ],

    // 8. Pengaturan Toko (Settings - tidak memerlukan panduan)
    settings: () => [],

    // 9. Penarikan Saldo (Withdrawals)
    withdrawals: () => [
        {
            stepNumber: 1,
            targetId: "tour-withdrawals-stats",
            preferredPlacement: "below",
            scrollBlock: "start",
            badge: "Arus Kas",
            title: "Status Saldo & Total Pendapatan",
            subtitle: "Saldo Tersedia vs Saldo Tertahan",
            icon: <Wallet className="w-5 h-5 text-brand-orange" />,
            description:
                "Pantau saldo hasil penjualan yang siap dicairkan ke rekening bank Anda.",
            bulletPoints: [
                "Saldo Tersedia: Dana dari pesanan selesai yang siap ditarik",
                "Saldo Tertahan: Dana dari pesanan yang sedang dalam proses pengiriman",
            ],
            tips: "Dana otomatis masuk ke Saldo Tersedia begitu pesanan diterima pembeli.",
        },
        {
            stepNumber: 2,
            targetId: "tour-withdrawals-bank",
            preferredPlacement: "below",
            scrollBlock: "start",
            badge: "Rekening Tujuan",
            title: "Rekening Bank Pencairan Dana",
            subtitle: "Dukungan Bank Lokal (BRI, Mandiri, BCA, BNI, dll)",
            icon: <Landmark className="w-5 h-5 text-blue-500" />,
            description:
                "Pastikan nomor rekening dan nama pemilik rekening bank sudah sesuai untuk kelancaran transfer pencairan.",
            bulletPoints: [
                "Nama pemilik rekening harus sesuai dengan buku tabungan",
                "Hubungi administrator jika ingin memperbarui data rekening bank",
            ],
        },
        {
            stepNumber: 3,
            targetId: "tour-withdrawals-form",
            preferredPlacement: "above",
            scrollBlock: "center",
            badge: "Formulir Tarik",
            title: "Pengajuan Penarikan Saldo",
            subtitle: "Proses Cepat & Transparan",
            icon: <TrendingUp className="w-5 h-5 text-emerald-500" />,
            description:
                "Masukkan nominal saldo yang ingin ditarik ke rekening bank. Minimal penarikan saldo adalah Rp 10.000.",
            bulletPoints: [
                "Pencairan diverifikasi oleh tim keuangan desa",
                "Riwayat status penarikan dapat dipantau di tabel bawah",
            ],
        },
        {
            stepNumber: 4,
            targetId: "tour-withdrawals-history",
            preferredPlacement: "above",
            scrollBlock: "center",
            badge: "Riwayat Pencairan",
            title: "Tabel Riwayat Penarikan Dana",
            subtitle: "Nomor Referensi & Status Transfer",
            icon: <Clock className="w-5 h-5 text-purple-500" />,
            description:
                "Daftar lengkap seluruh riwayat pencairan saldo beserta nomor referensi, nominal, tanggal, dan status transfer.",
            bulletPoints: [
                "Status Pending: Sedang dalam antrean pemrosesan bank",
                "Status Selesai: Dana telah berhasil ditransfer ke rekening Anda",
            ],
            tips: "Seluruh tur pengenalan fitur toko selesai! Selanjutnya mari lengkapi alamat toko Anda di Pengaturan.",
        },
    ],
};

/**
 * Mendapatkan daftar langkah tour berdasarkan tab aktif
 */
export function getMerchantTourSteps(
    tabKey: MerchantTourTabKey,
    context?: TourContext
): TourStepItem[] {
    const factory = merchantTourRegistry[tabKey];
    return factory ? factory(context) : [];
}

/**
 * Mendapatkan title tab untuk header panduan
 */
export function getTourTabTitle(tabKey: MerchantTourTabKey): string {
    switch (tabKey) {
        case "dashboard":
            return "Dashboard Toko";
        case "products_index":
            return "Kelola Produk";
        case "products_create":
            return "Tambah Produk";
        case "products_edit":
            return "Edit Produk";
        case "orders":
            return "Kelola Pesanan";
        case "customers":
            return "Kelola Pelanggan";
        case "analytics":
            return "Laporan & Analisis";
        case "settings":
            return "Pengaturan Toko";
        case "withdrawals":
            return "Penarikan Saldo";
        default:
            return "Panduan Halaman";
    }
}

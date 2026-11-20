import React from "react";
import { Head, Link } from "@inertiajs/react";
import StorefrontLayout from "@/Layouts/StorefrontLayout";
import {
    Shield,
    ArrowLeft,
    Lock,
    Eye,
    Database,
    MapPin,
    UserCheck,
    HelpCircle,
    FileText,
} from "lucide-react";

export default function PrivacyPolicy() {
    return (
        <StorefrontLayout>
            <Head title="Kebijakan Privasi - CibendaMart" />

            <div className="bg-slate-50 min-h-screen pt-28 pb-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header Nav */}
                    <div className="mb-6 flex items-center justify-between">
                        <Link
                            href={route("dashboard")}
                            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-brand-orange transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Kembali ke Beranda
                        </Link>
                        <span className="text-xs font-medium text-slate-500 bg-white px-3 py-1.5 rounded-full border border-slate-200">
                            Versi: 1.0 (20 November 2026)
                        </span>
                    </div>

                    {/* Main Document Card */}
                    <article className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-slate-200/80">
                        {/* Title Header */}
                        <div className="border-b border-slate-100 pb-8 mb-8">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-brand-orange-tint border border-brand-orange/30 flex items-center justify-center text-brand-orange">
                                    <Shield className="w-6 h-6" />
                                </div>
                                <div>
                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                        Pemerintah Desa Cibenda
                                    </span>
                                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                                        Kebijakan Privasi (Pelindungan Data Pribadi)
                                    </h1>
                                </div>
                            </div>
                            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                                Pemerintah Desa Cibenda, Kecamatan Parigi, Kabupaten Pangandaran berkomitmen penuh melindungi hak privasi dan kerahasiaan data pribadi seluruh pengguna platform CibendaMart (Cimart) sesuai ketentuan Undang-Undang Republik Indonesia Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP). Dokumen ini merinci jenis data yang kami kumpulkan, tujuan pemrosesan, dasar hukum, serta hak-hak Anda sebagai subjek data.
                            </p>
                        </div>

                        {/* Content Clauses */}
                        <div className="space-y-10 text-slate-700 text-sm sm:text-base leading-relaxed">
                            {/* Bagian 1: Pengendali Data */}
                            <section className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold bg-brand-orange-tint text-brand-orange border border-brand-orange/20 px-2.5 py-1 rounded-lg">
                                        Bagian 1
                                    </span>
                                    <h2 className="text-lg font-bold text-slate-900">
                                        Identitas Pengendali Data Pribadi
                                    </h2>
                                </div>
                                <p className="text-slate-600">
                                    Pengendali data pribadi atas seluruh pemrosesan data pada platform CibendaMart adalah <strong>Pemerintah Desa Cibenda</strong>, beralamat di Kantor Kepala Desa Cibenda, Kecamatan Parigi, Kabupaten Pangandaran, Jawa Barat. Pengelola bertindak sebagai pihak yang menentukan tujuan dan melakukan kendali atas pemrosesan data pribadi demi terselenggaranya layanan e-commerce dan logistik digital desa.
                                </p>
                            </section>

                            {/* Bagian 2: Data yang Dikumpulkan */}
                            <section className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold bg-brand-orange-tint text-brand-orange border border-brand-orange/20 px-2.5 py-1 rounded-lg">
                                        Bagian 2
                                    </span>
                                    <h2 className="text-lg font-bold text-slate-900">
                                        Data Pribadi yang Kami Kumpulkan dan Proses
                                    </h2>
                                </div>
                                <p className="text-slate-600">
                                    Dalam mengoperasikan platform, kami mengumpulkan data pribadi yang Anda berikan secara langsung maupun yang dihasilkan saat bertransaksi:
                                </p>
                                <ul className="list-disc pl-5 space-y-2 text-slate-600">
                                    <li>
                                        <strong>Identitas Akun & Profil:</strong> Nama lengkap, alamat surat elektronik (email), nomor telepon/WhatsApp, foto profil, dan kata sandi terenkripsi.
                                    </li>
                                    <li>
                                        <strong>Akun Pihak Ketiga (Google OAuth):</strong> Identifikasi unik akun Google, nama, dan alamat email ketika Anda memilih mendaftar atau masuk menggunakan fitur Masuk dengan Google.
                                    </li>
                                    <li>
                                        <strong>Data Verifikasi Mitra Pedagang (Spesifik):</strong> Nomor Induk Kependudukan (NIK) penanggung jawab usaha, nomor Surat Keterangan Usaha (SKU) dari Sistem Informasi Desa (SIDUTama), dan nama merek usaha.
                                    </li>
                                    <li>
                                        <strong>Alamat & Geolokasi:</strong> Alamat lengkap pengiriman, catatan patokan, koordinat GPS (latitude dan longitude) untuk perhitungan jarak, ongkos kirim, dan navigasi kurir lokal desa.
                                    </li>
                                    <li>
                                        <strong>Lokasi Kurir Secara Langsung (Live Tracking):</strong> Posisi GPS kurir desa saat membawa paket pesanan aktif disiarkan secara aman dan real-time kepada pembeli dan toko hingga paket diserahterimakan.
                                    </li>
                                    <li>
                                        <strong>Data Transaksi Finansial & Rekening:</strong> Riwayat pesanan, status pembayaran, nomor rekening bank dan nama pemilik rekening untuk keperluan pencairan saldo hasil penjualan toko mitra. Kami tidak menyimpan detail kartu kredit/kredensial pembayaran sensitif; pembayaran diproses melalui gerbang pembayaran resmi berizin Bank Indonesia.
                                    </li>
                                    <li>
                                        <strong>Pesan dan Media Obrolan:</strong> Pesan teks, tawaran negosiasi harga, dan lampiran gambar produk dalam fitur chat antara pembeli dan pedagang disimpan untuk keperluan arsip transaksi dan mediasi sengketa.
                                    </li>
                                </ul>
                            </section>

                            {/* Bagian 3: Tujuan & Dasar Hukum Pemrosesan */}
                            <section className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold bg-brand-orange-tint text-brand-orange border border-brand-orange/20 px-2.5 py-1 rounded-lg">
                                        Bagian 3
                                    </span>
                                    <h2 className="text-lg font-bold text-slate-900">
                                        Tujuan dan Dasar Hukum Pemrosesan Data
                                    </h2>
                                </div>
                                <p className="text-slate-600">
                                    Pemrosesan data pribadi dilakukan berdasarkan persetujuan eksplisit Anda, pelaksanaan kontrak transaksi jual beli dan kemitraan, serta kepentingan umum penyelenggaraan tata kelola ekonomi desa:
                                </p>
                                <ul className="list-disc pl-5 space-y-2 text-slate-600">
                                    <li>
                                        Memvalidasi keabsahan pedagang lokal warga Desa Cibenda yang memiliki izin usaha terverifikasi dari SIDUTama.
                                    </li>
                                    <li>
                                        Memproses pemesanan barang, pembayaran aman melalui penampung escrow, dan pencairan dana toko.
                                    </li>
                                    <li>
                                        Mengoperasikan armada kurir lokal dalam mengantar pesanan ke titik alamat pembeli dengan akurat.
                                    </li>
                                    <li>
                                        Memfasilitasi negosiasi kesepakatan harga dan komunikasi jual beli langsung antarwarga.
                                    </li>
                                    <li>
                                        Menyediakan fasilitas mediasi perselisihan konsumen oleh pengurus desa secara objektif.
                                    </li>
                                </ul>
                            </section>

                            {/* Bagian 4: Pembagian Data kepada Pihak Ketiga */}
                            <section className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold bg-brand-orange-tint text-brand-orange border border-brand-orange/20 px-2.5 py-1 rounded-lg">
                                        Bagian 4
                                    </span>
                                    <h2 className="text-lg font-bold text-slate-900">
                                        Pengungkapan dan Pembagian Data
                                    </h2>
                                </div>
                                <p className="text-slate-600">
                                    Kami tidak pernah menjual, menyewakan, atau memperdagangkan data pribadi Anda kepada pihak komersial mana pun. Data hanya dibagikan secara terbatas untuk kelancaran transaksi:
                                </p>
                                <ul className="list-disc pl-5 space-y-2 text-slate-600">
                                    <li>
                                        <strong>Mitra Pedagang:</strong> Menerima nama pembeli, nomor kontak WhatsApp, dan alamat pengantaran untuk penyiapan barang.
                                    </li>
                                    <li>
                                        <strong>Kurir Lokal Desa:</strong> Menerima nama penerima, nomor kontak, rute alamat dan koordinat GPS paket untuk pengiriman.
                                    </li>
                                    <li>
                                        <strong>Gerbang Pembayaran Berizin (Payment Gateway):</strong> Menerima identitas transaksi dan nominal untuk pemrosesan Virtual Account, QRIS, dan e-wallet.
                                    </li>
                                    <li>
                                        <strong>Pemerintah & Penegak Hukum:</strong> Hanya jika diwajibkan secara sah oleh peraturan perundang-undangan Republik Indonesia.
                                    </li>
                                </ul>
                            </section>

                            {/* Bagian 5: Keamanan & Penyimpanan Data */}
                            <section className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold bg-brand-orange-tint text-brand-orange border border-brand-orange/20 px-2.5 py-1 rounded-lg">
                                        Bagian 5
                                    </span>
                                    <h2 className="text-lg font-bold text-slate-900">
                                        Keamanan dan Retensi Data Pribadi
                                    </h2>
                                </div>
                                <p className="text-slate-600">
                                    Kami menerapkan langkah teknis dan organisasi yang ketat guna melindungi data pribadi Anda dari akses tidak sah, kebocoran, kehilangan, atau perusakan:
                                </p>
                                <ul className="list-disc pl-5 space-y-2 text-slate-600">
                                    <li>
                                        Transmisi data dilindungi dengan enkripsi Transport Layer Security (TLS/HTTPS).
                                    </li>
                                    <li>
                                        Kata sandi pengguna diacak dengan fungsi hashing kriptografis satu arah yang kuat.
                                    </li>
                                    <li>
                                        Akses administratif dibatasi hanya bagi staf berwenang Pemerintah Desa Cibenda dengan pencatatan jejak audit (audit log).
                                    </li>
                                    <li>
                                        Data akun disimpan selama akun aktif. Data transaksi finansial disimpan minimal selama 5 (lima) tahun sesuai ketentuan peraturan pembukuan dan hukum transaksi elektronik di Indonesia.
                                    </li>
                                </ul>
                            </section>

                            {/* Bagian 6: Hak-Hak Subjek Data */}
                            <section className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold bg-brand-orange-tint text-brand-orange border border-brand-orange/20 px-2.5 py-1 rounded-lg">
                                        Bagian 6
                                    </span>
                                    <h2 className="text-lg font-bold text-slate-900">
                                        Hak Anda Menurut UU Pelindungan Data Pribadi
                                    </h2>
                                </div>
                                <p className="text-slate-600">
                                    Sesuai Pasal 5 sampai Pasal 13 UU No. 27 Tahun 2022, Anda sebagai subjek data memiliki hak-hak fundamental berikut:
                                </p>
                                <ul className="list-disc pl-5 space-y-2 text-slate-600">
                                    <li>
                                        <strong>Hak Akses & Informasi:</strong> Mengetahui kejelasan identitas pengendali dan salinan data pribadi yang diproses.
                                    </li>
                                    <li>
                                        <strong>Hak Perbaikan & Pembaruan:</strong> Mengoreksi atau memperbarui informasi profil akun dan alamat Anda secara mandiri di halaman profil atau dengan bantuan pengelola.
                                    </li>
                                    <li>
                                        <strong>Hak Penghapusan & Pemusnahan (Right to Erasure):</strong> Meminta penghapusan atau penutupan akun dan data pribadi Anda apabila tujuan pemrosesan telah berakhir dan tidak bertentangan dengan kewajiban retensi hukum.
                                    </li>
                                    <li>
                                        <strong>Hak Penarikan Persetujuan:</strong> Menarik kembali persetujuan pemrosesan data tertentu dengan konsekuensi pembatasan fitur tertentu pada platform.
                                    </li>
                                    <li>
                                        <strong>Hak Pengaduan:</strong> Menyampaikan keberatan atas dugaan kegagalan pelindungan data pribadi kepada pengelola atau lembaga pengawas pelindungan data pribadi.
                                    </li>
                                </ul>
                            </section>

                            {/* Bagian 7: Kontak & Pengaduan */}
                            <section className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold bg-brand-orange-tint text-brand-orange border border-brand-orange/20 px-2.5 py-1 rounded-lg">
                                        Bagian 7
                                    </span>
                                    <h2 className="text-lg font-bold text-slate-900">
                                        Kontak Pengelola dan Pengaduan Privasi
                                    </h2>
                                </div>
                                <p className="text-slate-600">
                                    Apabila Anda memiliki pertanyaan, permohonan penggunaan hak subjek data, atau keluhan terkait pelindungan data pribadi di CibendaMart, Anda dapat menghubungi kami melalui:
                                </p>
                                <div className="p-4 rounded-2xl bg-slate-100/80 border border-slate-200/80 text-xs sm:text-sm text-slate-700 space-y-1.5">
                                    <p className="font-bold text-slate-900">
                                        Unit Layanan Pelindungan Data - Pemerintah Desa Cibenda
                                    </p>
                                    <p>Alamat: Jl. Raya Cibenda No. 01, Kec. Parigi, Kab. Pangandaran, Jawa Barat 46393</p>
                                    <p>Surat Elektronik: <span className="font-mono text-brand-orange font-semibold">privasi@cibenda.desa.id</span></p>
                                    <p>WhatsApp Helpdesk: <span className="font-semibold">+62 812-3456-7890</span> (Jam Kerja Kantor Desa)</p>
                                </div>
                            </section>
                        </div>

                        {/* Footer Links */}
                        <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3 text-slate-600 text-xs sm:text-sm">
                                <Shield className="w-5 h-5 text-brand-orange shrink-0" />
                                <span>Kerahasiaan dan integritas data Anda adalah amanah warga Desa Cibenda.</span>
                            </div>
                            <div className="flex items-center gap-4 text-xs sm:text-sm font-bold text-brand-orange">
                                <Link
                                    href={route("legal.terms")}
                                    className="hover:text-brand-orange-hover transition"
                                >
                                    Syarat & Ketentuan &rarr;
                                </Link>
                            </div>
                        </div>
                    </article>
                </div>
            </div>
        </StorefrontLayout>
    );
}

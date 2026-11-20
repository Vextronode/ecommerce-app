    import React from "react";
import { Head, Link } from "@inertiajs/react";
import StorefrontLayout from "@/Layouts/StorefrontLayout";
import { FileText, ShieldCheck, ArrowLeft, Building2, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function MerchantAgreement() {
    return (
        <StorefrontLayout>
            <Head title="Perjanjian Mitra Pedagang - CibendaMart" />

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
                            Versi Dokumen: 1.2 (November 2026)
                        </span>
                    </div>

                    {/* Main Document Card */}
                    <article className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-slate-200/80">
                        {/* Title & Organization Header */}
                        <div className="border-b border-slate-100 pb-8 mb-8">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-brand-orange-tint border border-brand-orange/30 flex items-center justify-center text-brand-orange">
                                    <Building2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                        Pemerintah Desa Cibenda
                                    </span>
                                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                                        Perjanjian Kemitraan Pedagang CibendaMart
                                    </h1>
                                </div>
                            </div>
                            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                                Dokumen ini mengatur hak, kewajiban, standar operasional, dan pedoman kemitraan antara pengelola platform CibendaMart (Pemerintah Desa Cibenda, Kec. Parigi, Kab. Pangandaran) dengan pelaku usaha atau pedagang lokal yang membuka toko di platform.
                            </p>
                        </div>

                        {/* Document Clauses */}
                        <div className="space-y-10 text-slate-700 text-sm sm:text-base leading-relaxed">
                            {/* Pasal 1 */}
                            <section className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold bg-brand-orange-tint text-brand-orange border border-brand-orange/20 px-2.5 py-1 rounded-lg">
                                        Pasal 1
                                    </span>
                                    <h2 className="text-lg font-bold text-slate-900">
                                        Ketentuan Umum dan Legalitas Usaha
                                    </h2>
                                </div>
                                <ul className="list-disc pl-5 space-y-2 text-slate-600">
                                    <li>
                                        Calon pedagang wajib berdomisili atau memiliki aktivitas usaha yang sah di wilayah Desa Cibenda dan sekitarnya (Kecamatan Parigi, Kabupaten Pangandaran).
                                    </li>
                                    <li>
                                        Pendaftaran toko terintegrasi langsung dengan database Sistem Informasi Desa (SIDUTama) Desa Cibenda. Pedagang wajib memiliki Surat Keterangan Usaha (SKU) yang aktif dan terverifikasi oleh Kantor Desa Cibenda.
                                    </li>
                                    <li>
                                        Toko yang tidak memiliki SKU sah atau mengalami pembatalan izin usaha dari pemerintah desa akan dibekukan sementara hingga status perizinan diperbarui.
                                    </li>
                                </ul>
                            </section>

                            {/* Pasal 2 */}
                            <section className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold bg-brand-orange-tint text-brand-orange border border-brand-orange/20 px-2.5 py-1 rounded-lg">
                                        Pasal 2
                                    </span>
                                    <h2 className="text-lg font-bold text-slate-900">
                                        Standar Produk dan Larangan Penjualan
                                    </h2>
                                </div>
                                <ul className="list-disc pl-5 space-y-2 text-slate-600">
                                    <li>
                                        Pedagang bertanggung jawab penuh atas keaslian, kelayakan, keamanan, dan kehalalan/keterangan produk yang dijual. Khusus produk makanan basah, olahan seafood, dan sayuran segar wajib menjamin kesegaran barang saat diserahkan ke pembeli atau kurir.
                                    </li>
                                    <li>
                                        Dilarang keras memperjualbelikan minuman keras/beralkohol, obat-obatan terlarang, senjata tajam/senjata api, barang hasil tindak kejahatan, serta barang kadaluarsa atau berbahaya lainnya.
                                    </li>
                                    <li>
                                        Foto dan deskripsi produk yang diunggah harus mencerminkan kondisi barang sebenarnya tanpa manipulasi yang merugikan konsumen.
                                    </li>
                                </ul>
                            </section>

                            {/* Pasal 3 */}
                            <section className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold bg-brand-orange-tint text-brand-orange border border-brand-orange/20 px-2.5 py-1 rounded-lg">
                                        Pasal 3
                                    </span>
                                    <h2 className="text-lg font-bold text-slate-900">
                                        Service Level Agreement (SLA) Pesanan
                                    </h2>
                                </div>
                                <ul className="list-disc pl-5 space-y-2 text-slate-600">
                                    <li>
                                        Pedagang wajib merespons dan menyiapkan pesanan yang masuk maksimal dalam waktu 1x24 jam sejak order diterima.
                                    </li>
                                    <li>
                                        Apabila pesanan tidak diproses dalam batas waktu tersebut tanpa pemberitahuan resmi, Pengelola berhak membatalkan pesanan demi melindungi hak pembeli.
                                    </li>
                                    <li>
                                        Untuk pengiriman kurir lokal, pedagang wajib mengemas pesanan dengan aman sesuai standar perlindungan paket sebelum diserahterimakan kepada petugas kurir.
                                    </li>
                                </ul>
                            </section>

                            {/* Pasal 4 */}
                            <section className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold bg-brand-orange-tint text-brand-orange border border-brand-orange/20 px-2.5 py-1 rounded-lg">
                                        Pasal 4
                                    </span>
                                    <h2 className="text-lg font-bold text-slate-900">
                                        Biaya Platform, Pajak, dan Penarikan Dana
                                    </h2>
                                </div>
                                <ul className="list-disc pl-5 space-y-2 text-slate-600">
                                    <li>
                                        Platform CibendaMart beroperasi dengan skema bagi hasil/biaya layanan yang ditetapkan secara transparan oleh Pemerintah Desa Cibenda untuk pemeliharaan server, operasional kurir lokal, dan kas pembangunan desa.
                                    </li>
                                    <li>
                                        Pengelola CibendaMart tidak memungut pajak secara otomatis pada transaksi, kecuali apabila diwajibkan secara tegas atau ditunjuk resmi oleh Direktorat Jenderal Pajak (DJP) sesuai ketentuan perpajakan yang berlaku. Pedagang bertanggung jawab secara mandiri atas kepatuhan kewajiban perpajakan usahanya.
                                    </li>
                                    <li>
                                        Dana hasil penjualan bersih akan masuk ke saldo penjualan toko pedagang setelah pesanan terkonfirmasi selesai oleh pembeli. Pedagang dapat mengajukan pencairan saldo ke rekening bank terdaftar kapan saja selama fitur penarikan dalam status aktif.
                                    </li>
                                </ul>
                            </section>

                            {/* Pasal 5 */}
                            <section className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold bg-brand-orange-tint text-brand-orange border border-brand-orange/20 px-2.5 py-1 rounded-lg">
                                        Pasal 5
                                    </span>
                                    <h2 className="text-lg font-bold text-slate-900">
                                        Sanksi dan Penangguhan Akun
                                    </h2>
                                </div>
                                <p className="text-slate-600">
                                    Pengelola berhak memberikan teguran, menonaktifkan produk, atau menutup akun toko pedagang untuk sementara maupun permanen apabila:
                                </p>
                                <ul className="list-disc pl-5 space-y-2 text-slate-600">
                                    <li>Melakukan transaksi fiktif atau manipulasi penilaian ulasan toko.</li>
                                    <li>Menerima komplain barang rusak atau basi berulang kali tanpa komitmen perbaikan.</li>
                                    <li>Melakukan tindakan penipuan atau merugikan masyarakat Desa Cibenda.</li>
                                </ul>
                            </section>
                        </div>

                        {/* Footer Confirmation Notice */}
                        <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3 text-slate-600 text-xs sm:text-sm">
                                <ShieldCheck className="w-5 h-5 text-status-success shrink-0" />
                                <span>Perjanjian ini berlaku mengikat sejak toko pertama kali diverifikasi oleh Admin.</span>
                            </div>
                            <div className="flex items-center gap-4 text-xs sm:text-sm font-bold text-brand-orange">
                                <Link
                                    href={route("legal.privacy")}
                                    className="hover:text-brand-orange-hover transition"
                                >
                                    Kebijakan Privasi
                                </Link>
                                <span className="text-slate-300">•</span>
                                <Link
                                    href={route("legal.refund")}
                                    className="hover:text-brand-orange-hover transition"
                                >
                                    Kebijakan Refund &rarr;
                                </Link>
                            </div>
                        </div>
                    </article>
                </div>
            </div>
        </StorefrontLayout>
    );
}

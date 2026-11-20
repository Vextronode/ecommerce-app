import React from "react";
import { Head, Link } from "@inertiajs/react";
import StorefrontLayout from "@/Layouts/StorefrontLayout";
import { ShieldCheck, ArrowLeft, RefreshCw, AlertCircle, CheckCircle, Clock } from "lucide-react";

export default function RefundPolicy() {
    return (
        <StorefrontLayout>
            <Head title="Kebijakan Refund & Retur - CibendaMart" />

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
                            Versi Kebijakan: 1.1 (November 2026)
                        </span>
                    </div>

                    {/* Main Document Card */}
                    <article className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-slate-200/80">
                        {/* Title Header */}
                        <div className="border-b border-slate-100 pb-8 mb-8">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-status-success-tint border border-status-success/30 flex items-center justify-center text-status-success">
                                    <RefreshCw className="w-6 h-6" />
                                </div>
                                <div>
                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                        Perlindungan Hak Konsumen
                                    </span>
                                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                                        Kebijakan Pengembalian Dana dan Barang (Refund & Retur)
                                    </h1>
                                </div>
                            </div>
                            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                                CibendaMart berkomitmen memastikan transaksi jual beli antara pembeli dan pelaku usaha lokal Desa Cibenda berlangsung adil, transparan, dan terpercaya. Kebijakan ini menjelaskan syarat serta alur klaim pengembalian dana atau retur produk.
                            </p>
                        </div>

                        {/* Content Clauses */}
                        <div className="space-y-10 text-slate-700 text-sm sm:text-base leading-relaxed">
                            {/* Bagian 1 */}
                            <section className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold bg-status-success-tint text-status-success-dark border border-status-success/20 px-2.5 py-1 rounded-lg">
                                        Bagian 1
                                    </span>
                                    <h2 className="text-lg font-bold text-slate-900">
                                        Sistem Perlindungan Rekening Penampung (Escrow)
                                    </h2>
                                </div>
                                <p className="text-slate-600">
                                    Setiap pembayaran yang dilakukan pembeli (baik melalui Virtual Account, QRIS, maupun e-wallet) tidak langsung diteruskan ke rekening pedagang, melainkan disimpan dengan aman dalam sistem penampung sementara (Escrow) CibendaMart. Dana baru akan diteruskan ke saldo toko pedagang setelah barang terkonfirmasi diterima dengan baik oleh pembeli.
                                </p>
                            </section>

                            {/* Bagian 2 */}
                            <section className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold bg-status-success-tint text-status-success-dark border border-status-success/20 px-2.5 py-1 rounded-lg">
                                        Bagian 2
                                    </span>
                                    <h2 className="text-lg font-bold text-slate-900">
                                        Kondisi yang Memenuhi Syarat Refund
                                    </h2>
                                </div>
                                <p className="text-slate-600">
                                    Pembeli berhak mengajukan permohonan pengembalian dana atau retur barang dalam situasi berikut:
                                </p>
                                <ul className="list-disc pl-5 space-y-2 text-slate-600">
                                    <li>
                                        <strong>Hak Pembatalan Akibat Keterlambatan Respon:</strong> Pedagang tidak merespons atau tidak menyiapkan pesanan dalam waktu lebih dari 1x24 jam sejak order masuk. Dalam kondisi ini, pembeli atau Pengelola berhak membatalkan pesanan.
                                    </li>
                                    <li>
                                        <strong>Produk Rusak atau Basi:</strong> Produk olahan segar (hasil laut/seafood Pangandaran, sayuran, makanan siap saji) diterima dalam keadaan basi, busuk, atau tidak higienis.
                                    </li>
                                    <li>
                                        <strong>Ketidaksesuaian Barang:</strong> Produk yang diterima berbeda jauh dengan pesanan (salah varian, salah ukuran berat timbangan, atau jumlah barang kurang).
                                    </li>
                                    <li>
                                        <strong>Paket Hilang:</strong> Pesanan hilang dalam proses pengantaran oleh pihak kurir.
                                    </li>
                                </ul>
                            </section>

                            {/* Bagian 3 */}
                            <section className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold bg-status-success-tint text-status-success-dark border border-status-success/20 px-2.5 py-1 rounded-lg">
                                        Bagian 3
                                    </span>
                                    <h2 className="text-lg font-bold text-slate-900">
                                        Syarat Bukti, Saluran Aduan, dan Batas Waktu Pengajuan
                                    </h2>
                                </div>
                                <ul className="list-disc pl-5 space-y-2 text-slate-600">
                                    <li>
                                        Untuk pesanan produk basah atau makanan segar, komplain wajib diajukan maksimal <strong>1x24 jam</strong> sejak status pesanan dinyatakan selesai oleh kurir lokal.
                                    </li>
                                    <li>
                                        Pembeli wajib melampirkan foto jelas label resi pesanan dan bukti kondisi barang yang bermasalah (foto produk cacat/video singkat unboxing).
                                    </li>
                                    <li>
                                        Pengajuan aduan refund atau komplain dilakukan melalui saluran resmi Customer Support Pemerintah Desa Cibenda (Helpdesk Kantor Desa / WhatsApp Resmi Layanan Konsumen di +62 812-3456-7890) dengan menyertakan nomor invoice dan bukti fisik tersebut.
                                    </li>
                                    <li>
                                        Klaim tanpa kelengkapan bukti dokumentasi fisik dapat ditolak dalam proses verifikasi aduan.
                                    </li>
                                </ul>
                            </section>

                            {/* Bagian 4 */}
                            <section className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold bg-status-success-tint text-status-success-dark border border-status-success/20 px-2.5 py-1 rounded-lg">
                                        Bagian 4
                                    </span>
                                    <h2 className="text-lg font-bold text-slate-900">
                                        Mekanisme Pengembalian Dana
                                    </h2>
                                </div>
                                <ul className="list-disc pl-5 space-y-2 text-slate-600">
                                    <li>
                                        <strong>Pembayaran Online (VA / QRIS / GoPay):</strong> Dana akan dikembalikan secara otomatis ke rekening atau akun e-wallet sumber pembayaran pembeli sesuai estimasi waktu bank (1 hingga 3 hari kerja).
                                    </li>
                                    <li>
                                        <strong>Pembayaran COD (Bayar di Tempat):</strong> Jika pembeli telah menyerahkan uang tunai kepada kurir namun barang bermasalah, pengembalian dana dikoordinasikan secara langsung melalui kurir toko atau ditransfer manual oleh pihak pedagang setelah diverifikasi oleh Admin.
                                    </li>
                                </ul>
                            </section>

                            {/* Bagian 5 */}
                            <section className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold bg-status-success-tint text-status-success-dark border border-status-success/20 px-2.5 py-1 rounded-lg">
                                        Bagian 5
                                    </span>
                                    <h2 className="text-lg font-bold text-slate-900">
                                        Penyelesaian Sengketa (Mediasi Pemerintah Desa Cibenda)
                                    </h2>
                                </div>
                                <p className="text-slate-600">
                                    Apabila terjadi perselisihan pendapat antara pembeli dan pedagang mengenai kondisi barang atau klaim refund, Pengelola CibendaMart dari Pemerintah Desa Cibenda akan memfasilitasi musyawarah dan mediasi berdasarkan bukti transaksi secara objektif. Mediasi bertujuan mencapai penyelesaian kekeluargaan yang adil dan tidak mengurangi hak para pihak untuk menempuh penyelesaian sengketa konsumen sesuai ketentuan perundang-undangan yang berlaku (UU No. 8 Tahun 1999 tentang Perlindungan Konsumen).
                                </p>
                            </section>
                        </div>

                        {/* Footer Link to Merchant Agreement and Privacy */}
                        <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3 text-slate-600 text-xs sm:text-sm">
                                <ShieldCheck className="w-5 h-5 text-status-success shrink-0" />
                                <span>CibendaMart melindungi hak konsumen dan menjaga martabat pedagang lokal.</span>
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
                                    href={route("legal.merchant-agreement")}
                                    className="hover:text-brand-orange-hover transition"
                                >
                                    Perjanjian Mitra &rarr;
                                </Link>
                            </div>
                        </div>
                    </article>
                </div>
            </div>
        </StorefrontLayout>
    );
}

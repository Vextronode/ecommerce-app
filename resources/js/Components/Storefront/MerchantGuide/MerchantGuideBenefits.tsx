import React from "react";
import { Users, ShieldCheck, MessageSquare, LayoutDashboard } from "lucide-react";

export default function MerchantGuideBenefits() {
    const benefits = [
        {
            icon: Users,
            title: "Pasar Lokal Siap Beli",
            description:
                "Produk Anda langsung dipromosikan di halaman utama CibendaMart dan mudah diakses oleh warga desa, masyarakat sekitar Parigi, hingga wisatawan Pangandaran.",
            badgeColor: "bg-blue-50 text-blue-600 border-blue-200",
        },
        {
            icon: ShieldCheck,
            title: "Verifikasi Resmi SID Desa",
            description:
                "Setiap toko yang terdaftar divalidasi oleh Pemerintah Desa Cibenda, menciptakan ekosistem jual beli yang tepercaya, bebas penipuan, dan mengutamakan produk asli UMKM warga.",
            badgeColor: "bg-emerald-50 text-emerald-600 border-emerald-200",
        },
        {
            icon: MessageSquare,
            title: "Fitur Negosiasi & Kurir Lokal",
            description:
                "Mendukung sistem tawar-menawar harga yang santun dan kekeluargaan layaknya pasar tradisional, didukung opsi pengiriman kurir lokal yang cepat dan terjangkau.",
            badgeColor: "bg-orange-50 text-brand-orange border-orange-200",
        },
        {
            icon: LayoutDashboard,
            title: "Dashboard Praktis & Transparan",
            description:
                "Kelola katalog produk, pantau stok barang, lihat notifikasi pesanan masuk, dan pantau rekapan pemasukan harian dengan mudah lewat HP atau laptop.",
            badgeColor: "bg-purple-50 text-purple-600 border-purple-200",
        },
    ];

    return (
        <section className="py-16 md:py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
                    <p className="text-xs font-bold text-brand-orange uppercase tracking-wider mb-2">
                        Mengapa Berjualan di CibendaMart?
                    </p>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                        Fasilitas Terbaik untuk Mendukung Usaha Lokal Anda
                    </h2>
                    <p className="mt-3 text-sm sm:text-base text-slate-600">
                        Kami merancang platform ini dengan memprioritaskan kemudahan pelaku usaha desa dalam mengelola produk dan memperluas jangkauan pembeli.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {benefits.map((benefit, idx) => {
                        const Icon = benefit.icon;
                        return (
                            <div
                                key={idx}
                                className="p-6 rounded-2xl bg-surface-muted/60 hover:bg-white border border-slate-200 hover:border-brand-orange/40 hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
                            >
                                <div>
                                    <div
                                        className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-5 ${benefit.badgeColor}`}
                                    >
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2 group-hover:text-brand-orange transition-colors">
                                        {benefit.title}
                                    </h3>
                                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                        {benefit.description}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

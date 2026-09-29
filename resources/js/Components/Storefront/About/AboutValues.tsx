import React from "react";
import { Fish, PackageCheck, HeartHandshake, ShieldCheck } from "lucide-react";

const pillars = [
    {
        icon: Fish,
        title: "Tangkapan Segar Harian",
        desc: "Ikan laut dan hasil tangkapan nelayan dikurasi langsung di dermaga pendaratan Parigi sesaat setelah kapal bersandar, bukan persediaan beku yang disimpan lama.",
    },
    {
        icon: PackageCheck,
        title: "Kemasan Berpendingin (Cold Chain)",
        desc: "Produk segar dikemas menggunakan kotak insulasi bersegel dan es gel beku agar suhu tetap stabil dan kualitas ikan tetap prima hingga sampai ke tangan Anda.",
    },
    {
        icon: HeartHandshake,
        title: "Dampak Ekonomi Langsung",
        desc: "Tidak ada skema perantara tengkulak yang merugikan. Hasil penjualan diterima langsung oleh nelayan dan perajin lokal untuk keberlangsungan usaha mereka.",
    },
    {
        icon: ShieldCheck,
        title: "Garansi Mutu & Layanan",
        desc: "Bila pesanan yang sampai mengalami kerusakan fisik atau tidak sesuai dengan deskripsi toko, kami menyediakan jalur komplain cepat 1x24 jam untuk penggantian.",
    },
];

export default function AboutValues() {
    return (
        <section className="gsap-reveal-section py-16 md:py-20 bg-[#F8FAFC] border-t border-slate-200/70">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="gsap-reveal-item max-w-3xl mb-12">
                    <span className="text-xs font-bold tracking-wider text-[#006591] uppercase">
                        Standar & Komitmen
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1.5 mb-3">
                        Komitmen Kualitas & Pelayanan
                    </h2>
                    <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                        Prinsip operasional yang kami terapkan dalam menjaga mutu produk dan kepuasan setiap pelanggan.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {pillars.map((item, idx) => {
                        const Icon = item.icon;
                        return (
                            <div
                                key={idx}
                                className="gsap-reveal-item bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs flex flex-col justify-between"
                            >
                                <div className="space-y-3">
                                    <div className="w-10 h-10 rounded-lg bg-slate-100 text-[#006591] flex items-center justify-center">
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-base font-bold text-slate-900">
                                        {item.title}
                                    </h3>
                                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                        {item.desc}
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

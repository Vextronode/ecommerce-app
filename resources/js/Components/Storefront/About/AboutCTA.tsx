import React from "react";
import { Link } from "@inertiajs/react";
import { ShoppingBag, Store } from "lucide-react";

export default function AboutCTA() {
    return (
        <section className="gsap-reveal-section py-16 md:py-20 bg-[#281B7A] text-white">
            <div className="gsap-reveal-item max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    Mulai Belanja Hasil Laut Segar Pangandaran
                </h2>

                <p className="text-white/80 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
                    Dukung langsung perputaran ekonomi keluarga nelayan dan perajin olahan Desa Cibenda dengan berbelanja komoditas lokal berkualitas.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-3.5 pt-3">
                    <Link
                        href={route("shop")}
                        className="px-6 py-3 bg-brand-orange hover:bg-brand-orange-hover text-white rounded-xl font-bold text-sm sm:text-base transition-colors shadow-xs inline-flex items-center gap-2 cursor-pointer"
                    >
                        <ShoppingBag className="w-4 h-4" />
                        <span>Katalog Belanja</span>
                    </Link>

                    <Link
                        href={route("register")}
                        className="px-6 py-3 bg-white/10 hover:bg-white/15 text-white border border-white/20 rounded-xl font-semibold text-sm sm:text-base transition-colors inline-flex items-center gap-2"
                    >
                        <Store className="w-4 h-4 text-[#41B9C5]" />
                        <span>Daftar Jadi Penjual</span>
                    </Link>
                </div>
            </div>
        </section>
    );
}

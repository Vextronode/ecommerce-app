import React from "react";
import { Link } from "@inertiajs/react";
import { Store, ExternalLink } from "lucide-react";

interface MerchantGuideCTAProps {
    sidPortalUrl: string;
}

export default function MerchantGuideCTA({ sidPortalUrl }: MerchantGuideCTAProps) {
    return (
        <section className="py-16 md:py-20 bg-linear-to-r from-brand-orange-hover via-brand-orange to-brand-orange-light text-white relative overflow-hidden">
            {/* Ambient pattern */}
            <div className="absolute top-0 right-0 bottom-0 left-[45%] bg-white/5 skew-x-[-25deg] pointer-events-none" />

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
                <span className="inline-block px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-xs font-bold text-white tracking-wide">
                    Langkah Nyata Majukan Usaha Lokal
                </span>

                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
                    Siap Mengembangkan Usaha Anda Bersama CibendaMart?
                </h2>

                <p className="text-white/90 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
                    Daftarkan toko Anda hari ini secara gratis melalui portal resmi desa, atau langsung login ke dashboard apabila akun Anda sudah diverifikasi oleh administrator.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                    <a
                        href={sidPortalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-7 py-3.5 bg-white hover:bg-white/90 text-brand-orange font-bold text-sm sm:text-base rounded-xl transition shadow-lg inline-flex items-center gap-2 cursor-pointer"
                    >
                        <span>Kunjungi Portal SID Desa</span>
                        <ExternalLink className="w-4 h-4" />
                    </a>

                    <Link
                        href={route("merchant.login.view")}
                        className="px-6 py-3.5 bg-brand-indigo-merchant hover:bg-brand-indigo-merchant-hover text-white font-bold text-sm sm:text-base rounded-xl transition shadow-md inline-flex items-center gap-2 cursor-pointer border border-white/20"
                    >
                        <Store className="w-4 h-4" />
                        <span>Masuk Dashboard Pedagang</span>
                    </Link>
                </div>
            </div>
        </section>
    );
}

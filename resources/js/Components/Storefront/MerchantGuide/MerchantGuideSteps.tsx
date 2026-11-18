import React from "react";
import { Link } from "@inertiajs/react";
import { FileText, Globe, UserCheck, Rocket, ExternalLink, ArrowRight } from "lucide-react";

interface MerchantGuideStepsProps {
    sidPortalUrl: string;
}

export default function MerchantGuideSteps({ sidPortalUrl }: MerchantGuideStepsProps) {
    const steps = [
        {
            number: "01",
            icon: FileText,
            title: "Siapkan Data Identitas & Produk Usaha",
            description:
                "Persiapkan NIK KTP Anda sebagai warga Desa Cibenda, nama toko yang diinginkan, kontak WhatsApp usaha, serta foto produk yang hendak diperjualbelikan.",
            action: null,
        },
        {
            number: "02",
            icon: Globe,
            title: "Pengajuan via Portal SID Desa Cibenda",
            description:
                "Buka portal Sistem Informasi Desa (SID) Cibenda resmi. Akses formulir pendaftaran mitra pedagang/UMKM dan isi data profil usaha Anda.",
            action: {
                label: "Buka Portal SID Desa",
                href: sidPortalUrl,
                isExternal: true,
            },
        },
        {
            number: "03",
            icon: UserCheck,
            title: "Verifikasi oleh Administrator Kantor Desa",
            description:
                "Tim Administrator Desa Cibenda memvalidasi domisili dan keaslian usaha untuk memastikan seluruh penjual di platform terpercaya dan aman bagi konsumen.",
            action: null,
        },
        {
            number: "04",
            icon: Rocket,
            title: "Aktivasi Akun & Siap Menerima Pesanan",
            description:
                "Setelah akun pedagang aktif, login ke Dashboard Mitra CibendaMart, atur etalase toko, pasang produk perdana Anda, dan mulai jualan online!",
            action: {
                label: "Ke Halaman Login Pedagang",
                href: route("merchant.login.view"),
                isExternal: false,
            },
        },
    ];

    return (
        <section id="alur-pendaftaran" className="py-16 md:py-24 bg-surface-muted/50 border-y border-slate-200/80 scroll-mt-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-14">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-orange/10 text-brand-orange text-xs font-bold uppercase tracking-wider mb-2">
                        Panduan Langkah Demi Langkah
                    </div>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                        Cara Mudah Mendaftar Jadi Mitra Pedagang
                    </h2>
                    <p className="mt-3 text-sm sm:text-base text-slate-600">
                        Ikuti 4 tahapan praktis berikut agar tokomu dapat segera terdaftar dan aktif melayani pelanggan di CibendaMart.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        return (
                            <div
                                key={step.number}
                                className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col justify-between relative group hover:border-brand-orange/40 hover:shadow-md transition-all duration-300"
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-5">
                                        <div className="w-12 h-12 rounded-xl bg-orange-50 border border-brand-orange/20 text-brand-orange flex items-center justify-center font-bold">
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <span className="text-3xl font-black text-slate-200 group-hover:text-brand-orange/20 transition-colors">
                                            {step.number}
                                        </span>
                                    </div>

                                    <h3 className="text-base font-bold text-slate-900 mb-2 leading-snug">
                                        {step.title}
                                    </h3>

                                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                        {step.description}
                                    </p>
                                </div>

                                {step.action && (
                                    <div className="pt-6 mt-6 border-t border-slate-100">
                                        {step.action.isExternal ? (
                                            <a
                                                href={step.action.href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-orange hover:text-brand-orange-hover hover:underline"
                                            >
                                                <span>{step.action.label}</span>
                                                <ExternalLink className="w-3.5 h-3.5" />
                                            </a>
                                        ) : (
                                            <Link
                                                href={step.action.href}
                                                className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-indigo-merchant hover:text-brand-indigo-merchant-hover hover:underline"
                                            >
                                                <span>{step.action.label}</span>
                                                <ArrowRight className="w-3.5 h-3.5" />
                                            </Link>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

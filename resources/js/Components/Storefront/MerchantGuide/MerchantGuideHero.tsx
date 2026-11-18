import React from "react";
import { Link } from "@inertiajs/react";
import { Store, ExternalLink, ShieldCheck, CheckCircle2, ArrowRight } from "lucide-react";
import parigiMerchantImg from "@/assets/images/parigi_merchant.png";

interface MerchantGuideHeroProps {
    sidPortalUrl: string;
}

export default function MerchantGuideHero({ sidPortalUrl }: MerchantGuideHeroProps) {
    return (
        <section className="pt-32 md:pt-38 pb-16 md:pb-20 bg-linear-to-b from-orange-50/70 via-white to-white border-b border-slate-200/70">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
                    {/* Left: Text & Actions */}
                    <div className="guide-hero-content lg:col-span-7 space-y-5 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-orange/10 border border-brand-orange/20 text-brand-orange text-xs font-bold shadow-2xs">
                            <Store className="w-3.5 h-3.5 shrink-0" />
                            <span>Program Pemberdayaan UMKM Desa Cibenda</span>
                        </div>

                        <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold text-slate-900 tracking-tight leading-tight">
                            Buka Toko Online & Kembangkan Usaha Anda di <span className="text-brand-orange">CibendaMart</span>
                        </h1>

                        <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                            Wadah resmi jual beli digital bagi warga dan pelaku usaha lokal Desa Cibenda, Parigi. Pendaftaran terintegrasi langsung melalui <strong>Sistem Informasi Desa (SID)</strong> untuk keamanan, keaslian produk lokal, dan bebas biaya pendaftaran.
                        </p>

                        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
                            <a
                                href={sidPortalUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-6 py-3.5 bg-brand-orange hover:bg-brand-orange-hover text-white rounded-xl font-bold text-sm sm:text-base shadow-lg shadow-brand-orange/25 transition hover:scale-[1.01] active:scale-[0.99] inline-flex items-center gap-2 cursor-pointer"
                            >
                                <span>Daftar via Portal SID Desa</span>
                                <ExternalLink className="w-4 h-4" />
                            </a>

                            <Link
                                href={route("merchant.login.view")}
                                className="px-5 py-3.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-xl font-bold text-sm sm:text-base transition-colors inline-flex items-center gap-2 shadow-2xs"
                            >
                                <Store className="w-4 h-4 text-brand-indigo-merchant" />
                                <span>Masuk Dashboard Pedagang</span>
                            </Link>
                        </div>

                        {/* Quick Trust Highlights */}
                        <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-slate-200/80 text-left">
                            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                <span>100% Gratis Pendaftaran</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                                <ShieldCheck className="w-4 h-4 text-brand-orange shrink-0" />
                                <span>Verifikasi Aparatur Desa</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                <span>Terintegrasi Portal SID</span>
                            </div>
                        </div>
                    </div>

                    {/* Right: Graphic Card & Merchant Identity */}
                    <div className="guide-hero-image lg:col-span-5">
                        <div className="rounded-3xl bg-linear-to-br from-brand-orange-warm via-brand-orange-tint to-white p-7 sm:p-8 border border-brand-orange/20 shadow-xl shadow-brand-orange/10 relative overflow-hidden">
                            {/* Decorative ambient lights */}
                            <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/30 rounded-full blur-2xl pointer-events-none" />
                            <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-orange-400/20 rounded-full blur-3xl pointer-events-none" />

                            <div className="relative z-10 space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-2xl bg-white/90 backdrop-blur-md shadow-md p-2 flex items-center justify-center border border-white">
                                        <img
                                            src={parigiMerchantImg}
                                            alt="Logo Mitra Pedagang"
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-brand-indigo-merchant tracking-tight">
                                            Portal Mitra Pedagang
                                        </h2>
                                        <p className="text-xs font-medium text-slate-600">
                                            Pemberdayaan Ekonomi Desa Cibenda
                                        </p>
                                    </div>
                                </div>

                                <div className="p-4 rounded-2xl bg-white/80 backdrop-blur-xs border border-white/60 space-y-3">
                                    <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                                        Fasilitas Mitra Pedagang:
                                    </p>
                                    <ul className="space-y-2 text-xs text-slate-600">
                                        <li className="flex items-start gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-brand-orange mt-1.5 shrink-0" />
                                            <span>Etalase online 24 jam untuk aneka produk olahan, hasil laut, dan kerajinan.</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-brand-orange mt-1.5 shrink-0" />
                                            <span>Fitur tawar-menawar interaktif dengan calon pembeli via chat.</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-brand-orange mt-1.5 shrink-0" />
                                            <span>Pencairan saldo hasil penjualan ke rekening bank atau e-wallet.</span>
                                        </li>
                                    </ul>
                                </div>

                                <div className="pt-2">
                                    <a
                                        href={sidPortalUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full py-3 px-4 rounded-xl bg-brand-indigo-merchant hover:bg-brand-indigo-merchant-hover text-white text-xs font-bold flex items-center justify-center gap-2 transition shadow-md shadow-brand-indigo-merchant/20"
                                    >
                                        <span>Buka Formulir Pendaftaran di SID</span>
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

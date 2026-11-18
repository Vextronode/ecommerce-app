import React, { useState } from "react";
import { Head, Link } from "@inertiajs/react";
import StorefrontLayout from "@/Layouts/StorefrontLayout";
import {
    Ban,
    ArrowLeft,
    ShieldAlert,
    AlertTriangle,
    FileCheck,
    HelpCircle,
    Mail,
    Phone,
    ShieldCheck,
} from "lucide-react";
import {
    LOCAL_PROHIBITED_ITEMS,
    NATIONAL_PROHIBITED_ITEMS,
    PROHIBITED_METADATA,
    RESTRICTED_ITEMS,
    SANCTION_TIERS,
} from "@/constants/legal/prohibited";

export default function ProhibitedProducts() {
    const [selectedTab, setSelectedTab] = useState<"law" | "policy" | "restricted" | "sanctions">("law");

    return (
        <StorefrontLayout>
            <Head title="Daftar Produk Terlarang & Dibatasi - CibendaMart" />

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
                            Versi: {PROHIBITED_METADATA.version} ({PROHIBITED_METADATA.effectiveDate})
                        </span>
                    </div>

                    {/* Main Card */}
                    <article className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-slate-200/80">
                        {/* Title Header */}
                        <div className="border-b border-slate-100 pb-8 mb-8">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
                                    <Ban className="w-6 h-6" />
                                </div>
                                <div>
                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                        {PROHIBITED_METADATA.subtitle}
                                    </span>
                                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                                        {PROHIBITED_METADATA.title}
                                    </h1>
                                </div>
                            </div>
                            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                                {PROHIBITED_METADATA.intro}
                            </p>
                        </div>

                        {/* Interactive Tabs */}
                        <div className="flex md:grid md:grid-cols-4 gap-2.5 overflow-x-auto md:overflow-visible pb-3 md:pb-0 mb-8 border-b border-slate-100 scrollbar-none">
                            <button
                                type="button"
                                onClick={() => setSelectedTab("law")}
                                className={`text-xs sm:text-sm font-bold px-3.5 py-2.5 rounded-xl border transition flex items-center justify-center gap-2 shrink-0 md:shrink ${
                                    selectedTab === "law"
                                        ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                                }`}
                            >
                                <ShieldAlert className="w-4 h-4 shrink-0" />
                                <span className="whitespace-nowrap">Regulasi Nasional</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setSelectedTab("policy")}
                                className={`text-xs sm:text-sm font-bold px-3.5 py-2.5 rounded-xl border transition flex items-center justify-center gap-2 shrink-0 md:shrink ${
                                    selectedTab === "policy"
                                        ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                                }`}
                            >
                                <AlertTriangle className="w-4 h-4 shrink-0" />
                                <span className="whitespace-nowrap">Kebijakan Desa</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setSelectedTab("restricted")}
                                className={`text-xs sm:text-sm font-bold px-3.5 py-2.5 rounded-xl border transition flex items-center justify-center gap-2 shrink-0 md:shrink ${
                                    selectedTab === "restricted"
                                        ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                                }`}
                            >
                                <FileCheck className="w-4 h-4 shrink-0" />
                                <span className="whitespace-nowrap">Produk Bersyarat</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setSelectedTab("sanctions")}
                                className={`text-xs sm:text-sm font-bold px-3.5 py-2.5 rounded-xl border transition flex items-center justify-center gap-2 shrink-0 md:shrink ${
                                    selectedTab === "sanctions"
                                        ? "bg-slate-800 text-white border-slate-800 shadow-xs"
                                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                                }`}
                            >
                                <HelpCircle className="w-4 h-4 shrink-0" />
                                <span className="whitespace-nowrap">Sanksi & Aduan</span>
                            </button>
                        </div>

                        {/* Tab Content 1: National Law Prohibited */}
                        {selectedTab === "law" && (
                            <div className="space-y-6">
                                <div className="p-4 bg-rose-50/70 border border-rose-200/80 rounded-2xl text-xs sm:text-sm text-rose-900 leading-relaxed">
                                    <strong>Ketentuan Mutlak:</strong> Produk dalam daftar ini dilarang keras diperjualbelikan, diiklankan, maupun disamarkan dengan nama atau foto lain di platform Cibenda Mart. Pelanggaran akan berakibat penurunan produk seketika dan penutupan toko.
                                </div>
                                <div className="grid grid-cols-1 gap-4">
                                    {NATIONAL_PROHIBITED_ITEMS.map((item) => (
                                        <div
                                            key={item.no}
                                            className="p-4 rounded-2xl border border-slate-200/90 bg-white hover:border-slate-300 transition"
                                        >
                                            <div className="flex items-start justify-between gap-3 mb-1.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 text-xs font-bold flex items-center justify-center shrink-0">
                                                        {item.no}
                                                    </span>
                                                    <h3 className="text-sm sm:text-base font-bold text-slate-900">
                                                        {item.title}
                                                    </h3>
                                                </div>
                                                <span className="text-[11px] font-semibold text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200/80 shrink-0">
                                                    {item.ref}
                                                </span>
                                            </div>
                                            <p className="text-xs sm:text-sm text-slate-600 pl-8">
                                                {item.desc}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Tab Content 2: Local Village Policy Prohibited */}
                        {selectedTab === "policy" && (
                            <div className="space-y-6">
                                <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl text-xs sm:text-sm text-amber-900 leading-relaxed">
                                    <strong>Kebijakan Khusus Desa Cibenda:</strong> Komoditas berikut dilarang dijual melalui platform demi keselamatan warga dan ketepatan sasaran barang bantuan sosial bersubsidi.
                                </div>
                                <div className="grid grid-cols-1 gap-4">
                                    {LOCAL_PROHIBITED_ITEMS.map((item, idx) => (
                                        <div
                                            key={idx}
                                            className="p-5 rounded-2xl border border-amber-200/80 bg-amber-50/20 space-y-2"
                                        >
                                            <div className="flex items-center gap-2 text-amber-900 font-bold text-base">
                                                <Ban className="w-4 h-4 text-amber-600" />
                                                <h4>{item.title}</h4>
                                            </div>
                                            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                                {item.desc}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Tab Content 3: Restricted Items */}
                        {selectedTab === "restricted" && (
                            <div className="space-y-6">
                                <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl text-xs sm:text-sm text-emerald-900 leading-relaxed">
                                    <strong>Boleh Dijual dengan Syarat Izin:</strong> Produk berikut merupakan komoditas UMKM lokal yang diperbolehkan sepanjang pedagang dapat menunjukkan legalitas sertifikat atau standar izin edar yang sah.
                                </div>
                                <div className="grid grid-cols-1 gap-4">
                                    {RESTRICTED_ITEMS.map((item, idx) => (
                                        <div
                                            key={idx}
                                            className="p-5 rounded-2xl border border-slate-200/90 bg-white space-y-2"
                                        >
                                            <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                                                <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                                                <h3>{item.category}</h3>
                                            </div>
                                            <div className="text-xs sm:text-sm text-slate-600">
                                                <span className="font-semibold text-slate-800">Contoh Produk:</span> {item.examples}
                                            </div>
                                            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-700">
                                                <span className="font-bold text-emerald-700">Persyaratan Legalitas:</span> {item.requirement}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Tab Content 4: Sanctions & Reporting */}
                        {selectedTab === "sanctions" && (
                            <div className="space-y-8 text-slate-700 text-sm sm:text-base leading-relaxed">
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold text-slate-900">
                                        Skema Penindakan & Sanksi Bertahap
                                    </h3>
                                    <p className="text-slate-600 text-sm">
                                        Pengelola akan menurunkan produk yang melanggar paling lambat <strong>1×24 jam</strong> sejak temuan terdeteksi. Sanksi terhadap toko pedagang diberlakukan secara bertahap:
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                                        {SANCTION_TIERS.map((tier, idx) => (
                                            <div
                                                key={idx}
                                                className={`p-4 rounded-2xl border space-y-1 ${
                                                    idx === 0
                                                        ? "border-amber-200 bg-amber-50/40"
                                                        : idx === 1
                                                        ? "border-rose-200 bg-rose-50/40"
                                                        : "border-slate-800 bg-slate-900 text-white"
                                                }`}
                                            >
                                                <span
                                                    className={`text-xs font-bold uppercase tracking-wider ${
                                                        idx === 0
                                                            ? "text-amber-700"
                                                            : idx === 1
                                                            ? "text-rose-700"
                                                            : "text-rose-400"
                                                    }`}
                                                >
                                                    {tier.stage}
                                                </span>
                                                <h4
                                                    className={`font-bold text-sm ${
                                                        idx === 2 ? "text-white" : "text-slate-900"
                                                    }`}
                                                >
                                                    {tier.title}
                                                </h4>
                                                <p
                                                    className={`text-xs ${
                                                        idx === 2 ? "text-slate-300" : "text-slate-600"
                                                    }`}
                                                >
                                                    {tier.desc}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-100 space-y-3">
                                    <h3 className="text-lg font-bold text-slate-900">
                                        Kanal Pelaporan Produk Melanggar
                                    </h3>
                                    <p className="text-slate-600 text-sm">
                                        Warga atau pembeli yang menemukan produk terlarang dapat melaporkan kepada Pengelola Pemerintah Desa Cibenda. <strong>Identitas pelapor dijamin kerahasiaannya.</strong>
                                    </p>
                                    <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2 text-xs sm:text-sm text-slate-700">
                                        <div className="flex items-center gap-2">
                                            <Mail className="w-4 h-4 text-brand-orange shrink-0" />
                                            <span>Email Aduan: <strong>{PROHIBITED_METADATA.reporting.email}</strong></span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Phone className="w-4 h-4 text-brand-orange shrink-0" />
                                            <span>WhatsApp Pengaduan: <strong>{PROHIBITED_METADATA.reporting.whatsapp}</strong></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Navigation Footer */}
                        <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3 text-slate-600 text-xs sm:text-sm">
                                <ShieldCheck className="w-5 h-5 text-status-success shrink-0" />
                                <span>Lampiran resmi Syarat & Ketentuan Cibenda Mart.</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm font-bold">
                                <Link
                                    href={route("legal.terms")}
                                    className="inline-flex items-center gap-1.5 text-brand-orange hover:text-brand-orange-hover transition whitespace-nowrap"
                                >
                                    <span>Baca Syarat & Ketentuan</span>
                                    <span className="font-normal">→</span>
                                </Link>
                                <Link
                                    href={route("legal.merchant-agreement")}
                                    className="inline-flex items-center gap-1.5 text-brand-orange hover:text-brand-orange-hover transition whitespace-nowrap"
                                >
                                    <span>Perjanjian Mitra Pedagang</span>
                                    <span className="font-normal">→</span>
                                </Link>
                            </div>
                        </div>
                    </article>
                </div>
            </div>
        </StorefrontLayout>
    );
}

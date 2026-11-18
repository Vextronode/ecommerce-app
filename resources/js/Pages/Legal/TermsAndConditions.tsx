import React, { useState } from "react";
import { Head, Link } from "@inertiajs/react";
import StorefrontLayout from "@/Layouts/StorefrontLayout";
import { Scale, ArrowLeft, ShieldCheck, MapPin, Mail, Phone } from "lucide-react";
import { TERMS_ARTICLES, TERMS_METADATA } from "@/constants/legal/terms";

export default function TermsAndConditions() {
    const [activeSection, setActiveSection] = useState<string>("pasal-1");

    const scrollToSection = (id: string) => {
        setActiveSection(id);
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    return (
        <StorefrontLayout>
            <Head title="Syarat dan Ketentuan - CibendaMart" />

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
                            Versi: {TERMS_METADATA.version} ({TERMS_METADATA.effectiveDate})
                        </span>
                    </div>

                    {/* Main Document Card */}
                    <article className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-slate-200/80">
                        {/* Title Header */}
                        <div className="border-b border-slate-100 pb-8 mb-8">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-brand-orange-tint border border-brand-orange/30 flex items-center justify-center text-brand-orange">
                                    <Scale className="w-6 h-6" />
                                </div>
                                <div>
                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                        Pemerintah Desa Cibenda
                                    </span>
                                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                                        {TERMS_METADATA.title}
                                    </h1>
                                </div>
                            </div>
                            <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-4">
                                {TERMS_METADATA.preamble}
                            </p>
                            <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs sm:text-sm text-slate-600">
                                <strong>Penyelenggara:</strong> {TERMS_METADATA.organizer}
                            </div>
                        </div>

                        {/* Quick Jump Dropdown */}
                        <div className="mb-8 p-4 sm:p-5 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                                <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                                    Navigasi Cepat Pasal
                                </span>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Pilih pasal untuk langsung menuju ke rincian isi ketentuan
                                </p>
                            </div>
                            <div className="w-full sm:w-80">
                                <select
                                    value={activeSection}
                                    onChange={(e) => scrollToSection(e.target.value)}
                                    aria-label="Pilih Pasal"
                                    className="w-full text-xs sm:text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 shadow-xs focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition cursor-pointer"
                                >
                                    {TERMS_ARTICLES.map((article) => (
                                        <option key={article.id} value={article.id}>
                                            Pasal {article.number}: {article.title}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Clauses Stream */}
                        <div className="space-y-10 text-slate-700 text-sm sm:text-base leading-relaxed">
                            {TERMS_ARTICLES.map((article) => (
                                <section key={article.id} id={article.id} className="space-y-3 scroll-mt-24">
                                    <h2 className="text-lg font-bold text-slate-900">
                                        Pasal {article.number}: {article.title}
                                    </h2>

                                    {/* Paragraphs if any */}
                                    {article.paragraphs?.map((p, idx) => (
                                        <p key={idx} className="text-slate-600">
                                            {p}
                                        </p>
                                    ))}

                                    {/* Numbered List */}
                                    {article.type === "numbered" && article.items && (
                                        <ol className="list-decimal pl-5 space-y-2 text-slate-600">
                                            {article.items.map((item, idx) => (
                                                <li key={idx}>{item}</li>
                                            ))}
                                        </ol>
                                    )}

                                    {/* Bullet List */}
                                    {article.type === "bullets" && article.items && (
                                        <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                                            {article.items.map((item, idx) => (
                                                <li key={idx}>{item}</li>
                                            ))}
                                        </ul>
                                    )}

                                    {/* Special Link Reference to Refund Policy */}
                                    {article.type === "reference_refund" && (
                                        <div className="pt-1">
                                            <Link
                                                href={route("legal.refund")}
                                                className="inline-flex items-center gap-1 font-bold text-brand-orange hover:underline text-sm"
                                            >
                                                <span>Buka Halaman Kebijakan Refund & Retur</span>
                                                <span className="font-normal">→</span>
                                            </Link>
                                        </div>
                                    )}

                                    {/* Special Contact Card for Pasal 22 */}
                                    {article.id === "pasal-22" && (
                                        <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2 text-xs sm:text-sm text-slate-700 mt-2">
                                            <div className="font-bold text-slate-900">
                                                {TERMS_METADATA.contact.entity}
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <MapPin className="w-4 h-4 text-brand-orange shrink-0 mt-0.5" />
                                                <span>{TERMS_METADATA.contact.address}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Mail className="w-4 h-4 text-brand-orange shrink-0" />
                                                <span>{TERMS_METADATA.contact.email}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Phone className="w-4 h-4 text-brand-orange shrink-0" />
                                                <span>{TERMS_METADATA.contact.whatsapp}</span>
                                            </div>
                                            <div className="text-slate-500 pt-1 border-t border-slate-200/60">
                                                Jam Layanan: {TERMS_METADATA.contact.hours}
                                            </div>
                                        </div>
                                    )}
                                </section>
                            ))}
                        </div>

                        {/* Navigation Footer */}
                        <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3 text-slate-600 text-xs sm:text-sm">
                                <ShieldCheck className="w-5 h-5 text-status-success shrink-0" />
                                <span>Syarat & Ketentuan resmi Pemerintah Desa Cibenda.</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm font-bold">
                                <Link
                                    href={route("legal.prohibited-products")}
                                    className="inline-flex items-center gap-1.5 text-brand-orange hover:text-brand-orange-hover transition whitespace-nowrap"
                                >
                                    <span>Daftar Produk Terlarang</span>
                                    <span className="font-normal">→</span>
                                </Link>
                                <Link
                                    href={route("legal.refund")}
                                    className="inline-flex items-center gap-1.5 text-brand-orange hover:text-brand-orange-hover transition whitespace-nowrap"
                                >
                                    <span>Kebijakan Refund</span>
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

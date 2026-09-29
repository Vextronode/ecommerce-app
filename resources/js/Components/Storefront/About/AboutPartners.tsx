import React from "react";
import logoWidyatama from "@/assets/images/logo-widyatama.webp";
import logoParigi from "@/assets/images/parigi_logo.png";
import logoPangandaran from "@/assets/images/lambang-pangandaran.webp";

const partners = [
    {
        logo: logoWidyatama,
        alt: "Universitas Widyatama",
        title: "Universitas Widyatama",
        role: "Pendamping Teknologi & Riset",
        desc: "Penyusunan arsitektur sistem informasi, riset rantai pasok digital, dan pelatihan operasional aplikasi untuk pedagang desa.",
    },
    {
        logo: logoParigi,
        alt: "Kecamatan Parigi",
        title: "Pemerintah Kec. Parigi",
        role: "Fasilitator Wilayah & Pembinaan",
        desc: "Koordinasi integrasi potensi wilayah pesisir Parigi, pembinaan pelaku usaha, dan pengawasan kelancaran rantai distribusi.",
    },
    {
        logo: logoPangandaran,
        alt: "Kabupaten Pangandaran",
        title: "Pemerintah Kab. Pangandaran",
        role: "Pembina Regulasi & Promosi Daerah",
        desc: "Dukungan legalitas izin UMKM pesisir serta integrasi promosi komoditas bahari Pangandaran di tingkat regional dan nasional.",
    },
];

export default function AboutPartners() {
    return (
        <section className="gsap-reveal-section py-16 md:py-20 bg-white border-t border-slate-200/70">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="gsap-reveal-item max-w-3xl mb-12">
                    <span className="text-xs font-bold tracking-wider text-[#006591] uppercase">
                        Sinergi & Kemitraan
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1.5 mb-3">
                        Dukungan Lembaga & Pemangku Kepentingan
                    </h2>
                    <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                        Cibenda Mart merupakan wujud kolaborasi nyata antara institusi pendidikan tinggi, pemerintah daerah, dan aparatur desa.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {partners.map((p, idx) => (
                        <div
                            key={idx}
                            className="gsap-reveal-item bg-[#FAFBFD] border border-slate-200/80 rounded-2xl p-6 flex flex-col justify-between"
                        >
                            <div>
                                <div className="w-20 h-16 bg-white rounded-xl border border-slate-200/60 p-2.5 flex items-center justify-center mb-4">
                                    <img
                                        src={p.logo}
                                        alt={p.alt}
                                        className="max-h-full max-w-full object-contain"
                                    />
                                </div>
                                <h3 className="text-base font-bold text-slate-900">
                                    {p.title}
                                </h3>
                                <p className="text-xs font-semibold text-brand-orange mt-0.5 mb-2">
                                    {p.role}
                                </p>
                                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                    {p.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

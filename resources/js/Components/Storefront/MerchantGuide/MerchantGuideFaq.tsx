import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

export default function MerchantGuideFaq() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const faqs = [
        {
            q: "Apakah pendaftaran mitra pedagang dipungut biaya?",
            a: "Sama sekali tidak dipungut biaya (100% Gratis). Program marketplace CibendaMart merupakan prakarsa pemberdayaan ekonomi UMKM lokal oleh Pemerintah Desa Cibenda.",
        },
        {
            q: "Siapa saja yang diperbolehkan mendaftar sebagai pedagang?",
            a: "Diutamakan bagi warga Desa Cibenda yang memiliki NIK KTP setempat atau pelaku usaha mikro, kecil, dan menengah (UMKM) yang beroperasi di wilayah Desa Cibenda, Parigi.",
        },
        {
            q: "Berapa lama waktu yang dibutuhkan sampai akun pedagang diverifikasi?",
            a: "Proses verifikasi oleh Administrator Desa umumnya memakan waktu 1x24 jam pada hari dan jam kerja setelah data pendaftaran di portal SID dilengkapi.",
        },
        {
            q: "Produk apa saja yang boleh dan tidak boleh dijual?",
            a: "Anda dapat menjual aneka produk olahan laut, makanan & camilan khas, kerajinan tangan, produk pertanian, dan kebutuhan harian lainnya. Dilarang menjual produk ilegal, miras, rokok/tembakau, obat terlarang, atau barang berbahaya sesuai Syarat & Ketentuan platform.",
        },
        {
            q: "Ke mana saya harus menghubungi jika mengalami kendala teknis atau pendaftaran?",
            a: "Anda dapat berkonsultasi langsung ke Kantor Desa Cibenda (bagian Pelayanan UMKM & SID) pada jam kerja, atau melalui kontak layanan bantuan yang tertera di menu Tentang Kami.",
        },
    ];

    const toggle = (idx: number) => {
        setOpenIndex(openIndex === idx ? null : idx);
    };

    return (
        <section className="py-16 md:py-20 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider mb-2">
                        <HelpCircle className="w-3.5 h-3.5 text-brand-orange" />
                        <span>Tanya Jawab Seputar Mitra</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                        Pertanyaan yang Sering Diajukan (FAQ)
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                        Hal-hal penting yang perlu Anda ketahui sebelum dan sesudah bergabung sebagai mitra.
                    </p>
                </div>

                <div className="space-y-3.5">
                    {faqs.map((faq, idx) => {
                        const isOpen = openIndex === idx;
                        return (
                            <div
                                key={idx}
                                className={`rounded-2xl border transition-colors overflow-hidden ${
                                    isOpen
                                        ? "border-brand-orange/40 bg-orange-50/30"
                                        : "border-slate-200 bg-white hover:border-slate-300"
                                }`}
                            >
                                <button
                                    type="button"
                                    onClick={() => toggle(idx)}
                                    className="w-full py-4.5 px-6 flex items-center justify-between text-left gap-4 cursor-pointer"
                                >
                                    <span className="font-bold text-sm sm:text-base text-slate-800">
                                        {faq.q}
                                    </span>
                                    <ChevronDown
                                        className={`w-4 h-4 text-slate-500 shrink-0 transition-transform duration-200 ${
                                            isOpen ? "rotate-180 text-brand-orange" : ""
                                        }`}
                                    />
                                </button>

                                {isOpen && (
                                    <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100/80">
                                        {faq.a}
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

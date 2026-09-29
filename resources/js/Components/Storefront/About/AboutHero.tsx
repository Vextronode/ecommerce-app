import React from "react";
import { Link } from "@inertiajs/react";
import { MapPin, ShoppingBag, MessageSquareText } from "lucide-react";
import aboutImage from "@/assets/images/about.webp";

export default function AboutHero() {
    return (
        <section className="pt-32 md:pt-38 pb-16 md:pb-20 bg-[#F4F9FA] border-b border-slate-200/70">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
                    {/* Left: Text & Actions */}
                    <div className="about-hero-content lg:col-span-7 space-y-5 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-white border border-slate-200 text-slate-700 text-xs font-semibold shadow-2xs">
                            <MapPin className="w-3.5 h-3.5 text-brand-orange shrink-0" />
                            <span>Desa Cibenda, Kec. Parigi, Kab. Pangandaran</span>
                        </div>

                        <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold text-slate-900 tracking-tight leading-tight">
                            Pasar Digital Pesisir Pangandaran, Langsung dari Nelayan & UMKM Lokal
                        </h1>

                        <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                            Cibenda Mart hadir sebagai jembatan langsung antara perahu nelayan, rumah produksi olahan pesisir, dan konsumen. Membantu menjaga harga yang adil bagi produsen desa dan menghadirkan kesegaran hasil laut yang terjamin hingga ke meja makan Anda.
                        </p>

                        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
                            <Link
                                href={route("shop")}
                                className="px-6 py-3 bg-brand-orange hover:bg-brand-orange-hover text-white rounded-xl font-bold text-sm sm:text-base shadow-xs transition-colors inline-flex items-center gap-2 cursor-pointer"
                            >
                                <ShoppingBag className="w-4 h-4" />
                                <span>Belanja Produk Sekarang</span>
                            </Link>

                            <a
                                href="#contact-cs"
                                className="px-5 py-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl font-semibold text-sm sm:text-base transition-colors inline-flex items-center gap-2 shadow-2xs"
                            >
                                <MessageSquareText className="w-4 h-4 text-[#006591]" />
                                <span>Hubungi Layanan CS</span>
                            </a>
                        </div>
                    </div>

                    {/* Right: Authentic Photograph */}
                    <div className="about-hero-image lg:col-span-5">
                        <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm p-2">
                            <div className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-100">
                                <img
                                    src={aboutImage}
                                    alt="Aktivitas pedagang dan nelayan di Desa Cibenda, Parigi"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <p className="text-[12px] text-slate-500 font-medium px-2 pt-2.5 pb-1 text-center lg:text-left">
                                Suasana aktivitas ekonomi nelayan dan pedagang lokal di kawasan pesisir Parigi, Pangandaran.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

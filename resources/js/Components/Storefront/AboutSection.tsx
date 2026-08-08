import React from "react";
import { Link } from "@inertiajs/react";
import aboutImage from "@/assets/images/about.webp";

export default function AboutSection() {
    return (
        <section className="w-full py-16 md:py-24 mb-16 overflow-hidden">
            <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12">
                <div className="flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-24">
                    {/* TEXT CONTENT */}
                    <div className="w-full lg:w-1/2 flex flex-col justify-center items-center lg:items-start text-center lg:text-left">
                        <p className="text-black font-bold text-sm md:text-base mb-2">
                            Tentang CibendaMart
                        </p>
                        <h2 className="text-3xl md:text-5xl font-bold text-[#004F54] mb-6 leading-tight">
                            UMKM Desa Cibenda
                        </h2>
                        <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-8 max-w-lg">
                            CibendaMart merupakan marketplace lokal yang
                            menghubungkan masyarakat dengan pedagang.
                        </p>
                        <Link
                            href="/about"
                            className="bg-[#40E0D0] hover:bg-[#38c9ba] text-white font-bold text-sm md:text-base px-10 py-3 rounded-full transition-colors shadow-md shadow-[#40E0D0]/20"
                        >
                            Jelajahi
                        </Link>
                    </div>

                    {/* IMAGE CONTENT */}
                    <div className="w-full lg:w-1/2 flex justify-center lg:justify-end">
                        <div className="w-[300px] h-[300px] md:w-[450px] md:h-[450px] lg:w-[500px] lg:h-[500px] rounded-full overflow-hidden shadow-2xl relative">
                            <img
                                src={aboutImage}
                                alt="Pasar Tradisional Cibenda"
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700 ease-in-out"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

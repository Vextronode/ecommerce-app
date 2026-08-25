import React from "react";
import aboutImage from "@/assets/images/about.webp";

export default function AboutSection() {
    return (
        <section className="w-full py-16 md:py-24 bg-white overflow-hidden">
            <div className="w-full xl:max-w-[1440px] 2xl:max-w-[1600px] mx-auto px-4 md:px-8">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-24">
                    {/* TEXT CONTENT */}
                    <div className="w-full lg:w-1/2 flex flex-col justify-center items-center lg:items-start text-center lg:text-left">
                        <p className="font-bold text-base md:text-lg mb-2 text-brand-cyan">
                            Tentang CibendaMart
                        </p>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-brand-teal-deep mb-6 leading-tight tracking-tight">
                            UMKM Desa Cibenda
                        </h2>
                        <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-8 max-w-lg font-medium">
                            CibendaMart merupakan marketplace lokal yang menghubungkan
                            masyarakat dengan pedagang.
                        </p>
                        
                        {/* The SID Link */}
                        <a
                            href="https://cibenda.desa.id"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-brand-orange hover:bg-brand-orange-hover text-white font-bold text-sm md:text-base px-10 py-3.5 rounded-full transition-colors shadow-lg shadow-brand-orange/30"
                        >
                            Jelajahi
                        </a>
                    </div>

                    {/* IMAGE CONTENT */}
                    <div className="w-full lg:w-1/2 flex justify-center lg:justify-end">
                        <div className="w-[300px] h-[300px] md:w-[450px] md:h-[450px] lg:w-[480px] lg:h-[480px] overflow-hidden shadow-2xl relative" style={{ borderRadius: "100px" }}>
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

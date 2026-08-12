import React from "react";
import { Link } from "@inertiajs/react";
import { Truck, RefreshCw, Leaf, ShieldCheck } from "lucide-react";
import heroImage from "@/assets/images/hero_veg.webp";

export default function HeroSection() {
    return (
        <div className="w-full mx-auto px-4 md:px-8 mt-32 md:mt-32 mb-8 md:mb-28 relative">
            {/* Main Banner */}
            <div className="relative w-full bg-gradient-to-r from-[#DF7324] to-[#E88232] rounded-3xl md:rounded-[32px] px-6 md:px-16 pt-6 pb-6 md:pt-8 md:pb-24 flex flex-col md:flex-row items-center justify-between overflow-hidden shadow-sm">
                
                {/* Diagonal overlay (two-tone effect) */}
                <div className="absolute top-0 right-0 bottom-0 left-[45%] bg-white/5 skew-x-[-25deg] pointer-events-none transform origin-bottom"></div>

                {/* Left Content */}
                <div className="relative z-10 w-full md:w-3/5 text-center md:text-left mb-4 md:mb-0">
                    <div className="inline-block px-4 py-1.5 bg-white/20 rounded-full text-white text-[10px] md:text-xs font-semibold mb-4 md:mb-6 backdrop-blur-sm">
                        Pesan Antar Cepat
                    </div>
                    
                    <h1 className="text-3xl md:text-5xl lg:text-[56px] font-extrabold text-white leading-tight md:leading-[1.15] mb-4 md:mb-6 tracking-tight">
                        Belanja Kebutuhan<br className="hidden md:block" /> Harian dari UMKM<br className="hidden md:block" /> Cibenda
                    </h1>
                    
                    <p className="text-white/90 text-sm md:text-xl mb-6 md:mb-8">
                        Murah, Hemat, & Terjangkau
                    </p>
                    
                    <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3 md:gap-4">
                        <Link 
                            href="/shop"
                            className="bg-[#F8F9FA] hover:bg-white text-[#DF7324] font-bold px-6 md:px-8 py-3 md:py-3.5 rounded-xl transition-colors shadow-sm w-full sm:w-auto text-sm md:text-base text-center"
                            aria-label="Belanja Sekarang"
                        >
                            Belanja Sekarang
                        </Link>
                        <Link 
                            href="/shop"
                            className="border-2 border-white/80 hover:bg-white/10 text-white font-bold px-6 md:px-8 py-2.5 md:py-3 rounded-xl transition-colors w-full sm:w-auto text-sm md:text-base text-center"
                            aria-label="Jelajahi Produk"
                        >
                            Jelajahi Produk
                        </Link>
                    </div>
                </div>

                {/* Right Image */}
                <div className="relative z-10 w-full md:w-2/5 flex justify-center md:justify-end">
                    <img
                        src={heroImage}
                        alt="Aneka Sayuran Segar"
                        className="w-full max-w-[240px] md:max-w-[480px] object-contain drop-shadow-2xl translate-y-4 md:translate-y-0"
                        fetchPriority="high"
                    />
                </div>
            </div>

            {/* Floating Info Bar (Desktop Only) */}
            <div className="hidden md:block absolute left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 -bottom-14 md:-bottom-12 z-20 w-[calc(100%-2rem)] md:w-auto">
                <div className="bg-[#F4F5F7] shadow-xl rounded-[20px] border border-gray-200 px-6 py-4 md:py-5 w-full md:min-w-[900px] max-w-6xl xl:max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6">
                    
                    {/* Item 1 */}
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <Truck className="w-6 h-6 text-gray-700 shrink-0" strokeWidth={2} aria-hidden="true" />
                        <div>
                            <h4 className="font-bold text-sm text-gray-800 leading-tight">Free Shipping</h4>
                            <p className="text-xs text-gray-500 mt-0.5">delivery</p>
                        </div>
                    </div>

                    <div className="hidden md:block w-px h-10 bg-gray-300"></div>

                    {/* Item 2 */}
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <RefreshCw className="w-6 h-6 text-gray-700 shrink-0" strokeWidth={2} aria-hidden="true" />
                        <div>
                            <h4 className="font-bold text-sm text-gray-800 leading-tight">100% Fresh</h4>
                            <p className="text-xs text-gray-500 mt-0.5">from ocean</p>
                        </div>
                    </div>

                    <div className="hidden md:block w-px h-10 bg-gray-300"></div>

                    {/* Item 3 */}
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <Leaf className="w-6 h-6 text-gray-700 shrink-0" strokeWidth={2} aria-hidden="true" />
                        <div>
                            <h4 className="font-bold text-sm text-gray-800 leading-tight">100% Organic</h4>
                            <p className="text-xs text-gray-500 mt-0.5">Vegetable and Fruits</p>
                        </div>
                    </div>

                    <div className="hidden md:block w-px h-10 bg-gray-300"></div>

                    {/* Item 4 */}
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <ShieldCheck className="w-6 h-6 text-gray-700 shrink-0" strokeWidth={2} aria-hidden="true" />
                        <div>
                            <h4 className="font-bold text-sm text-gray-800 leading-tight">Secure Payment</h4>
                            <p className="text-xs text-gray-500 mt-0.5">100% protected</p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

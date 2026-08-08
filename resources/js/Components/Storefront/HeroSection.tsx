import React, { useState } from "react";
import {
    Search,
    SlidersHorizontal,
    Truck,
    RefreshCw,
    Leaf,
    ShieldCheck,
} from "lucide-react";
import { router } from "@inertiajs/react";
import heroImage from "@/assets/images/hero_veg.webp";

export default function HeroSection() {
    // state buat nyimpen input user
    const [searchQuery, setSearchQuery] = useState("");

    // handleSearch buat eksekusi pas tombol "Search" atau tombol "Enter" ditekan
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // ngarahin user ke halaman shop bawa parameter query-nya
        if (searchQuery.trim()) {
            router.get("/shop", { search: searchQuery });
        } else {
            router.get("/shop");
        }
    };

    return (
        <div className="w-full flex flex-col items-center mb-24 mt-24 md:mt-[120px] relative">
            <style>
                {`
                    .no-scrollbar::-webkit-scrollbar {
                        display: none;
                    }
                    .no-scrollbar {
                        -ms-overflow-style: none;
                        scrollbar-width: none;
                    }

                    @media (min-width: 768px) {
                        .hero-cutout {
                            clip-path: polygon(0 0, 100% 0, 100% 100%, calc(100% - 40px) 100%, calc(100% - 100px) calc(100% - 80px), 100px calc(100% - 80px), 40px 100%, 0 100%);
                        }
                        .hero-info-bar-desktop {
                            position: absolute;
                            bottom: 15px;
                            left: 100px;
                            right: 100px;
                            height: 80px;
                        }
                    }
                `}
            </style>

            {/* Hero Container */}
            <div className="w-full px-0 md:px-4 lg:px-8 xl:px-12 relative">
                <div className="relative z-10 drop-shadow-[0_15px_15px_rgba(0,0,0,0.08)]">
                    <div className="bg-[#004F54]/80 w-full pt-8 md:pt-[100px] pb-16 md:pb-[140px] px-6 md:px-20 flex flex-col md:flex-row items-center justify-between rounded-none md:rounded-t-[2.5rem] md:rounded-b-[2rem] hero-cutout transition-all backdrop-blur-sm">
                        <div className="w-full md:w-1/2 text-white text-center md:text-left mb-4 md:mb-0">
                            <h1 className="text-[2.5rem] md:text-6xl lg:text-[4.5rem] tracking-tight mb-2 md:mb-4 leading-none mt-4 md:mt-0">
                                <span className="font-normal text-[#40E0D0]">
                                    CIBENDA
                                </span>
                                <span className="font-bold text-white">
                                    MART
                                </span>
                            </h1>
                            <p className="text-gray-200 text-sm md:text-base max-w-sm mx-auto md:mx-0 mb-6 md:mb-8 leading-relaxed">
                                Belanja kebutuhan harian langsung dari tetangga,
                                lebih mudah dan cepat.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-4 justify-center md:justify-start w-full">
                                <button type="button" className="w-full sm:w-auto bg-[#40E0D0] hover:bg-[#3ce0c2] text-[#14433D] font-bold px-8 py-3 rounded-full transition shadow-lg shadow-[#40E0D0]/20 text-sm md:text-base">
                                    Shop Now
                                </button>
                                <button type="button" className="w-full sm:w-auto border-2 border-[#40E0D0] text-[#40E0D0] font-bold px-8 py-3 rounded-full hover:bg-[#40E0D0]/10 transition text-sm md:text-base hidden sm:block">
                                    Explore Category
                                </button>
                            </div>
                        </div>

                        <div className="w-full md:w-1/2 flex justify-center lg:justify-end pr-0 lg:pr-10 relative mt-6 md:mt-0">
                            <img
                                src={heroImage}
                                alt="Fresh Vegetables"
                                className="w-[80%] max-w-[280px] md:max-w-lg object-contain drop-shadow-2xl"
                                fetchPriority="high"
                            />
                        </div>
                    </div>
                </div>

                {/* Info bar */}
                <div className="w-full relative z-20 md:z-0 md:static -mt-8 md:mt-0 flex justify-center md:block">
                    <div className="w-[92%] md:w-auto mx-auto md:mx-0 md:hero-info-bar-desktop flex items-center transition-all bg-white md:bg-transparent rounded-[1.5rem] md:rounded-none shadow-[0_15px_30px_rgba(0,0,0,0.08)] md:shadow-none overflow-hidden border border-gray-100 md:border-none">
                        <div className="grid grid-cols-2 md:flex md:flex-row items-center justify-start md:justify-center w-full h-full p-4 md:p-0 md:px-8 gap-y-3 gap-x-2 md:gap-12 lg:gap-16">
                            <div className="flex items-center gap-2 md:gap-3 shrink-0">
                                <Truck
                                    className="text-[#004F54] md:text-gray-700 w-5 h-5 md:w-7 md:h-7"
                                    strokeWidth={2}
                                />
                                <div>
                                    <h4 className="font-bold text-xs md:text-sm text-gray-800 leading-tight">
                                        Free Shipping
                                    </h4>
                                    <p className="text-[10px] md:text-xs text-gray-500">
                                        delivery
                                    </p>
                                </div>
                            </div>

                            <div className="hidden md:block w-px h-8 md:h-8 bg-gray-200 md:bg-gray-300 shrink-0"></div>

                            <div className="flex items-center gap-2 md:gap-3 shrink-0">
                                <RefreshCw
                                    className="text-[#004F54] md:text-gray-700 w-5 h-5 md:w-7 md:h-7"
                                    strokeWidth={2}
                                />
                                <div>
                                    <h4 className="font-bold text-xs md:text-sm text-gray-800 leading-tight">
                                        100% Fresh
                                    </h4>
                                    <p className="text-[10px] md:text-xs text-gray-500">
                                        from ocean
                                    </p>
                                </div>
                            </div>

                            <div className="hidden md:block w-px h-8 md:h-8 bg-gray-200 md:bg-gray-300 shrink-0"></div>

                            <div className="flex items-center gap-2 md:gap-3 shrink-0">
                                <Leaf
                                    className="text-[#004F54] md:text-gray-700 w-5 h-5 md:w-7 md:h-7"
                                    strokeWidth={2}
                                />
                                <div>
                                    <h4 className="font-bold text-xs md:text-sm text-gray-800 leading-tight">
                                        100% Organic
                                    </h4>
                                    <p className="text-[10px] md:text-xs text-gray-500">
                                        Veg & Fruits
                                    </p>
                                </div>
                            </div>

                            <div className="hidden md:block w-px h-8 md:h-8 bg-gray-200 md:bg-gray-300 shrink-0"></div>

                            <div className="flex items-center gap-2 md:gap-3 shrink-0">
                                <ShieldCheck
                                    className="text-[#004F54] md:text-gray-700 w-5 h-5 md:w-7 md:h-7"
                                    strokeWidth={2}
                                />
                                <div>
                                    <h4 className="font-bold text-xs md:text-sm text-gray-800 leading-tight">
                                        Secure Payment
                                    </h4>
                                    <p className="text-[10px] md:text-xs text-gray-500">
                                        protected
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="w-full max-w-5xl px-4 z-20 mt-4 md:mt-16">
                <form onSubmit={handleSearch} className="bg-white rounded-full p-2 flex flex-row items-center justify-between shadow-[0_10px_30px_rgba(0,0,0,0.08)] border border-gray-100">

                    {/* Filter / Category Buttons (Desktop Only) */}
                    <div className="hidden md:flex items-center gap-2 w-auto bg-transparent p-0 rounded-full">
                        <button type="button" className="bg-gray-100 text-gray-700 px-6 py-2.5 rounded-full font-bold text-sm transition hover:bg-gray-200">
                            Category
                        </button>
                        <button type="button" className="text-gray-500 hover:text-gray-900 font-bold text-sm px-4 py-2.5 rounded-full transition">
                            Buy
                        </button>
                    </div>

                    <div className="hidden md:block w-[1px] h-8 bg-gray-200 mx-2"></div>

                    {/* Search Input */}
                    <div className="flex-1 flex items-center px-4 py-2 md:py-2 bg-transparent rounded-full group">
                        <Search className="w-5 h-5 text-gray-400 mr-2 md:mr-3 group-focus-within:text-[#004F54] transition-colors" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search products"
                            className="w-full border-none bg-transparent focus:ring-0 text-gray-700 p-0 text-sm md:text-base outline-none placeholder:text-gray-400"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1 md:gap-3 shrink-0">
                        <button type="button" className="text-gray-500 hover:text-[#004F54] p-2 bg-transparent rounded-full transition hidden sm:block">
                            <SlidersHorizontal
                                className="w-5 h-5"
                                strokeWidth={2}
                            />
                        </button>
                        <button type="submit" className="bg-[#004F54] hover:bg-[#003c40] text-white px-5 md:px-8 rounded-full font-bold text-sm transition shadow-md h-10 md:h-12 flex items-center justify-center">
                            <span className="hidden md:inline">Search</span>
                            <Search className="w-4 h-4 md:hidden" strokeWidth={2} />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

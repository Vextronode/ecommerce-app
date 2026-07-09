import React, { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { router } from "@inertiajs/react";
import heroBeach from "@/assets/images/hero_bg.jpeg";

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
        <div className="relative w-full h-100 md:h-125 lg:h-195 flex flex-col items-center justify-center mb-32 md:mb-16">
            <div className="absolute inset-0 w-full h-full rounded-b-[2.5rem] md:rounded-b-[3.5rem] overflow-hidden shadow-lg z-0">
                <div className="absolute top-0 left-0 w-full h-[60%]">
                    <img
                        src={heroBeach}
                        alt="Parigi Mart Beach"
                        className="w-full h-full object-cover"
                        fetchPriority="high"
                    />
                    <div className="absolute inset-0 bg-black/10"></div>
                </div>
                <div className="absolute bottom-0 left-0 w-full h-[40%] bg-linear-to-b from-[#40E0D0] to-[#E0F8F8]"></div>
            </div>

            <div className="absolute bottom-[40%] w-full flex flex-col items-center pointer-events-none z-10">
                <h1 className="text-[55px] sm:text-[80px] md:text-[120px] lg:text-[170px] font-bold tracking-widest leading-[0.8] text-[#40E0D0] drop-shadow-md -mb-4 sm:-mb-6 md:-mb-12">
                    CIBENDA
                </h1>
                <h1 className="text-[55px] sm:text-[80px] md:text-[120px] lg:text-[170px] font-bold tracking-widest leading-[0.8] text-white drop-shadow-md translate-y-1/2">
                    MART
                </h1>
            </div>

            {/* search bar container */}
            <div className="absolute -bottom-24 sm:-bottom-20 md:bottom-16 w-full max-w-5xl px-4 z-20 pointer-events-auto">
                <form
                    onSubmit={handleSearch}
                    className="bg-white rounded-3xl md:rounded-full p-4 md:p-2 flex flex-col md:flex-row items-center gap-4 shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-[#41B9C5]/30"
                >
                    {/* category & buy toggle */}
                    <div className="flex items-center gap-2 md:gap-4 px-2 w-full md:w-auto justify-center md:justify-start">
                        <button
                            type="button"
                            className="flex-1 md:flex-none bg-[#F0F2F5] text-[#334155] px-6 py-2.5 md:py-3 rounded-full font-bold text-sm transition hover:bg-gray-200"
                        >
                            Category
                        </button>
                        <button
                            type="button"
                            className="flex-1 md:flex-none text-[#475569] hover:text-gray-900 font-bold text-sm px-4 py-2.5 transition"
                        >
                            Buy
                        </button>
                    </div>

                    <div className="hidden md:block w-[1.5px] h-10 bg-gray-200 mx-2"></div>

                    {/* input search */}
                    <div className="flex-1 flex items-center px-5 py-2.5 border border-gray-200 rounded-full w-full group focus-within:border-[#40E0D0] focus-within:ring-1 focus-within:ring-[#40E0D0] transition-all bg-gray-50/50 md:bg-white">
                        <Search className="w-5 h-5 text-gray-400 mr-3 group-focus-within:text-[#40E0D0] transition-colors" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search products..."
                            className="w-full border-none bg-transparent focus:ring-0 text-gray-700 p-0 text-sm md:text-base outline-none placeholder:text-gray-400"
                        />
                    </div>

                    {/* filter & submit button */}
                    <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                        <button
                            type="button"
                            className="bg-gray-100 md:bg-transparent text-gray-500 hover:text-[#41B9C5] p-3 rounded-full transition"
                        >
                            <SlidersHorizontal
                                className="w-5 h-5 md:w-6 md:h-6"
                                strokeWidth={1.5}
                            />
                        </button>
                        <button
                            type="submit"
                            className="flex-1 md:flex-none bg-[#245D56] hover:bg-[#1a443f] text-white px-8 rounded-full font-bold text-sm transition shadow-md whitespace-nowrap h-12 flex items-center justify-center"
                        >
                            Search
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

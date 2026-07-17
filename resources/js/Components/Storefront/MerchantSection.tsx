import React from "react";
import { ChevronRight } from "lucide-react";
import { Link } from "@inertiajs/react";

export interface Store {
    id: number | string;
    name: string;
    description: string;
    image?: string;
}

interface MerchantSectionProps {
    stores: Store[];
}

export default function MerchantSection({ stores = [] }: MerchantSectionProps) {
    const displayStores = stores.length >= 4 ? stores.slice(0, 4) : [...stores, ...stores].slice(0, 4);

    return (
        <section className="w-full py-16 mb-8 md:mb-16">
            <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12">
                {/* HEADER */}
                <div className="flex items-end justify-between mb-8 md:mb-12">
                    <div>
                        <p className="text-gray-800 font-medium text-xs md:text-sm mb-1.5">
                            Merchant Category
                        </p>
                        <h2 className="text-2xl md:text-4xl font-bold text-black tracking-tight leading-none">
                            Shop by Store
                        </h2>
                    </div>
                    <Link
                        href="/stores"
                        className="flex items-center gap-1 font-semibold text-sm md:text-base text-[#40E0D0] hover:text-[#2dafa1] transition-colors group"
                    >
                        Lihat Semua
                        <ChevronRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {/* GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {displayStores.map((store, index) => {
                        // Alternate background colors to match the design
                        const bgClass =
                            index % 2 === 0
                                ? "bg-[#B2EBF2]" // Light cyan
                                : "bg-[#90A4AE]"; // Gray blue

                        const textClass = index % 2 === 0 ? "text-[#00838F]" : "text-[#263238]";

                        return (
                            <Link
                                href={`/store/${store.id}`}
                                key={`${store.id}-${index}`}
                                className={`${bgClass} rounded-[2rem] p-5 md:p-6 relative overflow-hidden flex flex-col h-72 hover:shadow-lg transition-shadow duration-300 group`}
                            >
                                {/* TEXT CONTENT */}
                                <div className="relative z-20 w-[65%] flex flex-col h-full pointer-events-none">
                                    <h3
                                        className={`font-black text-xl md:text-2xl leading-tight mb-2 ${textClass}`}
                                    >
                                        {store.name}
                                    </h3>
                                    <p className="text-gray-800 text-[11px] md:text-xs leading-relaxed mb-auto">
                                        {store.description || "Seafood fresh, sehat, dan enak"}
                                    </p>

                                    <button className="bg-white text-gray-900 font-bold text-xs px-5 py-2.5 rounded-full w-max shadow-sm hover:bg-gray-50 transition-colors mt-4 pointer-events-auto">
                                        Shop Now
                                    </button>
                                </div>

                                {/* IMAGE */}
                                <div className="absolute right-0 bottom-0 w-[40%] h-full flex items-center justify-end pr-4 md:pr-5 z-0 pointer-events-none">
                                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-4 border-white/30 shadow-md flex-shrink-0">
                                        <img
                                            src={
                                                store.image ||
                                                `https://placehold.co/400x400/e2e8f0/64748b?text=Merchant`
                                            }
                                            alt={store.name}
                                            className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500 ease-in-out"
                                        />
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

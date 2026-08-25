import React, { useMemo } from "react";
import { Link } from "@inertiajs/react";
import { BadgeCheck } from "lucide-react";

export interface Store {
    id: number | string;
    slug?: string;
    name: string;
    description: string;
    image?: string;
}

interface MerchantSectionProps {
    stores: Store[];
}

export default function MerchantSection({ stores = [] }: MerchantSectionProps) {
    // Shuffle stores daily
    const displayStores = useMemo(() => {
        if (!stores || stores.length === 0) return [];
        
        const today = new Date();
        const daySeed = today.getDate() + today.getMonth() * 31;
        
        let currentSeed = daySeed;
        const seededRandom = () => {
            const x = Math.sin(currentSeed++) * 10000;
            return x - Math.floor(x);
        };

        const validStores = stores.length >= 4 ? stores : [...stores, ...stores, ...stores, ...stores];
        
        const shuffled = [...validStores].sort(() => seededRandom() - 0.5);
        return shuffled.slice(0, 4);
    }, [stores]);

    if (!displayStores.length) return null;

    return (
        <section className="w-full py-16 bg-white">
            <div className="w-full xl:max-w-[1440px] 2xl:max-w-[1600px] mx-auto px-4 md:px-8">
                {/* HEADER */}
                <div className="mb-10">
                    <h2 className="text-3xl md:text-[34px] font-extrabold text-brand-teal-deep tracking-tight">
                        Belanja berdasarkan Toko
                    </h2>
                </div>

                {/* GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {displayStores.map((store, index) => {
                        // Alternate border colors
                        const borderColor = index % 2 === 0 ? "border-brand-teal/20" : "border-brand-orange/30";

                        return (
                            <Link
                                href={`/store/${store.slug || store.id}`}
                                key={`merchant-${store.id}-${index}`}
                                className={`bg-[#EAECEF] rounded-xl p-4 md:p-5 flex items-center gap-4 hover:shadow-md transition-all duration-300 border ${borderColor}`}
                                aria-label={`Kunjungi Toko ${store.name}`}
                            >
                                {/* IMAGE */}
                                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden shrink-0 border-2 border-white shadow-sm" aria-hidden="true">
                                    <img
                                        src={
                                            store.image ||
                                            `https://placehold.co/400x400/e2e8f0/64748b?text=Merchant`
                                        }
                                        alt=""
                                        className="object-cover w-full h-full"
                                        loading="lazy"
                                    />
                                </div>

                                {/* INFO */}
                                <div className="flex flex-col flex-1 min-w-0">
                                    <h3 className="font-bold text-gray-900 text-base md:text-lg flex items-center gap-1.5 truncate">
                                        <span className="truncate">{store.name}</span>
                                        <BadgeCheck className="w-4 h-4 text-green-500 shrink-0" aria-label="Terverifikasi" />
                                    </h3>
                                    <p className="text-gray-500 text-xs md:text-sm truncate mb-1">
                                        {store.description || "Toko Cibenda"}
                                    </p>
                                    <span className="text-brand-orange font-bold text-xs md:text-sm mt-0.5">
                                        Kunjungi Toko
                                    </span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

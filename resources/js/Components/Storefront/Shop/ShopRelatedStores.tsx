import React from "react";
import { Link } from "@inertiajs/react";
import { Store as StoreIcon, Star } from "lucide-react";
import StoreAvatar from "@/Components/Global/StoreAvatar";
import { StoreData } from "./types";

interface ShopRelatedStoresProps {
    searchQuery: string;
    relatedStores: StoreData[];
}

const getJoinedText = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 7) return "Baru bergabung";
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} minggu yang lalu`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} bulan yang lalu`;
    return `${Math.floor(diffDays / 365)} tahun yang lalu`;
};

export default function ShopRelatedStores({ searchQuery, relatedStores }: ShopRelatedStoresProps) {
    if (!searchQuery || !relatedStores || relatedStores.length === 0) {
        return null;
    }

    return (
        <div className="mb-10">
            <h2 className="text-xs md:text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <StoreIcon size={16} className="text-brand-orange" />
                <span>Toko Terkait "{searchQuery}"</span>
            </h2>
            <div className="grid grid-cols-1 gap-4">
                {relatedStores.map((store) => (
                    <div
                        key={store.id}
                        className="bg-white border border-gray-200 rounded-2xl p-4 md:p-6 flex flex-col md:flex-row gap-4 md:gap-6 shadow-xs hover:border-brand-orange/30 transition"
                    >
                        <div className="flex items-start gap-3 md:gap-4 flex-1">
                            <div className="w-12 h-12 md:w-16 md:h-16 shrink-0">
                                <StoreAvatar
                                    logoPath={store.logo_path}
                                    storeName={store.name}
                                    className="w-full h-full rounded-full text-lg md:text-xl"
                                />
                            </div>

                            <div className="flex flex-col flex-1">
                                <h3 className="text-base md:text-lg font-bold text-[#13005E] leading-tight mb-1">
                                    {store.name}
                                </h3>
                                <p className="text-xs md:text-sm text-gray-500 mb-3 md:mb-4 line-clamp-2">
                                    {store.description ||
                                        "Toko online lokal terpercaya di Pangandaran dengan produk berkualitas."}
                                </p>
                                <div>
                                    <Link
                                        href={route("store.detail", store.slug)}
                                        className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 border border-brand-orange text-brand-orange text-xs md:text-sm font-semibold rounded-xl hover:bg-orange-50 transition-colors"
                                    >
                                        <StoreIcon size={14} />
                                        Kunjungi Toko
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <div className="hidden md:block w-px bg-gray-100 mx-2"></div>
                        <div className="block md:hidden h-px bg-gray-100 my-1"></div>

                        <div className="grid grid-cols-2 gap-x-6 md:gap-x-10 gap-y-3 text-xs md:text-sm text-gray-500 md:min-w-64">
                            <div>
                                <span className="text-gray-400 block text-[11px]">Penilaian</span>
                                <span className="font-bold text-gray-800 text-sm flex items-center gap-1 mt-0.5">
                                    <Star size={13} className="fill-amber-400 text-amber-400" />
                                    {store.average_rating}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-400 block text-[11px]">Total Produk</span>
                                <span className="font-bold text-gray-800 text-sm mt-0.5 block">
                                    {store.products_count}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-400 block text-[11px]">Pengikut</span>
                                <span className="font-bold text-gray-800 text-sm mt-0.5 block">
                                    {store.followers_count}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-400 block text-[11px]">Bergabung</span>
                                <span className="font-bold text-gray-800 text-xs mt-0.5 block">
                                    {getJoinedText(store.created_at)}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

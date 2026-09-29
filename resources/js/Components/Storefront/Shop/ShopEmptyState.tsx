import React from "react";
import { Search } from "lucide-react";

interface ShopEmptyStateProps {
    onResetAll: () => void;
}

export default function ShopEmptyState({ onResetAll }: ShopEmptyStateProps) {
    return (
        <div className="w-full text-center py-20 flex flex-col items-center bg-white rounded-2xl border border-gray-100 shadow-xs mt-2 px-4">
            <div className="w-16 h-16 rounded-2xl bg-orange-50 text-brand-orange flex items-center justify-center mb-4">
                <Search className="w-8 h-8" />
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#13005E] mb-2">
                Produk Tidak Ditemukan
            </h3>
            <p className="text-gray-500 text-xs sm:text-sm mb-6 max-w-md">
                Tidak ada produk yang cocok dengan kombinasi filter atau pencarian Anda. Coba kurangi filter atau reset ke awal.
            </p>
            <button
                type="button"
                onClick={onResetAll}
                className="bg-brand-orange hover:bg-brand-orange-hover text-white px-7 py-3 rounded-full font-bold text-xs sm:text-sm transition shadow-md shadow-brand-orange/20 cursor-pointer"
            >
                Reset Semua Filter
            </button>
        </div>
    );
}

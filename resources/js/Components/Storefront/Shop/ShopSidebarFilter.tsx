import React from "react";
import { SlidersHorizontal, RotateCcw, Star } from "lucide-react";
import { renderCategoryIcon } from "@/utils/categoryIcons";
import { CategoryItem } from "./types";

interface ShopSidebarFilterProps {
    categories: CategoryItem[];
    allProductsCount: number;
    currentCategory: string;
    hasActiveFilters: boolean;
    priceMin: string;
    priceMax: string;
    minRating: string | number;
    onUpdateFilters: (params: Record<string, any>) => void;
    onApplyPrice: (e: React.FormEvent) => void;
    onResetAll: () => void;
    onSetPriceMin: (val: string) => void;
    onSetPriceMax: (val: string) => void;
}

export default function ShopSidebarFilter({
    categories,
    allProductsCount,
    currentCategory,
    hasActiveFilters,
    priceMin,
    priceMax,
    minRating,
    onUpdateFilters,
    onApplyPrice,
    onResetAll,
    onSetPriceMin,
    onSetPriceMax,
}: ShopSidebarFilterProps) {
    return (
        <aside className="w-64 shrink-0 hidden lg:block space-y-6 sticky top-28">
            <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs">
                {/* Header */}
                <div className="flex items-center justify-between pb-3.5 border-b border-gray-100 mb-4">
                    <div className="flex items-center gap-2">
                        <SlidersHorizontal size={16} className="text-brand-orange" />
                        <span className="font-bold text-sm text-gray-900">Filter Produk</span>
                    </div>
                    {hasActiveFilters && (
                        <button
                            type="button"
                            onClick={onResetAll}
                            className="text-[11px] font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1 transition cursor-pointer"
                        >
                            <RotateCcw size={11} />
                            Reset
                        </button>
                    )}
                </div>

                {/* Category Filter Group */}
                <div className="mb-6">
                    <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-3">
                        Kategori
                    </h3>
                    <div className="space-y-1.5 max-h-56 overflow-y-auto no-scrollbar pr-1">
                        <button
                            type="button"
                            onClick={() => onUpdateFilters({ category: "" })}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                                !currentCategory
                                    ? "bg-orange-50 text-brand-orange font-bold"
                                    : "text-gray-600 hover:bg-gray-50"
                            }`}
                        >
                            <span>Semua Kategori</span>
                            <span className="text-[10px] text-gray-400">
                                {allProductsCount}
                            </span>
                        </button>

                        {categories.map((cat) => {
                            const isSelected =
                                currentCategory === cat.slug ||
                                currentCategory.toLowerCase() === cat.name.toLowerCase();
                            return (
                                <button
                                    key={cat.id || cat.slug}
                                    type="button"
                                    onClick={() => onUpdateFilters({ category: cat.slug })}
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition text-left cursor-pointer ${
                                        isSelected
                                            ? "bg-orange-50 text-brand-orange font-bold"
                                            : "text-gray-600 hover:bg-gray-50"
                                    }`}
                                >
                                    <span className="flex items-center gap-2 truncate">
                                        <span className="w-6 h-6 rounded-md bg-gray-50 flex items-center justify-center shrink-0">
                                            {renderCategoryIcon(cat.slug, 13)}
                                        </span>
                                        <span className="truncate">{cat.name}</span>
                                    </span>
                                    {typeof cat.products_count === "number" && (
                                        <span className="text-[10px] text-gray-400 shrink-0">
                                            ({cat.products_count})
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Price Range Filter Group */}
                <div className="mb-6 pt-4 border-t border-gray-100">
                    <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-3">
                        Rentang Harga (Rp)
                    </h3>
                    <form onSubmit={onApplyPrice} className="space-y-2.5">
                        <div className="space-y-2">
                            <input
                                type="number"
                                placeholder="Harga Min"
                                value={priceMin}
                                onChange={(e) => onSetPriceMin(e.target.value)}
                                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/20"
                            />
                            <input
                                type="number"
                                placeholder="Harga Max"
                                value={priceMax}
                                onChange={(e) => onSetPriceMax(e.target.value)}
                                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/20"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full py-2 bg-gray-100 hover:bg-brand-orange hover:text-white text-gray-700 text-xs font-bold rounded-xl transition cursor-pointer"
                        >
                            Terapkan Harga
                        </button>
                    </form>
                </div>

                {/* Rating Filter Group */}
                <div className="pt-4 border-t border-gray-100">
                    <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-3">
                        Rating Produk
                    </h3>
                    <div className="space-y-1.5">
                        {[4, 3, 2, 1].map((stars) => {
                            const isSelected = String(minRating) === String(stars);
                            return (
                                <button
                                    key={stars}
                                    type="button"
                                    onClick={() =>
                                        onUpdateFilters({
                                            min_rating: isSelected ? "" : stars,
                                        })
                                    }
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                                        isSelected
                                            ? "bg-orange-50 text-brand-orange font-bold"
                                            : "text-gray-600 hover:bg-gray-50"
                                    }`}
                                >
                                    <div className="flex items-center gap-1">
                                        <Star size={13} className="fill-amber-400 text-amber-400" />
                                        <span>{stars} Bintang Ke Atas</span>
                                    </div>
                                    {isSelected && <span className="text-brand-orange text-xs font-bold">✓</span>}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </aside>
    );
}

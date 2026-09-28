import React from "react";
import { SlidersHorizontal, ArrowUpDown, RotateCcw, X } from "lucide-react";
import { CategoryItem } from "./types";

interface ShopToolbarProps {
    allProductsCount: number;
    hasActiveFilters: boolean;
    activeCategoryObj?: CategoryItem;
    minPrice?: string | number;
    maxPrice?: string | number;
    minRating?: string | number;
    currentSort?: string;
    currentExtraSort?: string;
    onOpenMobileFilter: () => void;
    onResetAll: () => void;
    onUpdateFilters: (params: Record<string, any>) => void;
    onClearPrice: () => void;
}

export default function ShopToolbar({
    allProductsCount,
    hasActiveFilters,
    activeCategoryObj,
    minPrice,
    maxPrice,
    minRating,
    currentSort = "default",
    currentExtraSort = "",
    onOpenMobileFilter,
    onResetAll,
    onUpdateFilters,
    onClearPrice,
}: ShopToolbarProps) {
    return (
        <div className="bg-white border border-gray-200/80 rounded-2xl p-3 sm:px-4 sm:py-3 mb-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-3">
            {/* Row 1: Header / Filter Trigger & Result Count */}
            <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                <div className="flex items-center gap-2">
                    {/* Mobile Filter Button */}
                    <button
                        type="button"
                        onClick={onOpenMobileFilter}
                        className="lg:hidden inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-orange-50 text-gray-700 hover:text-brand-orange border border-gray-200 rounded-xl text-xs font-bold transition shrink-0 active:scale-95 cursor-pointer"
                    >
                        <SlidersHorizontal size={14} className="text-brand-orange" />
                        <span>Filter</span>
                        {hasActiveFilters && (
                            <span className="w-2 h-2 rounded-full bg-brand-orange" />
                        )}
                    </button>

                    <span className="text-gray-400 font-semibold text-xs whitespace-nowrap">
                        Ditemukan: <span className="text-gray-900 font-bold">{allProductsCount}</span> produk
                    </span>
                </div>

                {hasActiveFilters && (
                    <button
                        type="button"
                        onClick={onResetAll}
                        className="lg:hidden text-[11px] font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1 transition cursor-pointer"
                    >
                        <RotateCcw size={11} />
                        Reset
                    </button>
                )}

                {/* Active Filter Chips (Desktop) */}
                <div className="hidden lg:flex items-center gap-1.5 flex-wrap">
                    {activeCategoryObj && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-50 text-brand-orange border border-brand-orange/20 rounded-lg text-xs font-bold">
                            Kategori: {activeCategoryObj.name}
                            <button
                                type="button"
                                onClick={() => onUpdateFilters({ category: "" })}
                                className="hover:text-rose-500 ml-0.5 cursor-pointer"
                            >
                                <X size={12} />
                            </button>
                        </span>
                    )}

                    {(minPrice || maxPrice) && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold">
                            Harga: {minPrice ? `Rp${Number(minPrice).toLocaleString("id-ID")}` : "0"} -{" "}
                            {maxPrice ? `Rp${Number(maxPrice).toLocaleString("id-ID")}` : "Max"}
                            <button
                                type="button"
                                onClick={onClearPrice}
                                className="hover:text-rose-500 ml-0.5 cursor-pointer"
                            >
                                <X size={12} />
                            </button>
                        </span>
                    )}

                    {minRating && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-xs font-semibold">
                            Rating {minRating}★+
                            <button
                                type="button"
                                onClick={() => onUpdateFilters({ min_rating: "" })}
                                className="hover:text-rose-500 ml-0.5 cursor-pointer"
                            >
                                <X size={12} />
                            </button>
                        </span>
                    )}

                    {currentExtraSort && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-50 text-brand-orange border border-brand-orange/20 rounded-lg text-xs font-bold">
                            {currentExtraSort === "price_asc"
                                ? "Harga: Terendah"
                                : currentExtraSort === "price_desc"
                                ? "Harga: Tertinggi"
                                : "Rating Tertinggi"}
                            <button
                                type="button"
                                onClick={() => onUpdateFilters({ extra_sort: "" })}
                                className="hover:text-rose-500 ml-0.5 cursor-pointer"
                            >
                                <X size={12} />
                            </button>
                        </span>
                    )}
                </div>
            </div>

            {/* Active Chips Strip (Mobile only, if any active filter) */}
            {(activeCategoryObj || minPrice || maxPrice || minRating || currentExtraSort) && (
                <div className="flex lg:hidden items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                    {activeCategoryObj && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-50 text-brand-orange border border-brand-orange/20 rounded-lg text-[11px] font-bold shrink-0">
                            {activeCategoryObj.name}
                            <button
                                type="button"
                                onClick={() => onUpdateFilters({ category: "" })}
                                className="hover:text-rose-500 ml-0.5"
                            >
                                <X size={11} />
                            </button>
                        </span>
                    )}

                    {(minPrice || maxPrice) && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 rounded-lg text-[11px] font-semibold shrink-0">
                            Rp {minPrice ? Number(minPrice).toLocaleString("id-ID") : "0"} - {maxPrice ? Number(maxPrice).toLocaleString("id-ID") : "Max"}
                            <button
                                type="button"
                                onClick={onClearPrice}
                                className="hover:text-rose-500 ml-0.5"
                            >
                                <X size={11} />
                            </button>
                        </span>
                    )}

                    {minRating && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-[11px] font-semibold shrink-0">
                            {minRating}★+
                            <button
                                type="button"
                                onClick={() => onUpdateFilters({ min_rating: "" })}
                                className="hover:text-rose-500 ml-0.5"
                            >
                                <X size={11} />
                            </button>
                        </span>
                    )}

                    {currentExtraSort && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-50 text-brand-orange border border-brand-orange/20 rounded-lg text-[11px] font-bold shrink-0">
                            {currentExtraSort === "price_asc"
                                ? "Harga: Terendah"
                                : currentExtraSort === "price_desc"
                                ? "Harga: Tertinggi"
                                : "Rating Tertinggi"}
                            <button
                                type="button"
                                onClick={() => onUpdateFilters({ extra_sort: "" })}
                                className="hover:text-rose-500 ml-0.5"
                            >
                                <X size={11} />
                            </button>
                        </span>
                    )}
                </div>
            )}

            {/* Row 2: Sort Actions - Smooth horizontal scroll on mobile, flex on desktop */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar sm:ml-auto pt-1 sm:pt-0">
                <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 font-semibold shrink-0 pr-1">
                    <ArrowUpDown size={13} className="text-gray-400" />
                    <span>Urutkan:</span>
                </div>

                {/* Square sort options */}
                {[
                    { label: "Paling Sesuai", value: "default" },
                    { label: "Terlaris", value: "popular" },
                    { label: "Panen Terbaru", value: "newest" },
                ].map((item) => {
                    const isActive = (currentSort || "default") === item.value;
                    return (
                        <button
                            key={item.value}
                            type="button"
                            onClick={() => onUpdateFilters({ sort: item.value })}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border whitespace-nowrap shrink-0 select-none cursor-pointer ${
                                isActive
                                    ? "bg-brand-orange text-white border-brand-orange shadow-xs"
                                    : "bg-white hover:bg-gray-50 text-gray-700 border-gray-200"
                            }`}
                        >
                            {item.label}
                        </button>
                    );
                })}

                {/* Dropdown Khusus Harga & Rating */}
                <div className="relative shrink-0">
                    <select
                        value={currentExtraSort || ""}
                        onChange={(e) => onUpdateFilters({ extra_sort: e.target.value })}
                        className={`px-3 py-1.5 border rounded-xl text-xs font-bold transition cursor-pointer outline-none whitespace-nowrap ${
                            currentExtraSort
                                ? "border-brand-orange bg-orange-50/70 text-brand-orange ring-1 ring-brand-orange/20"
                                : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                        }`}
                    >
                        <option value="">Harga & Rating</option>
                        <option value="price_asc">Harga: Terendah</option>
                        <option value="price_desc">Harga: Tertinggi</option>
                        <option value="top_rated">Rating Tertinggi</option>
                    </select>
                </div>
            </div>
        </div>
    );
}

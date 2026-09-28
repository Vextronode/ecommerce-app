import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, X, Star } from "lucide-react";
import { renderCategoryIcon } from "@/utils/categoryIcons";
import { CategoryItem } from "./types";

interface ShopMobileDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    categories: CategoryItem[];
    currentCategory: string;
    priceMin: string;
    priceMax: string;
    minRating: string | number;
    onUpdateFilters: (params: Record<string, any>) => void;
    onApplyPrice: (e: React.FormEvent) => void;
    onResetAll: () => void;
    onSetPriceMin: (val: string) => void;
    onSetPriceMax: (val: string) => void;
}

export default function ShopMobileDrawer({
    isOpen,
    onClose,
    categories,
    currentCategory,
    priceMin,
    priceMax,
    minRating,
    onUpdateFilters,
    onApplyPrice,
    onResetAll,
    onSetPriceMin,
    onSetPriceMax,
}: ShopMobileDrawerProps) {
    // Lock body scroll when mobile filter drawer is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex lg:hidden">
                    {/* Backdrop with smooth fade */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.22, ease: "easeOut" }}
                        className="fixed inset-0 bg-black/45 backdrop-blur-xs"
                        onClick={onClose}
                    />

                    {/* Modal Content sliding smoothly from LEFT */}
                    <motion.div
                        initial={{ x: "-100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "-100%" }}
                        transition={{ type: "spring", damping: 28, stiffness: 280 }}
                        className="relative mr-auto w-[85%] max-w-xs h-full bg-white shadow-2xl p-5 overflow-y-auto flex flex-col justify-between z-10"
                    >
                        <div>
                            <div className="flex items-center justify-between pb-3.5 border-b border-gray-100 mb-5">
                                <div className="flex items-center gap-2">
                                    <SlidersHorizontal size={18} className="text-brand-orange" />
                                    <h3 className="font-extrabold text-base text-gray-900">Filter Belanja</h3>
                                </div>
                                <button
                                    type="button"
                                    aria-label="Tutup filter"
                                    onClick={onClose}
                                    className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition cursor-pointer"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Mobile Categories */}
                            <div className="mb-6">
                                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5">
                                    Kategori
                                </h4>
                                <div className="space-y-1 max-h-48 overflow-y-auto no-scrollbar">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            onUpdateFilters({ category: "" });
                                            onClose();
                                        }}
                                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
                                            !currentCategory ? "bg-orange-50 text-brand-orange font-bold" : "text-gray-600"
                                        }`}
                                    >
                                        Semua Kategori
                                    </button>
                                    {categories.map((cat) => (
                                        <button
                                            key={cat.id || cat.slug}
                                            type="button"
                                            onClick={() => {
                                                onUpdateFilters({ category: cat.slug });
                                                onClose();
                                            }}
                                            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between cursor-pointer ${
                                                currentCategory === cat.slug
                                                    ? "bg-orange-50 text-brand-orange font-bold"
                                                    : "text-gray-600"
                                            }`}
                                        >
                                            <span className="flex items-center gap-2 truncate">
                                                <span className="w-5 h-5 rounded-md bg-gray-50 flex items-center justify-center shrink-0">
                                                    {renderCategoryIcon(cat.slug, 12)}
                                                </span>
                                                <span className="truncate">{cat.name}</span>
                                            </span>
                                            {typeof cat.products_count === "number" && (
                                                <span className="text-[10px] text-gray-400">
                                                    ({cat.products_count})
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Mobile Price */}
                            <div className="mb-6 pt-4 border-t border-gray-100">
                                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5">
                                    Rentang Harga
                                </h4>
                                <div className="space-y-2">
                                    <input
                                        type="number"
                                        placeholder="Harga Min"
                                        value={priceMin}
                                        onChange={(e) => onSetPriceMin(e.target.value)}
                                        className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Harga Max"
                                        value={priceMax}
                                        onChange={(e) => onSetPriceMax(e.target.value)}
                                        className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl"
                                    />
                                </div>
                            </div>

                            {/* Mobile Rating */}
                            <div className="pt-4 border-t border-gray-100">
                                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5">
                                    Rating Produk
                                </h4>
                                <div className="space-y-1">
                                    {[4, 3].map((stars) => {
                                        const isSelected = String(minRating) === String(stars);
                                        return (
                                            <button
                                                key={stars}
                                                type="button"
                                                onClick={() => {
                                                    onUpdateFilters({
                                                        min_rating: isSelected ? "" : stars,
                                                    });
                                                    onClose();
                                                }}
                                                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
                                                    isSelected
                                                        ? "bg-orange-50 text-brand-orange font-bold"
                                                        : "text-gray-600"
                                                }`}
                                            >
                                                <div className="flex items-center gap-1">
                                                    <Star size={13} className="fill-amber-400 text-amber-400" />
                                                    <span>{stars} Ke Atas</span>
                                                </div>
                                                {isSelected && <span className="text-brand-orange text-xs font-bold">✓</span>}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-4 border-t border-gray-100 space-y-2">
                            <button
                                type="button"
                                onClick={(e) => {
                                    onApplyPrice(e);
                                    onClose();
                                }}
                                className="w-full py-3 bg-brand-orange text-white text-xs font-bold rounded-xl shadow-md shadow-brand-orange/20 cursor-pointer"
                            >
                                Terapkan Filter
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    onResetAll();
                                    onClose();
                                }}
                                className="w-full py-2.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-xl cursor-pointer"
                            >
                                Reset Filter
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

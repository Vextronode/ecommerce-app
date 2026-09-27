import React from "react";
import { SlidersHorizontal, Download, Filter } from "lucide-react";

interface Props {
    activeFiltersCount: number;
    onOpenFilter: () => void;
    onExport: () => void;
}

export default function ReportHeader({
    activeFiltersCount,
    onOpenFilter,
    onExport,
}: Props) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            {/* Title & Subtitle */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                    Laporan Produk Terlaris
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">
                    Daftar produk dengan penjualan tertinggi dari seluruh pedagang CibendaMart.
                </p>
            </div>

            {/* Action Buttons: Filter & Export */}
            <div className="flex items-center gap-3 shrink-0">
                {/* Filter Button */}
                <button
                    type="button"
                    onClick={onOpenFilter}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold border transition cursor-pointer shadow-2xs ${activeFiltersCount > 0
                            ? "bg-orange-50 border-brand-orange/40 text-brand-orange"
                            : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300"
                        }`}
                >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Filter</span>
                    {activeFiltersCount > 0 && (
                        <span className="w-5 h-5 rounded-full bg-brand-orange text-white text-[10px] flex items-center justify-center font-extrabold">
                            {activeFiltersCount}
                        </span>
                    )}
                </button>

                {/* Export Button */}
                <button
                    type="button"
                    onClick={onExport}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold bg-brand-orange hover:bg-brand-orange-dark text-white shadow-md shadow-brand-orange/25 transition cursor-pointer"
                >
                    <Download className="w-3.5 h-3.5" />
                    <span>Ekspor Data</span>
                </button>
            </div>
        </div>
    );
}

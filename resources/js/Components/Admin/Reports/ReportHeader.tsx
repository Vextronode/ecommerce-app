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
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#004F54] tracking-tight">
                    Best Selling Products
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">
                    Top performing products across all merchants for the current period.
                </p>
            </div>

            {/* Action Buttons: Filter & Export */}
            <div className="flex items-center gap-3 shrink-0">
                {/* Filter Button */}
                <button
                    type="button"
                    onClick={onOpenFilter}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold border transition cursor-pointer shadow-2xs ${activeFiltersCount > 0
                            ? "bg-[#E6F8F9] border-[#41B9C5] text-[#004F54]"
                            : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300"
                        }`}
                >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Filter</span>
                    {activeFiltersCount > 0 && (
                        <span className="w-5 h-5 rounded-full bg-[#41B9C5] text-white text-[10px] flex items-center justify-center font-extrabold">
                            {activeFiltersCount}
                        </span>
                    )}
                </button>

                {/* Export Button */}
                <button
                    type="button"
                    onClick={onExport}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold bg-[#41B9C5] hover:bg-[#38a3ae] text-white shadow-md shadow-[#41B9C5]/25 transition cursor-pointer"
                >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export</span>
                </button>
            </div>
        </div>
    );
}

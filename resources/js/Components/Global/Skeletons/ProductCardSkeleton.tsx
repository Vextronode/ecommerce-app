import React from "react";

export default function ProductCardSkeleton() {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_16px_-2px_rgba(0,0,0,0.06),0_2px_6px_-1px_rgba(0,0,0,0.04)] flex flex-col h-full overflow-hidden p-3 sm:p-3.5 animate-pulse select-none pointer-events-none">
            {/* Product Image Skeleton */}
            <div className="w-full aspect-square rounded-xl bg-gray-200/80 mb-3 relative overflow-hidden">
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
            </div>

            {/* Product Meta Info Skeleton */}
            <div className="flex flex-col flex-1">
                {/* Category */}
                <div className="h-3 w-16 bg-gray-200/80 rounded-md mb-2" />

                {/* Product Title */}
                <div className="h-4 w-4/5 bg-gray-200/80 rounded-md mb-1.5" />
                <div className="h-4 w-1/2 bg-gray-100 rounded-md mb-2" />

                {/* Store Name */}
                <div className="flex items-center gap-1.5 mb-3">
                    <div className="w-3.5 h-3.5 bg-gray-200/80 rounded-full shrink-0" />
                    <div className="h-3 w-24 bg-gray-200/80 rounded-md" />
                </div>

                {/* Rating & Sold Row */}
                <div className="flex items-center justify-between mb-3 pt-0.5">
                    <div className="h-3 w-14 bg-gray-200/80 rounded-md" />
                    <div className="h-3 w-16 bg-gray-200/80 rounded-md" />
                </div>

                {/* Price & Add to Cart Action Row */}
                <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
                    {/* Price */}
                    <div className="h-5 w-24 bg-gray-200/80 rounded-md" />

                    {/* Shopping Cart Button Placeholder */}
                    <div className="w-7 h-7 bg-gray-200/80 rounded-full" />
                </div>
            </div>
        </div>
    );
}

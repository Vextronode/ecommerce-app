import React from "react";
import ProductCardSkeleton from "@/Components/Global/Skeletons/ProductCardSkeleton";

export default function DashboardPageSkeleton() {
    return (
        <div className="w-full animate-pulse select-none space-y-12 pb-16 pt-24 md:pt-28">
            {/* Hero Section Skeleton */}
            <div className="w-full xl:max-w-360 2xl:max-w-400 mx-auto px-4 md:px-8">
                <div className="w-full h-72 sm:h-96 md:h-112 rounded-3xl bg-gray-200 relative overflow-hidden flex flex-col justify-end p-6 md:p-12">
                    <div className="h-6 w-32 bg-gray-300 rounded-full mb-3" />
                    <div className="h-10 sm:h-14 w-3/4 max-w-lg bg-gray-300 rounded-2xl mb-4" />
                    <div className="h-4 sm:h-5 w-1/2 max-w-md bg-gray-300/80 rounded-xl mb-6" />
                    <div className="h-12 w-44 bg-gray-300 rounded-2xl" />
                </div>
            </div>

            {/* Daily Top Products Carousel Skeleton */}
            <div className="w-full py-12 md:py-16 bg-brand-orange-tint/30">
                <div className="w-full xl:max-w-360 2xl:max-w-400 mx-auto px-4 md:px-8">
                    <div className="flex items-center justify-between mb-8">
                        <div className="h-8 w-48 bg-gray-200 rounded-xl" />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <ProductCardSkeleton key={`top-skeleton-${i}`} />
                        ))}
                    </div>
                </div>
            </div>

            {/* Explore Products Grid Skeleton */}
            <div className="w-full py-12 bg-white">
                <div className="w-full xl:max-w-360 2xl:max-w-400 mx-auto px-4 md:px-8">
                    <div className="mb-10">
                        <div className="h-8 w-52 bg-gray-200 rounded-xl mb-2" />
                        <div className="h-4 w-64 bg-gray-100 rounded-md" />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 mb-12">
                        {Array.from({ length: 10 }).map((_, i) => (
                            <ProductCardSkeleton key={`explore-skeleton-${i}`} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

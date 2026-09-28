import React from "react";
import ProductGridSkeleton from "@/Components/Global/Skeletons/ProductGridSkeleton";

export default function StoreDetailPageSkeleton() {
    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-32 space-y-6 animate-pulse select-none">
            {/* Store Header Skeleton */}
            <div className="bg-white rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6 shadow-sm border border-gray-100 relative overflow-hidden">
                {/* Store Avatar */}
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gray-200 border-4 border-white shadow-lg shrink-0" />

                {/* Store Info & Follow/Share buttons */}
                <div className="relative z-10 flex-1 flex flex-col md:flex-row items-center md:items-center justify-between w-full">
                    <div className="text-center md:text-left space-y-2">
                        {/* Store Name */}
                        <div className="h-8 md:h-9 w-52 bg-gray-200 rounded-xl mx-auto md:mx-0" />
                        {/* Store Address */}
                        <div className="h-4 w-40 bg-gray-100 rounded-md mx-auto md:mx-0" />
                        {/* Follow & Share buttons */}
                        <div className="flex items-center gap-3 pt-2 justify-center md:justify-start">
                            <div className="h-10 w-32 bg-gray-200 rounded-2xl" />
                            <div className="h-10 w-10 bg-gray-100 rounded-full border border-gray-200" />
                        </div>
                    </div>

                    {/* Rating & Sold Stats */}
                    <div className="mt-6 md:mt-0 flex items-center justify-center md:justify-end">
                        <div className="text-center">
                            <div className="h-7 w-36 bg-gray-200 rounded-lg mx-auto mb-1.5" />
                            <div className="h-4 w-28 bg-gray-100 rounded-md mx-auto" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Store Filter Pills Skeleton */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                <div className="h-9 w-24 bg-gray-200 rounded-xl shrink-0" />
                <div className="h-9 w-20 bg-gray-100 rounded-xl shrink-0" />
                <div className="h-9 w-24 bg-gray-100 rounded-xl shrink-0" />
                <div className="h-9 w-28 bg-gray-100 rounded-xl shrink-0" />
            </div>

            {/* Tabs & Search Container Skeleton */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 min-h-125">
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-200/80 pb-4 md:pb-0 gap-4 mb-8">
                    {/* Tabs */}
                    <div className="flex items-center overflow-x-auto no-scrollbar">
                        <div className="h-12 w-32 bg-gray-200 rounded-t-lg mr-2" />
                        <div className="h-12 w-32 bg-gray-100 rounded-t-lg mr-2" />
                        <div className="h-12 w-32 bg-gray-100 rounded-t-lg" />
                    </div>

                    {/* Search Bar Skeleton */}
                    <div className="h-10 w-full md:w-64 bg-gray-100 rounded-lg border border-gray-200/50" />
                </div>

                {/* Tab Products Content Skeleton */}
                <div className="space-y-12">
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="h-6 w-44 bg-gray-200 rounded-lg" />
                            <div className="h-4 w-24 bg-gray-100 rounded-md" />
                        </div>
                        <ProductGridSkeleton count={10} />
                    </div>
                </div>
            </div>
        </main>
    );
}

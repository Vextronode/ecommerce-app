import React from "react";
import ProductGridSkeleton from "@/Components/Global/Skeletons/ProductGridSkeleton";

export default function ShopPageSkeleton() {
    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 md:pt-36 pb-20 animate-pulse select-none">
            {/* Breadcrumb Skeleton */}
            <div className="flex items-center gap-2 mb-3">
                <div className="h-3.5 w-16 bg-gray-200 rounded-md" />
                <div className="h-3 w-3 bg-gray-200 rounded-full" />
                <div className="h-3.5 w-16 bg-gray-200 rounded-md" />
            </div>

            {/* Header / Title Skeleton */}
            <div className="border-b border-gray-100 pb-5 mb-8">
                <div className="h-8 w-64 bg-gray-200 rounded-xl mb-2" />
                <div className="h-4 w-96 max-w-full bg-gray-100 rounded-md" />
            </div>

            {/* Main Layout: Sidebar Skeleton + Product Catalog Skeleton */}
            <div className="flex items-start gap-8">
                {/* Left Column: Sidebar Filter Skeleton (Desktop) */}
                <aside className="w-64 shrink-0 hidden lg:block space-y-6">
                    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs space-y-6">
                        <div className="flex items-center justify-between pb-3.5 border-b border-gray-100">
                            <div className="h-4 w-28 bg-gray-200 rounded-md" />
                            <div className="h-3.5 w-12 bg-gray-100 rounded-md" />
                        </div>
                        {/* Categories skeleton list */}
                        <div className="space-y-2">
                            <div className="h-3.5 w-20 bg-gray-200 rounded-md mb-3" />
                            {Array.from({ length: 7 }).map((_, i) => (
                                <div key={i} className="flex items-center justify-between py-1.5">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 bg-gray-200 rounded-md" />
                                        <div className="h-3.5 w-24 bg-gray-200 rounded-md" />
                                    </div>
                                    <div className="h-3 w-6 bg-gray-100 rounded-md" />
                                </div>
                            ))}
                        </div>
                        {/* Price skeleton */}
                        <div className="pt-4 border-t border-gray-100 space-y-2">
                            <div className="h-3.5 w-28 bg-gray-200 rounded-md mb-2" />
                            <div className="h-8 w-full bg-gray-100 rounded-xl" />
                            <div className="h-8 w-full bg-gray-100 rounded-xl" />
                            <div className="h-8 w-full bg-gray-200 rounded-xl mt-2" />
                        </div>
                    </div>
                </aside>

                {/* Right Column: Catalog Grid Skeleton */}
                <main className="flex-1 min-w-0">
                    {/* Toolbar Skeleton */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-3 sm:px-4 sm:py-3 mb-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <div className="h-7 w-20 bg-gray-200 rounded-xl lg:hidden" />
                            <div className="h-4 w-36 bg-gray-200 rounded-md" />
                        </div>
                        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                            <div className="h-8 w-24 bg-gray-200 rounded-xl shrink-0" />
                            <div className="h-8 w-20 bg-gray-100 rounded-xl shrink-0" />
                            <div className="h-8 w-24 bg-gray-100 rounded-xl shrink-0" />
                            <div className="h-8 w-28 bg-gray-100 rounded-xl shrink-0" />
                        </div>
                    </div>

                    {/* Products Grid Skeleton */}
                    <ProductGridSkeleton count={12} />
                </main>
            </div>
        </div>
    );
}

import React from "react";
import ProductCardSkeleton from "@/Components/Global/Skeletons/ProductCardSkeleton";

export default function ProductDetailPageSkeleton() {
    return (
        <div className="min-h-screen bg-[#EAF7F7] px-4 pb-8 pt-28 font-sans md:px-8 md:pb-10 md:pt-36 select-none animate-pulse">
            {/* Main Product Card Container */}
            <div className="mx-auto max-w-6xl rounded-[2.5rem] bg-white/90 p-5 shadow-[0_20px_80px_rgba(15,23,42,0.08)] backdrop-blur md:p-8 lg:p-10 mb-16">
                <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] lg:gap-12">
                    {/* Left: Product Gallery Skeleton */}
                    <div className="flex flex-col gap-4">
                        {/* Main Image Box */}
                        <div className="w-full aspect-square md:aspect-[4/3] rounded-3xl bg-gray-200" />
                        {/* Thumbnail Row */}
                        <div className="flex gap-3 overflow-x-auto pb-2">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="w-20 h-20 rounded-2xl bg-gray-200 shrink-0"
                                />
                            ))}
                        </div>
                    </div>

                    {/* Right: Product Summary & Purchase Options Skeleton */}
                    <div className="flex flex-col gap-5 lg:pt-1">
                        {/* Location / Shop Badge */}
                        <div className="flex items-center gap-2">
                            <div className="h-4 w-4 bg-gray-200 rounded-full" />
                            <div className="h-4 w-36 bg-gray-200 rounded-md" />
                        </div>

                        {/* Title */}
                        <div className="space-y-2">
                            <div className="h-8 w-4/5 bg-gray-200 rounded-xl" />
                            <div className="h-8 w-2/5 bg-gray-200 rounded-xl" />
                        </div>

                        {/* Price */}
                        <div className="h-10 w-48 bg-gray-200 rounded-2xl mt-1" />

                        {/* Variant Selector Skeleton */}
                        <div className="space-y-2.5 pt-2">
                            <div className="h-4 w-28 bg-gray-200 rounded-md" />
                            <div className="flex gap-2">
                                <div className="h-9 w-24 bg-gray-200 rounded-xl" />
                                <div className="h-9 w-28 bg-gray-100 rounded-xl" />
                                <div className="h-9 w-20 bg-gray-100 rounded-xl" />
                            </div>
                        </div>

                        {/* Quantity Selector Skeleton */}
                        <div className="flex items-center gap-4 pt-2">
                            <div className="h-4 w-20 bg-gray-200 rounded-md" />
                            <div className="h-10 w-32 bg-gray-200 rounded-xl" />
                            <div className="h-4 w-24 bg-gray-100 rounded-md" />
                        </div>

                        {/* CTA Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-3">
                            <div className="h-12 flex-1 bg-gray-200 rounded-2xl" />
                            <div className="h-12 flex-1 bg-gray-200 rounded-2xl" />
                        </div>

                        {/* Delivery Banner Skeleton */}
                        <div className="h-20 w-full bg-gray-100/80 rounded-2xl border border-gray-200/60 p-4 flex items-center gap-4 mt-2">
                            <div className="w-10 h-10 rounded-xl bg-gray-200 shrink-0" />
                            <div className="space-y-2 flex-1">
                                <div className="h-4 w-36 bg-gray-200 rounded-md" />
                                <div className="h-3 w-56 bg-gray-200 rounded-md" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Section: Store Profile + Tabs + Detail Card */}
                <div className="mt-10 space-y-6 border-t border-slate-100 pt-8 md:mt-12">
                    {/* Store Profile Card Skeleton */}
                    <div className="p-4 sm:p-5 rounded-2xl border border-gray-100 bg-gray-50/60 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-full bg-gray-200 shrink-0" />
                            <div className="space-y-2">
                                <div className="h-5 w-40 bg-gray-200 rounded-md" />
                                <div className="h-3.5 w-52 bg-gray-200 rounded-md" />
                            </div>
                        </div>
                        <div className="h-10 w-32 bg-gray-200 rounded-xl shrink-0" />
                    </div>

                    {/* Product Tabs Skeleton */}
                    <div className="flex gap-4 border-b border-gray-200 pb-3">
                        <div className="h-8 w-32 bg-gray-200 rounded-lg" />
                        <div className="h-8 w-28 bg-gray-100 rounded-lg" />
                    </div>

                    {/* Product Details & Guarantees Skeleton */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.25fr_0.75fr]">
                        <div className="p-6 rounded-2xl border border-gray-100 bg-white space-y-3">
                            <div className="h-5 w-40 bg-gray-200 rounded-md mb-4" />
                            <div className="h-4 w-full bg-gray-100 rounded-md" />
                            <div className="h-4 w-5/6 bg-gray-100 rounded-md" />
                            <div className="h-4 w-4/6 bg-gray-100 rounded-md" />
                            <div className="h-4 w-full bg-gray-100 rounded-md" />
                            <div className="h-4 w-3/4 bg-gray-100 rounded-md" />
                        </div>
                        <div className="p-6 rounded-2xl border border-gray-100 bg-white space-y-4">
                            <div className="h-5 w-36 bg-gray-200 rounded-md mb-3" />
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="flex gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-gray-200 shrink-0" />
                                    <div className="space-y-1.5 flex-1">
                                        <div className="h-4 w-32 bg-gray-200 rounded-md" />
                                        <div className="h-3 w-full bg-gray-100 rounded-md" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Related Products Carousel Skeleton */}
            <div className="mx-auto max-w-7xl pt-8 border-t border-[#41B9C5]/20">
                <div className="h-6 w-52 bg-gray-200 rounded-md mb-6" />
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <ProductCardSkeleton key={i} />
                    ))}
                </div>
            </div>
        </div>
    );
}

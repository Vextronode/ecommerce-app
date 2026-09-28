import React from "react";
import ProductCardSkeleton from "./ProductCardSkeleton";

interface ProductGridSkeletonProps {
    count?: number;
    className?: string;
}

export default function ProductGridSkeleton({
    count = 12,
    className = "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-5",
}: ProductGridSkeletonProps) {
    return (
        <div className={className}>
            {Array.from({ length: count }).map((_, index) => (
                <ProductCardSkeleton key={`product-skeleton-${index}`} />
            ))}
        </div>
    );
}

import React from "react";
import { Star, ShoppingCart } from "lucide-react";
import { Link, router } from "@inertiajs/react";
import toast from "react-hot-toast";
import ProductCard from "./ProductCard";

export interface Product {
    id: number | string;
    slug?: string;
    name: string;
    price: string;
    rating: number;
    sold: string;
    image: string;
}

interface ProductCarouselProps {
    title: string;
    products: Product[];
}

export default function ProductCarousel({
    title,
    products = [],
}: ProductCarouselProps) {
    return (
        <div className="w-full py-12 md:py-16 mb-16 md:mb-24">
            <div className="max-w-[1400px] mx-auto px-4 md:px-8">
                {/* HEADER */}
                <div className="flex flex-col items-center justify-center mb-10 text-center">
                    <p className="text-gray-500 text-xs md:text-sm mb-1">
                        Trending Produk
                    </p>
                    <h2 className="text-2xl md:text-4xl font-bold text-gray-900 tracking-tight">
                        {title}
                    </h2>
                </div>

                {/* GRID */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 px-2">
                    {products.map((product, index) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>
        </div>
    );
}

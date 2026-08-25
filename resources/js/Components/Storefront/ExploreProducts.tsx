import React, { useMemo } from "react";
import { Link } from "@inertiajs/react";
import ProductCard from "./ProductCard";

interface ExploreProductsProps {
    products: any[];
}

export default function ExploreProducts({ products }: ExploreProductsProps) {
    // Shuffle products daily to be fair
    const displayProducts = useMemo(() => {
        if (!products || products.length === 0) return [];
        
        const today = new Date();
        const daySeed = today.getDate() + today.getMonth() * 31;
        
        let currentSeed = daySeed;
        const seededRandom = () => {
            const x = Math.sin(currentSeed++) * 10000;
            return x - Math.floor(x);
        };

        const shuffled = [...products].sort(() => seededRandom() - 0.5);
        return shuffled.slice(0, 10);
    }, [products]);

    if (!displayProducts.length) return null;

    return (
        <section className="w-full py-16 bg-white">
            <div className="w-full xl:max-w-[1440px] 2xl:max-w-[1600px] mx-auto px-4 md:px-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
                    <div>
                        <h2 className="text-3xl md:text-[34px] font-extrabold text-brand-teal-deep tracking-tight mb-2">
                            Eksplor Produk
                        </h2>
                        <p className="text-sm md:text-base text-gray-500">
                            Apa yang semua orang beli sekarang
                        </p>
                    </div>
                </div>

                {/* Grid Products */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 mb-12">
                    {displayProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>

                {/* View All Button */}
                <div className="flex justify-center">
                    <Link
                        href="/shop"
                        className="inline-flex items-center justify-center px-8 md:px-12 py-3.5 rounded-lg border-2 border-brand-teal-deep text-brand-teal-deep font-bold text-sm md:text-base hover:bg-brand-teal-deep hover:text-white transition-colors"
                        aria-label="Lihat Semua Produk"
                    >
                        Lihat Semua Produk
                    </Link>
                </div>
            </div>
        </section>
    );
}

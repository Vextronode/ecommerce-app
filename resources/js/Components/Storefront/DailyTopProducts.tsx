import React, { useMemo } from "react";
import { Zap } from "lucide-react";
import ProductCard from "./ProductCard";

interface DailyTopProductsProps {
    products: any[];
}

export default function DailyTopProducts({ products }: DailyTopProductsProps) {
    const displayProducts = useMemo(() => {
        // Basic popularity score (rating and sold combined)
        const sorted = [...products].sort((a, b) => {
            const scoreA = (Number(a.rating) || 0) * 10 + (Number(a.sold) || 0);
            const scoreB = (Number(b.rating) || 0) * 10 + (Number(b.sold) || 0);
            return scoreB - scoreA;
        });

        // Use the current day to seed the randomizer (resets 1x a day)
        const today = new Date();
        const daySeed = today.getDate() + today.getMonth() * 31;
        
        const top10 = sorted.slice(0, 10);
        
        let currentSeed = daySeed;
        const seededRandom = () => {
            const x = Math.sin(currentSeed++) * 10000;
            return x - Math.floor(x);
        };

        // Shuffle the top 10 based on the daily seed and slice 5
        const shuffled = top10.sort(() => seededRandom() - 0.5);
        return shuffled.slice(0, 5);
    }, [products]);

    if (!displayProducts.length) return null;

    return (
        <section className="w-full py-12 md:py-16 bg-brand-orange-tint/40">
            <div className="w-full xl:max-w-360 2xl:max-w-400 mx-auto px-4 md:px-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 flex items-center gap-2">
                        Top Products <Zap className="w-6 h-6 md:w-8 md:h-8 text-brand-orange fill-brand-orange" />
                    </h2>
                </div>

                {/* Grid Products / Mobile Slider */}
                <div className="flex overflow-x-auto no-scrollbar snap-x snap-mandatory gap-4 pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0 sm:grid sm:grid-cols-3 lg:grid-cols-5 md:gap-6 sm:overflow-visible">
                    {displayProducts.map((product) => (
                        <div key={product.id} className="min-w-40 max-w-45 sm:min-w-0 sm:max-w-none shrink-0 snap-start">
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

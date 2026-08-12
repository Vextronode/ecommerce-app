import React, { useMemo } from "react";
import { Link } from "@inertiajs/react";
import ProductCard from "@/Components/Storefront/ProductCard";

interface Props {
    recommendations?: any[];
}

const formatProduct = (product: any) => ({
    id: product.id,
    name: product.name,
    slug: product.slug || String(product.id),
    store: product.store,
    store_name: product.store_name || product.store?.name,
    category: product.category,
    category_name: product.category_name || product.category?.name || "Pilihan",
    price: typeof product.price === "number" ? product.price : Number(product.price) || 0,
    rating: product.rating ? Number(product.rating) : 0,
    sold: product.sold ? Number(product.sold) : 0,
    image:
        product.img ||
        product.image ||
        product.image_path ||
        "https://images.unsplash.com/photo-1565688534245-05d6b5be184a?auto=format&fit=crop&q=80&w=400",
});

export default function ProductRecommendations({ recommendations = [] }: Props) {
    // Daily shuffle — produk bagus tetap lebih sering muncul
    const displayProducts = useMemo(() => {
        if (!recommendations || recommendations.length === 0) return [];
        const today = new Date();
        const daySeed = today.getDate() + today.getMonth() * 31;
        let seed = daySeed;
        const seededRandom = () => {
            const x = Math.sin(seed++) * 10000;
            return x - Math.floor(x);
        };
        return [...recommendations].sort(() => seededRandom() - 0.5).slice(0, 10);
    }, [recommendations]);

    if (displayProducts.length === 0) return null;

    return (
        <section className="mt-16 pt-12 border-t border-slate-200/60">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                <div>
                    <h2 className="text-2xl md:text-[28px] font-extrabold text-[#13005E] tracking-tight mb-1">
                        Rekomendasi Produk
                    </h2>
                    <p className="text-sm text-gray-500">
                        Pilihan terbaik buat melengkapi belanjaanmu
                    </p>
                </div>
            </div>

            {/* Grid — same layout as ExploreProducts */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 mb-10">
                {displayProducts.map((product) => (
                    <ProductCard key={product.id} product={formatProduct(product)} />
                ))}
            </div>

            {/* View All Button */}
            <div className="flex justify-center">
                <Link
                    href="/shop"
                    className="inline-flex items-center justify-center px-8 md:px-12 py-3.5 rounded-lg border-2 border-[#13005E] text-[#13005E] font-bold text-sm md:text-base hover:bg-[#13005E] hover:text-white transition-colors"
                    aria-label="Lihat Semua Produk"
                >
                    Lihat Semua Produk
                </Link>
            </div>
        </section>
    );
}

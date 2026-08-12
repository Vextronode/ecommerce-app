import React from "react";
import { Head } from "@inertiajs/react";
import StorefrontLayout from "@/Layouts/StorefrontLayout";
import HeroSection from "@/Components/Storefront/HeroSection";
import DailyTopProducts from "@/Components/Storefront/DailyTopProducts";
import ExploreProducts from "@/Components/Storefront/ExploreProducts";
import MerchantSection from "@/Components/Storefront/MerchantSection";
import AboutSection from "@/Components/Storefront/AboutSection";

interface Props {
    categories: any[];
    featuredProducts: any[];
    stores: any[];
}

const EMPTY_ARRAY: any[] = [];

export default function Dashboard({ categories, featuredProducts, stores = EMPTY_ARRAY }: Props) {
    const formattedProducts = featuredProducts.map((product) => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        store: product.store,
        store_name: product.store?.name || product.store_name,
        category: product.category,
        category_name: product.category?.name || product.category_name || "Produk",
        price: product.price,
        rating: product.rating ? Number(product.rating) : 0.0, // Pakai rating asli, default 0 jika belum ada
        sold: product.sold || 0,
        image:
            product.image_path ||
            "https://images.unsplash.com/photo-1565688534245-05d6b5be184a?auto=format&fit=crop&q=80&w=400", // Fallback kalau gak ada foto
    }));

    const formattedCategories = categories.map((cat, index) => ({
        id: cat.id,
        name: cat.name,
        image:
            cat.image_path ||
            `https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400&sig=${index}`,
    }));

    return (
        <StorefrontLayout>
            <Head title="Home - Cibenda Mart" />

            <HeroSection />

            <DailyTopProducts products={formattedProducts} />
            
            <ExploreProducts products={formattedProducts} />

            <MerchantSection stores={stores} />
            <AboutSection />
        </StorefrontLayout>
    );
}

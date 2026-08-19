import React, { useEffect } from "react";
import { Head, router } from "@inertiajs/react";
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
    // Live Real-Time Product & Stock Sync for Home Page
    useEffect(() => {
        if (typeof window === "undefined" || !window.Echo) return;

        const channel = window.Echo.channel("storefront-products");
        const handleProductUpdated = () => {
            router.reload({ only: ["featuredProducts", "categories", "stores"] });
        };

        channel.listen(".ProductStockUpdated", handleProductUpdated);
        channel.listen("ProductStockUpdated", handleProductUpdated);

        return () => {
            window.Echo.leaveChannel("storefront-products");
        };
    }, []);

    const formattedProducts = featuredProducts.map((product) => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        store: product.store,
        store_name: product.store?.name || product.store_name,
        category: product.category,
        category_name: product.category?.name || product.category_name || "Produk",
        price: product.price,
        rating: product.rating ? Number(product.rating) : 0.0,
        sold: product.sold || 0,
        image:
            product.image_path ||
            "https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&q=80&w=400",
    }));

    const formattedCategories = categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        image:
            cat.image_path ||
            "https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&q=80&w=400",
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

import React from "react";
import { Head } from "@inertiajs/react";
import StorefrontLayout from "@/Layouts/StorefrontLayout";
import HeroSection from "@/Components/Storefront/HeroSection";
import CategorySection from "@/Components/Storefront/CategorySection";
import ProductCarousel from "@/Components/Storefront/ProductCarousel";
import StoreFeatures from "@/Components/Storefront/StoreFeatures";
import MerchantSection from "@/Components/Storefront/MerchantSection";
import AboutSection from "@/Components/Storefront/AboutSection";

interface Props {
    categories: any[];
    featuredProducts: any[];
    stores: any[];
}

export default function Dashboard({ categories, featuredProducts, stores = [] }: Props) {
    // format data produk dari database biar sesuai sama kebutuhan komponen ProductCarousel
    const formattedProducts = featuredProducts.map((product) => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        // format mata uang
        price: new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0,
        }).format(product.price),
        rating: 5.0, // Sementara hardcode sampai fitur review dibuat
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
            {/* <InfoBanner /> */}

            <CategorySection categories={formattedCategories} />
            <ProductCarousel
                title="Top Produk"
                products={formattedProducts}
            />

            <MerchantSection stores={stores} />
            <AboutSection />
            <StoreFeatures />
        </StorefrontLayout>
    );
}

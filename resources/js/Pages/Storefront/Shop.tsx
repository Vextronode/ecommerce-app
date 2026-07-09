import React from "react";
import { Head, Link } from "@inertiajs/react";
import { X } from "lucide-react";
import StorefrontLayout from "@/Layouts/StorefrontLayout";
import ShopHero from "@/Components/Storefront/ShopHero";
import CategorySection from "@/Components/Storefront/CategorySection";
import ProductCarousel from "@/Components/Storefront/ProductCarousel";

interface GroupedProduct {
    category_name: string;
    products: any[];
}

interface Props {
    categories: any[];
    groupedProducts: GroupedProduct[];
    searchQuery: string;
}

export default function Shop({
    categories,
    groupedProducts,
    searchQuery,
}: Props) {
    const formattedCategories = categories.map((cat, index) => ({
        id: cat.id,
        name: cat.name,
        image:
            cat.image_path ||
            `https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400&sig=${index}`,
    }));

    const formatProduct = (product: any) => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0,
        }).format(product.price),
        rating: 5.0, // Hardcode sementara
        sold: "0", // Hardcode sementara
        image:
            product.image_path ||
            "https://images.unsplash.com/photo-1565688534245-05d6b5be184a?auto=format&fit=crop&q=80&w=400",
    });

    return (
        <StorefrontLayout>
            <Head
                title={
                    searchQuery
                        ? `Search: ${searchQuery} - Cibenda Mart`
                        : "Shop - Cibenda Mart"
                }
            />

            <ShopHero />

            {searchQuery && (
                <div className="w-full max-w-350 mx-auto px-4 md:px-8 lg:px-12 mt-8 -mb-4">
                    <div className="bg-[#E0F7FA] border border-[#41B9C5]/30 rounded-full py-3 px-6 inline-flex items-center gap-4 shadow-sm">
                        <h2 className="text-base md:text-lg font-bold text-gray-800 m-0">
                            Hasil pencarian untuk:{" "}
                            <span className="text-[#245D56]">
                                "{searchQuery}"
                            </span>
                        </h2>

                        <Link
                            href={route("shop")}
                            className="bg-white hover:bg-red-50 text-gray-400 hover:text-red-500 p-1.5 rounded-full transition-colors border border-gray-200 shadow-sm flex items-center justify-center"
                            title="Hapus pencarian"
                        >
                            <X
                                className="w-4 h-4 md:w-5 md:h-5"
                                strokeWidth={2.5}
                            />
                        </Link>
                    </div>
                </div>
            )}

            {!searchQuery && (
                <CategorySection categories={formattedCategories} />
            )}

            {groupedProducts.length > 0 ? (
                groupedProducts.map((group, index) => (
                    <ProductCarousel
                        key={index}
                        title={group.category_name}
                        products={group.products.map(formatProduct)}
                    />
                ))
            ) : (
                <div className="w-full text-center py-32 flex flex-col items-center">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                        Produk Tidak Ditemukan
                    </h3>
                    <p className="text-gray-500 mb-6">
                        Waduh bosku, produk yang dicari belum ada di Cibenda
                        Mart.
                    </p>
                    <Link
                        href={route("shop")}
                        className="bg-[#245D56] hover:bg-[#1a443f] text-white px-8 py-3 rounded-full font-bold transition shadow-md"
                    >
                        Lihat Semua Produk
                    </Link>
                </div>
            )}
        </StorefrontLayout>
    );
}

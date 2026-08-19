import React, { useEffect } from "react";
import { Head, Link, router } from "@inertiajs/react";
import { Search, Store as StoreIcon } from "lucide-react";
import StorefrontLayout from "@/Layouts/StorefrontLayout";
import ProductCard from "@/Components/Storefront/ProductCard";
import StoreAvatar from "@/Components/Global/StoreAvatar";

interface StoreData {
    id: number;
    name: string;
    slug: string;
    description: string;
    logo_path: string | null;
    products_count: number;
    followers_count: number;
    average_rating: string;
    created_at: string;
}

interface Props {
    allProducts?: any[];
    searchQuery: string;
    relatedStores?: StoreData[];
}

const formatProduct = (product: any) => ({
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
});

// Sama persis dengan StoreProfileCard agar konsisten di seluruh app
const getJoinedText = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 7) return "Baru bergabung";
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} minggu yang lalu`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} bulan yang lalu`;
    return `${Math.floor(diffDays / 365)} tahun yang lalu`;
};

export default function Shop({
    allProducts = [],
    searchQuery,
    relatedStores = [],
}: Props) {
    useEffect(() => {
        if (typeof window === "undefined" || !window.Echo) return;

        const channel = window.Echo.channel("storefront-products");
        const handleProductUpdated = () => {
            router.reload({ only: ["allProducts"] });
        };

        channel.listen(".ProductStockUpdated", handleProductUpdated);
        channel.listen("ProductStockUpdated", handleProductUpdated);

        return () => {
            window.Echo.leaveChannel("storefront-products");
        };
    }, []);

    return (
        <StorefrontLayout>
            <Head
                title={
                    searchQuery
                        ? `Search: ${searchQuery} - Cibenda Mart`
                        : "Shop - Cibenda Mart"
                }
            />

            <div className="w-full xl:max-w-360 2xl:max-w-400 mx-auto px-4 md:px-8 pt-32 md:pt-40 pb-16">

                {/* Related Stores Section — only shown during search */}
                {searchQuery && relatedStores.length > 0 && (
                    <div className="mb-10">
                        <h2 className="text-sm md:text-base font-bold text-gray-500 uppercase mb-4">
                            TOKO TERKAIT "{searchQuery.toUpperCase()}"
                        </h2>
                        <div className="grid grid-cols-1 gap-4">
                            {relatedStores.map((store) => (
                                <div key={store.id} className="bg-white border border-gray-200 rounded-xl p-4 md:p-6 flex flex-col md:flex-row gap-4 md:gap-6 shadow-sm">
                                    {/* Store Info Left */}
                                    <div className="flex items-start gap-3 md:gap-4 flex-1">
                                        <div className="w-12 h-12 md:w-16 md:h-16 shrink-0">
                                            <StoreAvatar
                                                logoPath={store.logo_path}
                                                storeName={store.name}
                                                className="w-full h-full rounded-full text-lg md:text-xl"
                                            />
                                        </div>

                                        <div className="flex flex-col flex-1">
                                            <h3 className="text-base md:text-lg font-bold text-[#13005E] leading-tight mb-1">{store.name}</h3>
                                            <p className="text-xs md:text-sm text-gray-500 mb-3 md:mb-4 line-clamp-2">
                                                {store.description || "Toko online terbaik yang menyediakan berbagai macam kebutuhan Anda dengan harga terjangkau."}
                                            </p>
                                            <div>
                                                <Link
                                                    href={route("store.detail", store.slug)}
                                                    className="inline-flex items-center justify-center gap-1.5 md:gap-2 px-3 md:px-4 py-1 md:py-1.5 border border-[#41B9C5] text-[#41B9C5] text-xs md:text-sm font-semibold rounded hover:bg-[#E0F7FA] transition-colors"
                                                >
                                                    <StoreIcon size={14} className="md:w-4 md:h-4" />
                                                    Kunjungin Toko
                                                </Link>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Divider Desktop */}
                                    <div className="hidden md:block w-px bg-gray-200 mx-4"></div>
                                    {/* Divider Mobile */}
                                    <div className="block md:hidden h-px bg-gray-200 my-1"></div>

                                    {/* Store Stats */}
                                    <div className="grid grid-cols-2 gap-x-6 md:gap-x-10 gap-y-3 md:gap-y-4 text-xs md:text-sm text-gray-500 md:min-w-75">
                                        <div className="flex items-center gap-3">
                                            <span className="text-gray-500">Penilaian Toko</span>
                                            <span className="font-bold text-[#ED7218]">{store.average_rating}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-gray-500">Total Produk</span>
                                            <span className="font-bold text-[#ED7218]">{store.products_count}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-gray-500">Pengikut</span>
                                            <span className="font-bold text-[#ED7218]">{store.followers_count}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-gray-500">Bergabung</span>
                                            <span className="font-bold text-[#ED7218]">{getJoinedText(store.created_at)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* All Products Grid */}
                <div className="mb-8">
                    {!searchQuery && (
                        <h1 className="text-2xl md:text-3xl font-extrabold text-[#13005E] tracking-tight mb-8">
                            Semua Produk
                        </h1>
                    )}

                    {allProducts.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                            {allProducts.map((p, index) => (
                                <ProductCard key={index} product={formatProduct(p)} />
                            ))}
                        </div>
                    ) : (
                        <div className="w-full text-center py-20 flex flex-col items-center bg-white rounded-xl border border-gray-100 shadow-sm mt-8">
                            <Search className="w-16 h-16 text-gray-300 mb-4" />
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">
                                Produk Tidak Ditemukan
                            </h3>
                            <p className="text-gray-500 mb-6 max-w-md">
                                Waduh bosku, produk yang dicari belum ada di Cibenda Mart. Coba gunakan kata kunci lain.
                            </p>
                            <Link
                                href={route("shop")}
                                className="bg-[#245D56] hover:bg-[#1a443f] text-white px-8 py-3 rounded-full font-bold transition shadow-md"
                            >
                                Lihat Semua Produk
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </StorefrontLayout>
    );
}

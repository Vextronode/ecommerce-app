import React, { useState, useEffect } from "react";
import { Head, Link, router } from "@inertiajs/react";
import { ChevronRight } from "lucide-react";
import StorefrontLayout from "@/Layouts/StorefrontLayout";
import ProductCard from "@/Components/Storefront/ProductCard";
import { renderCategoryIcon } from "@/utils/categoryIcons";
import {
    StoreData,
    CategoryItem,
    ShopProduct,
} from "@/Components/Storefront/Shop/types";
import ShopRelatedStores from "@/Components/Storefront/Shop/ShopRelatedStores";
import ShopSidebarFilter from "@/Components/Storefront/Shop/ShopSidebarFilter";
import ShopToolbar from "@/Components/Storefront/Shop/ShopToolbar";
import ShopMobileDrawer from "@/Components/Storefront/Shop/ShopMobileDrawer";
import ShopEmptyState from "@/Components/Storefront/Shop/ShopEmptyState";

interface Props {
    allProducts?: ShopProduct[];
    searchQuery?: string;
    relatedStores?: StoreData[];
    categories?: CategoryItem[];
    currentCategory?: string;
    currentSort?: string;
    currentExtraSort?: string;
    minPrice?: string | number;
    maxPrice?: string | number;
    minRating?: string | number;
}

const formatProduct = (product: ShopProduct) => ({
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
        product.image ||
        product.image_path ||
        "https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&q=80&w=400",
});

export default function Shop({
    allProducts = [],
    searchQuery = "",
    relatedStores = [],
    categories = [],
    currentCategory = "",
    currentSort = "default",
    currentExtraSort = "",
    minPrice = "",
    maxPrice = "",
    minRating = "",
}: Props) {
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
    const [priceMin, setPriceMin] = useState(minPrice ? String(minPrice) : "");
    const [priceMax, setPriceMax] = useState(maxPrice ? String(maxPrice) : "");
    const [isLoading, setIsLoading] = useState(false);

    // Sync input state if props change from URL
    useEffect(() => {
        setPriceMin(minPrice ? String(minPrice) : "");
        setPriceMax(maxPrice ? String(maxPrice) : "");
    }, [minPrice, maxPrice]);

    // Real-time stock update
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

    // Filter Navigation Handler with Inertia query preservation
    const updateFilters = (newParams: Record<string, any>) => {
        setIsLoading(true);
        const queryParams = new URLSearchParams(window.location.search);

        Object.entries(newParams).forEach(([key, value]) => {
            if (value === undefined || value === null || value === "" || value === "all") {
                queryParams.delete(key);
            } else {
                queryParams.set(key, String(value));
            }
        });

        const params: Record<string, string> = {};
        queryParams.forEach((val, key) => {
            params[key] = val;
        });

        router.get("/shop", params, {
            preserveState: false,
            preserveScroll: true,
            replace: true,
            onFinish: () => setIsLoading(false),
        });
    };

    const handleApplyPrice = (e: React.FormEvent) => {
        e.preventDefault();
        updateFilters({
            min_price: priceMin || undefined,
            max_price: priceMax || undefined,
        });
    };

    const handleResetAll = () => {
        setPriceMin("");
        setPriceMax("");
        setIsLoading(true);
        router.get("/shop", {}, {
            preserveState: false,
            preserveScroll: true,
            onFinish: () => setIsLoading(false),
        });
    };

    const handleClearPrice = () => {
        setPriceMin("");
        setPriceMax("");
        updateFilters({ min_price: "", max_price: "" });
    };

    const hasActiveFilters = Boolean(
        currentCategory ||
        searchQuery ||
        currentSort !== "default" ||
        currentExtraSort ||
        minPrice ||
        maxPrice ||
        minRating
    );

    const activeCategoryObj = categories.find(
        (c) => c.slug === currentCategory || c.name.toLowerCase() === currentCategory.toLowerCase()
    );

    const pageTitle = searchQuery
        ? `Cari: "${searchQuery}" - Cibenda Mart`
        : activeCategoryObj
        ? `${activeCategoryObj.name} - Cibenda Mart`
        : "Katalog Belanja - Cibenda Mart";

    return (
        <StorefrontLayout>
            <Head title={pageTitle} />

            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 md:pt-36 pb-20">
                {/* Breadcrumbs & Header Section */}
                <div className="mb-6">
                    <nav className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold mb-2.5">
                        <Link href="/dashboard" className="hover:text-brand-orange transition-colors">
                            Beranda
                        </Link>
                        <ChevronRight size={13} className="text-gray-400" />
                        <Link href="/shop" className="hover:text-brand-orange transition-colors">
                            Belanja
                        </Link>
                        {activeCategoryObj && (
                            <>
                                <ChevronRight size={13} className="text-gray-400" />
                                <span className="text-brand-orange font-bold truncate max-w-xs">
                                    {activeCategoryObj.name}
                                </span>
                            </>
                        )}
                        {searchQuery && (
                            <>
                                <ChevronRight size={13} className="text-gray-400" />
                                <span className="text-gray-800 font-bold truncate max-w-xs">
                                    "{searchQuery}"
                                </span>
                            </>
                        )}
                    </nav>

                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-gray-100 pb-5">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#13005E] tracking-tight">
                                {searchQuery ? (
                                    <span>
                                        Hasil Pencarian: <span className="text-brand-orange">"{searchQuery}"</span>
                                    </span>
                                ) : activeCategoryObj ? (
                                    <span className="flex items-center gap-2.5">
                                        <span className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center border border-orange-100">
                                            {renderCategoryIcon(activeCategoryObj.slug, 18)}
                                        </span>
                                        <span>{activeCategoryObj.name}</span>
                                    </span>
                                ) : (
                                    "Semua Produk"
                                )}
                            </h1>
                            <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">
                                Menampilkan {allProducts.length} produk segar & berkualitas langsung dari pedagang lokal
                            </p>
                        </div>
                    </div>
                </div>

                {/* Related Stores Section — only shown during search */}
                <ShopRelatedStores searchQuery={searchQuery} relatedStores={relatedStores} />

                {/* Main 2-Column Layout: Sidebar Filter + Product Catalog */}
                <div className="flex items-start gap-8">
                    {/* Left Column: Filter Sidebar (Desktop) */}
                    <ShopSidebarFilter
                        categories={categories}
                        allProductsCount={allProducts.length}
                        currentCategory={currentCategory}
                        hasActiveFilters={hasActiveFilters}
                        priceMin={priceMin}
                        priceMax={priceMax}
                        minRating={minRating}
                        onUpdateFilters={updateFilters}
                        onApplyPrice={handleApplyPrice}
                        onResetAll={handleResetAll}
                        onSetPriceMin={setPriceMin}
                        onSetPriceMax={setPriceMax}
                    />

                    {/* Right Column: Catalog Grid */}
                    <main className="flex-1 min-w-0">
                        {/* Top Toolbar (Sort, Active Chips & Mobile Filter Button) */}
                        <ShopToolbar
                            allProductsCount={allProducts.length}
                            hasActiveFilters={hasActiveFilters}
                            activeCategoryObj={activeCategoryObj}
                            minPrice={minPrice}
                            maxPrice={maxPrice}
                            minRating={minRating}
                            currentSort={currentSort}
                            currentExtraSort={currentExtraSort}
                            onOpenMobileFilter={() => setIsMobileFilterOpen(true)}
                            onResetAll={handleResetAll}
                            onUpdateFilters={updateFilters}
                            onClearPrice={handleClearPrice}
                        />

                        {/* Product Grid with Loading Fade Transition */}
                        <div
                            className={`transition-opacity duration-200 ${
                                isLoading ? "opacity-40 pointer-events-none" : "opacity-100"
                            }`}
                        >
                            {allProducts.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-5">
                                    {allProducts.map((p, index) => (
                                        <ProductCard key={p.id || index} product={formatProduct(p)} />
                                    ))}
                                </div>
                            ) : (
                                <ShopEmptyState onResetAll={handleResetAll} />
                            )}
                        </div>
                    </main>
                </div>
            </div>

            {/* Mobile Filter Modal/Drawer (Smooth Slide-in from LEFT) */}
            <ShopMobileDrawer
                isOpen={isMobileFilterOpen}
                onClose={() => setIsMobileFilterOpen(false)}
                categories={categories}
                currentCategory={currentCategory}
                priceMin={priceMin}
                priceMax={priceMax}
                minRating={minRating}
                onUpdateFilters={updateFilters}
                onApplyPrice={handleApplyPrice}
                onResetAll={handleResetAll}
                onSetPriceMin={setPriceMin}
                onSetPriceMax={setPriceMax}
            />
        </StorefrontLayout>
    );
}

import React, { useState, useMemo } from "react";
import { Head } from "@inertiajs/react";
import StorefrontLayout from "@/Layouts/StorefrontLayout";
import mainImage from "@/assets/images/kakap.png";

import ProductActions from "@/Components/Storefront/ProductDetail/ProductActions";
import DeliveryBanner from "@/Components/Storefront/ProductDetail/DeliveryBanner";
import ProductDetailsCard from "@/Components/Storefront/ProductDetail/ProductDetailsCard";
import ProductGallery from "@/Components/Storefront/ProductDetail/ProductGallery";
import ProductSummary from "@/Components/Storefront/ProductDetail/ProductSummary";
import ProductTabs from "@/Components/Storefront/ProductDetail/ProductTabs";
import QuantitySelector from "@/Components/Storefront/ProductDetail/QuantitySelector";
import ShippingGuaranteeCard from "@/Components/Storefront/ProductDetail/ShippingGuaranteeCard";
import ProductReviewsCard from "@/Components/Storefront/ProductDetail/ProductReviewsCard";
import ProductCarousel from "@/Components/Storefront/ProductCarousel";
import VariantSelector from "@/Components/Storefront/ProductDetail/VariantSelector";
import StoreProfileCard from "@/Components/Storefront/ProductDetail/StoreProfileCard";
import { GuaranteeItem } from "@/Components/Storefront/ProductDetail/types";

const staticGuarantees: GuaranteeItem[] = [
    {
        title: "Kualitas Dingin Terjaga",
        description:
            "Dikirim dalam kotak berinsulasi dengan gel pack untuk menjamin kesegaran.",
        icon: "snowflake",
        tone: "blue",
    },
    {
        title: "Waktu Pengiriman",
        description:
            "Pengiriman hari berikutnya untuk pesanan sebelum pukul 14:00.",
        icon: "clock",
        tone: "blue",
    },
    {
        title: "Perlindungan Pembeli",
        description:
            "Pengembalian dana penuh jika kualitas tidak memenuhi standar premium kami.",
        icon: "shield",
        tone: "green",
    },
];

interface Props {
    product: any;
    relatedProducts: any[];
}

export default function ProductDetail({ product, relatedProducts }: Props) {
    const [quantity, setQuantity] = useState(1);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [activeTab, setActiveTab] = useState<"details" | "reviews">(
        "details",
    );

    const [selectedVariants, setSelectedVariants] = useState<
        Record<string, string>
    >({});

    const handleVariantSelect = (variantName: string, option: string) => {
        setSelectedVariants((prev) => ({ ...prev, [variantName]: option }));
        setQuantity(1);
    };

    const currentSku = useMemo(() => {
        if (!product?.skus || product.skus.length === 0) return null;

        return product.skus.find((sku: any) => {
            const selectedValues = Object.values(selectedVariants);
            if (selectedValues.length === 0) return false;
            return selectedValues.every((val: any) =>
                sku.variant_name.includes(val),
            );
        });
    }, [product, selectedVariants]);

    const isAllVariantsSelected = product?.variants?.length
        ? product.variants.every((v: any) => selectedVariants[v.name])
        : true;

    const formatNumber = (angka: number) =>
        new Intl.NumberFormat("id-ID").format(angka);

    const getDisplayPrice = () => {
        if (isAllVariantsSelected && currentSku)
            return formatNumber(Number(currentSku.price));
        if (product?.variants?.length > 0 && product?.skus?.length > 0) {
            const prices = product.skus.map((s: any) => Number(s.price));
            const minPrice = Math.min(...prices);
            const maxPrice = Math.max(...prices);
            if (minPrice !== maxPrice)
                return `${formatNumber(minPrice)} - ${formatNumber(maxPrice)}`;
            return formatNumber(minPrice);
        }
        return formatNumber(Number(product.price));
    };

    const formattedProduct = {
        name: product.name,
        price: getDisplayPrice(),
        unit: product.unit || "pcs",
        location: product.store
            ? `${product.store.name}${product.store.address ? ` - ${product.store.address}` : ""}`
            : "Cibenda Mart",
        availableStock:
            isAllVariantsSelected && currentSku
                ? currentSku.stock
                : product.stock,
        description: product.description,
        images:
            product.images && product.images.length > 0
                ? product.images.map((img: any, idx: number) => ({
                      src: img.image_path,
                      alt: `${product.name} ${idx + 1}`,
                      objectPosition: "center center",
                  }))
                : [
                      {
                          src: product.image_path || mainImage,
                          alt: `${product.name} tampil utama`,
                          objectPosition: "center center",
                      },
                  ],
    };

    const formattedRelatedProducts = relatedProducts.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        store: p.store,
        store_name: p.store?.name,
        category: p.category,
        category_name: p.category?.name || "Produk",
        price: p.price,
        rating: p.rating ? Number(p.rating) : 0.0,
        sold: p.sold || 0,
        image: p.image_path || mainImage,
    }));

    return (
        <StorefrontLayout>
            <Head title={`${formattedProduct.name} - Cibenda Mart`} />

            <div className="min-h-screen bg-[#EAF7F7] px-4 pb-8 pt-28 font-sans md:px-8 md:pb-10 md:pt-36">
                <div className="mx-auto max-w-6xl rounded-[2.5rem] bg-white/90 p-5 shadow-[0_20px_80px_rgba(15,23,42,0.08)] backdrop-blur md:p-8 lg:p-10 mb-16">
                    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] lg:gap-12">
                        <ProductGallery
                            images={formattedProduct.images}
                            selectedImageIndex={selectedImageIndex}
                            onSelectImage={setSelectedImageIndex}
                        />

                        <div className="flex flex-col gap-4 lg:pt-1">
                            <ProductSummary
                                location={formattedProduct.location}
                                name={formattedProduct.name}
                                price={formattedProduct.price}
                                unit={formattedProduct.unit}
                            />

                            <VariantSelector
                                variants={product?.variants || []}
                                selectedVariants={selectedVariants}
                                onSelectVariant={handleVariantSelect}
                            />

                            <QuantitySelector
                                quantity={quantity}
                                availableStock={formattedProduct.availableStock}
                                unit={formattedProduct.unit}
                                onDecrease={() =>
                                    setQuantity((current) =>
                                        Math.max(1, current - 1),
                                    )
                                }
                                onIncrease={() =>
                                    setQuantity((current) =>
                                        Math.min(
                                            formattedProduct.availableStock,
                                            current + 1,
                                        ),
                                    )
                                }
                            />

                            <ProductActions
                                productId={product.id}
                                quantity={quantity}
                                prepOption={
                                    isAllVariantsSelected && currentSku
                                        ? currentSku.variant_name
                                        : undefined
                                }
                                disabled={
                                    !isAllVariantsSelected ||
                                    formattedProduct.availableStock === 0
                                }
                            />

                            <DeliveryBanner
                                title="Pengiriman Dingin Ekspres"
                                description="Pesan dalam 2 jam untuk pengiriman di hari yang sama."
                            />
                        </div>
                    </div>

                    <div className="mt-10 space-y-6 border-t border-slate-100 pt-8 md:mt-12">
                        {product.store && (
                            <StoreProfileCard store={product.store} />
                        )}

                        <ProductTabs
                            activeTab={activeTab}
                            onChangeTab={setActiveTab}
                        />
                        {activeTab === "details" ? (
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.25fr_0.75fr]">
                                <ProductDetailsCard
                                    description={formattedProduct.description}
                                />
                                <ShippingGuaranteeCard
                                    items={staticGuarantees}
                                />
                            </div>
                        ) : (
                            <ProductReviewsCard 
                                reviews={product.reviews || []}
                                reviewsCount={product.reviews_count || 0}
                                averageRating={product.rating || 0}
                            />
                        )}
                    </div>
                </div>

                {formattedRelatedProducts.length > 0 && (
                    <div className="mx-auto max-w-7xl pt-8 border-t border-[#41B9C5]/20">
                        <ProductCarousel
                            title="Mungkin Anda Juga Suka"
                            products={formattedRelatedProducts}
                        />
                    </div>
                )}
            </div>
        </StorefrontLayout>
    );
}

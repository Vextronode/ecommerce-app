import React, { useState } from "react";
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

const staticGuarantees = [
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

// Interface buat nerima data dari backend
interface Props {
    product: any;
    relatedProducts: any[];
}

export default function ProductDetail({ product, relatedProducts }: Props) {
    const [quantity, setQuantity] = useState(1);
    const [prepOption, setPrepOption] = useState("whole");
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [activeTab, setActiveTab] = useState<"details" | "reviews">(
        "details",
    );

    const formattedProduct = {
        name: product.name,
        price: new Intl.NumberFormat("id-ID").format(Number(product.price)),
        unit: product.unit || "kg",
        location: product.store
            ? `${product.store.name}${product.store.address ? ` - ${product.store.address}` : ""}`
            : "Cibenda Mart",
        availableStock: product.stock,
        description: product.description,
        images: [
            {
                src: product.image_path || mainImage,
                alt: `${product.name} tampil utama`,
                objectPosition: "center center",
            },
            {
                src: product.image_path || mainImage,
                alt: `${product.name} tampilan kedua`,
                objectPosition: "center 28%",
            },
            {
                src: product.image_path || mainImage,
                alt: `${product.name} tampilan ketiga`,
                objectPosition: "center 72%",
            },
        ],
    };
    // Format related products buat carousel
    const formattedRelatedProducts = relatedProducts.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0,
        }).format(p.price),
        rating: 5.0,
        sold: "0",
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
                            />

                            <DeliveryBanner
                                title="Pengiriman Dingin Ekspres"
                                description="Pesan dalam 2 jam untuk pengiriman di hari yang sama."
                            />
                        </div>
                    </div>

                    <div className="mt-10 space-y-6 border-t border-slate-100 pt-8 md:mt-12">
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
                            <ProductReviewsCard />
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

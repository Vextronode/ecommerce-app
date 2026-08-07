import React from "react";
import { Head, Link } from "@inertiajs/react";
import StorefrontLayout from "@/Layouts/StorefrontLayout";
import { ShoppingBasket } from "lucide-react";

import CartStoreGroup from "@/Components/Cart/CartStoreGroup";
import CartSummary from "@/Components/Cart/CartSummary";
import ProductRecommendations from "@/Components/Cart/ProductRecommendations";
import { useCartSelection } from "@/Hooks/Storefront/useCartSelection";

interface CartProps {
    cartData: any[];
    recommendations: any[];
}

export default function Cart({ cartData, recommendations }: CartProps) {
    const {
        selectedIds,
        isAllSelected,
        toggleItem,
        toggleStore,
        toggleAll,
        subtotal,
    } = useCartSelection(cartData);

    return (
        <StorefrontLayout>
            <Head title="Keranjang - Cibenda Mart" />

            <div className="max-w-7xl mx-auto px-4 md:px-8 pt-32 pb-24">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                    Keranjang
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8">
                        {cartData.length > 0 && (
                            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mb-6">
                                <label className="flex items-center gap-3 cursor-pointer w-fit">
                                    <input
                                        type="checkbox"
                                        checked={isAllSelected}
                                        onChange={toggleAll}
                                        className="w-5 h-5 rounded text-[#245D56] focus:ring-[#245D56] border-slate-300"
                                    />
                                    <span className="font-bold text-gray-900 text-sm">
                                        Pilih semua Product
                                    </span>
                                </label>
                            </div>
                        )}

                        {cartData.length > 0 ? (
                            cartData.map((store) => (
                                <CartStoreGroup
                                    key={store.id}
                                    store={store}
                                    selectedIds={selectedIds}
                                    onToggleItem={toggleItem}
                                    onToggleStore={toggleStore}
                                />
                            ))
                        ) : (
                            <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
                                <div className="w-20 h-20 bg-[#F0FAFB] rounded-full flex items-center justify-center mx-auto mb-4 text-[#41B9C5]">
                                    <ShoppingBasket className="w-10 h-10" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    Keranjang Kamu Masih Kosong
                                </h3>
                                <p className="text-gray-500 mb-6 max-w-sm mx-auto text-sm">
                                    Yuk jelajahi produk segar pilihan dari pedagang
                                    lokal terbaik di sekitarmu!
                                </p>
                                <Link
                                    href={route("shop")}
                                    className="inline-block bg-[#245D56] text-white px-8 py-3.5 rounded-full font-bold shadow-md hover:bg-[#1b4641] transition-all text-sm"
                                >
                                    Mulai Belanja
                                </Link>
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-4">
                        <CartSummary
                            subtotal={subtotal}
                            selectedCount={selectedIds.length}
                            selectedIds={selectedIds}
                        />
                    </div>
                </div>

                {recommendations && recommendations.length > 0 && (
                    <ProductRecommendations recommendations={recommendations} />
                )}
            </div>
        </StorefrontLayout>
    );
}

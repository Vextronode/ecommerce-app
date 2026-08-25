import React from "react";
import { Head, Link } from "@inertiajs/react";
import StorefrontLayout from "@/Layouts/StorefrontLayout";
import { ShoppingBasket } from "lucide-react";
import { router } from "@inertiajs/react";

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

    const handleCheckout = () => {
        if (selectedIds.length === 0) return;
        router.get(route("checkout"), { items: selectedIds });
    };

    return (
        <StorefrontLayout>
            <Head title="Keranjang - Cibenda Mart" />

            {/* Extra bottom padding on mobile to account for sticky bar */}
            <div className="max-w-7xl mx-auto px-3 md:px-8 pt-28 md:pt-32 pb-32 lg:pb-24">
                <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-6">
                    Keranjang
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-8">
                    {/* Cart Items Column */}
                    <div className="lg:col-span-8">
                        {cartData.length > 0 && (
                            <div className="bg-white rounded-2xl px-4 py-3 md:p-5 shadow-sm border border-slate-100 mb-3 md:mb-6">
                                <label className="flex items-center gap-3 cursor-pointer w-fit">
                                    <input
                                        type="checkbox"
                                        checked={isAllSelected}
                                        onChange={toggleAll}
                                        className="w-4 h-4 md:w-5 md:h-5 rounded accent-[#006591] border-slate-300"
                                    />
                                    <span className="font-bold text-gray-900 text-xs md:text-sm">
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
                            <div className="bg-white rounded-3xl p-8 md:p-12 text-center border border-slate-100 shadow-sm">
                                <div className="w-16 h-16 md:w-20 md:h-20 bg-brand-orange-tint rounded-full flex items-center justify-center mx-auto mb-4 text-brand-orange">
                                    <ShoppingBasket className="w-8 h-8 md:w-10 md:h-10" />
                                </div>
                                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
                                    Keranjang Kamu Masih Kosong
                                </h3>
                                <p className="text-gray-500 mb-6 max-w-sm mx-auto text-xs md:text-sm">
                                    Yuk jelajahi produk segar pilihan dari pedagang
                                    lokal terbaik di sekitarmu!
                                </p>
                                <Link
                                    href={route("shop")}
                                    className="inline-block bg-brand-orange text-white px-6 md:px-8 py-3 md:py-3.5 rounded-2xl font-bold shadow-md hover:bg-brand-orange-hover transition text-sm"
                                >
                                    Mulai Belanja
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Desktop Order Summary sidebar (hidden on mobile) */}
                    <div className="hidden lg:block lg:col-span-4 self-start sticky top-32">
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

            {/* Mobile sticky bottom bar — hidden on desktop */}
            {cartData.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white border-t border-slate-200 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] px-4 py-3">
                    <div className="flex items-center justify-between mb-2.5">
                        <div>
                            <p className="text-[11px] text-slate-500 font-medium">
                                Total Pembayaran ({selectedIds.length} item)
                            </p>
                            <p className="text-base font-black text-brand-orange">
                                Rp {subtotal.toLocaleString("id-ID")}
                            </p>
                        </div>
                        <button
                            onClick={handleCheckout}
                            disabled={selectedIds.length === 0}
                            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition ${
                                selectedIds.length > 0
                                    ? "bg-brand-orange text-white hover:bg-brand-orange-hover shadow-md"
                                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                            }`}
                        >
                            Checkout
                        </button>
                    </div>
                </div>
            )}
        </StorefrontLayout>
    );
}

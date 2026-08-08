import React from "react";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import { Link, router } from "@inertiajs/react";

interface Props {
    subtotal: number;
    selectedCount: number;
    selectedIds?: number[];
    selectedItemIds?: number[];
}

export default function CartSummary({
    subtotal,
    selectedCount,
    selectedIds,
    selectedItemIds,
}: Props) {
    const finalSelectedIds = selectedIds ?? selectedItemIds ?? [];
    const deliveryFee = selectedCount > 0 ? 25000 : 0;
    const packagingFee = selectedCount > 0 ? 15000 : 0;
    const totalPayment = subtotal + deliveryFee + packagingFee;

    // hanlder buat throw ID barang yang diceklis ke backend
    const handleCheckout = () => {
        if (selectedCount === 0) return;
        // Ini bakal bikin URL jadi: /checkout?items[]=1&items[]=2
        router.get(route("checkout"), { items: finalSelectedIds });
    };

    return (
        <div className="space-y-4 sticky top-32">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                <h2 className="text-lg font-bold text-gray-900 mb-6">
                    Order Summary
                </h2>

                <div className="space-y-4 mb-6 pb-6 border-b border-slate-100">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500 font-medium">
                            Subtotal ({selectedCount} items)
                        </span>
                        <span className="text-gray-900 font-bold">
                            Rp {subtotal.toLocaleString("id-ID")}
                        </span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500 font-medium">
                            Delivery Fee
                        </span>
                        <span className="text-gray-900 font-bold">
                            Rp {deliveryFee.toLocaleString("id-ID")}
                        </span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500 font-medium">
                            Cold-Chain Packaging
                        </span>
                        <span className="text-gray-900 font-bold">
                            Rp {packagingFee.toLocaleString("id-ID")}
                        </span>
                    </div>
                </div>

                <div className="flex justify-between items-end mb-6">
                    <span className="text-sm font-medium text-slate-500">
                        Total Payment
                    </span>
                    <span className="text-xl font-bold text-[#245D56]">
                        Rp {totalPayment.toLocaleString("id-ID")}
                    </span>
                </div>

                <button
                    onClick={handleCheckout}
                    disabled={selectedCount === 0}
                    className={`w-full flex items-center justify-center font-bold py-3.5 rounded-2xl transition shadow-lg mb-4 ${selectedCount > 0 ? "bg-[#245D56] text-white hover:bg-[#1a443f] shadow-[#245D56]/20 cursor-pointer" : "bg-gray-200 text-gray-400 pointer-events-none"}`}
                >
                    Checkout
                </button>

                <div className="flex items-center justify-center gap-2 text-[11px] font-medium text-slate-400">
                    <ShieldCheck className="w-4 h-4" />
                    <span>100% Pembayaran aman</span>
                </div>
            </div>

            <Link
                href={route("shop")}
                className="w-full flex items-center justify-center gap-2 bg-[#245D56]/10 text-[#245D56] font-bold py-3.5 rounded-2xl hover:bg-[#245D56]/20 transition"
            >
                <ArrowLeft className="w-4 h-4" />
                Kembali belanja
            </Link>
        </div>
    );
}

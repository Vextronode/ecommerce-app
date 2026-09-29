import React from "react";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import { Link, router } from "@inertiajs/react";

interface Props {
    subtotal: number;
    selectedCount: number;
    selectedIds: number[];
}

export default function CartSummary({
    subtotal,
    selectedCount,
    selectedIds,
}: Props) {
    const totalPayment = subtotal;

    const handleCheckout = () => {
        if (selectedCount === 0) return;
        router.get(route("checkout"), { items: selectedIds });
    };

    return (
        <div className="space-y-4">
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
                </div>

                <div className="flex justify-between items-end mb-6">
                    <span className="text-sm font-medium text-slate-500">
                        Total Payment
                    </span>
                    <span className="text-xl font-bold text-brand-orange">
                        Rp {totalPayment.toLocaleString("id-ID")}
                    </span>
                </div>

                <button
                    onClick={handleCheckout}
                    disabled={selectedCount === 0}
                    className={`w-full flex items-center justify-center font-bold py-3.5 rounded-2xl transition shadow-lg mb-4 ${
                        selectedCount > 0
                            ? "bg-brand-orange text-white hover:bg-brand-orange-hover shadow-brand-orange/20 cursor-pointer"
                            : "bg-gray-200 text-gray-400 pointer-events-none"
                    }`}
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
                className="w-full flex items-center justify-center gap-2 bg-brand-orange text-white font-bold py-3.5 rounded-2xl hover:bg-brand-orange-hover transition"
            >
                <ArrowLeft className="w-4 h-4" />
                Kembali belanja
            </Link>
        </div>
    );
}

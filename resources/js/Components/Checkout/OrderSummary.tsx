import React from "react";
import { ShieldCheck } from "lucide-react";

interface Props {
    subtotal: number;
    deliveryFee: number;
    adminFee: number;
    totalItems: number;
    onPlaceOrder: () => void;
    processing: boolean;
}

export default function OrderSummary({
    subtotal,
    deliveryFee,
    adminFee,
    totalItems,
    onPlaceOrder,
    processing,
}: Props) {
    const grandTotal = subtotal + deliveryFee + adminFee;

    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
                Order Summary
            </h2>

            <div className="space-y-4 mb-6 pb-6 border-b border-slate-100">
                <div className="flex justify-between text-sm">
                    <span className="text-slate-500 font-medium">
                        Subtotal ({totalItems} items)
                    </span>
                    <span className="text-gray-900 font-bold">
                        Rp {subtotal.toLocaleString("id-ID")}
                    </span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-slate-500 font-medium">Ongkir</span>
                    <span className="text-gray-900 font-bold">
                        Rp {deliveryFee.toLocaleString("id-ID")}
                    </span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-slate-500 font-medium">
                        Biaya Admin
                    </span>
                    <span className="text-gray-900 font-bold">
                        Rp {adminFee.toLocaleString("id-ID")}
                    </span>
                </div>
            </div>

            <div className="flex justify-between items-end mb-8">
                <span className="font-bold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-[#F77F00]">
                    Rp {grandTotal.toLocaleString("id-ID")}
                </span>
            </div>

            <button
                onClick={onPlaceOrder}
                disabled={processing}
                className={`w-full font-bold py-4 rounded-2xl transition shadow-lg mb-4 ${processing ? "bg-slate-400 text-white cursor-not-allowed" : "bg-[#ED7218] text-white hover:opacity-90 shadow-[#ED7218]/20"}`}
            >
                {processing ? "Processing..." : "Pay Now"}
            </button>

            <div className="flex items-center justify-center gap-2 text-xs font-medium text-slate-400">
                <ShieldCheck className="w-4 h-4" />
                <span>Transactions are 100% secure</span>
            </div>
        </div>
    );
}

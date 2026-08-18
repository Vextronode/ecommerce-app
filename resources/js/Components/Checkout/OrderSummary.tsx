import React, { useState } from "react";
import { ShieldCheck, ChevronDown, ChevronUp } from "lucide-react";
import { formatRupiah } from "@/utils/formatters";
import type { StoreShippingBreakdown } from "@/Hooks/Storefront/useCheckoutForm";

interface Props {
    subtotal: number;
    deliveryFee: number;
    adminFee: number;
    totalItems: number;
    storesBreakdown?: StoreShippingBreakdown[];
    onPlaceOrder: () => void;
    processing: boolean;
}

export default function OrderSummary({
    subtotal,
    deliveryFee,
    adminFee,
    totalItems,
    storesBreakdown = [],
    onPlaceOrder,
    processing,
}: Props) {
    const [showBreakdown, setShowBreakdown] = useState(false);
    const grandTotal = subtotal + deliveryFee + adminFee;
    const isMultiStore = storesBreakdown.length > 1;

    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 font-sans">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
                Ringkasan Pembayaran
            </h2>

            <div className="space-y-4 mb-6 pb-6 border-b border-slate-100">
                <div className="flex justify-between text-sm">
                    <span className="text-slate-500 font-medium">
                        Subtotal ({totalItems} item)
                    </span>
                    <span className="text-gray-900 font-bold">
                        {formatRupiah(subtotal)}
                    </span>
                </div>

                {/* Delivery Fee Line with multi-store toggle */}
                <div>
                    <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-1.5">
                            <span className="text-slate-500 font-medium">
                                Ongkos Kirim {isMultiStore ? `(${storesBreakdown.length} Toko)` : ""}
                            </span>
                            {isMultiStore && (
                                <button
                                    type="button"
                                    onClick={() => setShowBreakdown(!showBreakdown)}
                                    className="text-[#41B9C5] hover:text-[#14433D] transition p-0.5 cursor-pointer"
                                    title="Lihat rincian per toko"
                                >
                                    {showBreakdown ? (
                                        <ChevronUp className="w-4 h-4" />
                                    ) : (
                                        <ChevronDown className="w-4 h-4" />
                                    )}
                                </button>
                            )}
                        </div>
                        <span className="text-gray-900 font-bold">
                            {formatRupiah(deliveryFee)}
                        </span>
                    </div>

                    {isMultiStore && showBreakdown && (
                        <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1.5 text-xs pl-2 bg-slate-50 p-2.5 rounded-xl">
                            {storesBreakdown.map((sb) => (
                                <div
                                    key={sb.store_id}
                                    className="flex justify-between text-slate-600"
                                >
                                    <span className="truncate pr-2">{sb.store_name}:</span>
                                    <span className="font-semibold text-gray-800 shrink-0">
                                        {formatRupiah(sb.delivery_fee)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex justify-between text-sm">
                    <span className="text-slate-500 font-medium">
                        Biaya Layanan (Admin)
                    </span>
                    <span className="text-gray-900 font-bold">
                        {formatRupiah(adminFee)}
                    </span>
                </div>
            </div>

            <div className="flex justify-between items-end mb-8">
                <span className="font-bold text-gray-900">Total Tagihan</span>
                <span className="text-2xl font-extrabold text-[#ED7218]">
                    {formatRupiah(grandTotal)}
                </span>
            </div>

            <button
                onClick={onPlaceOrder}
                disabled={processing}
                className={`w-full font-bold py-4 rounded-2xl transition shadow-lg mb-4 flex items-center justify-center cursor-pointer ${
                    processing
                        ? "bg-slate-400 text-white cursor-not-allowed"
                        : "bg-[#ED7218] hover:bg-orange-600 text-white shadow-orange-500/20 active:scale-[0.98]"
                }`}
            >
                {processing ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    <span>Buat Pesanan & Bayar</span>
                )}
            </button>

            <div className="flex items-center justify-center gap-2 text-xs font-medium text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Transaksi Terenkripsi & Aman 100%</span>
            </div>
        </div>
    );
}

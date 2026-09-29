import React, { useState } from "react";
import { Head, router } from "@inertiajs/react";
import {
    Truck,
    Store,
    Layers,
    X,
    Navigation,
    ArrowRight,
    AlertCircle,
    Package,
} from "lucide-react";
import { formatRupiah } from "@/utils/formatters";

interface StopItem {
    id: number;
    invoice_number: string;
    stop_number: number;
    shipping_status: string;
    customer_name: string;
    customer_phone: string;
    shipping_address: string;
    distance_km: number | null;
    subtotal?: number;
    shipping_cost?: number;
    total_amount: number;
    payment_method: string;
    payment_status: string;
    items_count: number;
    items: Array<{
        name: string;
        qty: number;
        price: number;
    }>;
}

interface Props {
    batchToken: string;
    store: {
        id: number;
        name: string;
        support_email: string;
        latitude: number | null;
        longitude: number | null;
    };
    stops: StopItem[];
    totalOrders: number;
    totalItems: number;
    totalCodAmount: number;
}

export default function BatchHandoverConfirm({
    batchToken,
    store,
    stops,
    totalOrders,
    totalItems,
    totalCodAmount,
}: Props) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAcceptAll = () => {
        setIsSubmitting(true);
        router.post(
            route("tracker.acceptBatchHandover", batchToken),
            {},
            {
                onFinish: () => setIsSubmitting(false),
            }
        );
    };

    const handleCancel = () => {
        if (window.history.length > 1) {
            window.history.back();
        } else {
            window.location.href = "/";
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col justify-between py-6 px-4 sm:px-6 font-sans">
            <Head title={`Konfirmasi Pengiriman Gabungan - ${totalOrders} Pesanan`} />

            <div className="max-w-lg w-full mx-auto space-y-4 my-auto">
                {/* Header */}
                <div className="text-center space-y-1.5">
                    <div className="w-12 h-12 bg-brand-blue-tint text-brand-blue rounded-2xl flex items-center justify-center mx-auto mb-2 border border-brand-blue-light/30 shadow-xs">
                        <Layers className="w-6 h-6 text-brand-blue" />
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-brand-blue-tint text-brand-blue text-[11px] font-semibold border border-brand-blue-light/30">
                        {totalOrders} Pesanan Sekaligus
                    </span>
                    <h1 className="text-xl font-extrabold text-gray-900">
                        Pengiriman Gabungan
                    </h1>
                    <p className="text-xs text-gray-500 font-mono">
                        #{batchToken}
                    </p>
                </div>

                {/* Origin Store Card */}
                <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-xs flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-brand-blue-tint text-brand-blue flex items-center justify-center shrink-0">
                            <Store className="w-4 h-4" />
                        </div>
                        <div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                                Titik Ambil (Toko)
                            </span>
                            <h4 className="font-bold text-sm text-gray-900 truncate">
                                {store.name}
                            </h4>
                        </div>
                    </div>
                </div>

                {/* Stops List */}
                <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-xs space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                        <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                            <Package className="w-4 h-4 text-brand-blue" />
                            Rute & Titik Tujuan ({stops.length} Alamat)
                        </span>
                        <span className="text-[11px] font-medium text-gray-400">
                            Total {totalItems} Produk
                        </span>
                    </div>

                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                        {stops.map((stop) => (
                            <div
                                key={stop.id}
                                className="flex items-start gap-2.5 p-2.5 rounded-xl border border-gray-100 bg-gray-50/60 text-xs"
                            >
                                <div className="w-5 h-5 rounded-full bg-brand-orange text-white flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5 shadow-2xs">
                                    {stop.stop_number}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start gap-2">
                                        <span className="font-bold text-gray-900 truncate">
                                            {stop.customer_name}
                                        </span>
                                        <span className="text-[10px] font-semibold text-gray-500 shrink-0">
                                            {stop.distance_km} km
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-gray-500 truncate mt-0.5">
                                        {stop.shipping_address}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[10px] text-gray-400 font-mono">
                                            #{stop.invoice_number}
                                        </span>
                                        {stop.payment_method === "cod" ? (
                                            <span className="text-[10px] font-bold text-amber-700 bg-amber-100/70 px-1.5 py-0.2 rounded">
                                                COD: {formatRupiah(stop.total_amount)}
                                            </span>
                                        ) : (
                                            <span className="text-[10px] font-semibold text-emerald-600">
                                                Non-COD (Lunas)
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Total Summary Footer */}
                    {totalCodAmount > 0 && (
                        <div className="flex justify-between items-center bg-amber-50 p-3 rounded-xl border border-amber-200">
                            <span className="text-xs font-bold text-amber-800">
                                Total Tagihan COD:
                            </span>
                            <span className="text-sm font-extrabold text-amber-800">
                                {formatRupiah(totalCodAmount)}
                            </span>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-1">
                    <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={handleAcceptAll}
                        className="w-full py-3.5 px-5 rounded-xl bg-brand-blue hover:bg-brand-blue-hover text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                    >
                        {isSubmitting ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Truck className="w-4 h-4" />
                                <span>Ambil Semua & Mulai Antar ({totalOrders} Pesanan)</span>
                                <ArrowRight className="w-4 h-4 ml-1" />
                            </>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={handleCancel}
                        className="w-full py-2.5 text-xs font-medium text-gray-500 hover:text-gray-800 transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                        <X className="w-3.5 h-3.5" />
                        <span>Batal / Kembali</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

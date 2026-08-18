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
                    <div className="w-12 h-12 bg-[#EAF7F7] text-[#14433D] rounded-2xl flex items-center justify-center mx-auto mb-2 border border-[#41B9C5]/30 shadow-xs">
                        <Layers className="w-6 h-6 text-[#14433D]" />
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-teal-50 text-[#14433D] text-[11px] font-semibold border border-teal-200/60">
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
                        <div className="w-8 h-8 rounded-lg bg-teal-100 text-[#14433D] flex items-center justify-center shrink-0">
                            <Store className="w-4 h-4" />
                        </div>
                        <div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                                Titik Ambil (Toko)
                            </span>
                            <p className="text-sm font-bold text-gray-900 truncate">{store.name}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-[11px] text-gray-400 block">Total Muatan</span>
                        <p className="text-sm font-bold text-[#14433D]">{totalItems} Item</p>
                    </div>
                </div>

                {/* Ordered Stops List */}
                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-xs space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                        <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                            <Navigation className="w-3.5 h-3.5 text-[#41B9C5]" />
                            <span>Urutan Rute Pengantaran:</span>
                        </span>
                        <span className="text-[11px] font-semibold text-gray-500">
                            {totalOrders} Titik Stop
                        </span>
                    </div>

                    <div className="space-y-2.5 max-h-[42vh] overflow-y-auto pr-1">
                        {stops.map((stop) => (
                            <div
                                key={stop.id}
                                className="bg-gray-50 rounded-xl p-3 border border-gray-100 space-y-1.5"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-md bg-[#14433D] text-white text-xs font-bold flex items-center justify-center shrink-0">
                                            {stop.stop_number}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 truncate">
                                                {stop.customer_name}
                                            </p>
                                            <p className="text-[11px] font-mono text-gray-400">
                                                #{stop.invoice_number}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        {stop.distance_km !== null && (
                                            <span className="inline-block text-[10px] font-medium bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full text-gray-600">
                                                ± {stop.distance_km} km
                                            </span>
                                        )}
                                        <p className="text-xs font-bold text-gray-900 mt-0.5">
                                            {formatRupiah(stop.total_amount)}
                                        </p>
                                    </div>
                                </div>

                                <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                                    {stop.shipping_address}
                                </p>

                                <div className="flex items-center justify-between pt-1 text-[11px] text-gray-500 border-t border-gray-200/60">
                                    <span>
                                        {stop.items_count} item • Ongkir {formatRupiah(stop.shipping_cost || 0)}
                                    </span>
                                    {stop.payment_method === "cod" && stop.payment_status === "pending" ? (
                                        <span className="text-amber-700 font-bold flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3 text-amber-600" />
                                            <span>Tagih COD: {formatRupiah(stop.total_amount)}</span>
                                        </span>
                                    ) : (
                                        <span className="text-teal-700 font-semibold">Lunas (Online)</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Total Summary Footer */}
                    {totalCodAmount > 0 && (
                        <div className="pt-2 border-t border-gray-100 flex justify-between items-center bg-amber-50 p-3 rounded-xl border border-amber-200">
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
                        className="w-full py-3.5 px-5 rounded-xl bg-[#14433D] hover:bg-[#0f342f] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition active:scale-[0.98] disabled:opacity-50 cursor-pointer"
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

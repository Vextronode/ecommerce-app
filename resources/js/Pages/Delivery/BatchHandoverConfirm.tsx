import React, { useState } from "react";
import { Head, router } from "@inertiajs/react";
import {
    Truck,
    MapPin,
    Store,
    Package,
    Phone,
    ArrowRight,
    CheckCircle2,
    ShieldCheck,
    Layers,
    X,
    Navigation,
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
        <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between py-6 px-4 sm:px-6 relative overflow-hidden font-sans">
            <Head title={`Konfirmasi Pengiriman Gabungan - ${totalOrders} Pesanan`} />

            {/* Ambient Lighting Orbs */}
            <div className="absolute -top-32 -left-32 w-80 h-80 bg-[#41B9C5] rounded-full filter blur-[100px] opacity-20 pointer-events-none" />
            <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-[#ED7218] rounded-full filter blur-[100px] opacity-20 pointer-events-none" />

            <div className="max-w-lg w-full mx-auto space-y-4 my-auto relative z-10">
                {/* Header Badge */}
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#41B9C5] to-[#14433D] text-white shadow-lg shadow-[#41B9C5]/20 mb-1 animate-bounce">
                        <Layers className="w-8 h-8" />
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-[#41B9C5]">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Master QR: {totalOrders} Pesanan Sekaligus</span>
                    </div>
                    <h1 className="text-2xl font-black text-white tracking-tight">
                        Pengiriman Gabungan
                    </h1>
                    <p className="text-xs text-slate-400">
                        Kode Batch: <span className="text-[#41B9C5] font-mono font-bold">#{batchToken}</span>
                    </p>
                </div>

                {/* Origin Store Card */}
                <div className="bg-slate-800/80 backdrop-blur-xl rounded-2xl p-4 border border-white/10 shadow-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
                            <Store className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-teal-400 uppercase tracking-wider">
                                Titik Ambil (Toko)
                            </p>
                            <p className="text-sm font-bold text-white truncate">{store.name}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-xs text-slate-400">Total Paket</span>
                        <p className="text-sm font-black text-[#41B9C5]">{totalItems} Item</p>
                    </div>
                </div>

                {/* Ordered Stops List (Nearest to Farthest) */}
                <div className="bg-slate-800/80 backdrop-blur-xl rounded-3xl p-5 border border-white/10 shadow-2xl space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-white/10">
                        <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                            <Navigation className="w-3.5 h-3.5 text-[#41B9C5]" />
                            <span>Urutan Rute Pengantaran (Terdekat):</span>
                        </span>
                        <span className="text-[11px] font-semibold text-slate-400">
                            {totalOrders} Titik Stop
                        </span>
                    </div>

                    <div className="space-y-2.5 max-h-[38vh] overflow-y-auto pr-1">
                        {stops.map((stop) => (
                            <div
                                key={stop.id}
                                className="bg-slate-900/60 rounded-2xl p-3.5 border border-white/5 space-y-2 relative"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#ED7218] to-orange-600 text-white text-xs font-black flex items-center justify-center shrink-0 shadow-sm">
                                            {stop.stop_number}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white truncate">
                                                {stop.customer_name}
                                            </p>
                                            <p className="text-[11px] font-mono text-slate-400">
                                                #{stop.invoice_number}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        {stop.distance_km !== null && (
                                            <span className="inline-block text-[10px] font-bold bg-white/5 border border-white/10 px-2 py-0.5 rounded-full text-[#41B9C5]">
                                                ± {stop.distance_km} km
                                            </span>
                                        )}
                                        <p className="text-xs font-bold text-white mt-0.5">
                                            {formatRupiah(stop.total_amount)}
                                        </p>
                                    </div>
                                </div>

                                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                                    {stop.shipping_address}
                                </p>

                                <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                                    <span>{stop.items_count} item barang</span>
                                    {stop.payment_method === "cod" && stop.payment_status === "pending" ? (
                                        <span className="text-amber-400 font-bold">
                                            ⚠️ Tagih COD: {formatRupiah(stop.total_amount)}
                                        </span>
                                    ) : (
                                        <span className="text-teal-400 font-bold">✅ Sudah Lunas</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Total Summary Footer */}
                    {totalCodAmount > 0 && (
                        <div className="pt-3 border-t border-white/10 flex justify-between items-center bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
                            <span className="text-xs font-bold text-amber-300">
                                💵 Total Uang COD yang Harus Diterima:
                            </span>
                            <span className="text-sm font-black text-amber-400">
                                {formatRupiah(totalCodAmount)}
                            </span>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-2.5 pt-2">
                    <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={handleAcceptAll}
                        className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#41B9C5] to-[#14433D] hover:from-[#38a6b1] hover:to-[#0f342f] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl shadow-[#41B9C5]/20 active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {isSubmitting ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Truck className="w-5 h-5" />
                                <span>🛵 Ambil Semua & Mulai Antar ({totalOrders} Pesanan)</span>
                                <ArrowRight className="w-4 h-4 ml-1" />
                            </>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={handleCancel}
                        className="w-full py-3 text-xs font-semibold text-slate-400 hover:text-white transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                        <X className="w-3.5 h-3.5" />
                        <span>Batal / Kembali</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

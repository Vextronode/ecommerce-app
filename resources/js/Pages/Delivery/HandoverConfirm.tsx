import React, { useState } from "react";
import { Head, router } from "@inertiajs/react";
import {
    Truck,
    MapPin,
    Store,
    User,
    Package,
    Phone,
    ArrowRight,
    CheckCircle2,
    ShieldCheck,
    AlertCircle,
    X,
} from "lucide-react";
import { formatRupiah } from "@/utils/formatters";

interface Props {
    order: {
        id: number;
        invoice_number: string;
        shipping_status: string;
        customer_name: string;
        customer_phone: string;
        shipping_address: string;
        shipping_latitude: number | null;
        shipping_longitude: number | null;
        store_name: string;
        store_support_email: string;
        store_latitude: number | null;
        store_longitude: number | null;
        subtotal: number;
        shipping_cost: number;
        total_amount: number;
        payment_method: string;
        payment_status: string;
        items: Array<{
            product_name: string;
            quantity: number;
            price: number;
            unit?: string;
            variant_name?: string;
        }>;
    };
    estimatedDistanceKm?: number | null;
}

export default function HandoverConfirm({ order, estimatedDistanceKm }: Props) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isAlreadyShipped = order.shipping_status === "shipped";
    const isDelivered = order.shipping_status === "delivered";

    const handleAcceptHandover = () => {
        setIsSubmitting(true);
        router.post(
            route("tracker.acceptHandover", order.invoice_number),
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

    const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between py-6 px-4 sm:px-6 relative overflow-hidden font-sans">
            <Head title={`Konfirmasi Pengantaran #${order.invoice_number}`} />

            {/* Ambient Background Gradient Orbs */}
            <div className="absolute -top-32 -left-32 w-80 h-80 bg-[#41B9C5] rounded-full filter blur-[100px] opacity-20 pointer-events-none" />
            <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-[#ED7218] rounded-full filter blur-[100px] opacity-20 pointer-events-none" />

            <div className="max-w-lg w-full mx-auto space-y-4 my-auto relative z-10">
                {/* Header Badge */}
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#41B9C5] to-[#14433D] text-white shadow-lg shadow-[#41B9C5]/20 mb-1 animate-bounce">
                        <Truck className="w-8 h-8" />
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-[#41B9C5]">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Serah Terima Kurir Toko</span>
                    </div>
                    <h1 className="text-2xl font-black text-white tracking-tight">
                        Konfirmasi Pengantaran
                    </h1>
                    <p className="text-xs text-slate-400">
                        Invoice: <span className="text-[#41B9C5] font-bold">#{order.invoice_number}</span>
                    </p>
                </div>

                {/* Main Card Container */}
                <div className="bg-slate-800/80 backdrop-blur-xl rounded-3xl p-5 border border-white/10 shadow-2xl space-y-4">
                    {/* Notice if already shipped */}
                    {isAlreadyShipped && (
                        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3 flex items-start gap-2.5 text-amber-300 text-xs">
                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                            <p>
                                Pesanan ini sudah berstatus <strong>Dikirim</strong>. Anda dapat langsung melanjutkan ke halaman pelacak rute GPS.
                            </p>
                        </div>
                    )}

                    {isDelivered && (
                        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-3 flex items-start gap-2.5 text-emerald-300 text-xs">
                            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                            <p>
                                Pesanan ini sudah <strong>Selesai Diantar</strong> ke pembeli.
                            </p>
                        </div>
                    )}

                    {/* Store Origin & Customer Destination */}
                    <div className="space-y-3">
                        {/* Origin: Toko */}
                        <div className="bg-slate-900/60 rounded-2xl p-3.5 border border-white/5 flex items-start gap-3">
                            <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
                                <Store className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-bold text-teal-400 uppercase tracking-wider">
                                    Titik Ambil (Toko)
                                </p>
                                <p className="text-sm font-bold text-white truncate">
                                    {order.store_name}
                                </p>
                            </div>
                        </div>

                        {/* Route Line Indicator */}
                        <div className="flex items-center justify-between px-6 py-0.5">
                            <div className="h-6 w-0.5 bg-gradient-to-b from-teal-400 to-[#ED7218] rounded-full mx-auto" />
                            {estimatedDistanceKm !== null && estimatedDistanceKm !== undefined && (
                                <span className="text-[11px] font-bold bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full text-slate-300">
                                    ± {estimatedDistanceKm} km
                                </span>
                            )}
                        </div>

                        {/* Destination: Pembeli */}
                        <div className="bg-slate-900/60 rounded-2xl p-3.5 border border-white/5 flex items-start gap-3">
                            <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/20 text-[#ED7218] flex items-center justify-center shrink-0">
                                <MapPin className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] font-bold text-[#ED7218] uppercase tracking-wider">
                                        Titik Antar (Pembeli)
                                    </p>
                                    {order.customer_phone && (
                                        <a
                                            href={`tel:${order.customer_phone}`}
                                            className="text-[11px] text-teal-400 font-bold flex items-center gap-1 hover:underline"
                                        >
                                            <Phone className="w-3 h-3" />
                                            <span>Hubungi</span>
                                        </a>
                                    )}
                                </div>
                                <p className="text-sm font-bold text-white truncate mt-0.5">
                                    {order.customer_name}
                                </p>
                                <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">
                                    {order.shipping_address}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Order Items Summary */}
                    <div className="bg-slate-900/40 rounded-2xl p-3.5 border border-white/5 space-y-2">
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-400 flex items-center gap-1.5">
                                <Package className="w-3.5 h-3.5 text-[#41B9C5]" />
                                <span>Paket ({totalItems} item):</span>
                            </span>
                            <span className="text-white font-bold">
                                {formatRupiah(order.total_amount)}
                            </span>
                        </div>

                        <div className="divide-y divide-white/5 text-xs">
                            {order.items.map((item, idx) => (
                                <div key={idx} className="py-1.5 flex justify-between items-center text-slate-300">
                                    <span className="truncate pr-2">
                                        {item.quantity}x {item.product_name}
                                        {item.variant_name ? ` (${item.variant_name})` : ""}
                                    </span>
                                    <span className="text-slate-400 font-medium shrink-0">
                                        {formatRupiah(item.price * item.quantity)}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {order.payment_method === "cod" && (
                            <div className="pt-2 border-t border-white/10 flex justify-between items-center">
                                <span className="text-xs font-bold text-amber-400">
                                    ⚠️ Tagih Tunai (COD):
                                </span>
                                <span className="text-sm font-black text-amber-400">
                                    {formatRupiah(order.total_amount)}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2.5 pt-2">
                    {!isDelivered ? (
                        <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={handleAcceptHandover}
                            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#41B9C5] to-[#14433D] hover:from-[#38a6b1] hover:to-[#0f342f] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl shadow-[#41B9C5]/20 active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {isSubmitting ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Truck className="w-5 h-5" />
                                    <span>
                                        {isAlreadyShipped ? "Buka Rute & Lacak Pengiriman" : "✅ Ya, Ambil & Mulai Antar"}
                                    </span>
                                    <ArrowRight className="w-4 h-4 ml-1" />
                                </>
                            )}
                        </button>
                    ) : (
                        <a
                            href={`/tracker/${order.invoice_number}`}
                            className="w-full py-4 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm flex items-center justify-center gap-2 border border-white/10 transition"
                        >
                            <span>Lihat Bukti Pengiriman</span>
                        </a>
                    )}

                    <button
                        type="button"
                        onClick={handleCancel}
                        className="w-full py-3 text-xs font-semibold text-slate-400 hover:text-white transition flex items-center justify-center gap-1.5"
                    >
                        <X className="w-3.5 h-3.5" />
                        <span>Batal / Kembali</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

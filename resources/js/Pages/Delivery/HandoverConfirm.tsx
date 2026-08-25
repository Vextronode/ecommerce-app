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
        <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col justify-between py-6 px-4 sm:px-6 font-sans">
            <Head title={`Konfirmasi Pengantaran #${order.invoice_number}`} />

            <div className="max-w-md w-full mx-auto space-y-4 my-auto">
                {/* Header */}
                <div className="text-center space-y-1.5">
                    <div className="w-12 h-12 bg-brand-blue-tint text-brand-blue rounded-2xl flex items-center justify-center mx-auto mb-2 border border-brand-blue-light/30 shadow-xs">
                        <Truck className="w-6 h-6 text-brand-blue" />
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-brand-blue-tint text-brand-blue text-[11px] font-semibold border border-brand-blue-light/30">
                        Kurir Toko
                    </span>
                    <h1 className="text-xl font-extrabold text-gray-900">
                        Konfirmasi Pengantaran
                    </h1>
                    <p className="text-xs text-gray-500 font-mono">
                        #{order.invoice_number}
                    </p>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-xs space-y-4">
                    {/* Status Alert if not new */}
                    {isAlreadyShipped && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2.5 text-amber-800 text-xs">
                            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                            <p>
                                <strong>Info:</strong> Pesanan ini sudah dalam status pengantaran. Anda dapat langsung membuka rute navigasi.
                            </p>
                        </div>
                    )}

                    {isDelivered && (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-start gap-2.5 text-emerald-800 text-xs">
                            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                            <p>
                                Pesanan ini sudah <strong>Selesai Diantar</strong>.
                            </p>
                        </div>
                    )}

                    {/* Origin & Destination */}
                    <div className="space-y-3">
                        {/* Store Origin */}
                        <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="w-8 h-8 rounded-lg bg-brand-blue-tint text-brand-blue flex items-center justify-center shrink-0 mt-0.5">
                                <Store className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                                    Titik Ambil (Toko)
                                </span>
                                <h4 className="font-bold text-sm text-gray-900 truncate">
                                    {order.store_name}
                                </h4>
                            </div>
                        </div>

                        {/* Destination Buyer */}
                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="w-8 h-8 rounded-lg bg-brand-orange-tint text-brand-orange flex items-center justify-center shrink-0">
                                <MapPin className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                        Titik Antar (Pembeli)
                                    </span>
                                    {order.customer_phone && (
                                        <a
                                            href={`tel:${order.customer_phone}`}
                                            className="text-[11px] text-brand-blue font-semibold flex items-center gap-1 hover:underline"
                                        >
                                            <Phone className="w-3 h-3" />
                                            <span>Hubungi</span>
                                        </a>
                                    )}
                                </div>
                                <p className="text-sm font-bold text-gray-900 truncate mt-0.5">
                                    {order.customer_name}
                                </p>
                                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                                    {order.shipping_address}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Order Items & Cost Breakdown */}
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                        <div className="flex justify-between items-center text-xs text-gray-500 font-medium">
                            <span className="flex items-center gap-1.5">
                                <Package className="w-3.5 h-3.5 text-gray-400" />
                                <span>Paket ({totalItems} item):</span>
                            </span>
                            <span className="text-gray-700 font-medium">
                                {formatRupiah(order.subtotal)}
                            </span>
                        </div>

                        <div className="divide-y divide-gray-200/70 text-xs pt-1">
                            {order.items.map((item, idx) => (
                                <div key={idx} className="py-1.5 flex justify-between items-center text-gray-700">
                                    <span className="truncate pr-2">
                                        {item.quantity}x {item.product_name}
                                        {item.variant_name ? ` (${item.variant_name})` : ""}
                                    </span>
                                    <span className="text-gray-500 shrink-0 font-medium">
                                        {formatRupiah(item.price * item.quantity)}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Shipping Cost Breakdown */}
                        <div className="pt-2 border-t border-gray-200 flex justify-between items-center text-xs">
                            <span className="text-gray-500 flex items-center gap-1">
                                <Truck className="w-3.5 h-3.5 text-gray-400" />
                                <span>Ongkos Kirim:</span>
                            </span>
                            <span className="text-gray-800 font-semibold">
                                {formatRupiah(order.shipping_cost)}
                            </span>
                        </div>

                        {/* Total Payment */}
                        <div className="pt-2 border-t border-gray-200 flex justify-between items-center">
                            <span className="text-xs font-bold text-gray-900">Total Pembayaran:</span>
                            <span className="text-sm font-extrabold text-brand-orange">
                                {formatRupiah(order.total_amount)}
                            </span>
                        </div>

                        {order.payment_method === "cod" && (
                            <div className="pt-2 border-t border-gray-200 flex justify-between items-center">
                                <span className="text-xs font-bold text-amber-700 flex items-center gap-1">
                                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                                    <span>Tagihan Tunai (COD):</span>
                                </span>
                                <span className="text-sm font-extrabold text-amber-700">
                                    {formatRupiah(order.total_amount)}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-1">
                    {!isDelivered ? (
                        <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={handleAcceptHandover}
                            className="w-full py-3.5 px-5 rounded-xl bg-brand-blue hover:bg-brand-blue-hover text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                        >
                            {isSubmitting ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Truck className="w-4 h-4" />
                                    <span>
                                        {isAlreadyShipped ? "Buka Rute & Lacak Pengiriman" : "Ambil & Mulai Antar"}
                                    </span>
                                    <ArrowRight className="w-4 h-4 ml-1" />
                                </>
                            )}
                        </button>
                    ) : (
                        <a
                            href={`/tracker/${order.invoice_number}`}
                            className="w-full py-3.5 px-5 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition"
                        >
                            <span>Lihat Bukti Pengiriman</span>
                        </a>
                    )}

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

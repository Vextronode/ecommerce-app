import React from "react";
import { formatRupiah } from "@/utils/formatters";
import { Head, Link } from "@inertiajs/react";
import {
    Check,
    Package,
    Truck,
    ArrowLeft,
    Calendar,
    ShoppingBag,
    Store,
    MapPin,
    Navigation,
    Layers,
    ChevronRight,
} from "lucide-react";

interface OrderItemData {
    id: number;
    product_name: string;
    quantity: number;
    price: number;
    unit?: string;
    variant_name?: string;
    product?: {
        image_path?: string;
    };
}

interface OrderData {
    id: number;
    invoice_number: string;
    customer_name: string;
    customer_phone: string;
    shipping_address: string;
    delivery_method: string;
    shipping_status: string;
    payment_method: string;
    payment_channel: string;
    payment_status: string;
    subtotal: number;
    shipping_cost: number;
    total_amount: number;
    created_at: string;
    store?: {
        id: number;
        name: string;
        address?: string;
    };
    items?: OrderItemData[];
}

interface Props {
    orders?: OrderData[];
    order?: OrderData;
}

export default function Success({ orders = [], order }: Props) {
    const ordersList = orders.length > 0 ? orders : order ? [order] : [];
    const isMultiOrder = ordersList.length > 1;

    const totalSpent = ordersList.reduce(
        (sum, ord) => sum + (ord.total_amount || 0),
        0
    );

    const firstOrder = ordersList[0];
    const customerName = firstOrder?.customer_name || "Pelanggan";
    const shippingAddress = firstOrder?.shipping_address || "-";
    const isAllCod = ordersList.every((o) => o.payment_method === "cod");

    return (
        <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans">
            <Head title="Pesanan Berhasil - Cibenda Mart" />

            <main className="flex-1 w-full flex flex-col items-center">
                {/* Header Banner */}
                <div className="w-full bg-[#14433D] pt-12 pb-32 px-4 text-center relative overflow-hidden flex flex-col items-center justify-center">
                    <div className="relative z-10 flex flex-col items-center animate-fade-in-up mt-4 md:mt-8">
                        <div className="w-16 h-16 rounded-full bg-[#41B9C5] flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <Check className="w-8 h-8 text-[#14433D]" strokeWidth={3} />
                        </div>

                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-2">
                            {isMultiOrder
                                ? `${ordersList.length} Pesanan Berhasil Dibuat`
                                : "Pesanan Berhasil Dibuat"}
                        </h1>
                        <p className="text-[#a8c6c5] text-xs sm:text-sm md:text-base max-w-lg mx-auto font-medium leading-relaxed">
                            {isMultiOrder
                                ? `Pesanan Anda dari ${ordersList.length} toko berbeda telah diteruskan ke masing-masing penjual untuk diproses.`
                                : `Terima kasih telah berbelanja di ${firstOrder?.store?.name || "Toko Mitra"}. Penjual akan segera mengemas pesananmu.`}
                        </p>
                    </div>
                </div>

                {/* Main Content Container */}
                <div className="w-full max-w-4xl mx-auto px-4 -mt-24 relative z-20 pb-24 space-y-6">
                    {/* Overall Summary Card */}
                    <div className="w-full bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 text-xs sm:text-sm">
                            <div>
                                <span className="text-gray-400 block">Penerima</span>
                                <p className="font-bold text-gray-900">{customerName}</p>
                            </div>
                            <div>
                                <span className="text-gray-400 block">Metode Pembayaran</span>
                                <span className="font-bold text-[#14433D]">
                                    {isAllCod ? "COD (Bayar di Tempat)" : "Lunas (Online)"}
                                </span>
                            </div>
                            <div className="text-right">
                                <span className="text-gray-400 block">Total Keseluruhan</span>
                                <p className="font-extrabold text-base text-[#ED7218]">
                                    {formatRupiah(totalSpent)}
                                </p>
                            </div>
                        </div>

                        <div className="text-xs text-gray-600 flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                            <p className="leading-relaxed">
                                <strong className="text-gray-900">Alamat Pengiriman: </strong>
                                {shippingAddress}
                            </p>
                        </div>
                    </div>

                    {/* Orders List (1 or more stores) */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider px-1 flex items-center gap-2">
                            <Layers className="w-4 h-4 text-[#41B9C5]" />
                            <span>
                                {isMultiOrder
                                    ? `Daftar Pesanan per Toko (${ordersList.length})`
                                    : "Rincian Pesanan"}
                            </span>
                        </h3>

                        {ordersList.map((ord, idx) => {
                            const storeName = ord.store?.name || "Toko Mitra";
                            const itemsCount =
                                ord.items?.reduce((s, i) => s + i.quantity, 0) || 0;

                            return (
                                <div
                                    key={ord.id || idx}
                                    className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-100 space-y-4 hover:border-[#41B9C5]/40 transition"
                                >
                                    {/* Store & Invoice Header */}
                                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#14433D] flex items-center justify-center shrink-0 border border-teal-100">
                                                <Store className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900 text-sm sm:text-base leading-tight">
                                                    {storeName}
                                                </h4>
                                                <p className="font-mono text-[11px] text-gray-400 mt-0.5">
                                                    #{ord.invoice_number}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/50">
                                                Diproses Penjual
                                            </span>
                                            {ord.delivery_method === "local_delivery" && (
                                                <a
                                                    href={`/tracker/${ord.invoice_number}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-1 text-xs font-bold text-[#14433D] bg-[#EAF7F7] hover:bg-[#41B9C5] hover:text-white px-3 py-1.5 rounded-xl transition shadow-xs cursor-pointer"
                                                >
                                                    <Truck className="w-3.5 h-3.5" />
                                                    <span>Lacak</span>
                                                </a>
                                            )}
                                        </div>
                                    </div>

                                    {/* Order Items */}
                                    {ord.items && ord.items.length > 0 && (
                                        <div className="divide-y divide-slate-100 text-xs">
                                            {ord.items.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="py-2.5 flex items-center justify-between gap-3"
                                                >
                                                    <div className="flex items-center gap-2.5 min-w-0">
                                                        <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-[11px] shrink-0">
                                                            {item.quantity}x
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="font-semibold text-gray-900 truncate">
                                                                {item.product_name}
                                                            </p>
                                                            {item.variant_name && (
                                                                <p className="text-[10px] text-gray-400">
                                                                    Varian: {item.variant_name}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <span className="font-medium text-gray-700 shrink-0">
                                                        {formatRupiah(item.price * item.quantity)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Order Cost Breakdown Footer */}
                                    <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                                        <div className="text-gray-500 space-x-2">
                                            <span>Subtotal: {formatRupiah(ord.subtotal)}</span>
                                            <span>•</span>
                                            <span>Ongkir: {formatRupiah(ord.shipping_cost)}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-500">Total Toko:</span>
                                            <span className="font-extrabold text-sm text-[#14433D]">
                                                {formatRupiah(ord.total_amount)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3.5 justify-center w-full pt-4">
                        <Link
                            href={route("shop")}
                            className="flex items-center justify-center px-8 py-3.5 bg-[#14433D] hover:bg-[#0f342f] text-white font-bold rounded-2xl transition shadow-sm text-sm cursor-pointer"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Belanja Lagi
                        </Link>
                        <Link
                            href={route("history.index")}
                            className="flex items-center justify-center px-8 py-3.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 transition shadow-sm text-sm cursor-pointer"
                        >
                            <Calendar className="w-4 h-4 mr-2" />
                            Riwayat Pesanan
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}

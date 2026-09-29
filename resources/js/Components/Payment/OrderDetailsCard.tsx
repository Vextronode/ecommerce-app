import React, { useMemo } from "react";
import { Link } from "@inertiajs/react";
import { Store, RefreshCw, Package, ShoppingBag, FileText } from "lucide-react";
import { formatRupiah } from "@/utils/formatters";

export interface OrderItemProduct {
    id: number;
    name: string;
    image_path?: string | null;
}

export interface OrderItem {
    id: number;
    product_name?: string;
    quantity: number;
    price: number | string;
    product?: OrderItemProduct;
}

export interface OrderStore {
    id: number;
    name: string;
}

export interface OrderData {
    id: number;
    invoice_number: string;
    total_amount: number | string;
    subtotal?: number | string;
    shipping_cost?: number | string;
    payment_status: string;
    payment_method: string;
    payment_channel?: string;
    store?: OrderStore;
    items?: OrderItem[];
}

interface Props {
    order: OrderData;
    expiryTime?: string | null;
    isChecking: boolean;
    onCheckStatus: () => void;
}


export default function OrderDetailsCard({
    order,
    expiryTime,
    isChecking,
    onCheckStatus,
}: Props) {
    const { formattedDate, formattedTime } = useMemo(() => {
        const date = expiryTime
            ? new Date(expiryTime)
            : new Date(Date.now() + 24 * 60 * 60 * 1000);

        const d = date.toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "short",
            year: "numeric",
        });

        const t =
            date
                .toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                })
                .replace(":", ".") + " WIB";

        return { formattedDate: d, formattedTime: t };
    }, [expiryTime]);

    return (
        <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-9 border border-slate-100 shadow-xs space-y-6">
            <h4 className="font-bold text-base sm:text-xl text-gray-900">
                Rincian Pesanan
            </h4>

            {/* Store & Expiry Details */}
            <div className="space-y-3 text-xs sm:text-sm">
                <div className="flex items-center justify-between">
                    <span className="text-slate-500">Toko / Seller</span>
                    <div className="flex items-center gap-2 font-bold text-gray-900">
                        <Store className="w-4 h-4 text-slate-700" />
                        <span>{order.store?.name || "Seafood Asep Siti"}</span>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-slate-500">Batas Waktu Transfer</span>
                    <span className="font-semibold text-slate-800">{formattedDate}</span>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-slate-500">Jam Terakhir</span>
                    <span className="font-semibold text-slate-800">{formattedTime}</span>
                </div>
            </div>

            {/* ITEM BELANJA */}
            <div className="bg-[#F0F2F5] rounded-2xl p-5 sm:p-6 space-y-4">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    ITEM BELANJA ({order.items?.length || 1} PRODUK)
                </span>

                {/* Product List */}
                <div className="space-y-3.5">
                    {order.items && order.items.length > 0 ? (
                        order.items.map((item, idx) => {
                            const imgUrl = item.product?.image_path
                                ? (item.product.image_path.startsWith("http")
                                    ? item.product.image_path
                                    : `/storage/${item.product.image_path}`)
                                : null;

                            return (
                                <div key={item.id} className="flex items-center gap-3.5">
                                    {imgUrl ? (
                                        <img
                                            src={imgUrl}
                                            alt={item.product_name || item.product?.name || "Produk"}
                                            className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover bg-white border border-slate-200/80 flex-shrink-0"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center flex-shrink-0 text-slate-400">
                                            <Package className="w-6 h-6" />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <h5 className="font-bold text-xs sm:text-sm text-gray-900 truncate">
                                            {item.product_name || item.product?.name || "Produk Pilihan"}
                                        </h5>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            {item.quantity}x • {formatRupiah(Number(item.price))}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="flex items-center gap-3.5">
                            <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400">
                                <Package className="w-6 h-6" />
                            </div>
                            <div>
                                <h5 className="font-bold text-xs sm:text-sm text-gray-900">
                                    Paket Belanja Pangandaran
                                </h5>
                                <p className="text-xs text-slate-500">
                                    1x • {formatRupiah(Number(order.total_amount))}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Subtotal & Ongkir Breakdown */}
                <div className="border-t border-slate-200/80 pt-3.5 space-y-2 text-xs sm:text-sm text-slate-600">
                    <div className="flex justify-between">
                        <span>Subtotal Produk</span>
                        <span className="font-semibold text-slate-800">
                            {formatRupiah(Number(order.subtotal || order.total_amount))}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span>Ongkos Kirim</span>
                        <span className="font-semibold text-slate-800">
                            {formatRupiah(Number(order.shipping_cost || 0))}
                        </span>
                    </div>
                </div>
            </div>

            {/* Total Tagihan */}
            <div className="flex items-center justify-between pt-1">
                <span className="text-base sm:text-xl font-bold text-slate-800">
                    Total Tagihan
                </span>
                <span className="text-2xl sm:text-3xl md:text-4xl font-black text-[#281B7A]">
                    {formatRupiah(Number(order.total_amount))}
                </span>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3.5 pt-2">
                <button
                    onClick={onCheckStatus}
                    disabled={isChecking}
                    className="w-full bg-[#281B7A] hover:bg-[#1f1460] text-white font-bold py-4 rounded-xl sm:rounded-2xl text-sm sm:text-base shadow-xs transition active:scale-[0.99] flex items-center justify-center gap-2.5 disabled:opacity-60"
                >
                    <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 ${isChecking ? "animate-spin" : ""}`} />
                    <span>{isChecking ? "Memeriksa Pembayaran..." : "Cek Status Pembayaran"}</span>
                </button>

                <div className="flex items-center gap-3.5">
                    <Link
                        href={route("shop")}
                        className="flex-1 bg-[#C6C7D8] hover:bg-[#b5b7ca] text-[#281B7A] font-bold py-3.5 sm:py-4 rounded-xl sm:rounded-2xl text-xs sm:text-sm text-center transition shadow-2xs flex items-center justify-center gap-2"
                    >
                        <ShoppingBag className="w-4 h-4" />
                        <span>Lanjut Belanja</span>
                    </Link>
                    <Link
                        href={route("history.show", order.id)}
                        className="flex-1 bg-[#F5D8BA] hover:bg-[#eecaa8] text-[#D96B00] font-bold py-3.5 sm:py-4 rounded-xl sm:rounded-2xl text-xs sm:text-sm text-center transition shadow-2xs flex items-center justify-center gap-2"
                    >
                        <FileText className="w-4 h-4" />
                        <span>Lihat Rincian</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}

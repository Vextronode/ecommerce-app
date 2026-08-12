import React from "react";
import { formatRupiah, formatNumberId, formatNumberEn } from "@/utils/formatters";
import { Head, Link } from "@inertiajs/react";
import Navbar from "@/Components/Global/Navbar";
import {
    Check,
    Package,
    Truck,
    Home,
    ArrowLeft,
    Calendar,
    ShoppingBag,
    Store,
    MapPin,
} from "lucide-react";

interface Props {
    order?: any;
}

export default function Success({ order }: Props) {
    const storeName = order?.store?.name || "Toko Mitra Pangandaran";

    const orderDate = order?.created_at
        ? new Date(order.created_at).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
          })
        : "-";


    return (
        <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans">
            <Head title="Pesanan Berhasil - Cibenda Mart" />
            <Navbar />

            <main className="flex-1 w-full flex flex-col items-center">
                {/* Header Banner */}
                <div className="w-full bg-[#281B7A] pt-16 pb-36 px-4 text-center relative overflow-hidden flex flex-col items-center justify-center">
                    <div className="relative z-10 flex flex-col items-center animate-fade-in-up mt-16 md:mt-20">
                        <div className="w-16 h-16 rounded-full bg-[#40E0D0] flex items-center justify-center mx-auto mb-5 shadow-lg">
                            <Check className="w-8 h-8 text-white" strokeWidth={3} />
                        </div>

                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                            Pesanan Berhasil Dibuat
                        </h1>
                        <p className="text-[#a8c6c5] text-sm md:text-base max-w-lg mx-auto font-medium leading-relaxed">
                            Terima kasih telah berbelanja di <span className="text-white font-bold">{storeName}</span>. Penjual akan segera menyiapkan dan mengemas pesananmu.
                        </p>
                    </div>
                </div>

                {/* Main Content Container */}
                <div className="w-full max-w-4xl mx-auto px-4 -mt-24 relative z-20 pb-24 space-y-6">
                    {/* Order Tracking Progress Card */}
                    <div className="w-full bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-slate-100 animate-fade-in-up">
                        <h3 className="text-lg font-bold text-gray-900 mb-8 text-center">
                            Tracking Pesananmu
                        </h3>

                        <div className="relative flex justify-between max-w-2xl mx-auto mb-4">
                            <div className="absolute top-6 left-0 right-0 h-1.5 bg-gray-100 rounded-full z-0"></div>
                            <div className="absolute top-6 left-0 w-1/4 h-1.5 bg-[#006591] rounded-full z-0 transition duration-500"></div>

                            <div className="relative z-10 flex flex-col items-center flex-1">
                                <div className="w-12 h-12 bg-white border-2 border-[#006591] rounded-2xl flex items-center justify-center mb-3 shadow-xs">
                                    <Package className="w-6 h-6 text-[#006591]" />
                                </div>
                                <h4 className="font-bold text-gray-900 mb-1 text-xs sm:text-sm">Dikemas Penjual</h4>
                                <p className="text-[11px] text-gray-500 text-center px-2">Penjual sedang menyiapkan paket pesananmu</p>
                            </div>

                            <div className="relative z-10 flex flex-col items-center flex-1">
                                <div className="w-12 h-12 bg-white border-2 border-gray-200 rounded-2xl flex items-center justify-center mb-3 shadow-xs">
                                    <Truck className="w-6 h-6 text-gray-400" />
                                </div>
                                <h4 className="font-bold text-gray-900 mb-1 text-xs sm:text-sm">Dalam Pengiriman</h4>
                                <p className="text-[11px] text-gray-500 text-center px-2">Kurir mengantar pesanan ke alamat tujuan</p>
                            </div>

                            <div className="relative z-10 flex flex-col items-center flex-1">
                                <div className="w-12 h-12 bg-white border-2 border-gray-200 rounded-2xl flex items-center justify-center mb-3 shadow-xs">
                                    <Home className="w-6 h-6 text-gray-400" />
                                </div>
                                <h4 className="font-bold text-gray-900 mb-1 text-xs sm:text-sm">Pesanan Tiba</h4>
                                <p className="text-[11px] text-gray-500 text-center px-2">Paket diterima oleh pembeli</p>
                            </div>
                        </div>
                    </div>

                    {/* Detail Transaksi Card */}
                    <div className="bg-[#40E0D0]/10 rounded-3xl p-6 md:p-8 space-y-6">
                        <div className="flex items-center justify-between pb-4 border-b border-[#006591]/10">
                            <div className="flex items-center gap-2.5">
                                <ShoppingBag className="w-5 h-5 text-gray-900" />
                                <h4 className="font-bold text-gray-900 text-base">Detail Pesanan</h4>
                            </div>
                            <span className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800">
                                {order?.payment_method === "cod" ? "COD (BAYAR DI TEMPAT)" : "LUNAS"}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-5 gap-x-4">
                            <div>
                                <p className="text-xs text-slate-500 mb-1">Nomor Invoice</p>
                                <p className="font-mono font-bold text-xs sm:text-sm text-gray-900">{order?.invoice_number || "-"}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 mb-1">Nama Pembeli</p>
                                <p className="font-bold text-xs sm:text-sm text-gray-900">{order?.customer_name || "-"}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 mb-1">Metode Pembayaran</p>
                                <p className="font-bold text-xs sm:text-sm text-gray-900">
                                    {order?.payment_channel ? order.payment_channel.toUpperCase().replace("_", " ") : order?.payment_method?.toUpperCase() || "COD"}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 mb-1">Waktu Transaksi</p>
                                <p className="font-semibold text-xs sm:text-sm text-gray-900">{orderDate}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 mb-1">Total Pembayaran</p>
                                <p className="font-bold text-xs sm:text-sm text-[#245D56]">{order ? formatRupiah(order.total_amount) : "-"}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 mb-1">Toko</p>
                                <p className="font-bold text-xs sm:text-sm text-gray-900">{storeName}</p>
                            </div>
                            <div className="col-span-2 sm:col-span-3 pt-3 border-t border-slate-100">
                                <p className="text-xs text-slate-500 mb-1">Alamat Pengiriman</p>
                                <p className="font-medium text-xs text-gray-700 leading-relaxed">{order?.shipping_address || "-"}</p>
                            </div>
                        </div>

                        {/* Items preview */}
                        {order?.items && order.items.length > 0 && (
                            <div className="pt-4 border-t border-slate-100 space-y-3">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    Daftar Produk ({order.items.length} Item)
                                </p>
                                <div className="divide-y divide-slate-100">
                                    {order.items.map((item: any) => (
                                        <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-500">
                                                    {item.quantity}x
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">{item.product_name}</p>
                                                    {item.variant_name && (
                                                        <p className="text-[11px] text-slate-500">Varian: {item.variant_name}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="font-bold text-gray-900">
                                                {formatRupiah(item.price * item.quantity)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3.5 justify-center w-full pt-4">
                        <Link
                            href={route("shop")}
                            className="flex items-center justify-center px-8 py-3.5 bg-[#281B7A] text-white font-bold rounded-2xl hover:opacity-90 transition-colors shadow-sm text-sm"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Lanjut Pesanan
                        </Link>
                        <Link
                            href={order?.id ? route("history.show", order.id) : route("history.index")}
                            className="flex items-center justify-center px-8 py-3.5 bg-transparent border border-slate-300 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 transition-colors shadow-sm text-sm"
                        >
                            <Calendar className="w-4 h-4 mr-2" />
                            Pantau Pesanan
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}

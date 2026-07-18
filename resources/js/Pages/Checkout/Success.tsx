import React from "react";
import { Head, Link } from "@inertiajs/react";
import Navbar from "@/Components/Global/Navbar";
import { Check, Package, Truck, Home, ArrowLeft, Calendar } from "lucide-react";

interface Props {
    order?: any;
}

export default function Success({ order }: Props) {
    const storeName = order?.store?.name || "Toko";

    const orderDate = order ? new Date(order.created_at).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    }) : '-';

    const formatRupiah = (number: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(number);
    };

    return (
        <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans">
            <Head title="Order Completed" />
            <Navbar />

            <main className="flex-1 w-full flex flex-col items-center">
                <div className="w-full bg-[#1e5856] pt-16 pb-36 px-4 text-center relative overflow-hidden flex flex-col items-center justify-center">
                    <div className="relative z-10 flex flex-col items-center animate-fade-in-up mt-16 md:mt-20">
                        <div className="w-16 h-16 bg-[#41b9c5] rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg">
                            <Check className="w-8 h-8 text-white" strokeWidth={3} />
                        </div>

                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                            Order Completed
                        </h1>
                        <p className="text-[#a8c6c5] text-sm md:text-base max-w-md mx-auto font-medium leading-relaxed">
                            Terimakasih telah berbelanja di {storeName}. Penjual sudah menerima notifikasi pesananmu dan akan segera memprosesnya
                        </p>
                    </div>
                </div>

                <div className="w-full max-w-5xl mx-auto px-4 -mt-24 relative z-20 pb-20">
                    <div className="w-full bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-gray-100 mb-8 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                        <h3 className="text-xl font-bold text-gray-900 mb-12 text-center">Tracking Pesananmu</h3>

                        <div className="relative flex justify-between max-w-3xl mx-auto mb-8">
                            <div className="absolute top-6 left-0 right-0 h-1.5 bg-gray-200 rounded-full z-0"></div>

                            <div className="absolute top-6 left-0 w-1/4 h-1.5 bg-[#126871] rounded-full z-0 transition-all duration-500"></div>

                            <div className="relative z-10 flex flex-col items-center flex-1">
                                <div className="w-12 h-12 bg-white border-2 border-[#126871] rounded-xl flex items-center justify-center mb-4">
                                    <Package className="w-6 h-6 text-[#126871]" />
                                </div>
                                <h4 className="font-bold text-gray-900 mb-1 text-sm">Dikemas Penjual</h4>
                                <p className="text-xs text-gray-500 text-center px-2">Penjual menyiapkan dan mempacking barang belanjaanmu dengan aman</p>
                            </div>

                            <div className="relative z-10 flex flex-col items-center flex-1">
                                <div className="w-12 h-12 bg-white border-2 border-gray-200 rounded-xl flex items-center justify-center mb-4">
                                    <Truck className="w-6 h-6 text-gray-400" />
                                </div>
                                <h4 className="font-bold text-gray-900 mb-1 text-sm">Dalam Pengiriman</h4>
                                <p className="text-xs text-gray-500 text-center px-2">Kurir mengambil paketmu dan mengantarkannya ke alamat tujuan</p>
                            </div>

                            <div className="relative z-10 flex flex-col items-center flex-1">
                                <div className="w-12 h-12 bg-white border-2 border-gray-200 rounded-xl flex items-center justify-center mb-4">
                                    <Home className="w-6 h-6 text-gray-400" />
                                </div>
                                <h4 className="font-bold text-gray-900 mb-1 text-sm">Pesanan Tiba</h4>
                                <p className="text-xs text-gray-500 text-center px-2">Paket sampai ditanganmu dan siap untuk dinikmati atau digunakan</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#e6f4f4] rounded-2xl p-6 md:p-8 max-w-3xl mx-auto shadow-sm border border-[#d3ecec]">
                        <h4 className="font-bold text-gray-900 mb-6 text-center text-lg">Detail Pesanan</h4>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4">
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Order ID</p>
                                <p className="font-bold text-sm text-gray-900">{order?.invoice_number || '-'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Customer Name</p>
                                <p className="font-bold text-sm text-gray-900">{order?.customer_name || '-'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Payment Method</p>
                                <p className="font-bold text-sm text-gray-900">{order?.payment_method || 'Bank Transfer'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Order Date</p>
                                <p className="font-bold text-sm text-gray-900">{orderDate}</p>
                            </div>
                            <div className="md:col-span-1">
                                <p className="text-xs text-gray-500 mb-1">Shipping Address</p>
                                <p className="font-semibold text-xs text-gray-700 leading-relaxed truncate max-w-xs" title={order?.shipping_address}>{order?.shipping_address || '-'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Total Amount</p>
                                <p className="font-bold text-sm text-gray-900">{order ? formatRupiah(order.total_amount) : '-'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center w-full mt-8 max-w-3xl mx-auto">
                        <Link
                            href={route("shop")}
                            className="flex items-center justify-center px-8 py-3 bg-[#245D56] text-white font-medium rounded-lg hover:bg-[#1a4540] transition-colors shadow-sm"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Lanjut Pesanan
                        </Link>
                        <Link
                            href={order?.id ? route("history.show", order.id) : route("history.index")}
                            className="flex items-center justify-center px-8 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
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

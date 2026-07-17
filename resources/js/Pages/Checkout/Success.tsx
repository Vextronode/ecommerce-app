import React from "react";
import { Head, Link } from "@inertiajs/react";
import Navbar from "@/Components/Global/Navbar";
import { CheckCircle2, ShoppingBag, ArrowRight, Package, Truck, Home, PartyPopper } from "lucide-react";

interface Props {
    order_id?: number | string;
}

export default function Success({ order_id }: Props) {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <Head title="Pesanan Berhasil" />
            <Navbar />

            <main className="flex-1 w-full flex flex-col items-center">
                {/* Header */}
                <div className="w-full bg-[#245D56] pt-32 pb-32 px-4 text-center relative overflow-hidden">
                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-10">
                        <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-white blur-3xl"></div>
                        <div className="absolute top-40 -right-20 w-80 h-80 rounded-full bg-white blur-3xl"></div>
                    </div>

                    <div className="relative z-10 animate-fade-in-up">
                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-black/20 relative">
                            <CheckCircle2 className="w-12 h-12 text-[#245D56]" />
                            <div className="absolute -top-2 -right-2 bg-yellow-400 p-1.5 rounded-full shadow-lg">
                                <PartyPopper className="w-5 h-5 text-white" />
                            </div>
                        </div>

                        <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
                            Pesanan Berhasil!
                        </h1>
                        <p className="text-[#EAF7F7] text-base md:text-lg max-w-xl mx-auto font-medium">
                            Terima kasih telah berbelanja di Cbenda Mart. Penjual sudah menerima notifikasi pesananmu dan akan segera memprosesnya.
                        </p>
                    </div>
                </div>

                {/* Overlapping Content Section */}
                <div className="w-full max-w-5xl mx-auto px-4 -mt-20 relative z-20 pb-20">
                    <div className="w-full bg-white rounded-3xl p-8 md:p-10 shadow-xl shadow-gray-200/50 border border-gray-100 mb-10 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                        <h3 className="text-xl font-bold text-gray-900 mb-10 text-center">Apa yang terjadi selanjutnya?</h3>

                        <div className="relative flex flex-col md:flex-row justify-between items-center md:items-start gap-8 md:gap-4 max-w-4xl mx-auto">
                            <div className="hidden md:block absolute top-8 left-16 right-16 h-1 bg-gray-100 -z-10 rounded-full"></div>

                            <div className="flex flex-col items-center text-center w-full md:w-1/3">
                                <div className="w-16 h-16 rounded-2xl bg-[#EAF7F7] text-[#245D56] flex items-center justify-center mb-5 shadow-sm border border-white relative z-10">
                                    <Package className="w-8 h-8" />
                                </div>
                                <h4 className="font-bold text-gray-900 mb-2 text-lg">Dikemas Penjual</h4>
                                <p className="text-sm text-gray-500 leading-relaxed px-4">Penjual menyiapkan dan mempacking barang belanjaanmu dengan aman.</p>
                            </div>

                            <div className="flex flex-col items-center text-center w-full md:w-1/3">
                                <div className="w-16 h-16 rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center mb-5 border border-gray-100 relative z-10">
                                    <Truck className="w-8 h-8" />
                                </div>
                                <h4 className="font-bold text-gray-900 mb-2 text-lg">Dalam Pengiriman</h4>
                                <p className="text-sm text-gray-500 leading-relaxed px-4">Kurir mengambil paketmu dan mengantarkannya ke alamat tujuan.</p>
                            </div>

                            <div className="flex flex-col items-center text-center w-full md:w-1/3">
                                <div className="w-16 h-16 rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center mb-5 border border-gray-100 relative z-10">
                                    <Home className="w-8 h-8" />
                                </div>
                                <h4 className="font-bold text-gray-900 mb-2 text-lg">Pesanan Tiba</h4>
                                <p className="text-sm text-gray-500 leading-relaxed px-4">Paket sampai di tanganmu dan siap untuk dinikmati atau digunakan.</p>
                            </div>
                        </div>
                    </div>

                    {/* Call to Actions */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-lg mx-auto animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
                        <Link
                            href={order_id ? route("history.show", order_id) : route("history.index")}
                            className="flex-1 flex items-center justify-center px-6 py-4 bg-white border-2 border-[#245D56] text-[#245D56] font-bold rounded-2xl hover:bg-[#EAF7F7] transition-all hover:scale-105 active:scale-95"
                        >
                            <ShoppingBag className="w-5 h-5 mr-2" />
                            Pantau Pesanan
                        </Link>
                        <Link
                            href={route("shop")}
                            className="flex-1 flex items-center justify-center px-6 py-4 bg-[#245D56] text-white font-bold rounded-2xl hover:bg-[#1a4540] transition-all shadow-xl shadow-[#245D56]/30 hover:scale-105 active:scale-95"
                        >
                            Lanjut Belanja
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}

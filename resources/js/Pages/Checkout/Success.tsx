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
    Home,
    Phone,
    CreditCard,
    Clock,
} from "lucide-react";
import Footer from "@/Components/Global/Footer";

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
    const customerPhone = firstOrder?.customer_phone || "-";
    const shippingAddress = firstOrder?.shipping_address || "-";
    const isAllCod = ordersList.every((o) => o.payment_method === "cod");

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
        return new Date(dateStr).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    return (
        <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans">
            <Head title="Pesanan Berhasil - Cibenda Mart" />

            <main className="flex-1 w-full flex flex-col items-center">
                {/* Header Banner - Deep Indigo #281B7A */}
                <div className="w-full bg-[#281B7A] pt-14 pb-20 px-4 text-center relative overflow-hidden flex flex-col items-center justify-center">
                    <div className="relative z-10 flex flex-col items-center animate-fade-in-up">
                        {/* Check Circle Badge #40E0D0 */}
                        <div className="w-16 h-16 rounded-full bg-[#40E0D0] flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <Check className="w-9 h-9 text-white" strokeWidth={3} />
                        </div>

                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-2 tracking-tight">
                            {isMultiOrder
                                ? `${ordersList.length} Pesanan Berhasil Dibuat`
                                : "Order Completed"}
                        </h1>
                        <p className="text-white/80 text-xs sm:text-sm md:text-base max-w-lg mx-auto font-medium leading-relaxed">
                            {isMultiOrder
                                ? `Terimakasih telah berbelanja di CibendaMart. Pesanan Anda dari ${ordersList.length} toko berbeda telah diteruskan ke masing-masing penjual untuk diproses.`
                                : `Terimakasih telah berbelanja di CibendaMart. Penjual sudah menerima notifikasi pesananmu dan akan segera memprosesnya`}
                        </p>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="w-full max-w-3xl mx-auto px-4 py-10 space-y-10">
                    
                    {/* Stepper Tracking Pesananmu */}
                    <div className="w-full text-center space-y-6">
                        <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                            Tracking Pesananmu
                        </h2>

                        <div className="relative flex items-center justify-between max-w-2xl mx-auto px-4">
                            {/* Connecting Progress Line #006591 */}
                            <div className="absolute top-6 left-12 right-12 h-1 bg-gray-200 -z-0">
                                <div className="h-full bg-[#006591] w-1/3 transition-all duration-500 rounded-full" />
                            </div>

                            {/* Step 1: Dikemas */}
                            <div className="flex flex-col items-center text-center relative z-10 max-w-[150px]">
                                <div className="w-12 h-12 rounded-2xl bg-white border-2 border-[#006591] text-[#006591] flex items-center justify-center shadow-xs mb-3">
                                    <Package className="w-6 h-6" />
                                </div>
                                <h4 className="font-bold text-gray-900 text-xs sm:text-sm">
                                    Dikemas Penjual
                                </h4>
                                <p className="text-[11px] text-gray-500 mt-1 leading-snug">
                                    Penjual menyiapkan dan mempacking barang belanjaanmu dengan aman
                                </p>
                            </div>

                            {/* Step 2: Dalam Pengiriman */}
                            <div className="flex flex-col items-center text-center relative z-10 max-w-[150px]">
                                <div className="w-12 h-12 rounded-2xl bg-white border-2 border-gray-200 text-gray-400 flex items-center justify-center shadow-xs mb-3">
                                    <Truck className="w-6 h-6" />
                                </div>
                                <h4 className="font-bold text-gray-600 text-xs sm:text-sm">
                                    Dalam Pengiriman
                                </h4>
                                <p className="text-[11px] text-gray-400 mt-1 leading-snug">
                                    Kurir mengambil paketmu dan mengantarkannya ke alamat tujuan
                                </p>
                            </div>

                            {/* Step 3: Pesanan Tiba */}
                            <div className="flex flex-col items-center text-center relative z-10 max-w-[150px]">
                                <div className="w-12 h-12 rounded-2xl bg-white border-2 border-gray-200 text-gray-400 flex items-center justify-center shadow-xs mb-3">
                                    <Home className="w-6 h-6" />
                                </div>
                                <h4 className="font-bold text-gray-600 text-xs sm:text-sm">
                                    Pesanan Tiba
                                </h4>
                                <p className="text-[11px] text-gray-400 mt-1 leading-snug">
                                    Paket sampai ditanganmu dan siap untuk dinikmati atau digunakan
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Detail Pesanan Card - Background #40E0D0/10 */}
                    <div className="w-full bg-[#40E0D0]/10 border border-[#40E0D0]/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
                        <h3 className="text-lg font-bold text-gray-900 text-center tracking-tight">
                            Detail Pesanan
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs sm:text-sm">
                            {/* Col 1 */}
                            <div className="space-y-4">
                                <div>
                                    <span className="text-gray-500 text-xs block mb-0.5">Order ID</span>
                                    <p className="font-bold text-gray-900 font-mono">
                                        {firstOrder ? `#${firstOrder.invoice_number}` : "-"}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-gray-500 text-xs block mb-0.5">Order Date</span>
                                    <p className="font-bold text-gray-900">
                                        {formatDate(firstOrder?.created_at)}
                                    </p>
                                </div>
                            </div>

                            {/* Col 2 */}
                            <div className="space-y-4">
                                <div>
                                    <span className="text-gray-500 text-xs block mb-0.5">Customer Name</span>
                                    <p className="font-bold text-gray-900">
                                        {customerName}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-gray-500 text-xs block mb-0.5">Shipping Address</span>
                                    <p className="font-medium text-gray-900 leading-relaxed text-xs">
                                        {shippingAddress}
                                    </p>
                                </div>
                            </div>

                            {/* Col 3 */}
                            <div className="space-y-4">
                                <div>
                                    <span className="text-gray-500 text-xs block mb-0.5">Payment Method</span>
                                    <p className="font-bold text-gray-900">
                                        {isAllCod
                                            ? "COD (Bayar di Tempat)"
                                            : firstOrder?.payment_channel
                                                ? firstOrder.payment_channel.toUpperCase()
                                                : "Bank Transfer / E-Wallet"}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-gray-500 text-xs block mb-0.5">Total Amount</span>
                                    <p className="font-extrabold text-base text-gray-900">
                                        {formatRupiah(totalSpent)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Multi-Order Stores Breakdown (If multiple stores) */}
                    {isMultiOrder && (
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider px-1 flex items-center gap-2">
                                <Layers className="w-4 h-4 text-[#006591]" />
                                <span>Daftar Pesanan per Toko ({ordersList.length})</span>
                            </h3>

                            {ordersList.map((ord, idx) => (
                                <div
                                    key={ord.id || idx}
                                    className="bg-white rounded-2xl p-5 shadow-xs border border-gray-100 flex flex-wrap items-center justify-between gap-3 hover:border-gray-200 transition"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gray-50 text-[#281B7A] flex items-center justify-center font-bold border border-gray-100">
                                            <Store className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 text-sm">
                                                {ord.store?.name || "Toko Mitra"}
                                            </h4>
                                            <p className="text-xs text-gray-400 font-mono">
                                                #{ord.invoice_number}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs sm:text-sm">
                                        <span className="font-bold text-gray-900">
                                            {formatRupiah(ord.total_amount)}
                                        </span>
                                        {ord.delivery_method === "local_delivery" && (
                                            <a
                                                href={`/tracker/${ord.invoice_number}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-1 text-xs font-bold text-[#006591] bg-sky-50 hover:bg-[#006591] hover:text-white px-3 py-1.5 rounded-xl transition"
                                            >
                                                <Truck className="w-3.5 h-3.5" />
                                                <span>Lacak</span>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Action Buttons: Lanjut Pesanan & Pantau Pesanan */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-2">
                        <Link
                            href={route("shop")}
                            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 bg-[#281B7A] hover:bg-[#1e145c] text-white font-bold rounded-xl transition shadow-md shadow-[#281B7A]/20 text-sm cursor-pointer"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Lanjut Pesanan
                        </Link>
                        <Link
                            href={route("history.index")}
                            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition shadow-xs text-sm cursor-pointer"
                        >
                            <Calendar className="w-4 h-4 mr-2" />
                            Pantau Pesanan
                        </Link>
                    </div>
                </div>
            </main>

            {/* Footer with #281B7A theme */}
            <Footer />
        </div>
    );
}

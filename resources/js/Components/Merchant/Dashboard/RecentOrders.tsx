import React from "react";
import { Link } from "@inertiajs/react";
import { Inbox } from "lucide-react";

interface Props {
    orders: any[];
}

export default function RecentOrders({ orders }: Props) {
    const getStatusStyle = (status: string) => {
        if (status === "Delivered" || status === "Selesai") {
            return "bg-emerald-50 text-emerald-700 border border-emerald-200/50";
        }
        if (status === "Cancelled" || status === "Dibatalkan") {
            return "bg-rose-50 text-rose-700 border border-rose-200/50";
        }
        return "bg-amber-50 text-amber-700 border border-amber-200/50";
    };

    return (
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-brand-orange/30 shadow-sm flex flex-col w-full max-w-full overflow-hidden mb-8">
            <div className="flex justify-between items-center mb-4 md:mb-6">
                <h3 className="text-base md:text-lg font-bold text-brand-orange">
                    Pesanan Terbaru
                </h3>
                <Link
                    href={route("merchant.orders.index")}
                    className="text-xs md:text-sm font-bold text-brand-orange hover:text-brand-orange-hover transition-colors"
                >
                    Lihat Semua
                </Link>
            </div>

            {/* Mobile View: Card List (No awkward horizontal scroll, clean UX) */}
            <div className="block md:hidden space-y-3">
                {orders && orders.length > 0 ? (
                    orders.map((order, index) => (
                        <div
                            key={order.id || order.invoice_number || index}
                            className="p-3.5 bg-gray-50/70 rounded-xl border border-gray-100 flex flex-col gap-2.5 transition-all hover:border-brand-orange/30"
                        >
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="w-8 h-8 rounded-full bg-brand-orange-tint text-brand-orange font-bold flex items-center justify-center text-xs shrink-0">
                                        {order.customer_name ? order.customer_name.charAt(0).toUpperCase() : "?"}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold text-gray-900 truncate">
                                            {order.customer_name}
                                        </p>
                                        <p className="text-[10px] text-gray-400 font-mono truncate">
                                            #{order.invoice_number}
                                        </p>
                                    </div>
                                </div>
                                <span
                                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${getStatusStyle(order.status)}`}
                                >
                                    {order.status}
                                </span>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-gray-100/90 gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                    <img
                                        src={order.product_image || "https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&q=80&w=400"}
                                        alt={order.product_name}
                                        className="w-8 h-8 rounded-lg border border-gray-200 object-cover shrink-0"
                                    />
                                    <p className="text-xs text-gray-700 font-medium truncate max-w-[160px]">
                                        {order.product_name}
                                    </p>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-xs font-bold text-brand-orange">
                                        {order.amount}
                                    </p>
                                    <p className="text-[10px] text-gray-400">
                                        {order.date}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-8 text-center flex flex-col items-center justify-center text-gray-400 gap-2">
                        <Inbox className="w-8 h-8 text-gray-300" />
                        <p className="text-xs font-medium">Belum ada pesanan masuk.</p>
                    </div>
                )}
            </div>

            {/* Desktop View: Full Table with hidden scrollbar */}
            <div className="hidden md:block overflow-x-auto no-scrollbar pb-2">
                <table className="w-full text-left border-collapse min-w-[550px]">
                    <thead>
                        <tr className="border-b border-gray-100">
                            <th className="pb-3 text-xs font-extrabold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                PELANGGAN
                            </th>
                            <th className="pb-3 text-xs font-extrabold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                PRODUK
                            </th>
                            <th className="pb-3 text-xs font-extrabold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                TANGGAL
                            </th>
                            <th className="pb-3 text-xs font-extrabold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                TOTAL
                            </th>
                            <th className="pb-3 text-xs font-extrabold text-gray-400 uppercase tracking-wider whitespace-nowrap text-right">
                                STATUS
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {orders && orders.length > 0 ? (
                            orders.map((order, index) => (
                                <tr
                                    key={order.id || order.invoice_number || index}
                                    className="hover:bg-gray-50/50 transition-colors"
                                >
                                    <td className="py-3 border-b border-gray-50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-brand-orange-tint text-brand-orange font-bold flex items-center justify-center text-xs shrink-0">
                                                {order.customer_name ? order.customer_name.charAt(0).toUpperCase() : "?"}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">
                                                    {order.customer_name}
                                                </p>
                                                <p className="text-xs text-gray-500 font-medium">
                                                    #{order.invoice_number}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3 border-b border-gray-50">
                                        <div className="flex items-center gap-2.5">
                                            <img
                                                src={order.product_image || "https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&q=80&w=400"}
                                                alt={order.product_name}
                                                className="w-8 h-8 rounded-lg border border-gray-100 object-cover shrink-0"
                                            />
                                            <p className="text-sm font-medium text-gray-700 truncate max-w-[200px]">
                                                {order.product_name}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="py-3 border-b border-gray-50">
                                        <p className="text-xs text-gray-500 font-medium">
                                            {order.date}
                                        </p>
                                    </td>
                                    <td className="py-3 border-b border-gray-50">
                                        <p className="text-sm font-bold text-brand-orange">
                                            {order.amount}
                                        </p>
                                    </td>
                                    <td className="py-3 border-b border-gray-50 text-right">
                                        <span
                                            className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getStatusStyle(order.status)}`}
                                        >
                                            {order.status}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="py-10 text-center">
                                    <div className="flex flex-col items-center justify-center text-gray-400 gap-2">
                                        <Inbox className="w-8 h-8 text-gray-300" />
                                        <p className="text-xs md:text-sm font-medium">
                                            Belum ada pesanan masuk.
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

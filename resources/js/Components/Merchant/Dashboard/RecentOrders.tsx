import React from "react";
import { Inbox } from "lucide-react";

interface Props {
    orders: any[];
}

export default function RecentOrders({ orders }: Props) {
    return (
        <div className="bg-white rounded-3xl p-5 md:p-6 border border-[#41B9C5]/30 shadow-sm flex flex-col w-full mb-8">
            <div className="flex justify-between items-center mb-4 md:mb-6">
                <h3 className="text-base md:text-lg font-bold text-gray-800">
                    Recent Orders
                </h3>
                <button className="text-xs md:text-sm font-bold text-[#41B9C5] hover:text-[#004F54] transition-colors">
                    View All
                </button>
            </div>

            <div className="overflow-x-auto pb-2 -mx-5 px-5 md:mx-0 md:px-0">
                <table className="w-full text-left border-collapse min-w-150">
                    <thead>
                        <tr className="border-b border-gray-100">
                            <th className="pb-3 text-[10px] md:text-xs font-extrabold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                CUSTOMER
                            </th>
                            <th className="pb-3 text-[10px] md:text-xs font-extrabold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                PRODUCT
                            </th>
                            <th className="pb-3 text-[10px] md:text-xs font-extrabold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                DATE
                            </th>
                            <th className="pb-3 text-[10px] md:text-xs font-extrabold text-gray-400 uppercase tracking-wider whitespace-nowrap text-right md:text-left">
                                AMOUNT
                            </th>
                            <th className="pb-3 text-[10px] md:text-xs font-extrabold text-gray-400 uppercase tracking-wider whitespace-nowrap text-right">
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
                                    <td className="py-3 px-5 md:px-0 border-b border-gray-50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-brand-blue-tint text-brand-blue font-bold flex items-center justify-center text-xs shrink-0">
                                                {order.customer_name ? order.customer_name.charAt(0).toUpperCase() : "?"}
                                            </div>
                                            <div>
                                                <p className="text-xs md:text-sm font-bold text-gray-900">
                                                    {order.customer_name}
                                                </p>
                                                <p className="text-[10px] md:text-xs text-gray-500 font-medium truncate max-w-25 md:max-w-none">
                                                    #{order.invoice_number}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3 px-5 md:px-0 border-b border-gray-50">
                                        <div className="flex items-center gap-2">
                                            <img
                                                src={order.product_image || "https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&q=80&w=400"}
                                                alt="product"
                                                className="w-8 h-8 rounded border border-gray-100 object-cover"
                                            />
                                            <p className="text-xs md:text-sm font-medium text-gray-700 truncate max-w-25 md:max-w-none">
                                                {order.product_name}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="py-3 px-5 md:px-0 border-b border-gray-50">
                                        <p className="text-xs md:text-sm text-gray-500">
                                            {order.date}
                                        </p>
                                    </td>
                                    <td className="py-3 px-5 md:px-0 border-b border-gray-50 text-right md:text-left">
                                        <p className="text-xs md:text-sm font-bold text-gray-900">
                                            {order.amount}
                                        </p>
                                    </td>
                                    <td className="py-3 px-5 md:px-0 border-b border-gray-50 text-right">
                                        <span
                                            className={`inline-block px-2 md:px-3 py-1 rounded-full text-[10px] md:text-xs font-bold ${
                                                order.status === "Delivered" || order.status === "Selesai"
                                                    ? "bg-[#EAF7F7] text-[#245D56]"
                                                    : order.status === "Cancelled" || order.status === "Dibatalkan"
                                                    ? "bg-red-50 text-red-600"
                                                    : "bg-blue-50 text-blue-600"
                                            }`}
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

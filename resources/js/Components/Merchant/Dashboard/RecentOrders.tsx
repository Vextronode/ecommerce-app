import React from "react";

export default function RecentOrders() {
    const orders = [
        {
            customerName: "Santi",
            customerInitial: "S",
            product: "Udang Besar (2kg)",
            date: "Today, 10:42 AM",
            amount: "Rp 240,000",
            status: "COMPLETED",
            statusColor: "bg-green-100 text-green-700",
            avatarColor: "bg-[#F0FAFB] text-[#41B9C5]",
        },
        {
            customerName: "Joni",
            customerInitial: "J",
            product: "Tuna (1.5kg)",
            date: "Today, 09:15 AM",
            amount: "Rp 127,500",
            status: "PROCESSING",
            statusColor: "bg-blue-100 text-blue-700",
            avatarColor: "bg-[#41B9C5] text-white",
        },
        {
            customerName: "Budi",
            customerInitial: "B",
            product: "Alpukat (3kg)",
            date: "Yesterday, 14:20 PM",
            amount: "Rp 135,000",
            status: "PENDING",
            statusColor: "bg-orange-100 text-orange-700",
            avatarColor: "bg-gray-100 text-gray-600",
        },
    ];

    return (
        <div className="bg-white rounded-3xl p-6 border border-[#41B9C5]/30 shadow-sm flex flex-col w-full mb-8">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-800">
                    Recent Orders
                </h3>
                <button className="text-sm font-bold text-[#41B9C5] hover:text-[#004F54] transition-colors">
                    View All
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-gray-100">
                            <th className="pb-3 text-xs font-extrabold text-gray-400 tracking-wider">
                                CUSTOMER
                            </th>
                            <th className="pb-3 text-xs font-extrabold text-gray-400 tracking-wider">
                                PRODUCT
                            </th>
                            <th className="pb-3 text-xs font-extrabold text-gray-400 tracking-wider">
                                DATE
                            </th>
                            <th className="pb-3 text-xs font-extrabold text-gray-400 tracking-wider">
                                AMOUNT
                            </th>
                            <th className="pb-3 text-xs font-extrabold text-gray-400 tracking-wider">
                                STATUS
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {orders.map((order, index) => (
                            <tr
                                key={index}
                                className="hover:bg-gray-50/50 transition-colors group"
                            >
                                <td className="py-4">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${order.avatarColor}`}
                                        >
                                            {order.customerInitial}
                                        </div>
                                        <span className="text-sm font-bold text-[#004F54]">
                                            {order.customerName}
                                        </span>
                                    </div>
                                </td>
                                <td className="py-4">
                                    <span className="text-sm text-gray-600 font-medium">
                                        {order.product}
                                    </span>
                                </td>
                                <td className="py-4">
                                    <span className="text-sm text-gray-500 font-medium">
                                        {order.date}
                                    </span>
                                </td>
                                <td className="py-4">
                                    <span className="text-sm font-bold text-gray-800">
                                        {order.amount}
                                    </span>
                                </td>
                                <td className="py-4">
                                    <span
                                        className={`px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wide ${order.statusColor}`}
                                    >
                                        {order.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

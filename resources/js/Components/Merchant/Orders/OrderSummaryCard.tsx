import React from "react";
import { ShoppingBag, Truck, Wallet } from "lucide-react";

export default function OrderSummaryCard({ stats }: { stats: any }) {
    const summaryData = [
        {
            label: "TOTAL ORDERS",
            value: stats?.totalOrders || 0,
            icon: ShoppingBag,
            color: "text-[#41B9C5]",
            bg: "bg-[#EAF7F7]",
        },
        {
            label: "PENDING PENGIRIMAN",
            value: stats?.pendingShipping || 0,
            icon: Truck,
            color: "text-orange-400",
            bg: "bg-orange-50",
        },
        {
            label: "MENUNGGU PAYMENT",
            value: stats?.pendingPayment || 0,
            icon: Wallet,
            color: "text-slate-500",
            bg: "bg-slate-100",
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {summaryData.map((stat, i) => (
                <div
                    key={i}
                    className="bg-white rounded-[20px] p-6 border border-[#41B9C5]/20 shadow-sm flex items-center gap-5"
                >
                    <div
                        className={`w-12 h-12 rounded-full ${stat.bg} flex items-center justify-center ${stat.color} shrink-0`}
                    >
                        <stat.icon className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                            {stat.label}
                        </p>
                        <h3 className="text-2xl font-bold text-[#14433D]">
                            {stat.value}
                        </h3>
                    </div>
                </div>
            ))}
        </div>
    );
}

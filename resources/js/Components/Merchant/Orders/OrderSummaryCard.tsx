import React from "react";
import { ShoppingBag, Truck, Wallet } from "lucide-react";

export default function OrderSummaryCard({ stats }: { stats: any }) {
    const summaryData = [
        {
            label: "TOTAL PESANAN",
            value: stats?.totalOrders || 0,
            icon: ShoppingBag,
            color: "text-teal-600",
            bg: "bg-teal-50",
        },
        {
            label: "PERLU DIKIRIM",
            value: stats?.pendingShipping || 0,
            icon: Truck,
            color: "text-brand-orange",
            bg: "bg-brand-orange-tint",
        },
        {
            label: "MENUNGGU PEMBAYARAN",
            value: stats?.pendingPayment || 0,
            icon: Wallet,
            color: "text-slate-600",
            bg: "bg-slate-100",
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
            {summaryData.map((stat, i) => (
                <div
                    key={i}
                    className="bg-white rounded-3xl p-5 md:p-6 border border-brand-orange/30 shadow-sm flex items-center gap-4 md:gap-5"
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
                        <h3 className="text-2xl md:text-3xl font-extrabold text-brand-orange">
                            {stat.value?.toLocaleString("id-ID") || 0}
                        </h3>
                    </div>
                </div>
            ))}
        </div>
    );
}

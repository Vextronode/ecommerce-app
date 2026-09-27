import React from "react";
import { formatRupiah } from "@/utils/formatters";
import {
    Banknote,
    ShoppingBag,
    Users,
    Package,
    TrendingUp,
} from "lucide-react";

interface Props {
    statsData: {
        sales: number;
        orders: number;
        customers: number;
        products: number;
    };
}

export default function StatCards({ statsData }: Props) {
    const stats = [
        {
            title: "Total Penjualan",
            // format uang (Rp)
            value: formatRupiah(statsData.sales),
            trend: "+12%",
            icon: <Banknote className="w-6 h-6 text-[#245D56]" />,
        },
        {
            title: "Total Pesanan",
            value: statsData.orders.toString(),
            trend: "+16%",
            icon: <ShoppingBag className="w-6 h-6 text-[#245D56]" />,
        },
        {
            title: "Total Pelanggan",
            value: statsData.customers.toString(),
            trend: "+8%",
            icon: <Users className="w-6 h-6 text-[#245D56]" />,
        },
        {
            title: "Total Produk",
            value: statsData.products.toString(),
            trend: "+5%",
            icon: <Package className="w-6 h-6 text-[#245D56]" />,
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-4 md:mb-6">
            {stats.map((stat, index) => (
                <div
                    key={stat.title}
                    className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-brand-orange/30 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow max-w-full overflow-hidden"
                >
                    <div className="flex justify-between items-start mb-6">
                        <div className="w-12 h-12 bg-[#EAF7F7] rounded-full flex items-center justify-center">
                            {stat.icon}
                        </div>
                        <span className="bg-brand-orange text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm shadow-brand-orange/30">
                            <TrendingUp className="w-3.5 h-3.5" />
                            {stat.trend}
                        </span>
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm font-medium mb-1">
                            {stat.title}
                        </p>
                        <h3 className="text-3xl font-extrabold text-brand-orange tracking-tight">
                            {stat.value}
                        </h3>
                    </div>
                </div>
            ))}
        </div>
    );
}

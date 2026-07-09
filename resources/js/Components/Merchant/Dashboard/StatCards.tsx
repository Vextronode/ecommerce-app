import React from "react";
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
            value: new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                maximumFractionDigits: 0,
            }).format(statsData.sales),
            trend: "+0%",
            icon: <Banknote className="w-6 h-6 text-[#41B9C5]" />,
        },
        {
            title: "Total Pesanan",
            value: statsData.orders.toString(),
            trend: "+0%",
            icon: <ShoppingBag className="w-6 h-6 text-[#41B9C5]" />,
        },
        {
            title: "Total Konsumen",
            value: statsData.customers.toString(),
            trend: "+0%",
            icon: <Users className="w-6 h-6 text-[#41B9C5]" />,
        },
        {
            title: "Total Produk",
            value: statsData.products.toString(),
            trend: "+0%",
            icon: <Package className="w-6 h-6 text-[#41B9C5]" />,
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-4 md:mb-6">
            {stats.map((stat, index) => (
                <div
                    key={index}
                    className="bg-white rounded-3xl p-6 border border-[#41B9C5]/30 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                    <div className="flex justify-between items-start mb-6">
                        <div className="w-12 h-12 bg-[#F0FAFB] rounded-full flex items-center justify-center">
                            {stat.icon}
                        </div>
                        <span className="bg-[#41B9C5] text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm shadow-[#41B9C5]/30">
                            <TrendingUp className="w-3.5 h-3.5" />
                            {stat.trend}
                        </span>
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm font-medium mb-1">
                            {stat.title}
                        </p>
                        <h3 className="text-3xl font-extrabold text-[#004F54] tracking-tight">
                            {stat.value}
                        </h3>
                    </div>
                </div>
            ))}
        </div>
    );
}

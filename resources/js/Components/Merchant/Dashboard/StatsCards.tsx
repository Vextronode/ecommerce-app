import React from "react";
import {
    Banknote,
    ShoppingBag,
    Users,
    Package,
    TrendingUp,
} from "lucide-react";

export default function StatCards() {
    const stats = [
        {
            title: "Total Penjualan",
            value: "Rp 125M",
            trend: "+12%",
            icon: <Banknote className="w-6 h-6 text-[#41B9C5]" />,
        },
        {
            title: "Total Pesanan",
            value: "245",
            trend: "+18%",
            icon: <ShoppingBag className="w-6 h-6 text-[#41B9C5]" />,
        },
        {
            title: "Total Konsumen",
            value: "1.5k",
            trend: "+8%",
            icon: <Users className="w-6 h-6 text-[#41B9C5]" />,
        },
        {
            title: "Total Produk",
            value: "890",
            trend: "+5%",
            icon: <Package className="w-6 h-6 text-[#41B9C5]" />,
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
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

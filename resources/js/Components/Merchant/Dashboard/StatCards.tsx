import React from "react";
import { formatRupiah } from "@/utils/formatters";
import {
    Banknote,
    ShoppingBag,
    Users,
    Package,
    TrendingUp,
    TrendingDown,
    Minus,
} from "lucide-react";

interface Props {
    statsData: {
        sales: number;
        orders: number;
        customers: number;
        products: number;
        sales_growth?: number;
        orders_growth?: number;
        customers_growth?: number;
        products_growth?: number;
    };
}

export default function StatCards({ statsData }: Props) {
    const stats = [
        {
            title: "Total Penjualan",
            value: formatRupiah(statsData.sales),
            growth: statsData.sales_growth ?? 0,
            icon: <Banknote className="w-6 h-6 text-[#245D56]" />,
        },
        {
            title: "Total Pesanan",
            value: statsData.orders.toString(),
            growth: statsData.orders_growth ?? 0,
            icon: <ShoppingBag className="w-6 h-6 text-[#245D56]" />,
        },
        {
            title: "Total Pelanggan",
            value: statsData.customers.toString(),
            growth: statsData.customers_growth ?? 0,
            icon: <Users className="w-6 h-6 text-[#245D56]" />,
        },
        {
            title: "Total Produk",
            value: statsData.products.toString(),
            growth: statsData.products_growth ?? 0,
            icon: <Package className="w-6 h-6 text-[#245D56]" />,
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-4 md:mb-6">
            {stats.map((stat) => {
                const growth = stat.growth;
                const isZero = Math.abs(growth) < 0.01;
                const isPositive = growth > 0;

                return (
                    <div
                        key={stat.title}
                        className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-brand-orange/30 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow max-w-full overflow-hidden"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-12 h-12 bg-[#EAF7F7] rounded-full flex items-center justify-center">
                                {stat.icon}
                            </div>
                            <span
                                className={`text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-2xs transition-colors ${
                                    isZero
                                        ? "bg-slate-100 text-slate-500 border border-slate-200/80"
                                        : isPositive
                                          ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                                          : "bg-rose-50 text-rose-500 border border-rose-200"
                                }`}
                                title={
                                    isZero
                                        ? "Tidak ada perubahan dibanding bulan lalu"
                                        : `${isPositive ? "+" : ""}${growth}% dibanding bulan lalu`
                                }
                            >
                                {isZero ? (
                                    <>
                                        <Minus className="w-3.5 h-3.5" />
                                        <span>0%</span>
                                    </>
                                ) : isPositive ? (
                                    <>
                                        <TrendingUp className="w-3.5 h-3.5" />
                                        <span>+{growth}%</span>
                                    </>
                                ) : (
                                    <>
                                        <TrendingDown className="w-3.5 h-3.5" />
                                        <span>{growth}%</span>
                                    </>
                                )}
                            </span>
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <p className="text-gray-500 text-sm font-medium">
                                    {stat.title}
                                </p>
                                <span className="text-[11px] text-gray-400">
                                    vs bln lalu
                                </span>
                            </div>
                            <h3 className="text-3xl font-extrabold text-brand-orange tracking-tight">
                                {stat.value}
                            </h3>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

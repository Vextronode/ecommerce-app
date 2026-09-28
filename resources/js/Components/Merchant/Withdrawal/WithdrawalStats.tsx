import React from "react";
import { Wallet, ArrowUpRight, TrendingUp } from "lucide-react";
import { formatRupiah } from "@/utils/formatters";

interface StatsProps {
    availableBalance: number;
    pendingBalance: number;
    totalWithdrawn: number;
    totalEarnings: number;
}

export default function WithdrawalStats({
    availableBalance,
    pendingBalance,
    totalWithdrawn,
    totalEarnings,
}: StatsProps) {
    const stats = [
        {
            title: "Saldo Siap Ditarik",
            value: formatRupiah(availableBalance),
            subtitle: "* Tersedia di Available Balance",
            icon: <Wallet className="w-6 h-6 text-brand-orange" />,
            badgeBg: "bg-emerald-50 text-emerald-600 border-emerald-200/50",
            badgeText: "Aktif",
        },
        {
            title: "Saldo Tertahan (Escrow)",
            value: formatRupiah(pendingBalance),
            subtitle: "* Cair setelah pesanan selesai",
            icon: <Wallet className="w-6 h-6 text-amber-500" />,
            badgeBg: "bg-amber-50 text-amber-600 border-amber-200/50",
            badgeText: "Ditahan",
        },
        {
            title: "Total Saldo Ditarik",
            value: formatRupiah(totalWithdrawn),
            subtitle: "Akumulasi pencairan sukses",
            icon: <ArrowUpRight className="w-6 h-6 text-brand-orange" />,
            badgeBg: "bg-emerald-50 text-emerald-600 border-emerald-200/50",
            badgeText: "Sukses",
        },
        {
            title: "Total Penjualan",
            value: formatRupiah(totalEarnings),
            subtitle: "Total pendapatan kotor",
            icon: <TrendingUp className="w-6 h-6 text-brand-orange" />,
            badgeBg: "bg-emerald-50 text-emerald-600 border-emerald-200/50",
            badgeText: "Kotor",
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
            {stats.map((stat) => (
                <div
                    key={stat.title}
                    className="bg-white rounded-2xl p-5 md:p-6 border border-brand-orange/20 shadow-sm flex flex-col justify-between hover:shadow-md transition-all"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-brand-orange-tint rounded-xl flex items-center justify-center">
                            {stat.icon}
                        </div>
                        <span className={`${stat.badgeBg} text-xs font-bold px-3 py-1 rounded-full border shadow-xs flex items-center gap-1`}>
                            {stat.badgeText}
                        </span>
                    </div>
                    <div>
                        <p className="text-gray-500 text-xs md:text-sm font-medium mb-1">
                            {stat.title}
                        </p>
                        <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900">
                            {stat.value}
                        </h3>
                        <p className="text-xs text-gray-400 mt-1.5 font-medium">
                            {stat.subtitle}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}

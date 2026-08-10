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
            icon: <Wallet className="w-6 h-6 text-[#41B9C5]" />,
            badgeBg: "bg-[#EAF7F7]",
        },
        {
            title: "Saldo Tertahan (Escrow)",
            value: formatRupiah(pendingBalance),
            subtitle: "* Cair setelah pesanan selesai",
            icon: <Wallet className="w-6 h-6 text-[#F59E0B]" />,
            badgeBg: "bg-[#FEF3C7]",
            badgeText: "Ditahan",
        },
        {
            title: "Total Saldo Ditarik",
            value: formatRupiah(totalWithdrawn),
            subtitle: "Akumulasi pencairan sukses",
            icon: <ArrowUpRight className="w-6 h-6 text-[#41B9C5]" />,
            badgeBg: "bg-[#EAF7F7]",
        },
        {
            title: "Total Penjualan",
            value: formatRupiah(totalEarnings),
            subtitle: "Total pendapatan kotor",
            icon: <TrendingUp className="w-6 h-6 text-[#41B9C5]" />,
            badgeBg: "bg-[#EAF7F7]",
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
            {stats.map((stat, index) => (
                <div
                    key={stat.title}
                    className="bg-white rounded-3xl p-6 border border-[#41B9C5]/30 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                    <div className="flex justify-between items-start mb-6">
                        <div className="w-12 h-12 bg-[#F0FAFB] rounded-full flex items-center justify-center">
                            {stat.icon}
                        </div>
                        <span className={`${stat.badgeBg} ${stat.badgeText === 'Ditahan' ? 'text-[#D97706]' : 'text-[#41B9C5]'} text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm`}>
                            {stat.badgeText || "Aktif"}
                        </span>
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm font-medium mb-1">
                            {stat.title}
                        </p>
                        <h3 className={`text-2xl md:text-3xl font-extrabold tracking-tight ${stat.badgeText === 'Ditahan' ? 'text-[#D97706]' : 'text-[#004F54]'}`}>
                            {stat.value}
                        </h3>
                        <p className="text-[11px] text-gray-400 mt-2 font-medium">
                            {stat.subtitle}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}

import React from "react";
import { Wallet, ArrowUpRight, TrendingUp } from "lucide-react";

interface StatsProps {
    availableBalance: number;
    totalWithdrawn: number;
    totalEarnings: number;
}

export default function WithdrawalStats({
    availableBalance,
    totalWithdrawn,
    totalEarnings,
}: StatsProps) {
    const formatRupiah = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const stats = [
        {
            title: "Saldo Siap Ditarik",
            value: formatRupiah(availableBalance),
            subtitle: "* Saldo terisi setelah pesanan selesai",
            icon: <Wallet className="w-6 h-6 text-[#41B9C5]" />,
            badgeBg: "bg-[#EAF7F7]",
        },
        {
            title: "Total Saldo Ditarik",
            value: formatRupiah(totalWithdrawn),
            subtitle: "Akumulasi pencairan dana sukses",
            icon: <ArrowUpRight className="w-6 h-6 text-[#41B9C5]" />,
            badgeBg: "bg-[#EAF7F7]",
        },
        {
            title: "Total Penjualan Selesai",
            value: formatRupiah(totalEarnings),
            subtitle: "Total pendapatan kotor pesanan",
            icon: <TrendingUp className="w-6 h-6 text-[#41B9C5]" />,
            badgeBg: "bg-[#EAF7F7]",
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-6">
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
                            Aktif
                        </span>
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm font-medium mb-1">
                            {stat.title}
                        </p>
                        <h3 className="text-2xl md:text-3xl font-extrabold text-[#004F54] tracking-tight">
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

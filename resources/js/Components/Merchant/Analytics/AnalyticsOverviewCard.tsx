import React from 'react';
import { formatRupiah, formatNumberId, formatNumberEn } from "@/utils/formatters";
import { LucideIcon } from 'lucide-react';

interface AnalyticsOverviewCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    growth?: number;
    isPositive?: boolean;
    isCurrency?: boolean;
}

export default function AnalyticsOverviewCard({ 
    title, 
    value, 
    icon: Icon, 
    growth, 
    isPositive = true,
    isCurrency = false
}: AnalyticsOverviewCardProps) {
    const formattedValue = isCurrency 
        ? `Rp. ${formatNumberId(Number(value))}` 
        : (typeof value === 'number' ? formatNumberEn(value) : value);

    return (
        <div className="bg-white rounded-[20px] border border-[#41B9C5]/20 p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div className="z-10 relative">
                <div className="flex justify-between items-start mb-2">
                    <div className="p-3 rounded-lg bg-[#EAF7F7] text-[#41B9C5]">
                        <Icon className="w-5 h-5" />
                    </div>
                    {growth !== undefined && (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isPositive ? 'bg-teal-50 text-[#41B9C5]' : 'bg-orange-50 text-orange-500'}`}>
                            {isPositive ? '↗ +' : '↘ '}{Math.abs(growth)}%
                        </span>
                    )}
                </div>

                <div className="mt-4">
                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{title}</h3>
                    <p className="text-2xl font-bold text-[#14433D]">
                        {formattedValue}{title === 'RATING SHOP' ? '%' : ''}
                    </p>
                </div>
            </div>
        </div>
    );
}

import React from 'react';
import { formatNumberId, formatNumberEn } from "@/utils/formatters";
import { LucideIcon } from 'lucide-react';

interface AnalyticsOverviewCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    growth?: number;
    isPositive?: boolean;
    isCurrency?: boolean;
    iconTheme?: 'teal' | 'emerald' | 'blue' | 'orange';
}

export default function AnalyticsOverviewCard({ 
    title, 
    value, 
    icon: Icon, 
    growth, 
    isPositive,
    isCurrency = false,
    iconTheme = 'teal',
}: AnalyticsOverviewCardProps) {
    const formattedValue = isCurrency 
        ? `Rp. ${formatNumberId(Number(value))}` 
        : (typeof value === 'number' ? formatNumberEn(value) : value);

    // Auto calculate isPositive if not explicitly provided
    const positiveStatus = isPositive !== undefined ? isPositive : (growth !== undefined ? growth > 0 : true);
    const isZero = growth !== undefined && Math.abs(growth) < 0.01;

    const themeStyles = {
        teal: 'bg-[#EAF7F7] text-[#41B9C5]',
        emerald: 'bg-[#E8F8F5] text-[#10B981]',
        blue: 'bg-[#E0F2FE] text-[#0284C7]',
        orange: 'bg-brand-orange-tint text-brand-orange',
    };

    return (
        <div className="bg-white rounded-2xl border border-brand-orange/20 p-5 md:p-6 shadow-sm flex flex-col justify-between relative overflow-hidden transition-all duration-200 hover:shadow-md hover:border-brand-orange/40">
            <div className="z-10 relative">
                <div className="flex justify-between items-start mb-3">
                    <div className={`p-3 rounded-xl ${themeStyles[iconTheme]} transition-colors`}>
                        <Icon className="w-5 h-5" />
                    </div>
                    {growth !== undefined && (
                        <span 
                            className={`text-xs font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 ${
                                isZero 
                                    ? 'bg-amber-50 text-amber-600'
                                    : positiveStatus 
                                        ? 'bg-emerald-50 text-emerald-600' 
                                        : 'bg-rose-50 text-rose-500'
                            }`}
                        >
                            {isZero ? '→ ' : positiveStatus ? '↗ +' : '↘ -'}{Math.abs(growth)}%
                        </span>
                    )}
                </div>

                <div className="mt-2">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">{title}</h3>
                    <p className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
                        {formattedValue}{title.toUpperCase().includes('RATING') ? '%' : ''}
                    </p>
                </div>
            </div>
        </div>
    );
}

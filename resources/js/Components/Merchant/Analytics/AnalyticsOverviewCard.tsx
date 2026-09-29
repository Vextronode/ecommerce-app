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
    isRating?: boolean;
    reviewsCount?: number;
    iconTheme?: 'teal' | 'emerald' | 'blue' | 'orange' | 'amber';
}

export default function AnalyticsOverviewCard({ 
    title, 
    value, 
    icon: Icon, 
    growth, 
    isPositive,
    isCurrency = false,
    isRating = false,
    reviewsCount,
    iconTheme = 'teal',
}: AnalyticsOverviewCardProps) {
    const isRatingCard = isRating || title.toUpperCase().includes('RATING');

    let formattedValue: React.ReactNode;
    if (isCurrency) {
        formattedValue = `Rp. ${formatNumberId(Number(value))}`;
    } else if (isRatingCard) {
        const numVal = typeof value === 'number' ? value : parseFloat(String(value)) || 0;
        formattedValue = (
            <span className="flex items-baseline gap-1.5">
                <span>{numVal > 0 ? numVal.toFixed(1) : '0.0'}</span>
                <span className="text-xs md:text-sm font-semibold text-gray-400">/ 5.0</span>
            </span>
        );
    } else {
        formattedValue = typeof value === 'number' ? formatNumberEn(value) : value;
    }

    // Auto calculate isPositive if not explicitly provided
    const positiveStatus = isPositive !== undefined ? isPositive : (growth !== undefined ? growth > 0 : true);
    const isZero = growth !== undefined && Math.abs(growth) < 0.01;

    const themeStyles = {
        teal: 'bg-[#EAF7F7] text-[#41B9C5]',
        emerald: 'bg-[#E8F8F5] text-[#10B981]',
        blue: 'bg-[#E0F2FE] text-[#0284C7]',
        orange: 'bg-brand-orange-tint text-brand-orange',
        amber: 'bg-amber-50 text-amber-500',
    };

    return (
        <div className="bg-white rounded-2xl border border-brand-orange/20 p-5 md:p-6 shadow-sm flex flex-col justify-between relative overflow-hidden transition-all duration-200 hover:shadow-md hover:border-brand-orange/40">
            <div className="z-10 relative">
                <div className="flex justify-between items-start mb-3">
                    <div className={`p-3 rounded-xl ${themeStyles[iconTheme]} transition-colors`}>
                        <Icon className="w-5 h-5" />
                    </div>
                    {isRatingCard && (reviewsCount === undefined || reviewsCount === 0) ? (
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200/80">
                            0 Ulasan
                        </span>
                    ) : growth !== undefined && (
                        <span 
                            className={`text-xs font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 ${
                                isZero 
                                    ? 'bg-slate-100 text-slate-500 border border-slate-200/80'
                                    : positiveStatus 
                                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                                        : 'bg-rose-50 text-rose-500 border border-rose-200'
                            }`}
                        >
                            {isZero ? '→ ' : positiveStatus ? '↗ +' : '↘ -'}{Math.abs(growth)}%
                        </span>
                    )}
                </div>

                <div className="mt-2">
                    <div className="flex items-center justify-between mb-1.5">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">{title}</h3>
                        {isRatingCard && reviewsCount !== undefined && reviewsCount > 0 && (
                            <span className="text-[11px] text-gray-400 font-medium">({reviewsCount} ulasan)</span>
                        )}
                    </div>
                    <div className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
                        {formattedValue}
                    </div>
                </div>
            </div>
        </div>
    );
}

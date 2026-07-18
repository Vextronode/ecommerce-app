import React from 'react';
import { Users, UserPlus } from 'lucide-react';

interface CustomerStatsCardProps {
    title: string;
    value: number;
    growth: number;
    type: 'total' | 'new';
}

export default function CustomerStatsCard({ title, value, growth, type }: CustomerStatsCardProps) {
    const isPositive = growth >= 0;

    return (
        <div className="bg-white rounded-[20px] border border-[#41B9C5]/20 p-6 shadow-sm flex flex-col justify-between relative overflow-hidden h-48">
            <div className="z-10 relative">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h3 className="text-sm font-bold text-gray-700 mb-1">{title}</h3>
                        <p className="text-3xl font-bold text-[#41B9C5]">
                            {new Intl.NumberFormat('en-US').format(value)}
                        </p>
                    </div>
                    <div className="p-3 rounded-lg bg-[#EAF7F7] text-[#41B9C5]">
                        {type === 'total' ? <Users className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                    </div>
                </div>

                <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${isPositive ? 'bg-teal-50 text-[#41B9C5]' : 'bg-red-50 text-red-500'}`}>
                        {isPositive ? '↗ +' : '↘ '}{Math.abs(growth)}%
                    </span>
                    <span className="text-xs text-gray-500 font-medium">vs last month</span>
                </div>
                

            </div>

            {type === 'total' && (
                <div className="absolute bottom-0 left-0 right-0 h-24 flex items-end pointer-events-none z-0">
                    <svg viewBox="0 0 200 60" preserveAspectRatio="none" className="w-full h-full">
                        <defs>
                            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#41B9C5" stopOpacity="0.3" />
                                <stop offset="100%" stopColor="#41B9C5" stopOpacity="0.0" />
                            </linearGradient>
                        </defs>
                        <path 
                            d="M0,50 C40,40 60,20 100,30 C140,40 160,10 200,5 L200,60 L0,60 Z" 
                            fill="url(#chartGradient)" 
                        />
                        <path 
                            d="M0,50 C40,40 60,20 100,30 C140,40 160,10 200,5" 
                            fill="none" 
                            stroke="#41B9C5" 
                            strokeWidth="3"
                            strokeLinecap="round" 
                        />
                    </svg>
                </div>
            )}
        </div>
    );
}

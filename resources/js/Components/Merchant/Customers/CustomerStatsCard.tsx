import React from 'react';
import { formatRupiah, formatNumberId, formatNumberEn } from "@/utils/formatters";
import { Users, UserPlus } from 'lucide-react';

interface CustomerStatsCardProps {
    title: string;
    value: number;
    growth: number;
    type: 'total' | 'new';
    chartData?: number[];
}

export default function CustomerStatsCard({ title, value, growth, type, chartData }: CustomerStatsCardProps) {
    const isPositive = growth > 0;
    const isNegative = growth < 0;

    // Render grafik real pelanggan bulan ini
    const renderRealChart = () => {
        if (!chartData || chartData.length === 0) return null;

        const max = Math.max(...chartData);

        // Jika tidak ada data sama sekali atau semua 0 (garis rata)
        if (max === 0) {
            return (
                <div className="absolute bottom-4 left-0 right-0 h-4 flex items-center pointer-events-none z-0 px-6">
                    <svg viewBox="0 0 200 10" preserveAspectRatio="none" className="w-full h-full">
                        <line
                            x1="0"
                            y1="5"
                            x2="200"
                            y2="5"
                            stroke="#E5E7EB"
                            strokeWidth="2"
                            strokeDasharray="4 4"
                        />
                    </svg>
                </div>
            );
        }

        const n = chartData.length;
        const width = 200;
        const minY = 12;
        const maxY = 52;
        const usableHeight = maxY - minY;

        const points = chartData.map((val, idx) => {
            const x = (idx / (n - 1)) * width;
            const y = maxY - (val / max) * usableHeight;
            return { x, y };
        });

        // Smooth cubic Bézier curve
        let linePath = `M ${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}`;
        for (let i = 0; i < points.length - 1; i++) {
            const p0 = points[i];
            const p1 = points[i + 1];
            const cp1x = p0.x + (p1.x - p0.x) / 2;
            const cp1y = p0.y;
            const cp2x = p0.x + (p1.x - p0.x) / 2;
            const cp2y = p1.y;
            linePath += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p1.x.toFixed(1)},${p1.y.toFixed(1)}`;
        }

        const areaPath = `${linePath} L 200,60 L 0,60 Z`;

        return (
            <div className="absolute bottom-0 left-0 right-0 h-24 flex items-end pointer-events-none z-0">
                <svg viewBox="0 0 200 60" preserveAspectRatio="none" className="w-full h-full">
                    <defs>
                        <linearGradient id="customerRealGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#ED7218" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#ED7218" stopOpacity="0.0" />
                        </linearGradient>
                    </defs>
                    <path d={areaPath} fill="url(#customerRealGradient)" />
                    <path
                        d={linePath}
                        fill="none"
                        stroke="#ED7218"
                        strokeWidth="3"
                        strokeLinecap="round"
                    />
                </svg>
            </div>
        );
    };

    return (
        <div className="bg-white rounded-3xl border border-brand-orange/30 p-6 shadow-sm flex flex-col justify-between relative overflow-hidden h-48">
            <div className="z-10 relative">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-500 mb-1">{title}</h3>
                        <p className="text-3xl font-extrabold text-brand-orange">
                            {formatNumberEn(value)}
                        </p>
                    </div>
                    <div className="p-3 rounded-2xl bg-teal-50 text-teal-600 shrink-0">
                        {type === 'total' ? <Users className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                    </div>
                </div>

                <div className="flex items-center gap-2 mb-2">
                    <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-md inline-flex items-center gap-0.5 ${
                            isPositive
                                ? 'bg-teal-50 text-teal-600'
                                : isNegative
                                    ? 'bg-red-50 text-red-500'
                                    : 'bg-gray-100 text-gray-600'
                        }`}
                    >
                        {isPositive && `↗ +${growth}%`}
                        {isNegative && `↘ ${growth}%`}
                        {!isPositive && !isNegative && `0%`}
                    </span>
                    <span className="text-xs text-gray-500 font-medium">vs bulan lalu</span>
                </div>
            </div>

            {type === 'total' && renderRealChart()}

            {type === 'new' && (
                <div className="z-10 relative mt-auto">
                    <p className="text-xs text-gray-400 font-medium">
                        Akun baru terdaftar bulan ini
                    </p>
                </div>
            )}
        </div>
    );
}

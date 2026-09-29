import React, { useState } from "react";
// eslint-disable-next-line react-doctor/prefer-dynamic-import
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { BarChart3 } from "lucide-react";

interface Props {
    chartData: any[];
    monthlyChartData?: any[];
}

export default function SalesChart({ chartData, monthlyChartData = [] }: Props) {
    const [period, setPeriod] = useState<"weekly" | "monthly">("weekly");

    const isWeekly = period === "weekly";
    const hasWeeklyData =
        Boolean(chartData) &&
        chartData.some(
            (d) =>
                (d.minggu1 || 0) > 0 ||
                (d.minggu2 || 0) > 0 ||
                (d.minggu3 || 0) > 0
        );
    const hasMonthlyData =
        Boolean(monthlyChartData) &&
        monthlyChartData.some((d) => (d.sales || 0) > 0);
    const hasData = isWeekly ? hasWeeklyData : hasMonthlyData;

    const hasMinggu1Data =
        Boolean(chartData) && chartData.some((d) => (d.minggu1 || 0) > 0);
    const hasMinggu2Data =
        Boolean(chartData) && chartData.some((d) => (d.minggu2 || 0) > 0);
    const hasMinggu3Data =
        Boolean(chartData) && chartData.some((d) => (d.minggu3 || 0) > 0);

    const formatYAxis = (value: number) => {
        if (value >= 1000000) {
            return `Rp${(value / 1000000).toFixed(value % 1000000 === 0 ? 0 : 1)}jt`;
        }
        if (value >= 1000) {
            return `Rp${Math.round(value / 1000)}k`;
        }
        return `Rp${value}`;
    };

    return (
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-brand-orange/30 shadow-sm flex flex-col h-full w-full max-w-full overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 md:mb-6 gap-2">
                <h3 className="text-lg sm:text-xl font-extrabold text-brand-orange">
                    Grafik Penjualan
                </h3>
                <div className="flex bg-gray-50 rounded-lg p-1 border border-gray-100 self-start sm:self-auto">
                    <button
                        type="button"
                        onClick={() => setPeriod("weekly")}
                        className={`px-3 sm:px-4 py-1.5 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                            isWeekly
                                ? "bg-white shadow-sm text-brand-orange"
                                : "text-gray-500 hover:text-gray-700"
                        }`}
                    >
                        Mingguan
                    </button>
                    <button
                        type="button"
                        onClick={() => setPeriod("monthly")}
                        className={`px-3 sm:px-4 py-1.5 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                            !isWeekly
                                ? "bg-white shadow-sm text-brand-orange"
                                : "text-gray-500 hover:text-gray-700"
                        }`}
                    >
                        Bulanan
                    </button>
                </div>
            </div>

            {hasData ? (
                <div className="flex-1 w-full min-h-0 flex flex-col justify-between">
                    <div className="w-full h-55 sm:h-64 md:h-72 min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            {isWeekly ? (
                                <AreaChart
                                    data={chartData}
                                    margin={{ top: 10, right: 8, left: -16, bottom: 0 }}
                                >
                                    <defs>
                                        <linearGradient id="colorMinggu1" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#EA580C" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#EA580C" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorMinggu2" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorMinggu3" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="#e5e7eb" />
                                    <XAxis 
                                        dataKey="name" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fontSize: 11, fill: '#6b7280' }} 
                                        dy={8} 
                                    />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fontSize: 10, fill: '#6b7280' }} 
                                        tickFormatter={formatYAxis} 
                                        width={42}
                                        dx={-2} 
                                    />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                                        labelStyle={{ fontWeight: 'bold', color: '#1f2937' }}
                                        formatter={(value: any, name: any) => [
                                            `Rp ${Number(value || 0).toLocaleString('id-ID')}`, 
                                            name === 'minggu1' ? 'Minggu Ini' : name === 'minggu2' ? 'Minggu Lalu' : '2 Minggu Lalu'
                                        ]}
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="minggu1" 
                                        stroke={hasMinggu1Data ? "#EA580C" : "transparent"} 
                                        strokeWidth={hasMinggu1Data ? 2 : 0} 
                                        fillOpacity={hasMinggu1Data ? 1 : 0} 
                                        fill={hasMinggu1Data ? "url(#colorMinggu1)" : "transparent"} 
                                        activeDot={hasMinggu1Data ? { r: 5, strokeWidth: 0 } : false} 
                                        dot={hasMinggu1Data ? { r: 3, strokeWidth: 2, fill: "#fff", stroke: "#EA580C" } : false} 
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="minggu2" 
                                        stroke={hasMinggu2Data ? "#8b5cf6" : "transparent"} 
                                        strokeWidth={hasMinggu2Data ? 2 : 0} 
                                        fillOpacity={hasMinggu2Data ? 1 : 0} 
                                        fill={hasMinggu2Data ? "url(#colorMinggu2)" : "transparent"} 
                                        activeDot={hasMinggu2Data ? { r: 5, strokeWidth: 0 } : false} 
                                        dot={hasMinggu2Data ? { r: 3, strokeWidth: 2, fill: "#fff", stroke: "#8b5cf6" } : false} 
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="minggu3" 
                                        stroke={hasMinggu3Data ? "#22d3ee" : "transparent"} 
                                        strokeWidth={hasMinggu3Data ? 2 : 0} 
                                        fillOpacity={hasMinggu3Data ? 1 : 0} 
                                        fill={hasMinggu3Data ? "url(#colorMinggu3)" : "transparent"} 
                                        activeDot={hasMinggu3Data ? { r: 5, strokeWidth: 0 } : false} 
                                        dot={hasMinggu3Data ? { r: 3, strokeWidth: 2, fill: "#fff", stroke: "#22d3ee" } : false} 
                                    />
                                </AreaChart>
                            ) : (
                                <AreaChart
                                    data={monthlyChartData}
                                    margin={{ top: 10, right: 8, left: -16, bottom: 0 }}
                                >
                                    <defs>
                                        <linearGradient id="colorMonthlySales" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#EA580C" stopOpacity={0.35} />
                                            <stop offset="95%" stopColor="#EA580C" stopOpacity={0.02} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="#e5e7eb" />
                                    <XAxis 
                                        dataKey="name" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fontSize: 11, fill: '#6b7280' }} 
                                        dy={8} 
                                    />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fontSize: 10, fill: '#6b7280' }} 
                                        tickFormatter={formatYAxis} 
                                        width={42}
                                        dx={-2} 
                                    />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                                        labelStyle={{ fontWeight: 'bold', color: '#1f2937' }}
                                        formatter={(value: any) => [
                                            `Rp ${Number(value).toLocaleString('id-ID')}`, 
                                            'Total Penjualan'
                                        ]}
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="sales" 
                                        stroke="#EA580C" 
                                        strokeWidth={2.5} 
                                        fillOpacity={1} 
                                        fill="url(#colorMonthlySales)" 
                                        activeDot={{ r: 5, strokeWidth: 0 }}
                                        dot={{ r: 3, strokeWidth: 2, fill: "#fff", stroke: "#EA580C" }}
                                    />
                                </AreaChart>
                            )}
                        </ResponsiveContainer>
                    </div>
                    
                    {/* Responsive Legend without Collisions */}
                    {isWeekly ? (
                        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs sm:text-sm text-gray-500 font-medium mt-3 pt-2 border-t border-gray-50">
                            <div className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-brand-orange shrink-0"></span>
                                <span>Minggu Ini</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#8b5cf6] shrink-0"></span>
                                <span>Minggu Lalu</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#22d3ee] shrink-0"></span>
                                <span>2 Minggu Lalu</span>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs sm:text-sm text-gray-500 font-medium mt-3 pt-2 border-t border-gray-50">
                            <div className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-brand-orange shrink-0"></span>
                                <span>Penjualan 6 Bulan Terakhir</span>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex-1 w-full flex flex-col items-center justify-center text-gray-400 gap-3 py-12">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                        <BarChart3 className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-sm font-medium">
                        Belum ada data penjualan untuk ditampilkan.
                    </p>
                </div>
            )}
        </div>
    );
}

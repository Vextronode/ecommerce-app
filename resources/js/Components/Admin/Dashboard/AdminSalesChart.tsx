import React from "react";
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

interface Props {
    chartData?: Array<{
        name: string;
        minggu1: number;
        minggu2: number;
        minggu3: number;
    }>;
}

const defaultChartData = [
    { name: "Senin", minggu1: 0, minggu2: 0, minggu3: 0 },
    { name: "Selasa", minggu1: 0, minggu2: 0, minggu3: 0 },
    { name: "Rabu", minggu1: 0, minggu2: 0, minggu3: 0 },
    { name: "Kamis", minggu1: 0, minggu2: 0, minggu3: 0 },
    { name: "Jumat", minggu1: 0, minggu2: 0, minggu3: 0 },
    { name: "Sabtu", minggu1: 0, minggu2: 0, minggu3: 0 },
];

export default function AdminSalesChart({ chartData }: Props) {
    const data = chartData && chartData.length > 0 ? chartData : defaultChartData;

    return (
        <div className="bg-white rounded-3xl p-5 md:p-6 border border-gray-100 shadow-sm flex flex-col w-full h-full min-w-0 overflow-hidden">
            <div className="flex justify-between items-center mb-5">
                <h3 className="text-base md:text-lg font-bold text-gray-900">
                    Grafik Penjualan Produk
                </h3>
            </div>

            <div className="w-full h-64 sm:h-72 min-h-0 min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={data}
                        margin={{ top: 10, right: 15, left: -20, bottom: 0 }}
                    >
                        <defs>
                            {/* Brand Orange 1 Minggu */}
                            <linearGradient id="adminMinggu1" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ED7218" stopOpacity={0.35} />
                                <stop offset="95%" stopColor="#ED7218" stopOpacity={0.02} />
                            </linearGradient>
                            {/* Amber 2 Minggu */}
                            <linearGradient id="adminMinggu2" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.35} />
                                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.02} />
                            </linearGradient>
                            {/* Emerald 3 Minggu */}
                            <linearGradient id="adminMinggu3" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                                <stop offset="95%" stopColor="#10B981" stopOpacity={0.02} />
                            </linearGradient>
                        </defs>

                        <CartesianGrid strokeDasharray="2 2" vertical={true} stroke="#F1F5F9" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fill: "#94A3B8" }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            domain={[0, 100]}
                            ticks={[0, 20, 40, 60, 80, 100]}
                            tick={{ fontSize: 11, fill: "#94A3B8" }}
                            dx={-5}
                        />
                        <Tooltip
                            contentStyle={{
                                borderRadius: "12px",
                                border: "1px solid #E2E8F0",
                                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.08)",
                                fontSize: "12px",
                            }}
                            labelStyle={{ fontWeight: "bold", color: "#1E293B" }}
                            formatter={(value: any, name: any) => [
                                `${value} unit terjual`,
                                name === "minggu1"
                                    ? "1 Minggu"
                                    : name === "minggu2"
                                        ? "2 Minggu"
                                        : "3 Minggu",
                            ]}
                        />
                        {/* 1 Minggu (Brand Orange) */}
                        <Area
                            type="monotone"
                            dataKey="minggu1"
                            stroke="#ED7218"
                            strokeWidth={2.5}
                            fillOpacity={1}
                            fill="url(#adminMinggu1)"
                            activeDot={{ r: 5, strokeWidth: 2, stroke: "#ED7218", fill: "#FFF" }}
                            dot={{ r: 3.5, strokeWidth: 2, fill: "#FFF", stroke: "#ED7218" }}
                        />
                        {/* 2 Minggu (Amber) */}
                        <Area
                            type="monotone"
                            dataKey="minggu2"
                            stroke="#F59E0B"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#adminMinggu2)"
                            activeDot={{ r: 5, strokeWidth: 2, stroke: "#F59E0B", fill: "#FFF" }}
                            dot={{ r: 3.5, strokeWidth: 2, fill: "#FFF", stroke: "#F59E0B" }}
                        />
                        {/* 3 Minggu (Emerald) */}
                        <Area
                            type="monotone"
                            dataKey="minggu3"
                            stroke="#10B981"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#adminMinggu3)"
                            activeDot={{ r: 5, strokeWidth: 2, stroke: "#10B981", fill: "#FFF" }}
                            dot={{ r: 3.5, strokeWidth: 2, fill: "#FFF", stroke: "#10B981" }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Custom Legend Matching Mockup */}
            <div className="flex justify-center items-center mt-3 gap-5 text-xs text-gray-500 font-medium">
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full border-2 border-[#ED7218] bg-white"></div>
                    <span>1 Minggu</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full border-2 border-[#F59E0B] bg-white"></div>
                    <span>2 Minggu</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full border-2 border-[#10B981] bg-white"></div>
                    <span>3 Minggu</span>
                </div>
            </div>
        </div>
    );
}

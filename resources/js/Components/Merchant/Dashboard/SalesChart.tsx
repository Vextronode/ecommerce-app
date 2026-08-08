import React from "react";
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
}

export default function SalesChart({ chartData }: Props) {
    return (
        <div className="bg-white rounded-3xl p-6 border border-[#41B9C5]/30 shadow-sm min-h-100 flex flex-col h-full w-full">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-extrabold text-[#004F54]">
                    Grafik Penjualan
                </h3>
                <div className="flex bg-gray-50 rounded-lg p-1 border border-gray-100">
                    <button className="px-4 py-1.5 text-xs font-bold bg-white shadow-sm rounded-md text-[#004F54]">
                        Weekly
                    </button>
                    <button className="px-4 py-1.5 text-xs font-bold text-gray-500 hover:text-gray-700">
                        Monthly
                    </button>
                </div>
            </div>

            {chartData && chartData.length > 0 ? (
                <div className="flex-1 w-full h-64 md:h-72 min-h-0 pb-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={chartData}
                            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id="colorMinggu1" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorMinggu2" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f87171" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
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
                                tick={{ fontSize: 12, fill: '#6b7280' }} 
                                dy={10} 
                            />
                            <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 12, fill: '#6b7280' }} 
                                tickFormatter={(value) => `Rp${value/1000}k`} 
                                dx={10} 
                            />
                            <Tooltip 
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                labelStyle={{ fontWeight: 'bold', color: '#1f2937' }}
                                formatter={(value: any, name: any) => [
                                    `Rp ${Number(value).toLocaleString('id-ID')}`, 
                                    name === 'minggu1' ? '1 Minggu' : name === 'minggu2' ? '2 Minggu' : '3 Minggu'
                                ]}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="minggu1" 
                                stroke="#8b5cf6" 
                                strokeWidth={2} 
                                fillOpacity={1} 
                                fill="url(#colorMinggu1)" 
                                activeDot={{ r: 6, strokeWidth: 0 }}
                                dot={{ r: 4, strokeWidth: 2, fill: "#fff", stroke: "#8b5cf6" }}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="minggu2" 
                                stroke="#f87171" 
                                strokeWidth={2} 
                                fillOpacity={1} 
                                fill="url(#colorMinggu2)" 
                                activeDot={{ r: 6, strokeWidth: 0 }}
                                dot={{ r: 4, strokeWidth: 2, fill: "#fff", stroke: "#f87171" }}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="minggu3" 
                                stroke="#22d3ee" 
                                strokeWidth={2} 
                                fillOpacity={1} 
                                fill="url(#colorMinggu3)" 
                                activeDot={{ r: 6, strokeWidth: 0 }}
                                dot={{ r: 4, strokeWidth: 2, fill: "#fff", stroke: "#22d3ee" }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                    
                    <div className="flex justify-center mt-4 gap-6 text-sm text-gray-500 font-medium">
                        <div className="flex items-center gap-2">
                            <div className="flex items-center">
                                <div className="w-3 h-0.5 bg-[#8b5cf6]"></div>
                                <div className="w-2.5 h-2.5 rounded-full border-2 border-[#8b5cf6] bg-white -mx-1 z-10"></div>
                                <div className="w-3 h-0.5 bg-[#8b5cf6]"></div>
                            </div>
                            <span>1 Minggu</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center">
                                <div className="w-3 h-0.5 bg-[#f87171]"></div>
                                <div className="w-2.5 h-2.5 rounded-full border-2 border-[#f87171] bg-white -mx-1 z-10"></div>
                                <div className="w-3 h-0.5 bg-[#f87171]"></div>
                            </div>
                            <span>2 Minggu</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center">
                                <div className="w-3 h-0.5 bg-[#22d3ee]"></div>
                                <div className="w-2.5 h-2.5 rounded-full border-2 border-[#22d3ee] bg-white -mx-1 z-10"></div>
                                <div className="w-3 h-0.5 bg-[#22d3ee]"></div>
                            </div>
                            <span>3 Minggu</span>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 w-full flex flex-col items-center justify-center text-gray-400 gap-3">
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

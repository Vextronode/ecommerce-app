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

export default function SalesChart() {
    // data dummy
    const data = [
        { name: "Senin", minggu1: 20, minggu2: 15, minggu3: 82 },
        { name: "Selasa", minggu1: 95, minggu2: 35, minggu3: 68 },
        { name: "Rabu", minggu1: 20, minggu2: 95, minggu3: 38 },
        { name: "Kamis", minggu1: 40, minggu2: 32, minggu3: 58 },
        { name: "Jumat", minggu1: 18, minggu2: 31, minggu3: 34 },
        { name: "Sabtu", minggu1: 65, minggu2: 18, minggu3: 92 },
        { name: "Minggu", minggu1: 40, minggu2: 75, minggu3: 80 },
    ];

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

            <div className="flex-1 w-full h-75">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={data}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient
                                id="colorMinggu1"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="5%"
                                    stopColor="#8B5CF6"
                                    stopOpacity={0.3}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="#8B5CF6"
                                    stopOpacity={0}
                                />
                            </linearGradient>
                            <linearGradient
                                id="colorMinggu2"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="5%"
                                    stopColor="#F87171"
                                    stopOpacity={0.3}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="#F87171"
                                    stopOpacity={0}
                                />
                            </linearGradient>
                            <linearGradient
                                id="colorMinggu3"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="5%"
                                    stopColor="#41B9C5"
                                    stopOpacity={0.3}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="#41B9C5"
                                    stopOpacity={0}
                                />
                            </linearGradient>
                        </defs>

                        <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="#f3f4f6"
                        />

                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: "#9ca3af" }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: "#9ca3af" }}
                        />

                        <Tooltip
                            contentStyle={{
                                borderRadius: "12px",
                                border: "none",
                                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                            }}
                        />

                        <Area
                            type="monotone"
                            dataKey="minggu3"
                            stroke="#41B9C5"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorMinggu3)"
                            dot={{
                                fill: "#fff",
                                stroke: "#41B9C5",
                                strokeWidth: 2,
                                r: 4,
                            }}
                            activeDot={{ r: 6 }}
                        />

                        <Area
                            type="monotone"
                            dataKey="minggu2"
                            stroke="#F87171"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorMinggu2)"
                            dot={{
                                fill: "#fff",
                                stroke: "#F87171",
                                strokeWidth: 2,
                                r: 4,
                            }}
                            activeDot={{ r: 6 }}
                        />

                        <Area
                            type="monotone"
                            dataKey="minggu1"
                            stroke="#8B5CF6"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorMinggu1)"
                            dot={{
                                fill: "#fff",
                                stroke: "#8B5CF6",
                                strokeWidth: 2,
                                r: 4,
                            }}
                            activeDot={{ r: 6 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="flex justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                    <svg
                        width="24"
                        height="8"
                        viewBox="0 0 24 8"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <line
                            x1="0"
                            y1="4"
                            x2="24"
                            y2="4"
                            stroke="#8B5CF6"
                            strokeWidth="1.5"
                        />
                        <circle
                            cx="12"
                            cy="4"
                            r="3"
                            fill="white"
                            stroke="#8B5CF6"
                            strokeWidth="1.5"
                        />
                    </svg>
                    <span className="text-xs font-medium text-gray-500">
                        1 Minggu
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <svg
                        width="24"
                        height="8"
                        viewBox="0 0 24 8"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <line
                            x1="0"
                            y1="4"
                            x2="24"
                            y2="4"
                            stroke="#F87171"
                            strokeWidth="1.5"
                        />
                        <circle
                            cx="12"
                            cy="4"
                            r="3"
                            fill="white"
                            stroke="#F87171"
                            strokeWidth="1.5"
                        />
                    </svg>
                    <span className="text-xs font-medium text-gray-500">
                        2 Minggu
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <svg
                        width="24"
                        height="8"
                        viewBox="0 0 24 8"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <line
                            x1="0"
                            y1="4"
                            x2="24"
                            y2="4"
                            stroke="#41B9C5"
                            strokeWidth="1.5"
                        />
                        <circle
                            cx="12"
                            cy="4"
                            r="3"
                            fill="white"
                            stroke="#41B9C5"
                            strokeWidth="1.5"
                        />
                    </svg>
                    <span className="text-xs font-medium text-gray-500">
                        3 Minggu
                    </span>
                </div>
            </div>
        </div>
    );
}

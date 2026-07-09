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
                <div className="flex-1 w-full h-75">
                    {/* nanti diisi code chart ResponsiveContainer*/}
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

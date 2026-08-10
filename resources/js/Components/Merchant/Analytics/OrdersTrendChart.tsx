import React from 'react';
// eslint-disable-next-line react-doctor/prefer-dynamic-import
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface OrdersTrendChartProps {
    data: any[];
}

export default function OrdersTrendChart({ data }: OrdersTrendChartProps) {
    return (
        <div className="bg-white p-6 rounded-[20px] border border-[#41B9C5]/20 shadow-sm col-span-1 lg:col-span-2">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="font-bold text-[#14433D]">Orders Trend</h3>
                    <p className="text-xs text-gray-400 mt-1 font-medium">Menampilkan rekapan bulanan (tidak terpengaruh filter harian)</p>
                </div>
                <div className="flex items-center gap-4 mt-1">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#41B9C5]"></span>
                        <span className="text-xs text-gray-500 font-medium">Completed</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#e2e8f0]"></span>
                        <span className="text-xs text-gray-500 font-medium">Canceled</span>
                    </div>
                </div>
            </div>
            
            <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                        barSize={30}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                            dataKey="name" 
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: '#94a3b8' }}
                            dy={10}
                        />
                        <YAxis 
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: '#94a3b8' }}
                        />
                        <Tooltip 
                            cursor={{ fill: '#f8fafc' }}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="Completed" stackId="a" fill="#41B9C5" radius={[0, 0, 4, 4]} />
                        <Bar dataKey="Canceled" stackId="a" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

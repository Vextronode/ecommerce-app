import React from 'react';
// eslint-disable-next-line react-doctor/prefer-dynamic-import
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface OrdersTrendChartProps {
    data: any[];
}

export default function OrdersTrendChart({ data }: OrdersTrendChartProps) {
    return (
        <div className="bg-white p-6 rounded-2xl border border-brand-orange/20 shadow-sm col-span-1 lg:col-span-2">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-6 gap-2">
                <div>
                    <h3 className="font-bold text-lg text-gray-900">Tren Pesanan</h3>
                    <p className="text-xs text-gray-400 mt-0.5 font-medium">Menampilkan rekapan bulanan (tidak terpengaruh filter harian)</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-brand-orange"></span>
                        <span className="text-xs text-gray-600 font-semibold">Selesai</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
                        <span className="text-xs text-gray-500 font-medium">Dibatalkan</span>
                    </div>
                </div>
            </div>
            
            <div className="h-62.5 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                        barSize={28}
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
                            contentStyle={{ 
                                borderRadius: '12px', 
                                border: '1px solid #fed7aa', 
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                                fontSize: '12px'
                            }}
                            formatter={(value: any, name: any) => [`${value} Pesanan`, name === 'Completed' ? 'Selesai' : 'Dibatalkan']}
                        />
                        <Bar dataKey="Completed" stackId="a" fill="#ED7218" radius={[0, 0, 4, 4]} />
                        <Bar dataKey="Canceled" stackId="a" fill="#CBD5E1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

import React from 'react';
// eslint-disable-next-line react-doctor/prefer-dynamic-import
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { MoreVertical } from 'lucide-react';

interface RevenueTrendChartProps {
    data: any[];
    years: number[];
}

const colors = ['#E27C38', '#4F86F7', '#E5A962', '#10B981'];

export default function RevenueTrendChart({ data, years }: RevenueTrendChartProps) {
    return (
        <div className="bg-white p-6 rounded-2xl border border-brand-orange/20 shadow-sm col-span-1 lg:col-span-2">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="font-bold text-lg text-gray-900">Tren Pendapatan</h3>
                    <p className="text-xs text-gray-400 mt-0.5 font-medium">Perbandingan pendapatan tahunan (tidak terpengaruh filter harian)</p>
                </div>
                <button aria-label="Opsi Lainnya" className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-50 transition">
                    <MoreVertical className="w-5 h-5" />
                </button>
            </div>
            
            <div className="h-75 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{ top: 20, right: 10, left: -20, bottom: 5 }}
                        barGap={2}
                        barCategoryGap="20%"
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
                            tickFormatter={(value) => `${value >= 1000 ? (value/1000).toLocaleString('id-ID') + 'k' : value}`}
                        />
                        <Tooltip 
                            cursor={{ fill: '#f8fafc' }}
                            contentStyle={{ 
                                borderRadius: '12px', 
                                border: '1px solid #fed7aa', 
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                                fontSize: '12px'
                            }}
                            formatter={(value: any, name: any) => [`Rp ${Number(value).toLocaleString('id-ID')}`, `Tahun ${name}`]}
                        />
                        <Legend 
                            iconType="square"
                            iconSize={8}
                            wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }}
                            formatter={(value: any) => <span className="text-xs font-semibold text-gray-600">{value}</span>}
                        />
                        
                        {years.map((year, index) => (
                            <Bar 
                                key={year} 
                                dataKey={year.toString()} 
                                fill={colors[index % colors.length]} 
                                radius={[4, 4, 0, 0]}
                                barSize={years.length > 2 ? 8 : 12}
                            />
                        ))}
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

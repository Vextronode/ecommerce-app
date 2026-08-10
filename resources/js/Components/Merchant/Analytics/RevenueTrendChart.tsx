import React from 'react';
// eslint-disable-next-line react-doctor/prefer-dynamic-import
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface RevenueTrendChartProps {
    data: any[];
    years: number[];
}

const colors = ['#1f4b45', '#41B9C5', '#b2d8d8', '#e2e8f0'];

export default function RevenueTrendChart({ data, years }: RevenueTrendChartProps) {


    return (
        <div className="bg-white p-6 rounded-[20px] border border-[#41B9C5]/20 shadow-sm col-span-1 lg:col-span-2">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="font-bold text-[#14433D]">Revenue Trend</h3>
                    <p className="text-xs text-gray-400 mt-1 font-medium">Menampilkan perbandingan tahunan (tidak terpengaruh filter harian)</p>
                </div>
                <button aria-label="Action" className="text-gray-400 hover:text-gray-600 mt-1">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path></svg>
                </button>
            </div>
            
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{ top: 20, right: 10, left: -20, bottom: 5 }}
                        barGap={0}
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
                            tickFormatter={(value) => `${value >= 1000 ? value/1000 + 'k' : value}`}
                        />
                        <Tooltip 
                            cursor={{ fill: '#f8fafc' }}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Legend 
                            iconType="square"
                            iconSize={8}
                            wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }}
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

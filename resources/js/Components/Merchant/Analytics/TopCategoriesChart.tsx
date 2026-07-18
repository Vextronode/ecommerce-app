import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface TopCategoriesChartProps {
    data: any[];
}

export default function TopCategoriesChart({ data }: TopCategoriesChartProps) {
    const total = data.reduce((sum, item) => sum + item.value, 0);

    return (
        <div className="bg-white p-6 rounded-[20px] border border-[#41B9C5]/20 shadow-sm col-span-1">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-[#14433D]">Top Categories</h3>
                <button className="text-gray-400 hover:text-gray-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path></svg>
                </button>
            </div>

            <div className="relative h-[220px] flex justify-center items-center">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            innerRadius={70}
                            outerRadius={100}
                            paddingAngle={2}
                            dataKey="value"
                            stroke="none"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Pie>
                        <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
                
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-bold text-[#14433D]">
                        {total >= 1000 ? (total/1000).toFixed(1) + 'k' : total}
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Total Items</span>
                </div>
            </div>

            <div className="mt-4 space-y-3">
                {data.map((category, index) => (
                    <div key={index} className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: category.fill }}></span>
                            <span className="text-sm text-gray-600 font-medium">{category.name}</span>
                        </div>
                        <span className="text-sm font-bold text-[#14433D]">{category.percentage}%</span>
                    </div>
                ))}
                {data.length === 0 && (
                    <p className="text-sm text-center text-gray-400">Belum ada data.</p>
                )}
            </div>
        </div>
    );
}

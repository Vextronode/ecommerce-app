import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { MoreVertical } from 'lucide-react';

interface TopCategoriesChartProps {
    data: any[];
}

export default function TopCategoriesChart({ data }: TopCategoriesChartProps) {
    const total = data.reduce((sum, item) => sum + item.value, 0);

    return (
        <div className="bg-white p-6 rounded-2xl border border-brand-orange/20 shadow-sm col-span-1">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg text-gray-900">Kategori Terpopuler</h3>
                <button aria-label="Opsi Lainnya" className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-50 transition">
                    <MoreVertical className="w-5 h-5" />
                </button>
            </div>

            <div className="relative h-55 flex justify-center items-center">
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
                                <Cell key={entry.name || index} fill={entry.fill} />
                            ))}
                        </Pie>
                        <Tooltip 
                            contentStyle={{ 
                                borderRadius: '12px', 
                                border: '1px solid #fed7aa', 
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                                fontSize: '12px'
                            }}
                            formatter={(value: any) => [`${value} item terjual`, 'Total']}
                        />
                    </PieChart>
                </ResponsiveContainer>
                
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-extrabold text-gray-900 tracking-tight">
                        {total >= 1000 ? (total/1000).toFixed(1) + 'k' : total}
                    </span>
                    <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Total Item</span>
                </div>
            </div>

            <div className="mt-4 space-y-3">
                {data.map((category) => (
                    <div key={category.name} className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: category.fill }}></span>
                            <span className="text-sm text-gray-700 font-medium">{category.name}</span>
                        </div>
                        <span className="text-sm font-bold text-gray-900">{category.percentage}%</span>
                    </div>
                ))}
                {data.length === 0 && (
                    <p className="text-sm text-center text-gray-400 py-4">Belum ada data kategori.</p>
                )}
            </div>
        </div>
    );
}

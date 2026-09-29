import React from "react";

interface Props {
    statusData: {
        pending: number;
        processing: number;
        shipped: number;
        completed: number;
    };
}

export default function OrderStatus({ statusData }: Props) {
    const statuses = [
        { label: "Menunggu", count: statusData.pending, color: "bg-gray-400" },
        {
            label: "Diproses",
            count: statusData.processing,
            color: "bg-brand-orange-light",
        },
        { label: "Dikirim", count: statusData.shipped, color: "bg-brand-orange" },
        {
            label: "Selesai",
            count: statusData.completed,
            color: "bg-brand-orange-dark",
        },
    ];

    const total = statuses.reduce((acc, curr) => acc + curr.count, 0) || 1;

    return (
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-brand-orange/30 shadow-sm h-full flex flex-col max-w-full overflow-hidden">
            <h3 className="text-base sm:text-lg font-bold text-brand-orange mb-4 sm:mb-6">
                Status Pesanan
            </h3>

            <div className="space-y-4 flex-1">
                {statuses.map((item, index) => (
                    <div
                        key={item.label}
                        className="flex justify-between items-center"
                    >
                        <div className="flex items-center gap-3">
                            <span
                                className={`w-2 h-2 rounded-full ${item.color}`}
                            ></span>
                            <span className="text-sm text-gray-600 font-medium">
                                {item.label}
                            </span>
                        </div>
                        <span className="text-sm font-bold text-brand-orange">
                            {item.count}
                        </span>
                    </div>
                ))}
            </div>

            <div className="mt-6 flex h-2 w-full rounded-full overflow-hidden bg-gray-100">
                {statuses.map((item, index) => (
                    <div
                        key={index}
                        className={`h-full ${item.color} transition-all duration-300`}
                        style={{ width: `${total > 0 && item.count > 0 ? (item.count / total) * 100 : 0}%` }}
                    ></div>
                ))}
            </div>
        </div>
    );
}

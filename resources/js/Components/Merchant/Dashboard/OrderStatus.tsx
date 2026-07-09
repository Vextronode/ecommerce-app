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
        { label: "Pending", count: statusData.pending, color: "bg-gray-400" },
        {
            label: "Processing",
            count: statusData.processing,
            color: "bg-[#41B9C5]",
        },
        { label: "Shipped", count: statusData.shipped, color: "bg-blue-400" },
        {
            label: "Completed",
            count: statusData.completed,
            color: "bg-[#004F54]",
        },
    ];

    const total = statuses.reduce((acc, curr) => acc + curr.count, 0) || 1;

    return (
        <div className="bg-white rounded-3xl p-6 border border-[#41B9C5]/30 shadow-sm h-full flex flex-col">
            <h3 className="text-lg font-bold text-gray-800 mb-6">
                Order Status
            </h3>

            <div className="space-y-4 flex-1">
                {statuses.map((item, index) => (
                    <div
                        key={index}
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
                        <span className="text-sm font-bold text-[#004F54]">
                            {item.count}
                        </span>
                    </div>
                ))}
            </div>

            <div className="mt-6 flex h-2 w-full rounded-full overflow-hidden bg-gray-100">
                {statuses.map((item, index) => (
                    <div
                        key={index}
                        className={`h-full ${item.color}`}
                        style={{ width: `${(item.count / total) * 100}%` }}
                    ></div>
                ))}
            </div>
        </div>
    );
}

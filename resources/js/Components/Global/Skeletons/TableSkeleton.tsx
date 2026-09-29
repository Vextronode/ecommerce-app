import React from "react";

interface TableSkeletonProps {
    rows?: number;
    columns?: number;
    className?: string;
}

export default function TableSkeleton({
    rows = 5,
    columns = 6,
    className = "",
}: TableSkeletonProps) {
    return (
        <div className={`w-full overflow-hidden bg-white border border-gray-100 rounded-2xl shadow-xs animate-pulse select-none ${className}`}>
            {/* Table Header Placeholder */}
            <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-100 flex items-center gap-4">
                {Array.from({ length: columns }).map((_, i) => (
                    <div
                        key={`th-${i}`}
                        className="h-3.5 bg-gray-200/90 rounded-md"
                        style={{
                            width: i === 0 ? "20%" : i === 1 ? "30%" : `${Math.max(10, Math.floor(50 / (columns - 2)))}%`,
                        }}
                    />
                ))}
            </div>

            {/* Table Rows Placeholder */}
            <div className="divide-y divide-gray-100">
                {Array.from({ length: rows }).map((_, r) => (
                    <div key={`tr-${r}`} className="px-6 py-4.5 flex items-center gap-4">
                        {Array.from({ length: columns }).map((_, c) => (
                            <div
                                key={`td-${r}-${c}`}
                                className="h-4 bg-gray-200/70 rounded-md"
                                style={{
                                    width:
                                        c === 0
                                            ? `${15 + (r % 3) * 3}%`
                                            : c === 1
                                            ? `${25 + (r % 2) * 5}%`
                                            : `${Math.max(8, Math.floor(45 / (columns - 2)))}%`,
                                }}
                            />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

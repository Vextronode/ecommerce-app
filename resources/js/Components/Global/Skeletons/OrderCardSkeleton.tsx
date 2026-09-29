import React from "react";

export default function OrderCardSkeleton() {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-4 sm:p-5 md:p-6 animate-pulse select-none space-y-4">
            {/* Header: Store Info & Status */}
            <div className="flex items-center justify-between pb-3.5 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                    <div className="w-5 h-5 bg-gray-200 rounded-full" />
                    <div className="h-4 w-32 bg-gray-200 rounded-md" />
                </div>
                <div className="h-4 w-20 bg-gray-200 rounded-md" />
            </div>

            {/* Product Item Preview */}
            <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gray-200 shrink-0" />
                <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/5 bg-gray-200 rounded-md" />
                    <div className="h-3 w-1/4 bg-gray-100 rounded-md" />
                </div>
                <div className="h-4 w-20 sm:w-24 bg-gray-200 rounded-md shrink-0" />
            </div>

            {/* Footer: Total & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3.5 border-t border-gray-100 gap-3">
                <div className="h-4 w-32 bg-gray-200 rounded-md" />
                <div className="flex items-center justify-end gap-2">
                    <div className="h-8 w-28 bg-gray-200 rounded-xl" />
                    <div className="h-8 w-20 bg-gray-200 rounded-xl" />
                </div>
            </div>
        </div>
    );
}

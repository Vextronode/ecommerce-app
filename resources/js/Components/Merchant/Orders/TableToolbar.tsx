import React, { useState, useEffect, useRef } from "react";
import { Search, Filter } from "lucide-react";
import { router, usePage } from "@inertiajs/react";

export default function TableToolbar() {
    const { filters } = usePage().props as any;

    const [searchQuery, setSearchQuery] = useState(filters?.search || "");
    const [statusFilter, setStatusFilter] = useState(filters?.status || "all");

    const initialRender = useRef(true);

    useEffect(() => {
        if (initialRender.current) {
            initialRender.current = false;
            return;
        }

        const delayDebounceFn = setTimeout(() => {
            router.get(
                route("merchant.orders.index"),
                { search: searchQuery, status: statusFilter },
                { preserveState: true, preserveScroll: true, replace: true },
            );
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, statusFilter]);

    return (
        <div className="p-4 md:p-6 flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-gray-100">
            {/* Search */}
            <div className="relative w-full sm:w-72">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="w-4 h-4 text-gray-400" />
                </div>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#41B9C5]/50 focus:border-[#41B9C5] transition-all"
                    placeholder="Cari ID Pesanan atau Nama..."
                />
            </div>

            {/* Filter Dropdown */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative w-full sm:w-auto">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Filter className="w-4 h-4 text-gray-400" />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full sm:w-auto pl-10 pr-8 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#41B9C5]/50 focus:border-[#41B9C5] appearance-none cursor-pointer"
                    >
                        <option value="all">Semua Status</option>
                        <option value="pending">Menunggu Diproses</option>
                        <option value="processing">Sedang Diproses</option>
                        <option value="shipped">Sedang Dikirim</option>
                        <option value="delivered">Selesai</option>
                    </select>
                </div>
            </div>
        </div>
    );
}

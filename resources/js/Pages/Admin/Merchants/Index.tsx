import React, { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import AdminMerchantStatCards from "@/Components/Admin/Merchants/AdminMerchantStatCards";
import AdminMerchantTable, {
    MerchantItem,
} from "@/Components/Admin/Merchants/AdminMerchantTable";
import MerchantFilterModal from "@/Components/Admin/Merchants/MerchantFilterModal";
import {
    Filter,
    Plus,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Props {
    merchants: {
        data: MerchantItem[];
        current_page: number;
        last_page: number;
        from: number | null;
        to: number | null;
        total: number;
        links: PaginationLink[];
    };
    stats: {
        total_merchants: number;
        suspended_merchants: number;
        verified_merchants: number;
        pending_merchants: number;
    };
    filters: {
        search?: string;
        status?: string;
        sid_status?: string;
        subdistrict?: string;
    };
}

export default function AdminMerchantsIndex({
    merchants,
    stats,
    filters,
}: Props) {
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

    const handleResetAllFilters = () => {
        router.get(route("admin.merchants.index"));
    };

    const hasActiveFilters = Boolean(
        filters.status || filters.sid_status || filters.subdistrict,
    );

    return (
        <AdminLayout>
            <Head title="Manajemen Pedagang - CibendaMart Admin" />

            <div className="space-y-6">
                {/* Header Title & Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
                            Manajemen Pedagang
                        </h1>
                        <p className="text-xs md:text-sm text-gray-400 mt-1 font-medium">
                            Kelola akun pedagang, status verifikasi, dan akses platform.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                        {/* Filter Button */}
                        <button
                            type="button"
                            onClick={() => setIsFilterModalOpen(true)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${hasActiveFilters
                                ? "bg-[#E6F8F9] text-[#245D56] border-[#41B9C5]"
                                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 shadow-2xs"
                                }`}
                        >
                            <Filter className="w-4 h-4 text-[#245D56]" />
                            <span>Filter</span>
                            {hasActiveFilters && (
                                <span className="w-2 h-2 rounded-full bg-[#41B9C5]" />
                            )}
                        </button>

                        {/* + Create Account Button */}
                        <Link
                            href={route("admin.merchants.create")}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold bg-[#41B9C5] text-white hover:bg-[#38a3ae] shadow-md shadow-[#41B9C5]/25 transition-all cursor-pointer"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Create Account</span>
                        </Link>
                    </div>
                </div>

                <AdminMerchantStatCards stats={stats} />

                <AdminMerchantTable
                    merchants={merchants.data}
                    onResetFilter={
                        hasActiveFilters
                            ? handleResetAllFilters
                            : undefined
                    }
                />

                {/* Pagination Footer */}
                {merchants.total > 0 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-3">
                        <div className="text-xs text-gray-500 font-medium">
                            Showing{" "}
                            <span className="font-bold text-gray-800">
                                {merchants.from || 0}
                            </span>{" "}
                            to{" "}
                            <span className="font-bold text-gray-800">
                                {merchants.to || 0}
                            </span>{" "}
                            of{" "}
                            <span className="font-bold text-gray-800">
                                {merchants.total.toLocaleString()}
                            </span>{" "}
                            entries
                        </div>

                        {/* Pagination Buttons */}
                        {merchants.last_page > 1 && (
                            <div className="flex items-center gap-1.5">
                                {merchants.links.map((link, index) => {
                                    const isPrev = link.label.includes("Previous") || link.label.includes("&laquo;");
                                    const isNext = link.label.includes("Next") || link.label.includes("&raquo;");

                                    if (isPrev) {
                                        return link.url ? (
                                            <Link
                                                key={index}
                                                href={link.url}
                                                preserveScroll
                                                preserveState
                                                className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all text-xs font-semibold shadow-2xs cursor-pointer"
                                            >
                                                <ChevronLeft className="w-4 h-4" />
                                            </Link>
                                        ) : (
                                            <span
                                                key={index}
                                                className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 border border-gray-100 text-gray-300 text-xs cursor-not-allowed"
                                            >
                                                <ChevronLeft className="w-4 h-4" />
                                            </span>
                                        );
                                    }

                                    if (isNext) {
                                        return link.url ? (
                                            <Link
                                                key={index}
                                                href={link.url}
                                                preserveScroll
                                                preserveState
                                                className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all text-xs font-semibold shadow-2xs cursor-pointer"
                                            >
                                                <ChevronRight className="w-4 h-4" />
                                            </Link>
                                        ) : (
                                            <span
                                                key={index}
                                                className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 border border-gray-100 text-gray-300 text-xs cursor-not-allowed"
                                            >
                                                <ChevronRight className="w-4 h-4" />
                                            </span>
                                        );
                                    }

                                    return link.url ? (
                                        <Link
                                            key={index}
                                            href={link.url}
                                            preserveScroll
                                            preserveState
                                            className={`w-9 h-9 flex items-center justify-center rounded-xl text-xs font-bold transition-all ${link.active
                                                ? "bg-[#41B9C5] text-white shadow-md shadow-[#41B9C5]/30 border border-[#41B9C5]"
                                                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-2xs"
                                                }`}
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                        />
                                    ) : (
                                        <span
                                            key={index}
                                            className="w-9 h-9 flex items-center justify-center text-xs text-gray-400"
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                        />
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Filter Modal */}
            <MerchantFilterModal
                isOpen={isFilterModalOpen}
                onClose={() => setIsFilterModalOpen(false)}
                currentFilters={filters}
            />
        </AdminLayout>
    );
}

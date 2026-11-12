import React, { useState, useEffect } from "react";
import { Head, Link, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import AdminMerchantStatCards from "@/Components/Admin/Merchants/AdminMerchantStatCards";
import AdminMerchantTable, {
    MerchantItem,
} from "@/Components/Admin/Merchants/AdminMerchantTable";
import SellerApplicationsTable, {
    SellerApplicationItem,
} from "@/Components/Admin/Merchants/SellerApplicationsTable";
import MerchantFilterModal from "@/Components/Admin/Merchants/MerchantFilterModal";
import { formatPaginationLabel } from "@/utils/formatPaginationLabel";
import {
    Filter,
    Plus,
    ChevronLeft,
    ChevronRight,
    Store,
    Clock,
} from "lucide-react";
import toast from "react-hot-toast";

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
    applications: {
        data: SellerApplicationItem[];
        current_page: number;
        last_page: number;
        from: number | null;
        to: number | null;
        total: number;
        links: PaginationLink[];
    };
    active_tab?: "merchants" | "applications";
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
    app_filters: {
        app_search?: string;
        app_status?: string;
    };
}

export default function AdminMerchantsIndex({
    merchants,
    applications,
    active_tab = "merchants",
    stats,
    filters,
    app_filters,
}: Props) {
    const [activeTab, setActiveTab] = useState<"merchants" | "applications">(
        active_tab || "merchants"
    );
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

    const hasActiveFilters = Boolean(
        filters.status || filters.sid_status || filters.subdistrict
    );

    const handleResetAllFilters = () => {
        router.get(route("admin.merchants.index"), { tab: "merchants" });
    };

    const handleTabSwitch = (tab: "merchants" | "applications") => {
        setActiveTab(tab);
        const url = new URL(window.location.href);
        url.searchParams.set("tab", tab);
        window.history.replaceState({}, "", url.toString());
    };

    // Realtime notification via Reverb when new application arrives from SID
    useEffect(() => {
        if (typeof window !== "undefined" && (window as any).Echo) {
            const echo = (window as any).Echo;
            const channel = echo.private("admin-notifications");

            channel.listen(
                ".seller.application.created",
                (e: { application?: { business_name?: string } }) => {
                    toast.success(
                        `Permohonan pedagang baru dari SID: ${
                            e.application?.business_name || "Toko Baru"
                        }!`,
                        { duration: 5000, icon: "🔔" }
                    );
                    router.reload({ only: ["applications", "stats"] });
                }
            );

            return () => {
                channel.stopListening(".seller.application.created");
            };
        }
    }, []);

    return (
        <AdminLayout>
            <Head title="Manajemen Pedagang - CibendaMart Admin" />

            <div className="space-y-6 w-full max-w-full min-w-0 overflow-x-hidden">
                {/* Header Title & Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
                            Manajemen Pedagang
                        </h1>
                        <p className="text-xs md:text-sm text-gray-400 mt-1 font-medium">
                            Kelola akun pedagang, antrean permohonan SID, dan verifikasi platform.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                        {/* Filter Button (Only for Merchants tab) */}
                        {activeTab === "merchants" && (
                            <button
                                type="button"
                                onClick={() => setIsFilterModalOpen(true)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold border transition-colors cursor-pointer ${
                                    hasActiveFilters
                                        ? "bg-orange-50 text-brand-orange border-orange-200"
                                        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 shadow-2xs"
                                }`}
                            >
                                <Filter className="w-4 h-4 text-brand-orange" />
                                <span>Filter</span>
                                {hasActiveFilters && (
                                    <span className="w-2 h-2 rounded-full bg-brand-orange" />
                                )}
                            </button>
                        )}

                        {/* Create Account Button */}
                        <Link
                            href={route("admin.merchants.create")}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold bg-brand-orange text-white hover:bg-brand-orange-hover shadow-md shadow-brand-orange/25 transition-colors cursor-pointer"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Tambah Pedagang</span>
                        </Link>
                    </div>
                </div>

                {/* Stat Cards with Interactive Tab Switching */}
                <AdminMerchantStatCards
                    stats={stats}
                    activeTab={activeTab}
                    onTabChange={handleTabSwitch}
                />

                {/* Tab Switcher */}
                <div className="flex items-center gap-2 border-b border-gray-200/80 pb-3">
                    <button
                        type="button"
                        onClick={() => handleTabSwitch("merchants")}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer ${
                            activeTab === "merchants"
                                ? "bg-brand-orange text-white shadow-md shadow-brand-orange/25"
                                : "bg-white text-gray-600 hover:bg-gray-100/80 border border-gray-200/70 shadow-2xs"
                        }`}
                    >
                        <Store className="w-4 h-4" />
                        <span>Daftar Pedagang</span>
                        <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                                activeTab === "merchants"
                                    ? "bg-white/20 text-white"
                                    : "bg-gray-100 text-gray-600"
                            }`}
                        >
                            {stats.total_merchants}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => handleTabSwitch("applications")}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer relative ${
                            activeTab === "applications"
                                ? "bg-brand-orange text-white shadow-md shadow-brand-orange/25"
                                : "bg-white text-gray-600 hover:bg-gray-100/80 border border-gray-200/70 shadow-2xs"
                        }`}
                    >
                        <Clock className="w-4 h-4" />
                        <span>Permohonan Masuk (SID)</span>
                        {(stats.pending_merchants ?? 0) > 0 && (
                            <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                                    activeTab === "applications"
                                        ? "bg-white text-brand-orange"
                                        : "bg-amber-100 text-amber-800"
                                }`}
                            >
                                {stats.pending_merchants} Baru
                            </span>
                        )}
                    </button>
                </div>

                {/* TAB 1: Registered Merchants Table */}
                {activeTab === "merchants" && (
                    <>
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
                                    Menampilkan{" "}
                                    <span className="font-bold text-gray-800">
                                        {merchants.from || 0}
                                    </span>{" "}
                                    sampai{" "}
                                    <span className="font-bold text-gray-800">
                                        {merchants.to || 0}
                                    </span>{" "}
                                    dari{" "}
                                    <span className="font-bold text-gray-800">
                                        {merchants.total.toLocaleString()}
                                    </span>{" "}
                                    data pedagang
                                </div>

                                {merchants.last_page > 1 && (
                                    <div className="flex items-center gap-1.5">
                                        {merchants.links.map((link, index) => {
                                            const isPrev =
                                                link.label.includes("Previous") ||
                                                link.label.includes("&laquo;");
                                            const isNext =
                                                link.label.includes("Next") ||
                                                link.label.includes("&raquo;");

                                            if (isPrev) {
                                                return link.url ? (
                                                    <Link
                                                        key={link.label}
                                                        href={link.url}
                                                        preserveScroll
                                                        preserveState
                                                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors text-xs font-semibold shadow-2xs cursor-pointer"
                                                    >
                                                        <ChevronLeft className="w-4 h-4" />
                                                    </Link>
                                                ) : (
                                                    <span
                                                        key={link.label}
                                                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 border border-gray-100 text-gray-300 text-xs cursor-not-allowed"
                                                    >
                                                        <ChevronLeft className="w-4 h-4" />
                                                    </span>
                                                );
                                            }

                                            if (isNext) {
                                                return link.url ? (
                                                    <Link
                                                        key={link.label}
                                                        href={link.url}
                                                        preserveScroll
                                                        preserveState
                                                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors text-xs font-semibold shadow-2xs cursor-pointer"
                                                    >
                                                        <ChevronRight className="w-4 h-4" />
                                                    </Link>
                                                ) : (
                                                    <span
                                                        key={link.label}
                                                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 border border-gray-100 text-gray-300 text-xs cursor-not-allowed"
                                                    >
                                                        <ChevronRight className="w-4 h-4" />
                                                    </span>
                                                );
                                            }

                                            return link.url ? (
                                                <Link
                                                    key={link.label}
                                                    href={link.url}
                                                    preserveScroll
                                                    preserveState
                                                    className={`w-9 h-9 flex items-center justify-center rounded-xl text-xs font-bold transition-colors ${
                                                        link.active
                                                            ? "bg-brand-orange text-white shadow-md shadow-brand-orange/30 border border-brand-orange"
                                                            : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-2xs"
                                                    }`}
                                                >
                                                    {formatPaginationLabel(
                                                        link.label
                                                    )}
                                                </Link>
                                            ) : (
                                                <span
                                                    key={index}
                                                    className="w-9 h-9 flex items-center justify-center text-xs text-gray-400"
                                                >
                                                    {formatPaginationLabel(
                                                        link.label
                                                    )}
                                                </span>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}

                {/* TAB 2: Incoming SID Applications Table */}
                {activeTab === "applications" && (
                    <>
                        <SellerApplicationsTable
                            applications={applications.data}
                            filters={app_filters}
                        />

                        {/* Pagination Footer for Applications */}
                        {applications.total > 0 && applications.last_page > 1 && (
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-3">
                                <div className="text-xs text-gray-500 font-medium">
                                    Menampilkan{" "}
                                    <span className="font-bold text-gray-800">
                                        {applications.from || 0}
                                    </span>{" "}
                                    sampai{" "}
                                    <span className="font-bold text-gray-800">
                                        {applications.to || 0}
                                    </span>{" "}
                                    dari{" "}
                                    <span className="font-bold text-gray-800">
                                        {applications.total.toLocaleString()}
                                    </span>{" "}
                                    permohonan
                                </div>

                                <div className="flex items-center gap-1.5">
                                    {applications.links.map((link, index) => {
                                        const isPrev =
                                            link.label.includes("Previous") ||
                                            link.label.includes("&laquo;");
                                        const isNext =
                                            link.label.includes("Next") ||
                                            link.label.includes("&raquo;");

                                        if (isPrev) {
                                            return link.url ? (
                                                <Link
                                                    key={link.label}
                                                    href={link.url}
                                                    preserveScroll
                                                    preserveState
                                                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors text-xs font-semibold shadow-2xs cursor-pointer"
                                                >
                                                    <ChevronLeft className="w-4 h-4" />
                                                </Link>
                                            ) : (
                                                <span
                                                    key={link.label}
                                                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 border border-gray-100 text-gray-300 text-xs cursor-not-allowed"
                                                >
                                                    <ChevronLeft className="w-4 h-4" />
                                                </span>
                                            );
                                        }

                                        if (isNext) {
                                            return link.url ? (
                                                <Link
                                                    key={link.label}
                                                    href={link.url}
                                                    preserveScroll
                                                    preserveState
                                                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors text-xs font-semibold shadow-2xs cursor-pointer"
                                                >
                                                    <ChevronRight className="w-4 h-4" />
                                                </Link>
                                            ) : (
                                                <span
                                                    key={link.label}
                                                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 border border-gray-100 text-gray-300 text-xs cursor-not-allowed"
                                                >
                                                    <ChevronRight className="w-4 h-4" />
                                                </span>
                                            );
                                        }

                                        return link.url ? (
                                            <Link
                                                key={link.label}
                                                href={link.url}
                                                preserveScroll
                                                preserveState
                                                className={`w-9 h-9 flex items-center justify-center rounded-xl text-xs font-bold transition-colors ${
                                                    link.active
                                                        ? "bg-brand-orange text-white shadow-md shadow-brand-orange/30 border border-brand-orange"
                                                        : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-2xs"
                                                }`}
                                            >
                                                {formatPaginationLabel(
                                                    link.label
                                                )}
                                            </Link>
                                        ) : (
                                            <span
                                                key={index}
                                                className="w-9 h-9 flex items-center justify-center text-xs text-gray-400"
                                            >
                                                {formatPaginationLabel(
                                                    link.label
                                                )}
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Filter Modal for Registered Merchants */}
            <MerchantFilterModal
                isOpen={isFilterModalOpen}
                onClose={() => setIsFilterModalOpen(false)}
                currentFilters={filters}
            />
        </AdminLayout>
    );
}

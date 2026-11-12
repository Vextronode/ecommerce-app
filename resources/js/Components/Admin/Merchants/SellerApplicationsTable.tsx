import React, { useState } from "react";
import { Link, router } from "@inertiajs/react";
import {
    Store,
    UserCheck,
    XCircle,
    Clock,
    CheckCircle2,
    RefreshCw,
    Search,
    ShieldAlert,
    ExternalLink,
    FileText,
    AlertCircle,
    Info,
} from "lucide-react";
import RejectApplicationModal from "./RejectApplicationModal";
import toast from "react-hot-toast";

export interface SellerApplicationItem {
    id: number;
    business_ref: string;
    status: "pending" | "accepted" | "rejected" | "cancelled" | string;
    requested_at: string | null;
    requested_date: string;
    decided_at: string | null;
    note: string | null;
    nik: string;
    name: string;
    business_name: string;
    business_activity: string;
    category: string;
    category_label: string;
    email: string;
    phone: string;
    address: string;
    letter_number: string;
    issued_at: string;
    expires_at: string;
    store_id: number | null;
    user_id: number | null;
}

interface Props {
    applications: SellerApplicationItem[];
    filters: {
        app_search?: string;
        app_status?: string;
    };
}

export default function SellerApplicationsTable({
    applications,
    filters,
}: Props) {
    const [search, setSearch] = useState(filters.app_search || "");
    const [isSyncing, setIsSyncing] = useState(false);
    const [selectedForReject, setSelectedForReject] =
        useState<SellerApplicationItem | null>(null);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            route("admin.merchants.index"),
            {
                tab: "applications",
                app_search: search,
                app_status: filters.app_status || "pending",
            },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleStatusFilterChange = (status: string) => {
        router.get(
            route("admin.merchants.index"),
            {
                tab: "applications",
                app_search: search,
                app_status: status,
            },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleManualSync = () => {
        setIsSyncing(true);
        router.post(
            route("admin.merchants.applications.sync"),
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success("Sinkronisasi SID berhasil diperbarui!");
                    setIsSyncing(false);
                },
                onError: () => {
                    toast.error("Gagal melakukan sinkronisasi dengan SID.");
                    setIsSyncing(false);
                },
            }
        );
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "pending":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <Clock className="w-3.5 h-3.5" />
                        Menunggu Diproses
                    </span>
                );
            case "accepted":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Akun Dibuat
                    </span>
                );
            case "rejected":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        <XCircle className="w-3.5 h-3.5" />
                        Ditolak
                    </span>
                );
            case "cancelled":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-gray-100 text-gray-500 border border-gray-200">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        Dibatalkan Pemohon
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-gray-100 text-gray-600">
                        {status}
                    </span>
                );
        }
    };

    return (
        <div className="space-y-4">
            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-3xl border border-gray-100 shadow-2xs">
                {/* Search Input */}
                <form
                    onSubmit={handleSearchSubmit}
                    className="relative flex-1 max-w-md"
                >
                    <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari toko, nama pemilik, NIK, atau no. SKU..."
                        className="w-full pl-9 pr-4 py-2 bg-[#EEF2F4]/60 border border-gray-200/80 rounded-2xl text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:bg-white focus:border-brand-orange transition"
                    />
                </form>

                {/* Filter Pills & Sync Button */}
                <div className="flex items-center justify-between sm:justify-end gap-2 overflow-x-auto">
                    <div className="flex items-center gap-1.5 bg-[#EEF2F4]/60 p-1 rounded-2xl border border-gray-200/80">
                        {[
                            { key: "pending", label: "Menunggu" },
                            { key: "all", label: "Semua" },
                            { key: "accepted", label: "Diterima" },
                            { key: "rejected", label: "Ditolak" },
                        ].map((tab) => {
                            const active =
                                (filters.app_status || "pending") === tab.key;
                            return (
                                <button
                                    key={tab.key}
                                    type="button"
                                    onClick={() =>
                                        handleStatusFilterChange(tab.key)
                                    }
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                                        active
                                            ? "bg-white text-brand-orange shadow-xs"
                                            : "text-gray-500 hover:text-gray-800"
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Sync Button */}
                    <button
                        type="button"
                        onClick={handleManualSync}
                        disabled={isSyncing}
                        title="Ambil data permohonan terbaru dari SID"
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 shadow-2xs transition cursor-pointer shrink-0"
                    >
                        <RefreshCw
                            className={`w-3.5 h-3.5 text-brand-orange ${
                                isSyncing ? "animate-spin" : ""
                            }`}
                        />
                        <span className="hidden sm:inline">Sync SID</span>
                    </button>
                </div>
            </div>

            {/* Empty State */}
            {applications.length === 0 && (
                <div className="bg-white rounded-3xl border border-gray-100 p-8 sm:p-12 text-center shadow-sm">
                    <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mx-auto mb-4">
                        <Store className="w-8 h-8" />
                    </div>
                    <h3 className="text-base font-bold text-gray-900 mb-1">
                        Tidak Ada Permohonan Pedagang
                    </h3>
                    <p className="text-xs text-gray-400 max-w-md mx-auto mb-6 leading-relaxed">
                        Saat ini tidak ada permohonan pedagang dari SIDUTama
                        dengan filter ini. Anda dapat menyinkronkan data kembali.
                    </p>
                    <button
                        type="button"
                        onClick={handleManualSync}
                        disabled={isSyncing}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-brand-orange text-white hover:bg-brand-orange-hover shadow-md shadow-brand-orange/20 transition cursor-pointer"
                    >
                        <RefreshCw
                            className={`w-3.5 h-3.5 ${
                                isSyncing ? "animate-spin" : ""
                            }`}
                        />
                        <span>Tarik Permohonan dari SID</span>
                    </button>
                </div>
            )}

            {/* Application Cards / Table */}
            {applications.length > 0 && (
                <div className="space-y-3">
                    {applications.map((app) => {
                        const isPending = app.status === "pending";

                        return (
                            <div
                                key={app.id}
                                className="bg-white rounded-3xl p-5 border border-gray-100 shadow-2xs hover:shadow-md transition space-y-4"
                            >
                                {/* Top Row: Store Info & Status */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                                    <div className="flex items-start gap-3.5">
                                        <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200/60 flex items-center justify-center text-brand-orange font-extrabold text-sm shrink-0">
                                            {app.business_name
                                                .slice(0, 2)
                                                .toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h3 className="text-sm font-extrabold text-gray-900">
                                                    {app.business_name}
                                                </h3>
                                                <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-gray-100 text-gray-600">
                                                    {app.category_label}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 font-medium mt-0.5">
                                                Pemilik:{" "}
                                                <strong className="text-gray-800">
                                                    {app.name}
                                                </strong>{" "}
                                                • NIK:{" "}
                                                <span className="font-mono text-gray-600">
                                                    {app.nik}
                                                </span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        {getStatusBadge(app.status)}
                                    </div>
                                </div>

                                {/* Detail Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                                    <div className="p-3 bg-[#EEF2F4]/40 rounded-2xl border border-gray-100">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                                            Kegiatan Usaha
                                        </span>
                                        <p className="font-semibold text-gray-800 line-clamp-2">
                                            {app.business_activity}
                                        </p>
                                    </div>

                                    <div className="p-3 bg-[#EEF2F4]/40 rounded-2xl border border-gray-100">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                                            Nomor SKU & Berlaku
                                        </span>
                                        <p className="font-mono font-bold text-gray-800">
                                            {app.letter_number}
                                        </p>
                                        <span className="text-[11px] text-gray-400">
                                            Terbit: {app.issued_at}
                                        </span>
                                    </div>

                                    <div className="p-3 bg-[#EEF2F4]/40 rounded-2xl border border-gray-100">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                                            Kontak Usaha
                                        </span>
                                        <p className="font-semibold text-gray-800 truncate">
                                            {app.email}
                                        </p>
                                        <span className="text-[11px] text-gray-500">
                                            WA: {app.phone}
                                        </span>
                                    </div>

                                    <div className="p-3 bg-[#EEF2F4]/40 rounded-2xl border border-gray-100">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                                            Waktu Pendaftaran SID
                                        </span>
                                        <p className="font-semibold text-gray-800">
                                            {app.requested_date}
                                        </p>
                                        <span className="text-[11px] text-gray-400">
                                            Alamat: {app.address}
                                        </span>
                                    </div>
                                </div>

                                {/* Rejection Note Banner if rejected */}
                                {app.status === "rejected" && app.note && (
                                    <div className="p-3.5 bg-rose-50 rounded-2xl border border-rose-100 flex items-start gap-2.5 text-xs text-rose-800">
                                        <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                                        <div>
                                            <span className="font-bold">
                                                Alasan Penolakan:
                                            </span>{" "}
                                            {app.note}
                                        </div>
                                    </div>
                                )}

                                {/* Bottom Actions Bar */}
                                {isPending && (
                                    <div className="flex items-center justify-end gap-3 pt-2">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setSelectedForReject(app)
                                            }
                                            className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:text-rose-600 hover:bg-rose-50 border border-gray-200 transition cursor-pointer"
                                        >
                                            Tolak Permohonan
                                        </button>

                                        <Link
                                            href={route(
                                                "admin.merchants.create",
                                                {
                                                    business_ref:
                                                        app.business_ref,
                                                }
                                            )}
                                            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-brand-orange text-white hover:bg-brand-orange-hover shadow-md shadow-brand-orange/25 transition cursor-pointer"
                                        >
                                            <UserCheck className="w-4 h-4" />
                                            <span>Buat Akun Pedagang</span>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Rejection Modal */}
            <RejectApplicationModal
                isOpen={Boolean(selectedForReject)}
                onClose={() => setSelectedForReject(null)}
                application={selectedForReject}
            />
        </div>
    );
}

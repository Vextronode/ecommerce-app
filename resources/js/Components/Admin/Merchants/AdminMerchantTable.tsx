import React from "react";

import StoreAvatar from '@/Components/Global/StoreAvatar';
import {
    MoreVertical,
    Edit2,
    Trash2,
    ShieldCheck,
    Store,
    CheckCircle2,
    Ban,
} from "lucide-react";
import EditMerchantModal from "./EditMerchantModal";
import DeleteMerchantModal from "./DeleteMerchantModal";
import { useMerchantTableActions } from "@/Hooks/Admin/useMerchantTableActions";

export interface MerchantItem {
    id: number;
    store_id?: number;
    name: string;
    nik?: string;
    email: string;
    phone: string;
    status: "active" | "warning" | "suspended" | "inactive" | string;
    reg_date: string;
    username: string;
    store?: {
        id?: number;
        name?: string;
        slug?: string;
        logo_path?: string | null;
        description?: string | null;
        address?: string;
        subdistrict?: string;
        sid_status?: "verified" | "pending" | "rejected" | string;
        balance?: number;
    };
}

interface Props {
    merchants: MerchantItem[];
    onResetFilter?: () => void;
}

export default function AdminMerchantTable({ merchants, onResetFilter }: Props) {
    const {
        activeDropdown,
        setActiveDropdown,
        toggleDropdown,
        selectedForEdit,
        setSelectedForEdit,
        selectedForDelete,
        setSelectedForDelete,
        handleQuickStatus,
        handleQuickVerification,
    } = useMerchantTableActions();

    if (!merchants || merchants.length === 0) {
        return (
            <div className="bg-white rounded-3xl border border-gray-100 p-8 sm:p-12 text-center shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-orange-50 border border-brand-orange/30 flex items-center justify-center text-brand-orange mx-auto mb-4">
                    <Store className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1">
                    Belum Ada Data Pedagang
                </h3>
                <p className="text-xs text-gray-400 max-w-md mx-auto mb-6 leading-relaxed">
                    Tidak ada akun pedagang yang ditemukan untuk filter pencarian ini atau belum ada pedagang yang terdaftar.
                </p>
                {onResetFilter && (
                    <button
                        type="button"
                        onClick={onResetFilter}
                        className="px-5 py-2.5 rounded-xl text-xs font-bold bg-brand-orange text-white hover:bg-brand-orange-hover shadow-md shadow-brand-orange/20 transition-colors cursor-pointer"
                    >
                        Reset Filter Pencarian
                    </button>
                )}
            </div>
        );
    }

    return (
        <>
            {/* MOBILE VIEW: Touch-friendly cards (No sideways scrolling!) */}
            <div className="block md:hidden space-y-3.5 w-full">
                {merchants.map((merchant) => {
                    const storeName = merchant.store?.name || merchant.name;
                    const subdistrict = merchant.store?.subdistrict || "Cibenda";
                    const sidStatus = merchant.store?.sid_status || "verified";
                    const status = merchant.status || "active";

                    return (
                        <div
                            key={merchant.id}
                            className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-3"
                        >
                            {/* Card Top: Store Avatar, Name & Status Badges */}
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                    <StoreAvatar
                                        logoPath={merchant.store?.logo_path}
                                        storeName={storeName}
                                        className="w-11 h-11 rounded-2xl text-sm shrink-0 border border-orange-100"
                                    />
                                    <div className="min-w-0">
                                        <h4 className="font-bold text-gray-900 text-sm truncate">
                                            {storeName}
                                        </h4>
                                        <p className="text-gray-400 text-xs truncate">
                                            {merchant.name} • {subdistrict}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end gap-1 shrink-0">
                                    {status === "active" && (
                                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                            Aktif
                                        </span>
                                    )}
                                    {status === "warning" && (
                                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                            Peringatan
                                        </span>
                                    )}
                                    {(status === "suspended" || status === "inactive") && (
                                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                            {status === "suspended" ? "Ditangguhkan" : "Nonaktif"}
                                        </span>
                                    )}

                                    {sidStatus === "verified" && (
                                        <span className="text-[10px] font-semibold text-brand-orange bg-orange-50 px-2 py-0.5 rounded-md border border-brand-orange/20">
                                            SID Terverifikasi
                                        </span>
                                    )}
                                    {sidStatus === "pending" && (
                                        <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                                            SID Menunggu
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Card Details: Contact, Username, Reg Date */}
                            <div className="grid grid-cols-2 gap-2 p-2.5 bg-gray-50/70 rounded-xl text-xs">
                                <div>
                                    <span className="text-[10px] text-gray-400 font-semibold block uppercase">
                                        Email
                                    </span>
                                    <span className="text-gray-800 font-medium truncate block" title={merchant.email}>
                                        {merchant.email}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[10px] text-gray-400 font-semibold block uppercase">
                                        Telepon
                                    </span>
                                    <span className="text-gray-800 font-medium">
                                        {merchant.phone || "-"}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[10px] text-gray-400 font-semibold block uppercase">
                                        Username
                                    </span>
                                    <span className="text-gray-600 font-mono text-[11px]">
                                        @{merchant.username}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[10px] text-gray-400 font-semibold block uppercase">
                                        Terdaftar
                                    </span>
                                    <span className="text-gray-600 text-[11px]">
                                        {merchant.reg_date}
                                    </span>
                                </div>
                            </div>

                            {/* Card Bottom Actions */}
                            <div className="flex items-center justify-end gap-2 pt-1 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setSelectedForEdit(merchant)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                                >
                                    <Edit2 className="w-3.5 h-3.5 text-brand-orange" />
                                    <span>Edit</span>
                                </button>

                                {status !== "active" ? (
                                    <button
                                        type="button"
                                        onClick={() => handleQuickStatus(merchant.id, "active")}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                                    >
                                        <ShieldCheck className="w-3.5 h-3.5" />
                                        <span>Aktifkan</span>
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => handleQuickStatus(merchant.id, "suspended")}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors"
                                    >
                                        <Ban className="w-3.5 h-3.5" />
                                        <span>Suspend</span>
                                    </button>
                                )}

                                <button
                                    type="button"
                                    onClick={() => setSelectedForDelete(merchant)}
                                    className="p-1.5 rounded-xl text-rose-500 bg-rose-50 hover:bg-rose-100 border border-rose-100 transition-colors"
                                    title="Hapus Akun"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* DESKTOP VIEW: Full table with clean Indonesian headers and Brand Orange styling */}
            <div className="hidden md:block bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto w-full">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50">
                                <th className="py-4 px-6">NAMA PEDAGANG / TOKO</th>
                                <th className="py-4 px-4">STATUS SID</th>
                                <th className="py-4 px-4">KONTAK</th>
                                <th className="py-4 px-4">USERNAME</th>
                                <th className="py-4 px-4">TANGGAL DAFTAR</th>
                                <th className="py-4 px-4">STATUS</th>
                                <th className="py-4 px-6 text-right">AKSI</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-xs">
                            {merchants.map((merchant) => {
                                const storeName = merchant.store?.name || merchant.name;
                                const subdistrict = merchant.store?.subdistrict || "Cibenda";
                                const sidStatus = merchant.store?.sid_status || "verified";
                                const status = merchant.status || "active";

                                return (
                                    <tr
                                        key={merchant.id}
                                        className="hover:bg-orange-50/20 transition-colors group"
                                    >
                                        {/* NAMA PEDAGANG */}
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3.5">
                                                <StoreAvatar 
                                                    logoPath={merchant.store?.logo_path} 
                                                    storeName={storeName} 
                                                    className="w-10 h-10 rounded-2xl text-sm"
                                                />
                                                <div>
                                                    <div className="font-bold text-gray-900 text-sm">
                                                        {storeName}
                                                    </div>
                                                    <div className="text-gray-400 text-[11px] font-medium">
                                                        {merchant.name} • {subdistrict}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* STATUS SID */}
                                        <td className="py-4 px-4 whitespace-nowrap">
                                            {sidStatus === "verified" && (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-orange-50 text-brand-orange border border-brand-orange/30">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-brand-orange" />
                                                    Terverifikasi
                                                </span>
                                            )}
                                            {sidStatus === "pending" && (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                                    Menunggu
                                                </span>
                                            )}
                                            {sidStatus === "rejected" && (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                                    Ditolak
                                                </span>
                                            )}
                                        </td>

                                        {/* KONTAK */}
                                        <td className="py-4 px-4 whitespace-nowrap">
                                            <div className="font-semibold text-gray-800 text-xs">
                                                {merchant.email}
                                            </div>
                                            <div className="text-gray-400 text-[11px]">
                                                {merchant.phone || "-"}
                                            </div>
                                        </td>

                                        {/* USERNAME */}
                                        <td className="py-4 px-4 whitespace-nowrap">
                                            <span className="text-gray-600 font-medium text-xs">
                                                @{merchant.username}
                                            </span>
                                        </td>

                                        {/* TANGGAL DAFTAR */}
                                        <td className="py-4 px-4 whitespace-nowrap">
                                            <span className="text-gray-600 text-xs font-medium">
                                                {merchant.reg_date}
                                            </span>
                                        </td>

                                        {/* STATUS */}
                                        <td className="py-4 px-4 whitespace-nowrap">
                                            {status === "active" && (
                                                <span className="inline-block px-3 py-1 rounded-xl text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                    Aktif
                                                </span>
                                            )}
                                            {status === "warning" && (
                                                <span className="inline-block px-3 py-1 rounded-xl text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                                    Peringatan
                                                </span>
                                            )}
                                            {(status === "suspended" || status === "inactive") && (
                                                <span className="inline-block px-3 py-1 rounded-xl text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                                    {status === "suspended" ? "Ditangguhkan" : "Nonaktif"}
                                                </span>
                                            )}
                                        </td>

                                        {/* AKSI */}
                                        <td className="py-4 px-6 text-right whitespace-nowrap relative">
                                            <div aria-label="Pilih opsi yang tersedia" className="relative inline-block text-left">
                                                <button aria-label="Tampilkan rincian lebih lanjut"
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleDropdown(merchant.id);
                                                    }}
                                                    className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                                                >
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>

                                                {/* Dropdown Menu */}
                                                {activeDropdown === merchant.id && (
                                                    <div
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="absolute right-0 top-full mt-1 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-30 animate-in fade-in zoom-in-95 transition-opacity duration-150"
                                                    >
                                                        {/* Edit Merchant */}
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setActiveDropdown(null);
                                                                setSelectedForEdit(merchant);
                                                            }}
                                                            className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors text-left"
                                                        >
                                                            <Edit2 className="w-3.5 h-3.5 text-brand-orange" />
                                                            Edit Data Pedagang
                                                        </button>

                                                        {/* Quick Verify */}
                                                        {merchant.store?.id && sidStatus !== "verified" && (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleQuickVerification(merchant.store?.id, "verified")
                                                                }
                                                                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 transition-colors text-left"
                                                            >
                                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                                Verifikasi Toko (SID)
                                                            </button>
                                                        )}

                                                        {/* Quick Suspend / Activate */}
                                                        {status !== "active" ? (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleQuickStatus(merchant.id, "active")
                                                                }
                                                                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 transition-colors text-left"
                                                            >
                                                                <ShieldCheck className="w-3.5 h-3.5" />
                                                                Aktifkan Akun
                                                            </button>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleQuickStatus(merchant.id, "suspended")
                                                                }
                                                                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-amber-600 hover:bg-amber-50 transition-colors text-left"
                                                            >
                                                                <Ban className="w-3.5 h-3.5" />
                                                                Suspend Akun
                                                            </button>
                                                        )}

                                                        <div className="my-1 border-t border-gray-100" />

                                                        {/* Delete Merchant */}
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setActiveDropdown(null);
                                                                setSelectedForDelete(merchant);
                                                            }}
                                                            className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors text-left"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                            Hapus Akun
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Modal */}
            <EditMerchantModal
                isOpen={!!selectedForEdit}
                onClose={() => setSelectedForEdit(null)}
                merchant={selectedForEdit}
            />

            {/* Delete Modal */}
            <DeleteMerchantModal
                isOpen={!!selectedForDelete}
                onClose={() => setSelectedForDelete(null)}
                merchant={selectedForDelete}
            />
        </>
    );
}

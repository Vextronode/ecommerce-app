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
            <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-[#F0FAFB] border border-[#41B9C5]/30 flex items-center justify-center text-[#245D56] mx-auto mb-4">
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
                        className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#41B9C5] text-white hover:bg-[#38a3ae] shadow-md shadow-[#41B9C5]/20 transition-colors cursor-pointer"
                    >
                        Reset Filter Pencarian
                    </button>
                )}
            </div>
        );
    }

    return (
        <>
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50">
                                <th className="py-4 px-6">MERCHANT NAME</th>
                                <th className="py-4 px-4">SID STATUS</th>
                                <th className="py-4 px-4">CONTACT INFO</th>
                                <th className="py-4 px-4">USERNAME</th>
                                <th className="py-4 px-4">REG. DATE</th>
                                <th className="py-4 px-4">STATUS</th>
                                <th className="py-4 px-6 text-right">ACTIONS</th>
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
                                        className="hover:bg-[#F9FCFC] transition-colors group"
                                    >
                                        {/* MERCHANT NAME */}
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
                                                        {subdistrict}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* SID STATUS */}
                                        <td className="py-4 px-4 whitespace-nowrap">
                                            {sidStatus === "verified" && (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#E6F8F9] text-[#245D56] border border-[#41B9C5]/30">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-[#41B9C5]" />
                                                    Verified
                                                </span>
                                            )}
                                            {sidStatus === "pending" && (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                                    Pending
                                                </span>
                                            )}
                                            {sidStatus === "rejected" && (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                                    Rejected
                                                </span>
                                            )}
                                        </td>

                                        {/* CONTACT INFO */}
                                        <td className="py-4 px-4 whitespace-nowrap">
                                            <div className="font-semibold text-gray-800 text-xs">
                                                {merchant.email}
                                            </div>
                                            <div className="text-gray-400 text-[11px]">
                                                {merchant.phone}
                                            </div>
                                        </td>

                                        {/* USERNAME */}
                                        <td className="py-4 px-4 whitespace-nowrap">
                                            <span className="text-gray-600 font-medium text-xs">
                                                {merchant.username}
                                            </span>
                                        </td>

                                        {/* REG. DATE */}
                                        <td className="py-4 px-4 whitespace-nowrap">
                                            <span className="text-gray-600 text-xs font-medium">
                                                {merchant.reg_date}
                                            </span>
                                        </td>

                                        {/* STATUS */}
                                        <td className="py-4 px-4 whitespace-nowrap">
                                            {status === "active" && (
                                                <span className="inline-block px-3 py-1 rounded-xl text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                    Active
                                                </span>
                                            )}
                                            {status === "warning" && (
                                                <span className="inline-block px-3 py-1 rounded-xl text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                                    Warning
                                                </span>
                                            )}
                                            {(status === "suspended" || status === "inactive") && (
                                                <span className="inline-block px-3 py-1 rounded-xl text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                                    {status === "suspended" ? "Suspended" : "Inactive"}
                                                </span>
                                            )}
                                        </td>

                                        {/* ACTIONS */}
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
                                                            <Edit2 className="w-3.5 h-3.5 text-[#41B9C5]" />
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

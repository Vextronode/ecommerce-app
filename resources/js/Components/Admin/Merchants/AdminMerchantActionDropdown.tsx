import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
    MoreVertical,
    Edit2,
    Trash2,
    ShieldCheck,
    CheckCircle2,
    Ban,
} from "lucide-react";
import type { MerchantItem } from "./AdminMerchantTable";

interface Props {
    merchant: MerchantItem;
    onEdit: (merchant: MerchantItem) => void;
    onDelete: (merchant: MerchantItem) => void;
    onQuickStatus: (id: number, status: string) => void;
    onQuickVerification: (storeId: number | undefined, status: string) => void;
}

export default function AdminMerchantActionDropdown({
    merchant,
    onEdit,
    onDelete,
    onQuickStatus,
    onQuickVerification,
}: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const status = merchant.status || "active";
    const sidStatus = merchant.store?.sid_status || "pending";

    const toggleDropdown = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            const dropdownWidth = 208; // w-52 = 208px
            const dropdownHeight = 180; // approximate height

            const openUpwards =
                window.innerHeight - rect.bottom < dropdownHeight + 10;

            setCoords({
                top: openUpwards
                    ? Math.max(10, rect.top - dropdownHeight - 4)
                    : rect.bottom + 4,
                left: Math.max(10, rect.right - dropdownWidth),
            });
        }
        setIsOpen((prev) => !prev);
    };

    useEffect(() => {
        if (!isOpen) return;

        const handleClose = () => setIsOpen(false);
        window.addEventListener("scroll", handleClose, true);
        window.addEventListener("resize", handleClose);

        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            window.removeEventListener("scroll", handleClose, true);
            window.removeEventListener("resize", handleClose);
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div aria-label="Pilih opsi yang tersedia" className="relative inline-block text-left">
            <button
                ref={buttonRef}
                aria-label="Tampilkan rincian lebih lanjut"
                type="button"
                onClick={toggleDropdown}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
            >
                <MoreVertical className="w-4 h-4" />
            </button>

            {isOpen &&
                coords &&
                typeof document !== "undefined" &&
                createPortal(
                    <div
                        ref={dropdownRef}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            position: "fixed",
                            top: `${coords.top}px`,
                            left: `${coords.left}px`,
                            zIndex: 9999,
                        }}
                        className="w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 animate-in fade-in zoom-in-95 transition-opacity duration-150"
                    >
                        {/* Edit Merchant */}
                        <button
                            type="button"
                            onClick={() => {
                                setIsOpen(false);
                                onEdit(merchant);
                            }}
                            className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors text-left cursor-pointer"
                        >
                            <Edit2 className="w-3.5 h-3.5 text-brand-orange" />
                            Edit Data Pedagang
                        </button>

                        {/* Quick Verify */}
                        {merchant.store?.id && sidStatus !== "verified" && (
                            <button
                                type="button"
                                onClick={() => {
                                    setIsOpen(false);
                                    onQuickVerification(merchant.store?.id, "verified");
                                }}
                                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 transition-colors text-left cursor-pointer"
                            >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Verifikasi Toko (SID)
                            </button>
                        )}

                        {/* Quick Suspend / Activate */}
                        {status !== "active" ? (
                            <button
                                type="button"
                                onClick={() => {
                                    setIsOpen(false);
                                    onQuickStatus(merchant.id, "active");
                                }}
                                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 transition-colors text-left cursor-pointer"
                            >
                                <ShieldCheck className="w-3.5 h-3.5" />
                                Aktifkan Akun
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() => {
                                    setIsOpen(false);
                                    onQuickStatus(merchant.id, "suspended");
                                }}
                                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-amber-600 hover:bg-amber-50 transition-colors text-left cursor-pointer"
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
                                setIsOpen(false);
                                onDelete(merchant);
                            }}
                            className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            Hapus Akun
                        </button>
                    </div>,
                    document.body,
                )}
        </div>
    );
}

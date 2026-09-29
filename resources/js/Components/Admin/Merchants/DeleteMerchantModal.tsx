import React, { useState } from "react";
import { AlertTriangle, X, Trash2 } from "lucide-react";
import { router } from "@inertiajs/react";
import toast from "react-hot-toast";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    merchant: {
        id: number;
        name: string;
        store?: {
            name?: string;
        };
    } | null;
}

export default function DeleteMerchantModal({
    isOpen,
    onClose,
    merchant,
}: Props) {
    const [isDeleting, setIsDeleting] = useState(false);

    if (!isOpen || !merchant) return null;

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(route("admin.merchants.destroy", merchant.id), {
            onSuccess: () => {
                toast.success("Akun pedagang berhasil dihapus.");
                setIsDeleting(false);
                onClose();
            },
            onError: () => {
                setIsDeleting(false);
                toast.error("Gagal menghapus akun pedagang.");
            },
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <button
                type="button"
                className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity w-full cursor-default"
                onClick={onClose}
                aria-label="Tutup modal"
            />

            <div className="relative bg-white rounded-3xl p-6 md:p-7 w-full max-w-md shadow-2xl border border-gray-100 z-10 animate-in fade-in zoom-in-95 transition-opacity duration-200">
                <div className="flex items-center justify-between pb-3">
                    <div className="w-11 h-11 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500">
                        <AlertTriangle className="w-5 h-5" />
                    </div>
                    <button aria-label="Tutup modal"
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="mt-3">
                    <h3 className="text-base font-bold text-gray-900">
                        Hapus Akun Pedagang?
                    </h3>
                    <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                        Apakah Anda yakin ingin menghapus akun pedagang{" "}
                        <strong className="text-gray-800">
                            {merchant.store?.name || merchant.name}
                        </strong>{" "}
                        ({merchant.name})? Seluruh data produk dan pengaturan terkait akan dihapus secara permanen.
                    </p>
                </div>

                <div className="flex items-center justify-end gap-2.5 mt-6 pt-4 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                        Batal
                    </button>
                    <button
                        type="button"
                        disabled={isDeleting}
                        onClick={handleDelete}
                        className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 shadow-md shadow-rose-600/20 transition-colors cursor-pointer disabled:opacity-50"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                        {isDeleting ? "Menghapus..." : "Ya, Hapus Akun"}
                    </button>
                </div>
            </div>
        </div>
    );
}

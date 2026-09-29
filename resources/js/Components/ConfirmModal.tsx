import React from "react";
import { X } from "lucide-react";

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onClose: () => void;
    isDanger?: boolean;
}

export default function ConfirmModal({
    isOpen,
    title,
    message,
    confirmText = "Konfirmasi",
    cancelText = "Batal",
    onConfirm,
    onClose,
    isDanger = false,
}: ConfirmModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <button type="button" aria-label="Tutup modal"
                className="absolute inset-0 bg-black/40 backdrop-blur-sm w-full cursor-default"
                onClick={onClose}
            />
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition">
                <div aria-label="Pilih opsi yang tersedia" className="flex items-center justify-between p-5 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                    <button aria-label="Tampilkan rincian lebih lanjut"
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6">
                    <p className="text-gray-600 leading-relaxed">{message}</p>
                </div>
                <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`px-5 py-2.5 text-sm font-bold text-white rounded-xl transition-colors ${
                            isDanger
                                ? "bg-red-500 hover:bg-red-600"
                                : "bg-brand-blue hover:bg-brand-blue-hover"
                        }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}

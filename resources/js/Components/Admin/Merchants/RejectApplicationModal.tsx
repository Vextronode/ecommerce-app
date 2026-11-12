import React from "react";
import { useForm } from "@inertiajs/react";
import { X, AlertTriangle, ShieldAlert } from "lucide-react";
import toast from "react-hot-toast";

interface ApplicationData {
    business_ref: string;
    business_name: string;
    name: string;
    letter_number?: string;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    application: ApplicationData | null;
}

export default function RejectApplicationModal({
    isOpen,
    onClose,
    application,
}: Props) {
    const { data, setData, post, processing, reset, errors } = useForm({
        note: "",
    });

    if (!isOpen || !application) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!data.note.trim() || data.note.trim().length < 3) {
            toast.error("Alasan penolakan minimal 3 karakter.");
            return;
        }

        if (data.note.trim().length > 500) {
            toast.error("Alasan penolakan maksimal 500 karakter.");
            return;
        }

        post(
            route("admin.merchants.applications.reject", {
                business_ref: application.business_ref,
            }),
            {
                onSuccess: () => {
                    toast.success("Permohonan berhasil ditolak.");
                    reset();
                    onClose();
                },
                onError: (errs) => {
                    const first = Object.values(errs)[0];
                    toast.error(typeof first === "string" ? first : "Gagal menolak permohonan.");
                },
            }
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-rose-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                            <ShieldAlert className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-gray-900">
                                Tolak Permohonan Pedagang
                            </h2>
                            <p className="text-xs text-gray-500 font-medium mt-0.5">
                                {application.business_name} ({application.name})
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-8 h-8 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 flex items-center justify-center transition-colors cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200/60 flex items-start gap-3">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div className="text-xs text-amber-800 leading-relaxed">
                            <span className="font-bold">Perhatian:</span> Alasan penolakan ini akan <strong>ditampilkan langsung kepada warga di aplikasi SID</strong>. Gunakan bahasa yang sopan, jelas, dan tanpa informasi internal.
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label
                                htmlFor="note"
                                className="block text-xs font-semibold text-gray-700"
                            >
                                Alasan Penolakan <span className="text-rose-500">*</span>
                            </label>
                            <span className="text-[11px] text-gray-400">
                                {data.note.length}/500 karakter
                            </span>
                        </div>
                        <textarea
                            id="note"
                            rows={4}
                            required
                            maxLength={500}
                            value={data.note}
                            onChange={(e) => setData("note", e.target.value)}
                            placeholder="Contoh: Foto usaha tidak sesuai dengan bidang usaha atau nomor kontak tidak dapat dihubungi saat verifikasi."
                            className={`w-full px-4 py-3 bg-[#EEF2F4]/60 border rounded-2xl text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:bg-white transition ${
                                errors.note
                                    ? "border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                                    : "border-gray-300/70 focus:border-rose-400 focus:ring-1 focus:ring-rose-400"
                            }`}
                        />
                        {errors.note && (
                            <p className="text-rose-500 text-[11px] mt-1.5 font-medium">
                                {errors.note}
                            </p>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={processing}
                            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing || !data.note.trim()}
                            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 shadow-md shadow-rose-600/25 transition-colors disabled:opacity-50 cursor-pointer"
                        >
                            {processing ? "Menyimpan..." : "Kirim Penolakan"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

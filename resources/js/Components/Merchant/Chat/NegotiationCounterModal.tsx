import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { NegotiationItem } from "@/types/chat";
import {
    X,
    Tag,
    ShoppingBag,
    Loader2,
    AlertCircle,
    Info,
    ArrowRightLeft,
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import {
    parseRupiahInput,
    formatRupiahNumber,
    formatRupiahDisplay,
    handleRupiahInputChange,
} from "@/utils/formatters";

interface Props {
    isOpen: boolean;
    negotiation: NegotiationItem | null;
    onClose: () => void;
    onSuccess: (updated: NegotiationItem) => void;
}

export default function NegotiationCounterModal({
    isOpen,
    negotiation,
    onClose,
    onSuccess,
}: Props) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!isOpen || !negotiation) return null;

    const originalPrice = Number(negotiation.original_price);
    const buyerOfferedPrice = Number(negotiation.offered_price);

    // Default counter-price midpoint between buyer's offer and original price
    const defaultCounter = Math.round((originalPrice + buyerOfferedPrice) / 2);

    const [counterPrice, setCounterPrice] = useState<string>(() =>
        formatRupiahDisplay(defaultCounter)
    );
    const [note, setNote] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const numericCounter = parseRupiahInput(counterPrice);
    const totalCounter = numericCounter * negotiation.quantity;
    const unit = negotiation.product?.unit || "pcs";

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (!val) {
            setCounterPrice("");
            return;
        }

        if (val.toLowerCase().includes("k") || val.toLowerCase().includes("rb")) {
            const parsed = parseRupiahInput(val);
            if (parsed > 0) {
                setCounterPrice(formatRupiahDisplay(parsed));
                return;
            }
        }

        const digits = val.replace(/\D/g, "");
        if (!digits) {
            setCounterPrice("");
            return;
        }

        const num = parseInt(digits, 10);
        setCounterPrice(formatRupiahDisplay(num));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);

        if (!numericCounter || numericCounter <= 0) {
            setErrorMsg("Silakan masukkan nominal tawaran balik.");
            return;
        }

        if (numericCounter <= buyerOfferedPrice) {
            setErrorMsg(
                `Harga tawaran balik harus lebih tinggi dari tawaran pembeli (Rp ${buyerOfferedPrice.toLocaleString("id-ID")}).`
            );
            return;
        }

        if (numericCounter >= originalPrice) {
            setErrorMsg(
                `Harga tawaran balik harus lebih murah dari harga normal (Rp ${originalPrice.toLocaleString("id-ID")}).`
            );
            return;
        }

        setIsSubmitting(true);
        try {
            const payload: any = {
                counter_price: numericCounter,
            };

            if (note.trim()) {
                payload.note = note.trim();
            }

            const res = await axios.post(
                `/pedagang/chat/negotiations/${negotiation.id}/counter`,
                payload
            );
            toast.success(res.data.message || "Tawaran balik berhasil dikirim!");
            onSuccess(res.data.negotiation);
            onClose();
        } catch (err: any) {
            const msg =
                err.response?.data?.message ||
                err.response?.data?.errors?.counter_price?.[0] ||
                "Gagal mengirim tawaran balik.";
            setErrorMsg(msg);
            toast.error(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!mounted) return null;

    const modalContent = (
        <div className="fixed inset-0 z-[9990] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
            <div
                className="w-full max-w-md bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200 text-gray-800"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-5 py-4 bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-indigo-100 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                            <ArrowRightLeft className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 leading-tight">
                                Berikan Tawaran Balik
                            </h3>
                            <p className="text-[11px] text-gray-500">
                                Ajukan harga kesepakatan tengah untuk pembeli
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-white/80 transition cursor-pointer"
                        aria-label="Tutup modal"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs overscroll-contain">
                    {/* Item Details */}
                    <div className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-xl border border-gray-200/80">
                        <div className="w-12 h-12 rounded-lg bg-white overflow-hidden shrink-0 border border-gray-100">
                            {negotiation.product?.image_path ? (
                                <img
                                    src={negotiation.product.image_path}
                                    alt={negotiation.product.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <ShoppingBag className="w-5 h-5 m-auto text-gray-400 mt-3" />
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="font-bold text-gray-900 truncate">
                                {negotiation.product?.name || "Produk"}
                            </p>
                            {negotiation.variant_name && (
                                <p className="text-[11px] text-gray-500">
                                    Varian: {negotiation.variant_name}
                                </p>
                            )}
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[11px] text-gray-500">
                                    Qty: <strong className="text-gray-800">{negotiation.quantity} {unit}</strong>
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Price Comparison */}
                    <div className="grid grid-cols-2 gap-2 text-center">
                        <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200/60">
                            <span className="text-[10px] text-gray-500 block">Harga Normal</span>
                            <span className="font-bold text-gray-700 text-xs line-through">
                                Rp {originalPrice.toLocaleString("id-ID")}
                            </span>
                        </div>
                        <div className="p-2.5 bg-amber-50/70 rounded-xl border border-amber-200/70">
                            <span className="text-[10px] text-amber-700 block">Tawaran Pembeli</span>
                            <span className="font-extrabold text-amber-800 text-xs">
                                Rp {buyerOfferedPrice.toLocaleString("id-ID")}
                            </span>
                        </div>
                    </div>

                    {errorMsg && (
                        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-start gap-2 text-xs">
                            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                            <span className="flex-1">{errorMsg}</span>
                        </div>
                    )}

                    {/* Counter Price Input with Auto Rupiah Formatting */}
                    <div>
                        <label className="block font-semibold text-gray-700 mb-1">
                            Nominal Tawaran Balik per {unit} (Rp) <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-xs">
                                Rp
                            </span>
                            <input
                                type="text"
                                inputMode="numeric"
                                required
                                value={counterPrice}
                                onChange={handlePriceChange}
                                placeholder="Masukkan tawaran balik Anda"
                                className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm font-bold text-indigo-900 bg-white border border-gray-300 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                            />
                        </div>
                        <p className="mt-1 text-[11px] text-gray-400 flex items-center gap-1">
                            <Info className="w-3 h-3 text-gray-400 shrink-0" />
                            Harus berada di antara Rp {(buyerOfferedPrice + 1).toLocaleString("id-ID")} dan Rp {(originalPrice - 1).toLocaleString("id-ID")}
                        </p>
                    </div>

                    {/* Note Input (Lebih Luas & Nyaman) */}
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <label className="font-semibold text-gray-700">
                                Catatan untuk Pembeli (Opsional)
                            </label>
                            <span className="text-[10px] text-gray-400">
                                {note.length}/500
                            </span>
                        </div>
                        <textarea
                            rows={3}
                            maxLength={500}
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Contoh: Ini harga nett pasnya ya kak, sudah kami beri diskon spesial."
                            className="w-full min-h-[85px] px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 bg-white border border-gray-300 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition resize-none leading-relaxed placeholder:text-gray-400"
                        />
                    </div>

                    {/* Summary */}
                    {numericCounter > 0 && (
                        <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-100 flex items-center justify-between">
                            <div>
                                <span className="text-[11px] text-gray-600 block">Total yang Diterima:</span>
                                <span className="text-[10px] text-gray-400">
                                    Rp {numericCounter.toLocaleString("id-ID")} x {negotiation.quantity} {unit}
                                </span>
                            </div>
                            <span className="text-sm sm:text-base font-extrabold text-indigo-700">
                                Rp {totalCounter.toLocaleString("id-ID")}
                            </span>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="pt-2 flex items-center justify-end gap-2.5 shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-4 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition cursor-pointer"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={
                                isSubmitting ||
                                numericCounter <= buyerOfferedPrice ||
                                numericCounter >= originalPrice
                            }
                            className="px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    Mengirim...
                                </>
                            ) : (
                                <>
                                    <Tag className="w-3.5 h-3.5" />
                                    Kirim Tawaran Balik
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}


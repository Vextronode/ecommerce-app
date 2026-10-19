import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { ProductAttachment } from "@/types/chat";
import {
    X,
    Tag,
    ShoppingBag,
    Loader2,
    Calendar,
    AlertCircle,
    Info,
    Sparkles,
    Plus,
    Minus,
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
    roomId: number;
    product: ProductAttachment & { sku_id?: number; variant_name?: string; stock?: number };
    onClose: () => void;
    onSuccess: (negotiation: any) => void;
}

export default function NegotiationOfferModal({
    isOpen,
    roomId,
    product,
    onClose,
    onSuccess,
}: Props) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const originalPrice = Number(product.price);
    const minPrice = Math.round(originalPrice * 0.3);
    const maxStock = product.stock ?? 999;

    const [offeredPrice, setOfferedPrice] = useState<string>(() =>
        formatRupiahDisplay(Math.round(originalPrice * 0.85))
    );
    const [quantityInput, setQuantityInput] = useState<string>("1");
    const [poDays, setPoDays] = useState<string>("");
    const [note, setNote] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const numericPrice = parseRupiahInput(offeredPrice);
    const quantity = Math.max(1, parseInt(quantityInput, 10) || 1);
    const totalPrice = numericPrice * quantity;
    const originalTotal = originalPrice * quantity;
    const savings = originalTotal - totalPrice;

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (!val) {
            setOfferedPrice("");
            return;
        }

        // Detect if user typed 'k' or 'rb'
        if (val.toLowerCase().includes("k") || val.toLowerCase().includes("rb")) {
            const parsed = parseRupiahInput(val);
            if (parsed > 0) {
                setOfferedPrice(formatRupiahDisplay(parsed));
                return;
            }
        }

        const digits = val.replace(/\D/g, "");
        if (!digits) {
            setOfferedPrice("");
            return;
        }

        const num = parseInt(digits, 10);
        setOfferedPrice(formatRupiahDisplay(num));
    };

    const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (val === "") {
            setQuantityInput("");
            return;
        }

        const digits = val.replace(/\D/g, "");
        if (!digits) {
            setQuantityInput("");
            return;
        }

        const num = parseInt(digits, 10);
        if (num > maxStock) {
            setQuantityInput(String(maxStock));
            toast.error(`Maksimal stok tersedia adalah ${maxStock} barang.`);
        } else {
            setQuantityInput(String(num));
        }
    };

    const handleQuantityBlur = () => {
        if (!quantityInput || parseInt(quantityInput, 10) < 1) {
            setQuantityInput("1");
        }
    };

    const adjustQuantity = (delta: number) => {
        const current = parseInt(quantityInput, 10) || 1;
        const next = Math.max(1, Math.min(maxStock, current + delta));
        setQuantityInput(String(next));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);

        if (!numericPrice || numericPrice <= 0) {
            setErrorMsg("Silakan masukkan nominal harga tawaran yang valid.");
            return;
        }

        if (numericPrice >= originalPrice) {
            setErrorMsg(`Harga tawaran harus lebih murah dari harga normal (Rp ${originalPrice.toLocaleString("id-ID")}).`);
            return;
        }

        if (numericPrice < minPrice) {
            setErrorMsg(`Harga tawaran terlalu rendah. Minimal 30% dari harga normal (Rp ${minPrice.toLocaleString("id-ID")}).`);
            return;
        }

        if (quantity < 1) {
            setErrorMsg("Jumlah barang minimal 1.");
            return;
        }

        if (quantity > maxStock) {
            setErrorMsg(`Jumlah melebihi stok yang tersedia (${maxStock} barang).`);
            return;
        }

        setIsSubmitting(true);
        try {
            const payload: any = {
                product_id: product.id,
                offered_price: numericPrice,
                quantity: quantity,
            };

            if (product.sku_id) {
                payload.product_sku_id = product.sku_id;
            }

            if (poDays && Number(poDays) > 0) {
                payload.po_days = Number(poDays);
            }

            if (note.trim()) {
                payload.note = note.trim();
            }

            const res = await axios.post(`/chat/rooms/${roomId}/negotiate`, payload);
            toast.success(res.data.message || "Tawaran produk berhasil diajukan!");
            onSuccess(res.data.negotiation);
            onClose();
        } catch (err: any) {
            const msg =
                err.response?.data?.message ||
                err.response?.data?.errors?.offered_price?.[0] ||
                err.response?.data?.errors?.quantity?.[0] ||
                "Gagal mengajukan tawaran produk.";
            setErrorMsg(msg);
            toast.error(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen || !mounted) return null;

    const modalContent = (
        <div className="fixed inset-0 z-[9990] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
            <div
                className="w-full max-w-md bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-5 py-4 bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-100 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-brand-orange/15 text-brand-orange flex items-center justify-center shrink-0">
                            <Tag className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 leading-tight">
                                Tawar Produk
                            </h3>
                            <p className="text-[11px] text-gray-500">
                                Ajukan harga, jumlah pesanan, dan catatan khusus ke penjual
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
                    {/* Product Summary */}
                    <div className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-xl border border-gray-200/80">
                        <div className="w-12 h-12 rounded-lg bg-white overflow-hidden shrink-0 border border-gray-100">
                            {product.image_path ? (
                                <img
                                    src={product.image_path}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <ShoppingBag className="w-5 h-5 m-auto text-gray-400 mt-3" />
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="font-bold text-gray-900 truncate">{product.name}</p>
                            {product.variant_name && (
                                <p className="text-[11px] text-gray-500">Varian: {product.variant_name}</p>
                            )}
                            <p className="text-xs font-semibold text-gray-600">
                                Harga Asli:{" "}
                                <span className="text-gray-900 font-bold">
                                    Rp {originalPrice.toLocaleString("id-ID")}
                                </span>
                            </p>
                        </div>
                    </div>

                    {errorMsg && (
                        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-start gap-2 text-xs">
                            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                            <span className="flex-1">{errorMsg}</span>
                        </div>
                    )}

                    {/* Offered Price Input with Auto Rupiah Formatting */}
                    <div>
                        <label className="block font-semibold text-gray-700 mb-1">
                            Harga Tawaran per Barang (Rp) <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-xs">
                                Rp
                            </span>
                            <input
                                type="text"
                                inputMode="numeric"
                                required
                                value={offeredPrice}
                                onChange={handlePriceChange}
                                placeholder="Contoh: 25.000 atau 25k"
                                className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm font-bold text-gray-900 bg-white border border-gray-300 rounded-xl focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition"
                            />
                        </div>
                        <p className="mt-1 text-[11px] text-gray-400 flex items-center gap-1">
                            <Info className="w-3 h-3 text-gray-400 shrink-0" />
                            Tawaran minimal 30% dari harga normal (Rp {minPrice.toLocaleString("id-ID")})
                        </p>
                    </div>

                    {/* Quantity & PO Section */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Quantity with custom stepper & direct input */}
                        <div>
                            <label className="block font-semibold text-gray-700 mb-1">
                                Jumlah (Qty) <span className="text-rose-500">*</span>
                            </label>
                            <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden focus-within:border-brand-orange focus-within:ring-1 focus-within:ring-brand-orange bg-white">
                                <button
                                    type="button"
                                    onClick={() => adjustQuantity(-1)}
                                    disabled={quantity <= 1}
                                    className="p-2 sm:p-2.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 active:bg-gray-200 disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer"
                                    aria-label="Kurangi jumlah"
                                >
                                    <Minus className="w-3.5 h-3.5" />
                                </button>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    required
                                    value={quantityInput}
                                    onChange={handleQuantityChange}
                                    onBlur={handleQuantityBlur}
                                    placeholder="1"
                                    className="w-full py-2 text-center text-xs sm:text-sm font-bold text-gray-900 border-none focus:outline-none focus:ring-0"
                                />
                                <button
                                    type="button"
                                    onClick={() => adjustQuantity(1)}
                                    disabled={quantity >= maxStock}
                                    className="p-2 sm:p-2.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 active:bg-gray-200 disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer"
                                    aria-label="Tambah jumlah"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            {maxStock < 999 && (
                                <p className="mt-1 text-[10px] text-gray-400">Tersedia: {maxStock} pcs</p>
                            )}
                        </div>

                        {/* PO Days */}
                        <div>
                            <label className="block font-semibold text-gray-700 mb-1 flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-gray-400" />
                                Waktu PO (Hari)
                            </label>
                            <input
                                type="text"
                                inputMode="numeric"
                                value={poDays}
                                onChange={(e) => {
                                    const digits = e.target.value.replace(/\D/g, "");
                                    const num = parseInt(digits, 10);
                                    if (!digits) {
                                        setPoDays("");
                                    } else if (num > 30) {
                                        setPoDays("30");
                                    } else {
                                        setPoDays(String(num));
                                    }
                                }}
                                placeholder="Opsional (1-30 hari)"
                                className="w-full px-3 py-2.5 text-xs sm:text-sm text-gray-900 bg-white border border-gray-300 rounded-xl focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition"
                            />
                        </div>
                    </div>

                    {/* Catatan untuk Penjual (Lebih Luas & Nyaman di HP) */}
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <label className="font-semibold text-gray-700">
                                Catatan untuk Penjual (Opsional)
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
                            placeholder="Contoh: Mau beli banyak buat acara syukuran warga, tolong dipertimbangkan ya kak. Packing vakum rapi ya :)"
                            className="w-full min-h-[85px] px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 bg-white border border-gray-300 rounded-xl focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition resize-none leading-relaxed placeholder:text-gray-400"
                        />
                    </div>

                    {/* Calculation Summary */}
                    {numericPrice > 0 && (
                        <div className="p-3 bg-orange-50/70 rounded-xl border border-orange-100 space-y-1">
                            <div className="flex items-center justify-between text-[11px] text-gray-600">
                                <span>Total Harga Normal ({quantity} barang):</span>
                                <span className="line-through text-gray-400">
                                    Rp {originalTotal.toLocaleString("id-ID")}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-xs font-bold text-gray-900">
                                <span>Total Tawaran Anda:</span>
                                <span className="text-brand-orange font-extrabold text-sm sm:text-base">
                                    Rp {totalPrice.toLocaleString("id-ID")}
                                </span>
                            </div>
                            {savings > 0 && (
                                <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 pt-1">
                                    <Sparkles className="w-3.5 h-3.5" />
                                    Hemat Rp {savings.toLocaleString("id-ID")}!
                                </div>
                            )}
                        </div>
                    )}

                    {/* Submit Buttons */}
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
                            disabled={isSubmitting || numericPrice >= originalPrice || numericPrice < minPrice}
                            className="px-4 py-2.5 text-xs font-bold text-white bg-brand-orange hover:bg-brand-orange-dark active:scale-95 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    Mengirim...
                                </>
                            ) : (
                                <>
                                    <Tag className="w-3.5 h-3.5" />
                                    Kirim Tawaran Produk
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


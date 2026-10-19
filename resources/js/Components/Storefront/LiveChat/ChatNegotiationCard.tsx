import React, { useState } from "react";
import { NegotiationItem } from "@/types/chat";
import {
    Tag,
    Clock,
    CheckCircle2,
    XCircle,
    ShoppingBag,
    ArrowRight,
    Loader2,
    Calendar,
    MessageSquare,
    AlertCircle,
    Check,
    X,
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

interface Props {
    negotiation: NegotiationItem;
    role: "buyer" | "merchant";
    onOpenCounterModal?: (negotiation: NegotiationItem) => void;
    onNegotiationUpdated?: (updated: NegotiationItem) => void;
}

export default function ChatNegotiationCard({
    negotiation,
    role,
    onOpenCounterModal,
    onNegotiationUpdated,
}: Props) {
    const [isActionLoading, setIsActionLoading] = useState<string | null>(null);

    const isBuyer = role === "buyer";
    const isMerchant = role === "merchant";

    const isExpired = negotiation.is_expired || (negotiation.expires_at ? new Date(negotiation.expires_at) < new Date() : false);
    const effectiveStatus = isExpired && ["pending", "countered", "accepted"].includes(negotiation.status)
        ? "expired"
        : negotiation.status;

    const unit = negotiation.product?.unit || "pcs";
    const displayPrice = negotiation.counter_price ? Number(negotiation.counter_price) : Number(negotiation.offered_price);
    const totalPrice = displayPrice * negotiation.quantity;
    const originalTotal = Number(negotiation.original_price) * negotiation.quantity;
    const discountPercent = Math.round(((originalTotal - totalPrice) / originalTotal) * 100);

    const handleBuyerAccept = async () => {
        setIsActionLoading("buyer_accept");
        try {
            const res = await axios.post(`/chat/negotiations/${negotiation.id}/accept`);
            toast.success(res.data.message || "Tawaran balik berhasil disetujui!");
            if (res.data.negotiation && onNegotiationUpdated) {
                onNegotiationUpdated(res.data.negotiation);
            }
        } catch (err: any) {
            const msg = err.response?.data?.message || err.response?.data?.errors?.negotiation?.[0] || "Gagal menyetujui tawaran balik.";
            toast.error(msg);
        } finally {
            setIsActionLoading(null);
        }
    };

    const handleBuyerReject = async () => {
        setIsActionLoading("buyer_reject");
        try {
            const res = await axios.post(`/chat/negotiations/${negotiation.id}/reject`);
            toast.success(res.data.message || "Tawaran balik ditolak.");
            if (res.data.negotiation && onNegotiationUpdated) {
                onNegotiationUpdated(res.data.negotiation);
            }
        } catch (err: any) {
            const msg = err.response?.data?.message || "Gagal menolak tawaran balik.";
            toast.error(msg);
        } finally {
            setIsActionLoading(null);
        }
    };

    const handleBuyerCheckout = async () => {
        setIsActionLoading("buyer_checkout");
        try {
            const res = await axios.post(`/chat/negotiations/${negotiation.id}/checkout`);
            if (res.data.checkout_url) {
                window.location.href = res.data.checkout_url;
            }
        } catch (err: any) {
            const msg = err.response?.data?.message || err.response?.data?.errors?.negotiation?.[0] || "Gagal memproses checkout penawaran.";
            toast.error(msg);
            setIsActionLoading(null);
        }
    };

    const handleMerchantAccept = async () => {
        setIsActionLoading("merchant_accept");
        try {
            const res = await axios.post(`/pedagang/chat/negotiations/${negotiation.id}/accept`);
            toast.success(res.data.message || "Tawaran produk disetujui!");
            if (res.data.negotiation && onNegotiationUpdated) {
                onNegotiationUpdated(res.data.negotiation);
            }
        } catch (err: any) {
            const msg = err.response?.data?.message || err.response?.data?.errors?.negotiation?.[0] || "Gagal menyetujui tawaran.";
            toast.error(msg);
        } finally {
            setIsActionLoading(null);
        }
    };

    const handleMerchantReject = async () => {
        setIsActionLoading("merchant_reject");
        try {
            const res = await axios.post(`/pedagang/chat/negotiations/${negotiation.id}/reject`);
            toast.success(res.data.message || "Tawaran produk ditolak.");
            if (res.data.negotiation && onNegotiationUpdated) {
                onNegotiationUpdated(res.data.negotiation);
            }
        } catch (err: any) {
            const msg = err.response?.data?.message || "Gagal menolak penawaran.";
            toast.error(msg);
        } finally {
            setIsActionLoading(null);
        }
    };

    const renderStatusBadge = () => {
        switch (effectiveStatus) {
            case "pending":
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <Clock className="w-3 h-3 text-amber-500 animate-spin-slow" />
                        Menunggu Respon
                    </span>
                );
            case "countered":
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        <Tag className="w-3 h-3 text-blue-500" />
                        Tawaran Balik
                    </span>
                );
            case "accepted":
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Disetujui
                    </span>
                );
            case "rejected":
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        <XCircle className="w-3 h-3 text-rose-500" />
                        Ditolak
                    </span>
                );
            case "purchased":
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                        <ShoppingBag className="w-3 h-3 text-purple-600" />
                        Sudah Dibeli
                    </span>
                );
            case "expired":
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600 border border-gray-200">
                        <AlertCircle className="w-3 h-3 text-gray-400" />
                        Kadaluarsa
                    </span>
                );
        }
    };

    return (
        <div className="mb-2 w-full max-w-[310px] sm:max-w-[340px] bg-white rounded-2xl border border-gray-200/90 shadow-sm overflow-hidden text-gray-800">
            {/* Header Card */}
            <div className="px-3.5 py-2 bg-gradient-to-r from-orange-50/90 to-amber-50/80 border-b border-orange-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-xs text-gray-800">
                    <Tag className="w-3.5 h-3.5 text-brand-orange" />
                    <span>Nego Produk</span>
                </div>
                {renderStatusBadge()}
            </div>

            {/* Product Body */}
            <div className="p-3">
                <div className="flex items-start gap-2.5">
                    <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-200/80">
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
                        <p className="text-xs font-bold text-gray-900 line-clamp-1">
                            {negotiation.product?.name || "Produk"}
                        </p>
                        {negotiation.variant_name && (
                            <span className="inline-block mt-0.5 px-1.5 py-0.2 text-[10px] font-medium bg-gray-100 text-gray-600 rounded">
                                Varian: {negotiation.variant_name}
                            </span>
                        )}
                        <p className="text-[11px] text-gray-400 line-through mt-0.5">
                            Rp {Number(negotiation.original_price).toLocaleString("id-ID")}
                        </p>
                    </div>
                </div>

                {/* Offer Details */}
                <div className="mt-3 p-2.5 bg-gray-50/80 rounded-xl border border-gray-100 space-y-1.5">
                    <div className="flex items-baseline justify-between">
                        <span className="text-[11px] text-gray-500 font-medium">
                            {negotiation.counter_price ? "Tawaran Balik Penjual:" : "Harga Tawaran:"}
                        </span>
                        <div className="text-right">
                            <span className="text-sm font-extrabold text-brand-orange">
                                Rp {displayPrice.toLocaleString("id-ID")}
                            </span>
                            <span className="text-[10px] text-gray-500 ml-1">/{unit}</span>
                            {discountPercent > 0 && (
                                <span className="ml-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1 py-0.2 rounded">
                                    -{discountPercent}%
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-gray-600">
                        <span>Jumlah Pesanan:</span>
                        <span className="font-semibold text-gray-800">
                            {negotiation.quantity} {unit}
                        </span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1.5 border-t border-gray-200/60 font-bold">
                        <span className="text-gray-700">Total Kesepakatan:</span>
                        <span className="text-brand-orange">
                            Rp {totalPrice.toLocaleString("id-ID")}
                        </span>
                    </div>
                </div>

                {/* Optional PO Days */}
                {negotiation.po_days && negotiation.po_days > 0 && (
                    <div className="mt-2 flex items-center gap-1 text-[10px] font-medium text-amber-700 bg-amber-50/70 px-2.5 py-1 rounded-lg border border-amber-200/60">
                        <Calendar className="w-3 h-3 shrink-0 text-amber-600" />
                        <span>Pre-Order: perkiraan dikirim dalam {negotiation.po_days} hari</span>
                    </div>
                )}

                {/* Optional Note */}
                {negotiation.note && (
                    <div className="mt-2 flex items-start gap-1 text-[11px] text-gray-600 bg-white p-2 rounded-lg border border-gray-100 italic">
                        <MessageSquare className="w-3 h-3 text-gray-400 mt-0.5 shrink-0" />
                        <span className="break-words line-clamp-2">"{negotiation.note}"</span>
                    </div>
                )}

                {/* Status Notice / Expiry Note */}
                {!["purchased", "rejected", "expired"].includes(effectiveStatus) && (
                    <p className="mt-2 text-[10px] text-gray-400 flex items-center gap-1 justify-center">
                        <Clock className="w-3 h-3 text-gray-400" />
                        Berlaku 24 jam sejak pengajuan
                    </p>
                )}

                {/* Buyer Actions */}
                {isBuyer && effectiveStatus === "countered" && (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            onClick={handleBuyerReject}
                            disabled={isActionLoading !== null}
                            className="px-2.5 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                        >
                            {isActionLoading === "buyer_reject" ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                                <>
                                    <X className="w-3.5 h-3.5" />
                                    Tolak
                                </>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={handleBuyerAccept}
                            disabled={isActionLoading !== null}
                            className="px-2.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition flex items-center justify-center gap-1 cursor-pointer shadow-xs disabled:opacity-50"
                        >
                            {isActionLoading === "buyer_accept" ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                                <>
                                    <Check className="w-3.5 h-3.5" />
                                    Terima
                                </>
                            )}
                        </button>
                    </div>
                )}

                {isBuyer && effectiveStatus === "accepted" && (
                    <div className="mt-3">
                        <button
                            type="button"
                            onClick={handleBuyerCheckout}
                            disabled={isActionLoading !== null}
                            className="w-full py-2 px-3 text-xs font-bold text-white bg-brand-orange hover:bg-brand-orange-dark rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
                        >
                            {isActionLoading === "buyer_checkout" ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                                <>
                                    <ShoppingBag className="w-3.5 h-3.5" />
                                    Beli Sekarang (Rp {totalPrice.toLocaleString("id-ID")})
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </>
                            )}
                        </button>
                    </div>
                )}

                {/* Merchant Actions */}
                {isMerchant && effectiveStatus === "pending" && (
                    <div className="mt-3 flex items-center gap-1.5">
                        <button
                            type="button"
                            onClick={handleMerchantReject}
                            disabled={isActionLoading !== null}
                            className="p-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition flex items-center justify-center cursor-pointer shrink-0 disabled:opacity-50"
                            title="Tolak Penawaran"
                        >
                            {isActionLoading === "merchant_reject" ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                                <X className="w-4 h-4" />
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => onOpenCounterModal && onOpenCounterModal(negotiation)}
                            disabled={isActionLoading !== null}
                            className="flex-1 py-1.5 px-2 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 rounded-xl transition flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                        >
                            <Tag className="w-3.5 h-3.5" />
                            Tawar Balik
                        </button>
                        <button
                            type="button"
                            onClick={handleMerchantAccept}
                            disabled={isActionLoading !== null}
                            className="flex-1 py-1.5 px-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition flex items-center justify-center gap-1 cursor-pointer shadow-xs disabled:opacity-50"
                        >
                            {isActionLoading === "merchant_accept" ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                                <>
                                    <Check className="w-3.5 h-3.5" />
                                    Terima
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}


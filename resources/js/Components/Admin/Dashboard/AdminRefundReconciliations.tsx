import React, { useState } from "react";
import { router } from "@inertiajs/react";
import { AlertTriangle, CheckCircle, RefreshCw, User, Store, Banknote } from "lucide-react";

export interface ReconciliationOrder {
    id: number;
    invoice_number: string;
    store_name: string;
    customer_name: string;
    customer_phone: string;
    total_amount: number;
    payment_method: string;
    payment_channel?: string | null;
    shipping_status: string;
    payment_status: string;
    refund_type: string;
    refund_reason: string;
    refund_amount: number;
    created_at: string;
}

interface Props {
    reconciliations?: ReconciliationOrder[];
}

export default function AdminRefundReconciliations({ reconciliations = [] }: Props) {
    const [processingId, setProcessingId] = useState<number | null>(null);

    if (!reconciliations || reconciliations.length === 0) {
        return null;
    }

    const handleReconcile = (order: ReconciliationOrder) => {
        if (!confirm(`Tandai rekonsiliasi pesanan #${order.invoice_number} sebesar Rp ${order.refund_amount.toLocaleString("id-ID")} sebagai selesai/telah ditransfer?`)) {
            return;
        }

        setProcessingId(order.id);
        router.post(
            route("admin.orders.reconcile", order.id),
            {},
            {
                preserveScroll: true,
                onFinish: () => setProcessingId(null),
            }
        );
    };

    return (
        <div className="bg-amber-50/70 border border-amber-200 rounded-3xl p-5 md:p-6 mb-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 shrink-0">
                        <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-base md:text-lg font-bold text-gray-900 flex items-center gap-2">
                            Perlu Tindakan Pengelola: Rekonsiliasi & Refund Manual
                            <span className="px-2 py-0.5 text-xs font-semibold bg-amber-200 text-amber-800 rounded-full">
                                {reconciliations.length} Pesanan
                            </span>
                        </h3>
                        <p className="text-xs text-gray-600 mt-0.5">
                            Pesanan non-COD yang dibatalkan membutuhkan verifikasi atau pengembalian dana manual oleh Pemerintah Desa Cibenda.
                        </p>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-xs md:text-sm text-gray-700">
                    <thead className="bg-amber-100/60 text-gray-700 font-semibold uppercase text-[11px] tracking-wider rounded-xl">
                        <tr>
                            <th className="py-2.5 px-3 rounded-l-xl">No. Invoice & Tanggal</th>
                            <th className="py-2.5 px-3">Toko Mitra</th>
                            <th className="py-2.5 px-3">Pelanggan</th>
                            <th className="py-2.5 px-3">Nominal Refund</th>
                            <th className="py-2.5 px-3">Metode & Alasan</th>
                            <th className="py-2.5 px-3 text-right rounded-r-xl">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-amber-200/50">
                        {reconciliations.map((order) => (
                            <tr key={order.id} className="hover:bg-amber-100/30 transition">
                                <td className="py-3 px-3 font-semibold text-gray-900">
                                    <div>#{order.invoice_number}</div>
                                    <div className="text-[11px] text-gray-500 font-normal">{order.created_at}</div>
                                </td>
                                <td className="py-3 px-3">
                                    <div className="flex items-center gap-1.5 font-medium text-gray-800">
                                        <Store className="w-3.5 h-3.5 text-gray-500" />
                                        <span>{order.store_name}</span>
                                    </div>
                                </td>
                                <td className="py-3 px-3">
                                    <div className="flex items-center gap-1.5 font-medium text-gray-800">
                                        <User className="w-3.5 h-3.5 text-gray-500" />
                                        <span>{order.customer_name}</span>
                                    </div>
                                    <div className="text-[11px] text-gray-500">{order.customer_phone}</div>
                                </td>
                                <td className="py-3 px-3 font-bold text-gray-900">
                                    Rp {order.refund_amount.toLocaleString("id-ID")}
                                </td>
                                <td className="py-3 px-3">
                                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-white border border-amber-300 text-amber-800">
                                        <Banknote className="w-3 h-3" />
                                        {order.refund_type === "manual_bank_transfer" ? "VA (Transfer Manual)" : "Gateway Sync"}
                                    </div>
                                    <div className="text-[11px] text-gray-600 mt-1 max-w-xs line-clamp-2">
                                        {order.refund_reason}
                                    </div>
                                </td>
                                <td className="py-3 px-3 text-right">
                                    <button
                                        type="button"
                                        onClick={() => handleReconcile(order)}
                                        disabled={processingId === order.id}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition disabled:opacity-50 cursor-pointer"
                                    >
                                        {processingId === order.id ? (
                                            <>
                                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                                Memproses...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle className="w-3.5 h-3.5" />
                                                Selesaikan
                                            </>
                                        )}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

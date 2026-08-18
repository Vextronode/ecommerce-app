import React, { useState } from "react";
import axios from "axios";
import TableToolbar from "./TableToolbar";
import OrderTableRow from "./OrderTableRow";
import OrderMobileCard from "./OrderMobileCard";
import Pagination from "./Pagination";
import Modal from "@/Components/Modal";
import { QRCodeSVG } from "qrcode.react";
import {
    QrCode,
    X,
    Layers,
    CheckSquare,
    Square,
    Sparkles,
} from "lucide-react";

export default function OrderTable({
    orders,
    onOpenAction,
}: {
    orders: any;
    onOpenAction: (order: any) => void;
}) {
    const [selectedOrderIds, setSelectedOrderIds] = useState<number[]>([]);
    const [isGeneratingBatch, setIsGeneratingBatch] = useState(false);
    const [batchData, setBatchData] = useState<{
        batch_token: string;
        batch_url: string;
        orders_count: number;
        invoices: string[];
    } | null>(null);
    const [showBatchModal, setShowBatchModal] = useState(false);
    const [batchError, setBatchError] = useState<string | null>(null);

    // Eligible batch orders: ONLY orders already processed ('processing') with Kurir Toko
    const eligibleOrders =
        orders?.data?.filter(
            (o: any) =>
                o.delivery_method === "local_delivery" &&
                o.shipping_status === "processing"
        ) || [];

    const isAllEligibleSelected =
        eligibleOrders.length > 0 &&
        eligibleOrders.every((o: any) => selectedOrderIds.includes(o.id));

    const toggleSelectOrder = (orderId: number) => {
        setSelectedOrderIds((prev) =>
            prev.includes(orderId)
                ? prev.filter((id) => id !== orderId)
                : [...prev, orderId]
        );
    };

    const handleSelectAll = () => {
        if (isAllEligibleSelected) {
            setSelectedOrderIds([]);
        } else {
            setSelectedOrderIds(eligibleOrders.map((o: any) => o.id));
        }
    };

    const handleCreateMasterQR = async () => {
        if (selectedOrderIds.length < 2) return;

        setIsGeneratingBatch(true);
        setBatchError(null);

        try {
            const res = await axios.post("/pedagang/orders/batch-handover", {
                order_ids: selectedOrderIds,
            });

            if (res.data?.success) {
                setBatchData(res.data);
                setShowBatchModal(true);
            }
        } catch (err: any) {
            setBatchError(
                err?.response?.data?.error || "Gagal membuat Master QR Code."
            );
        } finally {
            setIsGeneratingBatch(false);
        }
    };

    return (
        <div className="relative bg-white rounded-[20px] border border-[#41B9C5]/20 shadow-sm overflow-hidden flex flex-col w-full">
            <TableToolbar />

            {/* Desktop View */}
            <div className="hidden lg:block w-full overflow-x-hidden">
                <table className="w-full text-left border-collapse table-auto">
                    <thead>
                        <tr className="border-b border-gray-100 bg-white">
                            <th className="py-4 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                <div className="flex items-center gap-2">
                                    {eligibleOrders.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={handleSelectAll}
                                            className="text-[#41B9C5] hover:text-[#14433D] transition rounded shrink-0 cursor-pointer"
                                            title={
                                                isAllEligibleSelected
                                                    ? "Batal Pilih Semua"
                                                    : "Pilih Semua Pesanan Siap Kirim"
                                            }
                                        >
                                            {isAllEligibleSelected ? (
                                                <CheckSquare className="w-4 h-4 text-[#41B9C5]" />
                                            ) : (
                                                <Square className="w-4 h-4 text-gray-300 hover:text-gray-400" />
                                            )}
                                        </button>
                                    )}
                                    <span>ORDER ID</span>
                                </div>
                            </th>
                            {[
                                "CUSTOMER",
                                "ITEMS",
                                "DATE",
                                "TOTAL",
                                "PAYMENT",
                                "SHIPPING",
                                "ACTIONS",
                            ].map((th) => (
                                <th
                                    key={th}
                                    className={`py-4 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider ${
                                        th === "ACTIONS" ? "text-center" : ""
                                    }`}
                                >
                                    {th}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {orders?.data?.length > 0 ? (
                            orders.data.map((order: any) => (
                                <OrderTableRow
                                    key={order.id}
                                    order={order}
                                    onOpenAction={onOpenAction}
                                    isSelected={selectedOrderIds.includes(order.id)}
                                    onToggleSelect={toggleSelectOrder}
                                />
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={8}
                                    className="py-8 text-center text-gray-400 font-medium"
                                >
                                    Belum ada pesanan masuk.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile View */}
            <div className="block lg:hidden divide-y divide-gray-100">
                {orders?.data?.length > 0 ? (
                    orders.data.map((order: any) => (
                        <OrderMobileCard
                            key={order.id}
                            order={order}
                            onOpenAction={onOpenAction}
                            isSelected={selectedOrderIds.includes(order.id)}
                            onToggleSelect={toggleSelectOrder}
                        />
                    ))
                ) : (
                    <div className="py-12 text-center text-gray-400 font-medium">
                        Belum ada pesanan masuk.
                    </div>
                )}
            </div>

            <Pagination pagination={orders} />

            {/* Floating Action Pill Dock for Batch Delivery */}
            {selectedOrderIds.length >= 2 && (
                <aside
                    aria-label="Floating Batch Bar"
                    className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#14433D]/95 backdrop-blur-xl text-white py-2.5 px-4 rounded-full shadow-2xl border border-white/20 flex items-center gap-3 animate-[slideUp_0.25s_ease-out]"
                >
                    <div className="flex items-center gap-2 pl-1">
                        <span className="w-6 h-6 rounded-full bg-[#41B9C5] text-[#14433D] flex items-center justify-center font-black text-xs">
                            {selectedOrderIds.length}
                        </span>
                        <span className="text-xs font-bold text-white whitespace-nowrap">
                            Pesanan Dipilih
                        </span>
                    </div>

                    <div className="h-4 w-px bg-white/20" />

                    <button
                        type="button"
                        disabled={isGeneratingBatch}
                        onClick={handleCreateMasterQR}
                        className="bg-gradient-to-r from-[#41B9C5] to-[#38a6b1] hover:from-[#38a6b1] hover:to-[#2e8f99] text-white font-bold text-xs py-2 px-4 rounded-full shadow-md transition flex items-center gap-1.5 active:scale-95 cursor-pointer disabled:opacity-50 whitespace-nowrap shrink-0"
                    >
                        {isGeneratingBatch ? (
                            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <QrCode className="w-3.5 h-3.5" />
                                <span>Buat Master QR</span>
                            </>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => setSelectedOrderIds([])}
                        className="w-7 h-7 text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition flex items-center justify-center cursor-pointer shrink-0"
                        title="Batal Pilih"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </aside>
            )}

            {/* Master QR Modal */}
            {batchData && (
                <Modal
                    show={showBatchModal}
                    onClose={() => setShowBatchModal(false)}
                    maxWidth="md"
                >
                    <div aria-label="Master QR Delivery" className="p-6 relative text-center font-sans">
                        <button
                            aria-label="Tutup modal"
                            onClick={() => setShowBatchModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-full p-2 transition-colors cursor-pointer"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="w-16 h-16 bg-[#EAF7F7] text-[#41B9C5] rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
                            <Layers className="w-8 h-8" />
                        </div>

                        <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#EAF7F7] text-[#14433D] text-xs font-bold mb-2">
                            <Sparkles className="w-3.5 h-3.5 text-[#41B9C5]" />
                            <span>Pengiriman Gabungan ({batchData.orders_count} Pesanan)</span>
                        </div>

                        <h3 className="text-xl font-extrabold text-[#14433D] mb-1">
                            Master QR Code Serah Terima
                        </h3>
                        <p className="text-xs text-gray-500 mb-5 max-w-sm mx-auto">
                            Minta kurir untuk <strong>Scan 1 QR Code</strong> ini. Kurir akan otomatis mendapatkan urutan rute multi-stop terdekat ke terjauh.
                        </p>

                        <div className="bg-white p-5 rounded-2xl border border-gray-100 flex justify-center mb-4 shadow-sm">
                            <QRCodeSVG
                                value={batchData.batch_url}
                                size={240}
                                className="w-full h-auto max-w-[240px]"
                            />
                        </div>

                        <div className="bg-gray-50 p-3.5 rounded-xl text-left text-xs mb-4 border border-gray-100 space-y-1.5">
                            <div className="flex justify-between items-center text-gray-500">
                                <span>Kode Batch:</span>
                                <span className="font-mono font-bold text-[#14433D]">
                                    #{batchData.batch_token}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-gray-500">
                                <span>Daftar Invoice:</span>
                                <span className="font-mono text-[11px] text-gray-700 font-semibold truncate max-w-[200px]">
                                    {batchData.invoices.map((inv) => `#${inv}`).join(", ")}
                                </span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                setShowBatchModal(false);
                                setSelectedOrderIds([]);
                            }}
                            className="w-full py-3 bg-[#14433D] hover:bg-[#0f342f] text-white text-xs font-bold rounded-xl transition cursor-pointer"
                        >
                            Selesai / Tutup
                        </button>
                    </div>
                </Modal>
            )}

            <style>{`
                @keyframes slideUp {
                    from { transform: translate(-50%, 100%); opacity: 0; }
                    to { transform: translate(-50%, 0); opacity: 1; }
                }
            `}</style>
        </div>
    );
}

import React, { useEffect } from "react";
import { useForm } from "@inertiajs/react";
import { X, Truck, Package, Clock, CheckCircle } from "lucide-react";

export default function UpdateStatusModal({ isOpen, onClose, order }: any) {
    const { data, setData, put, processing, reset } = useForm({
        shipping_status: "pending",
    });

    useEffect(() => {
        if (order) {
            setData("shipping_status", order.shipping_status);
        }
    }, [order, isOpen]);

    if (!isOpen || !order) return null;

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route("merchant.orders.update-status", order.id), {
            onSuccess: () => {
                onClose();
                reset();
            },
        });
    };

    const statuses = [
        {
            id: "pending",
            label: "Menunggu",
            icon: Clock,
            desc: "Pesanan baru masuk",
        },
        {
            id: "processing",
            label: "Diproses",
            icon: Package,
            desc: "Sedang disiapkan / dipacking",
        },
        {
            id: "shipped",
            label: "Dikirim",
            icon: Truck,
            desc: "Dalam perjalanan ke pembeli",
        },
        {
            id: "delivered",
            label: "Selesai",
            icon: CheckCircle,
            desc: "Pesanan sudah diterima",
        },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center p-5 border-b border-gray-100">
                    <div>
                        <h3 className="font-bold text-[#14433D] text-lg">
                            Update Status
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Order ID:{" "}
                            <span className="font-bold text-[#41B9C5]">
                                {order.invoice_number}
                            </span>
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={submit} className="p-5">
                    <div className="space-y-3 mb-6">
                        {statuses.map((s) => (
                            <label
                                key={s.id}
                                className={`flex items-center p-3 border rounded-xl cursor-pointer transition-all ${
                                    data.shipping_status === s.id
                                        ? "border-[#41B9C5] bg-[#EAF7F7]"
                                        : "border-gray-200 hover:border-[#41B9C5]/50 hover:bg-gray-50"
                                }`}
                            >
                                <div className="flex items-center">
                                    <input
                                        type="radio"
                                        name="status"
                                        value={s.id}
                                        checked={data.shipping_status === s.id}
                                        onChange={(e) =>
                                            setData(
                                                "shipping_status",
                                                e.target.value,
                                            )
                                        }
                                        className="w-4 h-4 text-[#41B9C5] bg-white border-gray-300 focus:ring-[#41B9C5]"
                                    />
                                </div>
                                <div className="ml-3 flex-1 flex items-center gap-3">
                                    <div
                                        className={`p-2 rounded-full ${data.shipping_status === s.id ? "bg-[#41B9C5] text-white" : "bg-gray-100 text-gray-500"}`}
                                    >
                                        <s.icon className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <span
                                            className={`block text-sm font-bold ${data.shipping_status === s.id ? "text-[#14433D]" : "text-gray-700"}`}
                                        >
                                            {s.label}
                                        </span>
                                        <span className="block text-xs text-gray-500 mt-0.5">
                                            {s.desc}
                                        </span>
                                    </div>
                                </div>
                            </label>
                        ))}
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm rounded-xl transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex-1 py-2.5 px-4 bg-[#14433D] hover:bg-[#14433D]/90 text-white font-bold text-sm rounded-xl transition-colors disabled:opacity-50"
                        >
                            {processing ? "Menyimpan..." : "Simpan Perubahan"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

import React, { useState } from "react";
import { CheckCircle2, Phone, MessageSquare } from "lucide-react";
import { formatRupiah } from "@/utils/formatters";

export interface BatchStopData {
    id: number;
    invoice_number: string;
    stop_number: number;
    status: string;
    customer_name: string;
    customer_phone: string;
    shipping_address: string;
    shipping_latitude: number | null;
    shipping_longitude: number | null;
    shipping_pin?: string;
    distance_km: number | null;
    total_amount: number;
    payment_method: string;
    payment_status: string;
    items: Array<{
        name: string;
        qty: number;
        price: number;
    }>;
}

interface Props {
    stop: BatchStopData;
    isDriver: boolean;
    onVerifyPin: (invoiceNumber: string, pin: string) => void;
    isSubmitting: boolean;
    errorMessage?: string;
}

export default function BatchStopCard({
    stop,
    isDriver,
    onVerifyPin,
    isSubmitting,
    errorMessage,
}: Props) {
    const [pin, setPin] = useState("");
    const isDelivered = stop.status === "delivered";

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onVerifyPin(stop.invoice_number, pin);
    };

    const totalItems = stop.items.reduce((s, i) => s + i.qty, 0);

    return (
        <div
            className={`rounded-2xl p-4 transition-all shadow-sm border ${
                isDelivered
                    ? "bg-emerald-50/70 border-emerald-200/80"
                    : "bg-white border-slate-200 hover:border-[#41B9C5]/50"
            }`}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div
                        className={`w-9 h-9 rounded-xl font-black text-sm flex items-center justify-center shrink-0 shadow-sm ${
                            isDelivered
                                ? "bg-emerald-600 text-white"
                                : "bg-gradient-to-br from-[#ED7218] to-orange-600 text-white"
                        }`}
                    >
                        {isDelivered ? <CheckCircle2 className="w-5 h-5" /> : stop.stop_number}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h4 className="font-bold text-[#14433D] text-sm truncate">
                                {stop.customer_name}
                            </h4>
                            {isDelivered && (
                                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                                    Terkirim
                                </span>
                            )}
                        </div>
                        <p className="text-[11px] font-mono text-slate-400">
                            #{stop.invoice_number}
                        </p>
                    </div>
                </div>

                {/* Contact Shortcuts */}
                <div className="flex items-center gap-1 shrink-0">
                    {stop.customer_phone && (
                        <>
                            <a
                                href={`tel:${stop.customer_phone}`}
                                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition"
                                title="Telepon"
                            >
                                <Phone className="w-3.5 h-3.5" />
                            </a>
                            <a
                                href={`https://wa.me/${stop.customer_phone
                                    .replace(/\D/g, "")
                                    .replace(/^0/, "62")}?text=${encodeURIComponent(
                                    `Halo kak ${stop.customer_name}, kurir toko sedang mengantar pesanan #${stop.invoice_number}...`
                                )}`}
                                target="_blank"
                                rel="noreferrer"
                                className="w-8 h-8 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 flex items-center justify-center transition"
                                title="WhatsApp"
                            >
                                <MessageSquare className="w-3.5 h-3.5" />
                            </a>
                        </>
                    )}
                </div>
            </div>

            <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
                {stop.shipping_address}
            </p>

            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">
                    {totalItems} item barang
                </span>
                {stop.payment_method === "cod" && stop.payment_status === "pending" ? (
                    <span className="text-amber-600 font-bold">
                        Tagih COD: {formatRupiah(stop.total_amount)}
                    </span>
                ) : (
                    <span className="text-teal-700 font-bold">Lunas (Online)</span>
                )}
            </div>

            {/* PIN Verification Form (Only for Driver & When Shipped) */}
            {!isDelivered && isDriver && (
                <form
                    onSubmit={handleSubmit}
                    className="mt-3 pt-3 border-t border-slate-200 bg-slate-50 -mx-4 -mb-4 p-4 rounded-b-2xl"
                >
                    <label
                        htmlFor={`pin-${stop.invoice_number}`}
                        className="block text-[11px] font-bold text-slate-700 mb-1.5"
                    >
                        Masukkan 4-Digit PIN Pembeli untuk Menyelesaikan:
                    </label>
                    <div className="flex gap-2">
                        <input
                            id={`pin-${stop.invoice_number}`}
                            type="text"
                            inputMode="numeric"
                            maxLength={4}
                            placeholder="••••"
                            value={pin}
                            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                            className="w-28 text-center tracking-[0.4em] font-mono font-bold text-sm bg-white border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-[#41B9C5] focus:outline-none"
                        />
                        <button
                            type="submit"
                            disabled={isSubmitting || pin.length !== 4}
                            className="flex-1 bg-[#14433D] hover:bg-[#0f342f] text-white font-bold text-xs rounded-xl py-2 px-4 transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
                        >
                            {isSubmitting ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Selesaikan Stop {stop.stop_number}</span>
                                </>
                            )}
                        </button>
                    </div>
                    {errorMessage && (
                        <p className="text-red-500 text-[11px] font-semibold mt-1">
                            {errorMessage}
                        </p>
                    )}
                </form>
            )}
        </div>
    );
}

import React from "react";
import { Landmark, QrCode, Banknote, Wallet, Check } from "lucide-react";

export interface PaymentOption {
    id: string;
    method: "va" | "qris" | "gopay" | "cod";
    channel: string;
    name: string;
    description: string;
    badge?: string;
}

interface Props {
    selectedMethod: string;
    selectedChannel: string;
    onSelect: (method: "va" | "qris" | "gopay" | "cod", channel: string) => void;
}

const VA_CHANNELS: PaymentOption[] = [
    {
        id: "bca_va",
        method: "va",
        channel: "bca_va",
        name: "BCA Virtual Account",
        description: "Bayar otomatis via m-BCA, KlikBCA, atau ATM BCA",
        badge: "BCA",
    },
    {
        id: "mandiri_bill",
        method: "va",
        channel: "mandiri_bill",
        name: "Mandiri Bill Payment",
        description: "Bayar via Livin' by Mandiri atau ATM Mandiri",
        badge: "Mandiri",
    },
    {
        id: "bni_va",
        method: "va",
        channel: "bni_va",
        name: "BNI Virtual Account",
        description: "Bayar via BNI Mobile Banking atau ATM BNI",
        badge: "BNI",
    },
    {
        id: "bri_va",
        method: "va",
        channel: "bri_va",
        name: "BRI Virtual Account (BRIVA)",
        description: "Bayar via BRImo atau ATM BRI",
        badge: "BRI",
    },
    {
        id: "permata_va",
        method: "va",
        channel: "permata_va",
        name: "Permata Virtual Account",
        description: "Bayar via PermataMobile X atau ATM",
        badge: "Permata",
    },
];

const EWALLET_CHANNELS: PaymentOption[] = [
    {
        id: "qris",
        method: "qris",
        channel: "qris",
        name: "QRIS (Semua E-Wallet & Bank)",
        description: "Scan QR via GoPay, OVO, DANA, ShopeePay, BCA, Livin', dll.",
        badge: "QRIS",
    },
    {
        id: "gopay",
        method: "gopay",
        channel: "gopay",
        name: "GoPay / GoPay Later",
        description: "Buka langsung aplikasi GoPay atau scan QR",
        badge: "GoPay",
    },
];

const COD_OPTION: PaymentOption = {
    id: "cod",
    method: "cod",
    channel: "cod",
    name: "Cash on Delivery (COD)",
    description: "Bayar tunai kepada kurir saat pesanan sampai di tempat",
    badge: "COD",
};

export default function PaymentSection({ selectedChannel, onSelect }: Props) {
    return (
        <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Metode Pembayaran</h2>
                    <p className="text-xs text-slate-500 mt-1">
                        Pilih metode pembayaran aman dan terverifikasi otomatis
                    </p>
                </div>
            </div>

            <div className="space-y-6">
                {/* Virtual Account Section */}
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <Landmark className="w-4 h-4 text-[#245D56]" />
                        <h3 className="text-sm font-bold text-gray-800">Virtual Account (Transfer Bank)</h3>
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-full border border-emerald-200">
                            Otomatis Terverifikasi
                        </span>
                    </div>
                    <div className="grid grid-cols-1 gap-2.5">
                        {VA_CHANNELS.map((item) => {
                            const isSelected = selectedChannel === item.channel;
                            return (
                                <div
                                    key={item.id}
                                    onClick={() => onSelect(item.method, item.channel)}
                                    className={`flex items-center justify-between p-3.5 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${isSelected
                                            ? "border-[#245D56] bg-[#245D56]/5 shadow-sm"
                                            : "border-slate-100 hover:border-slate-300 bg-white"
                                        }`}
                                >
                                    <div className="flex items-center gap-3.5">
                                        <div
                                            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shadow-xs border ${isSelected
                                                    ? "bg-[#245D56] text-white border-[#245D56]"
                                                    : "bg-slate-50 text-slate-700 border-slate-200"
                                                }`}
                                        >
                                            {item.badge}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm text-gray-900">{item.name}</h4>
                                            <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
                                        </div>
                                    </div>
                                    <div
                                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? "border-[#245D56] bg-[#245D56]" : "border-slate-300"
                                            }`}
                                    >
                                        {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/*  QRIS & E-Wallet Section */}
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <QrCode className="w-4 h-4 text-[#245D56]" />
                        <h3 className="text-sm font-bold text-gray-800">QRIS & E-Wallet</h3>
                        <span className="text-[10px] bg-sky-50 text-sky-700 font-semibold px-2 py-0.5 rounded-full border border-sky-200">
                            Instant Scan
                        </span>
                    </div>
                    <div className="grid grid-cols-1 gap-2.5">
                        {EWALLET_CHANNELS.map((item) => {
                            const isSelected = selectedChannel === item.channel;
                            return (
                                <div
                                    key={item.id}
                                    onClick={() => onSelect(item.method, item.channel)}
                                    className={`flex items-center justify-between p-3.5 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${isSelected
                                            ? "border-[#245D56] bg-[#245D56]/5 shadow-sm"
                                            : "border-slate-100 hover:border-slate-300 bg-white"
                                        }`}
                                >
                                    <div className="flex items-center gap-3.5">
                                        <div
                                            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shadow-xs border ${isSelected
                                                    ? "bg-[#245D56] text-white border-[#245D56]"
                                                    : "bg-slate-50 text-slate-700 border-slate-200"
                                                }`}
                                        >
                                            {item.channel === "qris" ? (
                                                <QrCode className="w-5 h-5" />
                                            ) : (
                                                <Wallet className="w-5 h-5" />
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm text-gray-900">{item.name}</h4>
                                            <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
                                        </div>
                                    </div>
                                    <div
                                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? "border-[#245D56] bg-[#245D56]" : "border-slate-300"
                                            }`}
                                    >
                                        {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/*  Cash on Delivery (COD) */}
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <Banknote className="w-4 h-4 text-[#245D56]" />
                        <h3 className="text-sm font-bold text-gray-800">Bayar di Tempat</h3>
                    </div>
                    <div
                        onClick={() => onSelect(COD_OPTION.method, COD_OPTION.channel)}
                        className={`flex items-center justify-between p-3.5 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${selectedChannel === COD_OPTION.channel
                                ? "border-[#245D56] bg-[#245D56]/5 shadow-sm"
                                : "border-slate-100 hover:border-slate-300 bg-white"
                            }`}
                    >
                        <div className="flex items-center gap-3.5">
                            <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shadow-xs border ${selectedChannel === COD_OPTION.channel
                                        ? "bg-[#245D56] text-white border-[#245D56]"
                                        : "bg-slate-50 text-slate-700 border-slate-200"
                                    }`}
                            >
                                <Banknote className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-gray-900">{COD_OPTION.name}</h4>
                                <p className="text-xs text-slate-500 mt-0.5">{COD_OPTION.description}</p>
                            </div>
                        </div>
                        <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${selectedChannel === COD_OPTION.channel ? "border-[#245D56] bg-[#245D56]" : "border-slate-300"
                                }`}
                        >
                            {selectedChannel === COD_OPTION.channel && (
                                <Check className="w-3 h-3 text-white" strokeWidth={3} />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

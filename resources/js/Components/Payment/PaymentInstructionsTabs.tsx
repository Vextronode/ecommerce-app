import React, { useState } from "react";
import { BookOpen } from "lucide-react";

interface Props {
    channel?: string;
    vaNumber?: string | null;
    billerCode?: string | null;
    billKey?: string | null;
    totalAmount?: number;
}

interface StepItem {
    text: React.ReactNode;
}

interface InstructionCategory {
    id: string;
    label: string;
    steps: StepItem[];
}

export default function PaymentInstructionsTabs({
    channel = "bca_va",
    vaNumber = "",
    billerCode = "70012",
    billKey = "",
    totalAmount = 0,
}: Props) {
    const [activeTab, setActiveTab] = useState<string>("mbanking");

    const formatRupiah = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const getInstructions = (): InstructionCategory[] => {
        if (channel === "bca_va") {
            return [
                {
                    id: "mbanking",
                    label: "m-BCA (BCA Mobile)",
                    steps: [
                        { text: <>Buka aplikasi <strong className="font-bold text-gray-900">BCA Mobile</strong> dan pilih menu <strong className="font-bold text-gray-900">m-BCA</strong>.</> },
                        { text: <>Pilih menu <strong className="font-bold text-gray-900">m-Transfer</strong> &gt; <strong className="font-bold text-gray-900">BCA Virtual Account</strong>.</> },
                        { text: <>Masukkan nomor Virtual Account <strong className="font-bold text-[#281B7A] font-mono">{vaNumber || "Nomor VA"}</strong> lalu klik <strong className="font-bold text-gray-900">Send</strong>.</> },
                        { text: <>Pastikan nama merchant <strong className="font-bold text-gray-900">Cibenda Mart</strong> dan total tagihan {totalAmount ? <strong className="font-bold text-gray-900">{formatRupiah(totalAmount)}</strong> : "sudah sesuai"}.</> },
                        { text: <>Masukkan PIN m-BCA Anda untuk menyelesaikan pembayaran.</> },
                    ],
                },
                {
                    id: "atm",
                    label: "ATM BCA",
                    steps: [
                        { text: <>Masukkan Kartu ATM BCA dan PIN Anda.</> },
                        { text: <>Pilih menu <strong className="font-bold text-gray-900">Transaksi Lainnya</strong> &gt; <strong className="font-bold text-gray-900">Transfer</strong> &gt; <strong className="font-bold text-gray-900">Ke Rek BCA Virtual Account</strong>.</> },
                        { text: <>Masukkan nomor Virtual Account <strong className="font-bold text-[#281B7A] font-mono">{vaNumber || "Nomor VA"}</strong> lalu tekan <strong className="font-bold text-gray-900">Benar</strong>.</> },
                        { text: <>Periksa rincian pembayaran di layar ATM, lalu pilih <strong className="font-bold text-gray-900">Ya</strong>.</> },
                        { text: <>Ambil struk sebagai bukti transaksi yang sah.</> },
                    ],
                },
                {
                    id: "ibanking",
                    label: "KlikBCA (Internet Banking)",
                    steps: [
                        { text: <>Login ke akun KlikBCA Individual.</> },
                        { text: <>Pilih menu <strong className="font-bold text-gray-900">Transfer Dana</strong> &gt; <strong className="font-bold text-gray-900">Transfer ke BCA Virtual Account</strong>.</> },
                        { text: <>Masukkan nomor Virtual Account <strong className="font-bold text-[#281B7A] font-mono">{vaNumber || "Nomor VA"}</strong>.</> },
                        { text: <>Masukkan Respon KeyBCA Appli 1 dan klik <strong className="font-bold text-gray-900">Kirim</strong>.</> },
                        { text: <>Pembayaran selesai diverifikasi secara otomatis.</> },
                    ],
                },
            ];
        }

        if (channel === "mandiri_bill") {
            return [
                {
                    id: "mbanking",
                    label: "Livin' by Mandiri",
                    steps: [
                        { text: <>Buka aplikasi <strong className="font-bold text-gray-900">Livin' by Mandiri</strong> dan login.</> },
                        { text: <>Pilih menu <strong className="font-bold text-gray-900">Bayar</strong> &gt; cari <strong className="font-bold text-gray-900">Midtrans</strong> atau kode <strong className="font-mono font-bold text-[#281B7A]">{billerCode || "70012"}</strong>.</> },
                        { text: <>Masukkan Nomor Tagihan (Bill Key): <strong className="font-mono font-bold text-[#281B7A]">{billKey || "Nomor Tagihan"}</strong>.</> },
                        { text: <>Periksa detail transaksi dan konfirmasi pembayaran.</> },
                        { text: <>Masukkan PIN Livin' Anda untuk menyelesaikan transaksi.</> },
                    ],
                },
                {
                    id: "atm",
                    label: "ATM Mandiri",
                    steps: [
                        { text: <>Masukkan kartu ATM Mandiri dan 6 digit PIN Anda.</> },
                        { text: <>Pilih menu <strong className="font-bold text-gray-900">Bayar / Beli</strong> &gt; <strong className="font-bold text-gray-900">Multipayment</strong>.</> },
                        { text: <>Masukkan Kode Perusahaan: <strong className="font-bold text-[#281B7A]">{billerCode || "70012"}</strong> lalu tekan Benar.</> },
                        { text: <>Masukkan Nomor Tagihan (Bill Key): <strong className="font-bold text-[#281B7A]">{billKey || "Bill Key"}</strong> lalu tekan Benar.</> },
                        { text: <>Periksa konfirmasi pembayaran dan tekan Ya.</> },
                    ],
                },
            ];
        }

        if (channel === "bni_va") {
            return [
                {
                    id: "mbanking",
                    label: "BNI Mobile Banking",
                    steps: [
                        { text: <>Buka aplikasi BNI Mobile Banking dan login ke akun Anda.</> },
                        { text: <>Pilih menu <strong className="font-bold text-gray-900">Transfer</strong> &gt; <strong className="font-bold text-gray-900">Virtual Account Billing</strong>.</> },
                        { text: <>Pilih tab <strong className="font-bold text-gray-900">Input Baru</strong> dan masukkan nomor VA <strong className="font-mono font-bold text-[#281B7A]">{vaNumber || "Nomor VA"}</strong>.</> },
                        { text: <>Konfirmasi rincian pembayaran dan masukkan Password Transaksi.</> },
                    ],
                },
                {
                    id: "atm",
                    label: "ATM BNI",
                    steps: [
                        { text: <>Masukkan kartu ATM BNI dan PIN Anda.</> },
                        { text: <>Pilih <strong className="font-bold text-gray-900">Menu Lain</strong> &gt; <strong className="font-bold text-gray-900">Transfer</strong> &gt; <strong className="font-bold text-gray-900">Virtual Account Billing</strong>.</> },
                        { text: <>Masukkan nomor Virtual Account <strong className="font-bold text-[#281B7A]">{vaNumber || "Nomor VA"}</strong>.</> },
                        { text: <>Periksa data transaksi dan konfirmasi dengan memilih Ya.</> },
                    ],
                },
            ];
        }

        if (channel === "bri_va") {
            return [
                {
                    id: "mbanking",
                    label: "BRImo (BRI Mobile)",
                    steps: [
                        { text: <>Buka aplikasi BRImo dan login ke akun Anda.</> },
                        { text: <>Pilih menu <strong className="font-bold text-gray-900">Tagihan</strong> &gt; <strong className="font-bold text-gray-900">BRIVA</strong>.</> },
                        { text: <>Pilih Tambah Transaksi Baru dan masukkan nomor BRIVA: <strong className="font-mono font-bold text-[#281B7A]">{vaNumber || "Nomor BRIVA"}</strong>.</> },
                        { text: <>Pastikan nominal tagihan sudah sesuai lalu klik Bayar.</> },
                    ],
                },
                {
                    id: "atm",
                    label: "ATM BRI",
                    steps: [
                        { text: <>Masukkan kartu ATM BRI dan PIN.</> },
                        { text: <>Pilih <strong className="font-bold text-gray-900">Transaksi Lain</strong> &gt; <strong className="font-bold text-gray-900">Pembayaran</strong> &gt; <strong className="font-bold text-gray-900">BRIVA</strong>.</> },
                        { text: <>Masukkan nomor BRIVA <strong className="font-bold text-[#281B7A]">{vaNumber || "Nomor BRIVA"}</strong> lalu tekan Benar.</> },
                        { text: <>Periksa detail pembayaran di layar dan pilih Ya.</> },
                    ],
                },
            ];
        }

        return [
            {
                id: "qris",
                label: "Cara Pembayaran QRIS",
                steps: [
                    { text: <>Buka aplikasi E-Wallet (GoPay, OVO, DANA, ShopeePay, LinkAja) atau m-Banking Anda.</> },
                    { text: <>Pilih menu <strong className="font-bold text-gray-900">Scan</strong> atau <strong className="font-bold text-gray-900">Bayar dengan QR</strong>.</> },
                    { text: <>Arahkan kamera ke Kode QR yang tertera di atas.</> },
                    { text: <>Periksa nama merchant (Cibenda Mart) dan nominal total tagihan.</> },
                    { text: <>Masukkan PIN transaksi aplikasi e-wallet Anda untuk menyelesaikan pembayaran.</> },
                ],
            },
        ];
    };

    const instructions = getInstructions();
    const currentCategory =
        instructions.find((i) => i.id === activeTab) || instructions[0];

    const getChannelLabel = () => {
        if (channel === "bca_va") return "BCA Virtual Account";
        if (channel === "mandiri_bill") return "Mandiri Bill Payment";
        if (channel === "bni_va") return "BNI Virtual Account";
        if (channel === "bri_va") return "BRI Virtual Account (BRIVA)";
        if (channel === "permata_va") return "Permata Virtual Account";
        return "QRIS / E-Wallet";
    };

    return (
        <div className="w-full bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-slate-100 shadow-xs space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-gray-900" />
                    <h4 className="font-bold text-sm sm:text-base text-gray-900">
                        Petunjuk Pembayaran
                    </h4>
                </div>
                <span className="text-xs text-slate-400 font-medium">
                    {getChannelLabel()}
                </span>
            </div>

            {/* Method Tabs Bar */}
            {instructions.length > 1 && (
                <div className="bg-[#F0F2F5] rounded-xl p-1 flex gap-1 overflow-x-auto scrollbar-none">
                    {instructions.map((cat) => {
                        const isActive = activeTab === cat.id;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => setActiveTab(cat.id)}
                                className={`flex-1 py-2 px-3 sm:px-4 rounded-lg text-xs font-semibold transition whitespace-nowrap text-center ${
                                    isActive
                                        ? "bg-white text-[#281B7A] font-bold shadow-xs"
                                        : "text-slate-600 hover:text-slate-900"
                                }`}
                            >
                                {cat.label}
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Step by Step List */}
            <div className="space-y-2 pt-1">
                {currentCategory?.steps.map((step, idx) => (
                    <div
                        key={idx}
                        className="bg-[#F0F2F5] rounded-xl p-3.5 flex items-center gap-3 text-xs sm:text-sm text-slate-700 leading-relaxed"
                    >
                        <span className="w-6 h-6 rounded-full bg-[#E5E5F7] text-[#281B7A] font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-2xs">
                            {idx + 1}
                        </span>
                        <span className="pt-0.5">{step.text}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

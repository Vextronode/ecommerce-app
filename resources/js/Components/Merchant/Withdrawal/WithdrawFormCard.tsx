import React from "react";
import { Send, Sparkles } from "lucide-react";
import { useMerchantWithdrawals } from "@/Hooks/Merchant/useMerchantWithdrawals";

interface WithdrawFormCardProps {
    availableBalance: number;
    hasBankAccount: boolean;
    onRequestEditBank: () => void;
}

export default function WithdrawFormCard({
    availableBalance,
    hasBankAccount,
    onRequestEditBank,
}: WithdrawFormCardProps) {
    const {
        data,
        setData,
        errors,
        processing,
        presetAmounts,
        currentNumericAmount,
        remainingBalance,
        handleSelectPreset,
        handleSelectAll,
        handleSubmit,
    } = useMerchantWithdrawals({
        availableBalance,
        hasBankAccount,
        onRequestEditBank,
    });

    return (
        <div className="bg-white rounded-3xl p-5 md:p-6 border border-[#41B9C5]/30 shadow-sm space-y-5">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#F0FAFB] rounded-full flex items-center justify-center shrink-0">
                    <Send className="w-5 h-5 text-[#41B9C5]" />
                </div>
                <div>
                    <h3 className="text-base font-extrabold text-gray-900">
                        Ajukan Penarikan Saldo
                    </h3>
                    <p className="text-xs text-gray-500 font-medium">Minimal penarikan Rp 10.000</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-wider mb-2">
                        Nominal Penarikan
                    </label>
                    <div className="flex rounded-xl overflow-hidden border border-gray-200 focus-within:border-[#41B9C5] focus-within:ring-1 focus-within:ring-[#41B9C5] bg-gray-50/50 transition-all">
                        <span className="px-4 py-3 bg-[#F0FAFB] text-[#004F54] font-black text-xs border-r border-gray-200 shrink-0 flex items-center select-none">
                            Rp
                        </span>
                        <input
                            type="number"
                            placeholder="Contoh: 100000"
                            value={data.amount}
                            onChange={(e) => setData("amount", e.target.value)}
                            className="w-full px-4 py-3 bg-transparent border-none focus:outline-none focus:ring-0 font-extrabold text-[#004F54] text-sm"
                        />
                    </div>
                    {errors.amount && <p className="text-xs text-red-500 mt-1 font-semibold">{errors.amount}</p>}
                </div>

                {/* Nominal Cepat Presets */}
                <div>
                    <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                        Nominal Cepat
                    </span>
                    <div className="flex flex-wrap gap-2">
                        {presetAmounts.map((preset) => (
                            <button
                                key={preset}
                                type="button"
                                onClick={() => handleSelectPreset(preset)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${data.amount === preset.toString()
                                        ? "bg-[#41B9C5] text-white border-[#41B9C5] shadow-sm shadow-[#41B9C5]/30"
                                        : "bg-[#F0FAFB] hover:bg-[#EAF7F7] text-[#004F54] border-[#41B9C5]/30"
                                    }`}
                            >
                                {(preset / 1000).toLocaleString("id-ID")}rb
                            </button>
                        ))}
                        <button
                            type="button"
                            onClick={handleSelectAll}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#EAF7F7] hover:bg-[#d5eded] text-[#004F54] border border-[#41B9C5]/40 transition-all inline-flex items-center gap-1"
                        >
                            <Sparkles className="w-3.5 h-3.5 text-[#41B9C5]" />
                            Tarik Semua
                        </button>
                    </div>
                </div>

                {/* Sisa Saldo breakdown */}
                {currentNumericAmount > 0 && currentNumericAmount <= availableBalance && (
                    <div className="bg-[#F0FAFB] px-4 py-3 rounded-2xl border border-[#41B9C5]/30 flex items-center justify-between text-xs gap-3">
                        <span className="text-gray-600 font-medium truncate">Sisa Saldo Setelah Penarikan:</span>
                        <span className="font-extrabold text-[#004F54] shrink-0 font-mono">
                            {new Intl.NumberFormat("id-ID", {
                                style: "currency",
                                currency: "IDR",
                                maximumFractionDigits: 0,
                            }).format(remainingBalance)}
                        </span>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={processing || availableBalance < 10000}
                    className="w-full py-3.5 bg-[#41B9C5] hover:bg-[#3498a3] disabled:opacity-50 text-white font-bold rounded-xl shadow-md shadow-[#41B9C5]/30 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
                >
                    <Send className="w-4 h-4" />
                    Proses Penarikan Dana
                </button>
            </form>
        </div>
    );
}

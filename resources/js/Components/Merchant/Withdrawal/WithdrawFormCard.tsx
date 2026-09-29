import React from "react";
import { formatRupiah } from "@/utils/formatters";
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
        <div className="bg-white rounded-2xl p-5 md:p-6 border border-brand-orange/20 shadow-sm space-y-5">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-orange-tint rounded-xl flex items-center justify-center shrink-0">
                    <Send className="w-5 h-5 text-brand-orange" />
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
                    <label htmlFor="field_withdrawal_amount" className="block text-xs font-extrabold text-gray-500 uppercase tracking-wider mb-2">
                        Nominal Penarikan
                    </label>
                    <div className="flex rounded-xl overflow-hidden border border-gray-200 focus-within:border-brand-orange focus-within:ring-1 focus-within:ring-brand-orange bg-gray-50/50 transition">
                        <span className="px-4 py-3 bg-brand-orange-tint text-brand-orange-dark font-black text-xs border-r border-brand-orange/15 shrink-0 flex items-center select-none">
                            Rp
                        </span>
                        <input 
                            aria-label="Nominal Penarikan" 
                            id="field_withdrawal_amount"
                            type="number"
                            placeholder="Contoh: 100000"
                            value={data.amount}
                            onChange={(e) => setData("amount", e.target.value)}
                            className="w-full px-4 py-3 bg-transparent border-none focus:outline-none focus:ring-0 font-extrabold text-gray-900 text-sm"
                        />
                    </div>
                    {errors.amount && <p className="text-xs text-rose-500 mt-1 font-semibold">{errors.amount}</p>}
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
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                                    data.amount === preset.toString()
                                        ? "bg-brand-orange text-white border-brand-orange shadow-sm shadow-brand-orange/30"
                                        : "bg-brand-orange-soft hover:bg-brand-orange-tint text-brand-orange-dark border-brand-orange/20"
                                }`}
                            >
                                {(preset / 1000).toLocaleString("id-ID")}rb
                            </button>
                        ))}
                        <button
                            type="button"
                            onClick={handleSelectAll}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-brand-orange-tint hover:bg-brand-orange/20 text-brand-orange border border-brand-orange/30 transition inline-flex items-center gap-1"
                        >
                            <Sparkles className="w-3.5 h-3.5 text-brand-orange" />
                            Tarik Semua
                        </button>
                    </div>
                </div>

                {/* Sisa Saldo breakdown */}
                {currentNumericAmount > 0 && currentNumericAmount <= availableBalance && (
                    <div className="bg-brand-orange-soft px-4 py-3 rounded-xl border border-brand-orange/20 flex items-center justify-between text-xs gap-3">
                        <span className="text-gray-600 font-medium truncate">Sisa Saldo Setelah Penarikan:</span>
                        <span className="font-extrabold text-brand-orange-dark shrink-0 font-mono">
                            {formatRupiah(remainingBalance)}
                        </span>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={processing || availableBalance < 10000}
                    className="w-full py-3.5 bg-brand-orange hover:bg-brand-orange-hover disabled:opacity-50 text-white font-bold rounded-xl shadow-md shadow-brand-orange/30 transition flex items-center justify-center gap-2 text-xs uppercase tracking-wider cursor-pointer disabled:cursor-not-allowed"
                >
                    <Send className="w-4 h-4" />
                    Proses Penarikan Dana
                </button>
            </form>
        </div>
    );
}

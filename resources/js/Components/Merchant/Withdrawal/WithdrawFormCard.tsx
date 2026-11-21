import React from "react";
import { formatRupiah, formatRupiahNumber, handleRupiahInputChange } from "@/utils/formatters";
import { Send, Sparkles, AlertTriangle } from "lucide-react";
import { useMerchantWithdrawals } from "@/Hooks/Merchant/useMerchantWithdrawals";

interface WithdrawFormCardProps {
    availableBalance: number;
    hasBankAccount: boolean;
    onRequestEditBank: () => void;
    isWithdrawalEnabled?: boolean;
}

export default function WithdrawFormCard({
    availableBalance,
    hasBankAccount,
    onRequestEditBank,
    isWithdrawalEnabled = true,
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
        isWithdrawalEnabled,
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

            {!isWithdrawalEnabled && (
                <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-950 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                            Pencairan Saldo Dinonaktifkan Sementara
                        </h4>
                        <p className="text-xs text-amber-800 leading-relaxed font-medium">
                            Admin platform sedang melakukan pemeliharaan sistem pencairan dana. Anda dapat mengajukan penarikan kembali setelah layanan diaktifkan.
                        </p>
                    </div>
                </div>
            )}

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
                            type="text"
                            inputMode="numeric"
                            autoComplete="off"
                            placeholder="Contoh: 100.000"
                            disabled={!isWithdrawalEnabled}
                            value={data.amount ? formatRupiahNumber(data.amount) : ""}
                            onChange={(e) => {
                                const { raw } = handleRupiahInputChange(e.target.value);
                                setData("amount", raw > 0 ? String(raw) : "");
                            }}
                            onKeyDown={(e) => {
                                if (["-", "+", "e", "E", ".", ","].includes(e.key)) {
                                    e.preventDefault();
                                }
                            }}
                            className="w-full px-4 py-3 bg-transparent border-none focus:outline-none focus:ring-0 font-extrabold text-gray-900 text-sm disabled:text-gray-400 disabled:cursor-not-allowed"
                        />
                    </div>
                    {currentNumericAmount > 0 && currentNumericAmount < 10000 && !errors.amount && (
                        <p className="text-xs text-amber-600 mt-1.5 font-semibold">
                            Minimal penarikan saldo adalah Rp 10.000
                        </p>
                    )}
                    {currentNumericAmount > availableBalance && !errors.amount && (
                        <p className="text-xs text-rose-500 mt-1.5 font-semibold">
                            Nominal penarikan melebihi saldo yang tersedia (Maks. {formatRupiah(availableBalance)})
                        </p>
                    )}
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
                                disabled={!isWithdrawalEnabled}
                                onClick={() => handleSelectPreset(preset)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border disabled:opacity-50 disabled:cursor-not-allowed ${
                                    currentNumericAmount === preset
                                        ? "bg-brand-orange text-white border-brand-orange shadow-sm shadow-brand-orange/30"
                                        : "bg-brand-orange-soft hover:bg-brand-orange-tint text-brand-orange-dark border-brand-orange/20"
                                }`}
                            >
                                {(preset / 1000).toLocaleString("id-ID")}rb
                            </button>
                        ))}
                        <button
                            type="button"
                            disabled={!isWithdrawalEnabled}
                            onClick={handleSelectAll}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-brand-orange-tint hover:bg-brand-orange/20 text-brand-orange border border-brand-orange/30 transition inline-flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    disabled={
                        processing ||
                        availableBalance < 10000 ||
                        !isWithdrawalEnabled ||
                        !data.amount ||
                        currentNumericAmount < 10000 ||
                        currentNumericAmount > availableBalance
                    }
                    className="w-full py-3.5 bg-brand-orange hover:bg-brand-orange-hover disabled:opacity-50 text-white font-bold rounded-xl shadow-md shadow-brand-orange/30 transition flex items-center justify-center gap-2 text-xs uppercase tracking-wider cursor-pointer disabled:cursor-not-allowed"
                >
                    {isWithdrawalEnabled ? (
                        <>
                            <Send className="w-4 h-4" />
                            Proses Penarikan Dana
                        </>
                    ) : (
                        <>
                            <AlertTriangle className="w-4 h-4" />
                            Penarikan Dinonaktifkan Sementara
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}

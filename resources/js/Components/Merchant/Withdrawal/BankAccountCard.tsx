import React from "react";
import { Building2, CreditCard, Check, Edit2, ShieldCheck, X } from "lucide-react";
import { useMerchantBankAccount } from "@/Hooks/Merchant/useMerchantBankAccount";

interface BankAccountCardProps {
    store: {
        id: number;
        bank_name: string;
        bank_account_number: string;
        bank_account_holder: string;
    };
}

export default function BankAccountCard({ store }: BankAccountCardProps) {
    const {
        isEditing,
        setIsEditing,
        data,
        setData,
        processing,
        errors,
        handleSubmit,
    } = useMerchantBankAccount({ store });

    return (
        <div id="bank-account-section" className="bg-white rounded-2xl p-5 md:p-6 border border-brand-orange/20 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand-orange-tint rounded-xl flex items-center justify-center shrink-0">
                        <Building2 className="w-5 h-5 text-brand-orange" />
                    </div>
                    <div>
                        <h3 className="text-base font-extrabold text-gray-900">Rekening Bank Tujuan</h3>
                        <p className="text-xs text-gray-500 font-medium">Pencairan via Midtrans IRIS</p>
                    </div>
                </div>

                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-orange-soft hover:bg-brand-orange-tint border border-brand-orange/30 rounded-full text-xs font-bold text-brand-orange-dark transition"
                    >
                        <Edit2 className="w-3.5 h-3.5 text-brand-orange" />
                        Ubah
                    </button>
                )}
            </div>

            {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    <div>
                        <label htmlFor="field_bank_name" className="block text-xs font-extrabold text-gray-500 uppercase tracking-wider mb-1.5">
                            Bank Tujuan
                        </label>
                        <select 
                            id="field_bank_name"
                            value={data.bank_name}
                            onChange={(e) => setData("bank_name", e.target.value)}
                            className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-brand-orange focus:ring-1 focus:ring-brand-orange text-xs font-bold text-gray-800 uppercase transition"
                        >
                            <option value="bca">Bank BCA (Bank Central Asia)</option>
                            <option value="mandiri">Bank Mandiri</option>
                            <option value="bri">Bank BRI (Bank Rakyat Indonesia)</option>
                            <option value="bni">Bank BNI (Bank Negara Indonesia)</option>
                            <option value="cimb">CIMB Niaga</option>
                            <option value="permata">Bank Permata</option>
                        </select>
                        {errors.bank_name && <p className="text-xs text-rose-500 mt-1">{errors.bank_name}</p>}
                    </div>

                    <div>
                        <label htmlFor="field_bank_number" className="block text-xs font-extrabold text-gray-500 uppercase tracking-wider mb-1.5">
                            Nomor Rekening
                        </label>
                        <input 
                            aria-label="Nomor Rekening" 
                            id="field_bank_number"
                            type="text"
                            placeholder="Contoh: 1234567890"
                            value={data.bank_account_number}
                            onChange={(e) => setData("bank_account_number", e.target.value)}
                            className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-brand-orange focus:ring-1 focus:ring-brand-orange text-xs font-mono font-bold text-gray-900 transition"
                        />
                        {errors.bank_account_number && (
                            <p className="text-xs text-rose-500 mt-1">{errors.bank_account_number}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="field_bank_holder" className="block text-xs font-extrabold text-gray-500 uppercase tracking-wider mb-1.5">
                            Nama Pemilik Rekening
                        </label>
                        <input 
                            aria-label="Nama Pemilik Rekening" 
                            id="field_bank_holder"
                            type="text"
                            placeholder="Contoh: Budi Santoso (sesuai buku tabungan)"
                            value={data.bank_account_holder}
                            onChange={(e) => setData("bank_account_holder", e.target.value)}
                            className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-brand-orange focus:ring-1 focus:ring-brand-orange text-xs font-bold text-gray-800 transition"
                        />
                        {errors.bank_account_holder && (
                            <p className="text-xs text-rose-500 mt-1">{errors.bank_account_holder}</p>
                        )}
                    </div>

                    <div className="flex gap-2 pt-2">
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex-1 py-3 bg-brand-orange hover:bg-brand-orange-hover disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-md shadow-brand-orange/30 transition flex items-center justify-center gap-1.5 uppercase tracking-wider cursor-pointer"
                        >
                            <Check className="w-4 h-4 text-white" />
                            Simpan Rekening
                        </button>
                        {store.bank_account_number && (
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition flex items-center gap-1 cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                                Batal
                            </button>
                        )}
                    </div>
                </form>
            ) : (
                /* Card Visual Mode */
                <div className="bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#1E293B] text-white p-5 rounded-2xl shadow-md border border-slate-700/50 space-y-4 relative overflow-hidden">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold uppercase tracking-widest bg-white/10 text-orange-400 px-3 py-1 rounded-full border border-orange-400/30">
                            {store.bank_name}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-500/30">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                            Terverifikasi
                        </div>
                    </div>

                    <div className="py-1">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                            Nomor Rekening
                        </p>
                        <p className="text-xl font-mono font-black tracking-wider text-white">
                            {store.bank_account_number}
                        </p>
                    </div>

                    <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                        <div>
                            <p className="text-[10px] text-gray-400 uppercase font-semibold">Atas Nama</p>
                            <p className="font-extrabold text-white truncate max-w-[200px]">
                                {store.bank_account_holder}
                            </p>
                        </div>
                        <CreditCard className="w-6 h-6 text-orange-400/80" />
                    </div>
                </div>
            )}
        </div>
    );
}

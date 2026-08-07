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
        <div className="bg-white rounded-3xl p-5 md:p-6 border border-[#41B9C5]/30 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#F0FAFB] rounded-full flex items-center justify-center shrink-0">
                        <Building2 className="w-5 h-5 text-[#41B9C5]" />
                    </div>
                    <div>
                        <h3 className="text-base font-extrabold text-gray-900">Rekening Bank Tujuan</h3>
                        <p className="text-xs text-gray-500 font-medium">Pencairan via Midtrans IRIS</p>
                    </div>
                </div>

                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F0FAFB] hover:bg-[#EAF7F7] border border-[#41B9C5]/30 rounded-full text-xs font-bold text-[#004F54] transition-all"
                    >
                        <Edit2 className="w-3.5 h-3.5 text-[#41B9C5]" />
                        Ubah
                    </button>
                )}
            </div>

            {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    <div>
                        <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-wider mb-1.5">
                            Bank Tujuan
                        </label>
                        <select
                            value={data.bank_name}
                            onChange={(e) => setData("bank_name", e.target.value)}
                            className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-[#41B9C5] focus:ring-1 focus:ring-[#41B9C5] text-xs font-bold text-gray-800 uppercase transition-all"
                        >
                            <option value="bca">Bank BCA (Bank Central Asia)</option>
                            <option value="mandiri">Bank Mandiri</option>
                            <option value="bri">Bank BRI (Bank Rakyat Indonesia)</option>
                            <option value="bni">Bank BNI (Bank Negara Indonesia)</option>
                            <option value="cimb">CIMB Niaga</option>
                            <option value="permata">Bank Permata</option>
                        </select>
                        {errors.bank_name && <p className="text-xs text-red-500 mt-1">{errors.bank_name}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-wider mb-1.5">
                            Nomor Rekening
                        </label>
                        <input
                            type="text"
                            placeholder="Contoh: 1234567890"
                            value={data.bank_account_number}
                            onChange={(e) => setData("bank_account_number", e.target.value)}
                            className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-[#41B9C5] focus:ring-1 focus:ring-[#41B9C5] text-xs font-mono font-bold text-[#004F54] transition-all"
                        />
                        {errors.bank_account_number && (
                            <p className="text-xs text-red-500 mt-1">{errors.bank_account_number}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-wider mb-1.5">
                            Nama Pemilik Rekening
                        </label>
                        <input
                            type="text"
                            placeholder="Contoh: Budi Santoso (sesuai buku tabungan)"
                            value={data.bank_account_holder}
                            onChange={(e) => setData("bank_account_holder", e.target.value)}
                            className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-[#41B9C5] focus:ring-1 focus:ring-[#41B9C5] text-xs font-bold text-gray-800 transition-all"
                        />
                        {errors.bank_account_holder && (
                            <p className="text-xs text-red-500 mt-1">{errors.bank_account_holder}</p>
                        )}
                    </div>

                    <div className="flex gap-2 pt-2">
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex-1 py-3 bg-[#004F54] hover:bg-[#003b3f] disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-1.5 uppercase tracking-wider"
                        >
                            <Check className="w-4 h-4 text-[#41B9C5]" />
                            Simpan Rekening
                        </button>
                        {store.bank_account_number && (
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-all flex items-center gap-1"
                            >
                                <X className="w-4 h-4" />
                                Batal
                            </button>
                        )}
                    </div>
                </form>
            ) : (
                /* Card Visual Mode  */
                <div className="bg-[#004F54] text-white p-5 rounded-2xl shadow-md border border-[#003c40] space-y-4 relative overflow-hidden">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold uppercase tracking-widest bg-[#0e5c61] text-[#41B9C5] px-3 py-1 rounded-full border border-[#41B9C5]/30">
                            {store.bank_name}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] font-bold bg-[#0e5c61] text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-500/30">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                            Terverifikasi
                        </div>
                    </div>

                    <div className="py-1">
                        <p className="text-[10px] text-teal-100/75 uppercase tracking-wider font-semibold">
                            Nomor Rekening
                        </p>
                        <p className="text-xl font-mono font-black tracking-wider text-white">
                            {store.bank_account_number}
                        </p>
                    </div>

                    <div className="pt-2 border-t border-white/20 flex items-center justify-between text-xs">
                        <div>
                            <p className="text-[10px] text-teal-100/75 uppercase font-semibold">Atas Nama</p>
                            <p className="font-extrabold text-white truncate max-w-[200px]">
                                {store.bank_account_holder}
                            </p>
                        </div>
                        <CreditCard className="w-6 h-6 text-[#41B9C5]/70" />
                    </div>
                </div>
            )}
        </div>
    );
}

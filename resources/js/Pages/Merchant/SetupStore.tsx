import React, { useState } from "react";
import { Head } from "@inertiajs/react";
import { Eye, EyeOff, Store, KeyRound, CheckCircle2, AlertCircle } from "lucide-react";
import MerchantAuthLayout from "@/Layouts/MerchantAuthLayout";
import parigiMerchantImg from "@/assets/images/parigi_merchant.png";
import { useSetupStoreForm } from "@/Hooks/Merchant/useSetupStoreForm";

interface Props {
    initialStoreName?: string;
}

export default function SetupStore({ initialStoreName = "" }: Props) {
    const { data, setData, processing, errors, formWarning, handleSubmit } =
        useSetupStoreForm(initialStoreName);

    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    return (
        <MerchantAuthLayout>
            <Head title="Aktivasi Akun Mitra Pedagang - CibendaMart" />

            <div className="w-full h-full flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
                {/* Left Column: Warm Gradient Hero Panel (Identik dengan Login) */}
                <div className="bg-gradient-to-br from-brand-orange-warm via-[#FFB86C] to-white p-6 sm:p-8 md:p-10 lg:p-12 xl:p-14 flex flex-col justify-between relative overflow-hidden">
                    {/* Decorative ambient lights */}
                    <div className="absolute -top-16 -left-16 w-56 h-56 bg-white/20 rounded-full blur-2xl pointer-events-none" />
                    <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-orange-400/20 rounded-full blur-3xl pointer-events-none" />

                    {/* Top Identity & Headlines */}
                    <div className="relative z-10">
                        {/* Brand Title & Badge */}
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h2 className="text-2xl sm:text-3xl font-black text-brand-indigo-merchant tracking-tight">
                                    Cibenda<span className="text-white drop-shadow-xs">Mart</span>
                                </h2>
                                <p className="text-xs font-semibold text-brand-indigo-merchant/80 mt-0.5">
                                    Portal Mitra Pedagang
                                </p>
                            </div>
                            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/45 backdrop-blur-md border border-white/60 text-xs font-bold text-brand-indigo-merchant shadow-2xs">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span>Aktivasi Akun Mitra</span>
                            </div>
                        </div>

                        {/* Hero Headline & Subtitle */}
                        <div className="mt-8 sm:mt-11">
                            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.5rem] font-extrabold text-white leading-tight drop-shadow-xs max-w-xl">
                                Kelola Toko & Hasil Bumi Anda Dalam Satu Tempat
                            </h1>
                            <p className="text-xs sm:text-sm md:text-base text-white/95 font-medium mt-3.5 leading-relaxed max-w-xl">
                                Pantau stok Hasil Tani, Kebun, & Laut harian, serta jangkau ribuan pelanggan CibendaMart dengan mudah.
                            </p>
                        </div>

                        {/* Feature Highlights Pills */}
                        <div className="mt-8 space-y-3.5 max-w-lg">
                            <div className="px-5 py-3.5 rounded-2xl bg-white/35 backdrop-blur-md border border-white/50 text-white font-bold text-xs sm:text-sm shadow-xs transition hover:bg-white/45">
                                Pantau Penjualan & Pesanan Realtime
                            </div>
                            <div className="px-5 py-3.5 rounded-2xl bg-white/35 backdrop-blur-md border border-white/50 text-white font-bold text-xs sm:text-sm shadow-xs transition hover:bg-white/45">
                                Dipercaya 500+ Mitra Pedagang Lokal
                            </div>
                        </div>
                    </div>

                    {/* Bottom Right Image: Logo Parigi Merchant */}
                    <div className="relative z-10 mt-6 flex justify-end items-end w-full">
                        <div className="w-56 sm:w-64 md:w-80 lg:w-96 max-w-[75%] drop-shadow-2xl transition-transform hover:scale-105 duration-300">
                            <img
                                src={parigiMerchantImg}
                                alt="Logo Mitra Pedagang Parigi CibendaMart"
                                className="w-full h-auto object-contain"
                            />
                        </div>
                    </div>
                </div>

                {/* Right Column: Clean Setup Store Form */}
                <div className="p-6 sm:p-8 md:p-10 lg:p-12 xl:p-14 flex flex-col justify-center bg-white overflow-y-auto">
                    <div className="max-w-md w-full mx-auto space-y-6">
                        {/* Title & Subtitle */}
                        <div>
                            <h2 className="text-3xl sm:text-4xl font-black text-brand-indigo-merchant tracking-tight">
                                Aktivasi Akun Pedagang
                            </h2>
                            <p className="text-xs sm:text-sm text-gray-500 font-medium mt-2 leading-relaxed">
                                Buat kata sandi baru pribadi dan pastikan nama toko Anda sudah sesuai sebelum mulai berjualan.
                            </p>
                        </div>

                        {/* Security Notice */}
                        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-amber-900 flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                            <p className="text-xs leading-relaxed font-medium">
                                Karena akun Anda dibuat oleh Administrator Desa, silakan buat kata sandi baru pribadi demi keamanan toko Anda.
                            </p>
                        </div>

                        {/* Validation Warning Alert */}
                        {formWarning && (
                            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
                                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                                <span className="font-semibold">{formWarning}</span>
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                            {/* Input Store Name */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label
                                        htmlFor="field_store_name"
                                        className="block text-xs font-bold text-gray-700 flex items-center gap-1.5"
                                    >
                                        <Store className="w-3.5 h-3.5 text-brand-indigo-merchant" />
                                        <span>Nama Toko / Usaha</span>
                                        <span className="text-rose-500">*</span>
                                    </label>
                                    <span className="text-[11px] font-semibold text-gray-400">
                                        Otomatis dari admin
                                    </span>
                                </div>
                                <input
                                    id="field_store_name"
                                    type="text"
                                    required
                                    value={data.store_name}
                                    onChange={(e) => setData("store_name", e.target.value)}
                                    placeholder="Contoh: Toko Berkah Tani"
                                    className={`w-full px-4 py-3.5 bg-gray-50/80 border rounded-2xl text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:bg-white transition ${
                                        errors.store_name
                                            ? "border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 bg-rose-50/20"
                                            : "border-gray-200 focus:border-brand-indigo-merchant focus:ring-2 focus:ring-brand-indigo-merchant/15"
                                    }`}
                                />
                                {errors.store_name && (
                                    <p className="text-rose-500 text-xs font-semibold mt-1.5">
                                        {errors.store_name}
                                    </p>
                                )}
                            </div>

                            {/* Input New Password */}
                            <div>
                                <label
                                    htmlFor="field_new_password"
                                    className="block text-xs font-bold text-gray-700 mb-2 flex items-center gap-1.5"
                                >
                                    <KeyRound className="w-3.5 h-3.5 text-brand-indigo-merchant" />
                                    <span>Kata Sandi Baru</span>
                                    <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        id="field_new_password"
                                        type={showNewPassword ? "text" : "password"}
                                        required
                                        value={data.password}
                                        onChange={(e) => setData("password", e.target.value)}
                                        placeholder="Minimal 8 karakter"
                                        className={`w-full pl-4 pr-11 py-3.5 bg-gray-50/80 border rounded-2xl text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:bg-white transition ${
                                            errors.password
                                                ? "border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 bg-rose-50/20"
                                                : "border-gray-200 focus:border-brand-indigo-merchant focus:ring-2 focus:ring-brand-indigo-merchant/15"
                                        }`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword((prev) => !prev)}
                                        tabIndex={-1}
                                        aria-label={showNewPassword ? "Sembunyikan sandi" : "Lihat sandi"}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors p-1 cursor-pointer"
                                    >
                                        {showNewPassword ? (
                                            <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                                        ) : (
                                            <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                                        )}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="text-rose-500 text-xs font-semibold mt-1.5">
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            {/* Input Confirm Password */}
                            <div>
                                <label
                                    htmlFor="field_confirm_password"
                                    className="block text-xs font-bold text-gray-700 mb-2 flex items-center gap-1.5"
                                >
                                    <KeyRound className="w-3.5 h-3.5 text-brand-indigo-merchant" />
                                    <span>Konfirmasi Kata Sandi Baru</span>
                                    <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        id="field_confirm_password"
                                        type={showConfirmPassword ? "text" : "password"}
                                        required
                                        value={data.password_confirmation}
                                        onChange={(e) =>
                                            setData("password_confirmation", e.target.value)
                                        }
                                        placeholder="Ulangi kata sandi baru"
                                        className={`w-full pl-4 pr-11 py-3.5 bg-gray-50/80 border rounded-2xl text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:bg-white transition ${
                                            errors.password_confirmation
                                                ? "border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 bg-rose-50/20"
                                                : "border-gray-200 focus:border-brand-indigo-merchant focus:ring-2 focus:ring-brand-indigo-merchant/15"
                                        }`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                                        tabIndex={-1}
                                        aria-label={showConfirmPassword ? "Sembunyikan sandi" : "Lihat sandi"}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors p-1 cursor-pointer"
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                                        ) : (
                                            <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                                        )}
                                    </button>
                                </div>
                                {errors.password_confirmation && (
                                    <p className="text-rose-500 text-xs font-semibold mt-1.5">
                                        {errors.password_confirmation}
                                    </p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full py-4 px-6 rounded-2xl bg-brand-indigo-merchant hover:bg-brand-indigo-merchant-hover text-white font-bold text-xs sm:text-sm shadow-xl shadow-brand-indigo-merchant/25 transition hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2 mt-4"
                            >
                                {processing ? "Menyimpan Data..." : "Simpan & Masuk ke Dashboard"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </MerchantAuthLayout>
    );
}

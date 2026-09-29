import React, { useState } from "react";
import { Head, useForm } from "@inertiajs/react";
import { Eye, EyeOff, Store } from "lucide-react";
import MerchantAuthLayout from "@/Layouts/MerchantAuthLayout";
import parigiMerchantImg from "@/assets/images/parigi_merchant.png";

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        email: "",
        password: "",
        remember: false,
        expected_role: "pedagang",
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("login"));
    };

    return (
        <MerchantAuthLayout>
            <Head title="Masuk Akun Pedagang - CibendaMart" />

            <div className="w-full h-full flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
                {/* Left Column: Warm Gradient Hero Panel (Balanced 50%) */}
                <div className="bg-linear-to-br from-brand-orange-warm via-[#FFB86C] to-white p-6 sm:p-8 md:p-10 lg:p-12 xl:p-14 flex flex-col justify-between relative overflow-hidden">
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
                                <span>Portal Mitra Pedagang</span>
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

                {/* Right Column: Clean Login Form */}
                <div className="p-6 sm:p-8 md:p-10 lg:p-12 xl:p-14 flex flex-col justify-center bg-white overflow-y-auto">
                    <div className="max-w-md w-full mx-auto space-y-7">
                        {/* Title & Subtitle */}
                        <div>
                            <h2 className="text-3xl sm:text-4xl font-black text-brand-indigo-merchant tracking-tight">
                                Masuk Akun Pedagang
                            </h2>
                            <p className="text-xs sm:text-sm text-gray-500 font-medium mt-2 leading-relaxed">
                                Masukkan email atau username toko terdaftar Anda untuk mengelola toko.
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={submit} className="space-y-5" noValidate>
                            {/* Field Email atau Username */}
                            <div>
                                <label
                                    htmlFor="field_email"
                                    className="block text-xs font-bold text-gray-700 mb-2"
                                >
                                    Email atau Username <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    id="field_email"
                                    type="text"
                                    required
                                    value={data.email}
                                    onChange={(e) => setData("email", e.target.value)}
                                    placeholder="Contoh: toko.berkah@cibendamart.com atau tokoujang"
                                    className={`w-full px-4 py-3.5 bg-gray-50/80 border rounded-2xl text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:bg-white transition ${
                                        errors.email
                                            ? "border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 bg-rose-50/20"
                                            : "border-gray-200 focus:border-brand-indigo-merchant focus:ring-2 focus:ring-brand-indigo-merchant/15"
                                    }`}
                                />
                                {errors.email && (
                                    <p className="text-rose-500 text-xs font-semibold mt-1.5">
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            {/* Field Kata Sandi */}
                            <div>
                                <label
                                    htmlFor="field_password"
                                    className="block text-xs font-bold text-gray-700 mb-2"
                                >
                                    Kata Sandi <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        id="field_password"
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={data.password}
                                        onChange={(e) => setData("password", e.target.value)}
                                        placeholder="••••••••••••"
                                        className={`w-full pl-4 pr-11 py-3.5 bg-gray-50/80 border rounded-2xl text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:bg-white transition ${
                                            errors.password
                                                ? "border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 bg-rose-50/20"
                                                : "border-gray-200 focus:border-brand-indigo-merchant focus:ring-2 focus:ring-brand-indigo-merchant/15"
                                        }`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        tabIndex={-1}
                                        aria-label={showPassword ? "Sembunyikan kata sandi" : "Lihat kata sandi"}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors p-1 cursor-pointer"
                                    >
                                        {showPassword ? (
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

                            {/* Checkbox Ingat Saya */}
                            <div className="flex items-center justify-between pt-1">
                                <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-gray-600 font-medium">
                                    <input
                                        type="checkbox"
                                        checked={data.remember}
                                        onChange={(e) => setData("remember", e.target.checked)}
                                        className="w-4 h-4 rounded-md border-gray-300 text-brand-indigo-merchant focus:ring-brand-indigo-merchant/30 cursor-pointer"
                                    />
                                    <span>Ingat Saya</span>
                                </label>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full py-4 px-6 rounded-2xl bg-brand-indigo-merchant hover:bg-brand-indigo-merchant-hover text-white font-bold text-xs sm:text-sm shadow-xl shadow-brand-indigo-merchant/25 transition hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2 mt-2"
                            >
                                {processing ? "Memproses Autentikasi..." : "Masuk ke Dashboard"}
                            </button>
                        </form>

                        {/* Notice Alur SID Desa */}
                        <div className="pt-5 border-t border-gray-100">
                            <div className="p-4 rounded-2xl bg-orange-50/70 border border-brand-orange/20 flex items-start gap-3 text-left">
                                <div className="w-7 h-7 rounded-xl bg-brand-orange/15 flex items-center justify-center text-brand-orange shrink-0 mt-0.5">
                                    <Store className="w-4 h-4" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-gray-800">
                                        Belum Terdaftar Sebagai Pedagang?
                                    </h4>
                                    <p className="text-[11px] text-gray-600 mt-0.5 leading-relaxed">
                                        Pendaftaran akun pedagang terintegrasi langsung melalui aplikasi <strong>Sistem Informasi Desa (SID)</strong> atau verifikasi oleh Administrator Desa Cibenda.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MerchantAuthLayout>
    );
}

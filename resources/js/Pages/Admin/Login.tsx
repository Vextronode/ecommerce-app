import React, { useState } from "react";
import { Head, useForm } from "@inertiajs/react";
import { ShieldAlert, KeyRound, X, Mail, Eye, EyeOff } from "lucide-react";
import AdminAuthLayout from "@/Layouts/AdminAuthLayout";

export default function AdminLogin() {
    const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        email: "",
        password: "",
        remember: false,
        expected_role: "admin",
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("login"));
    };

    return (
        <AdminAuthLayout>
            <Head title="Masuk Portal Admin - CibendaMart" />

            <div className="w-full h-full flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
                {/* Left Column: Pure Deep Indigo Panel (#281B7A, no gradient) */}
                <div className="bg-[#281B7A] p-6 sm:p-8 md:p-10 lg:p-12 xl:p-14 flex flex-col justify-between relative overflow-hidden text-white">
                    {/* Top Identity & Headlines */}
                    <div className="relative z-10">
                        {/* Brand Title & Badge */}
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h2 className="text-2xl sm:text-3xl font-black text-brand-orange tracking-tight">
                                    Cibenda<span className="text-white drop-shadow-xs">Mart</span>
                                </h2>
                                <p className="text-xs font-semibold text-white/75 mt-0.5">
                                    Portal Admin E-Commerce
                                </p>
                            </div>
                            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-white shadow-2xs">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                <span>Panel Admin</span>
                            </div>
                        </div>

                        {/* Hero Headline & Subtitle */}
                        <div className="mt-8 sm:mt-11">
                            <h1 className="text-3xl sm:text-4xl lg:text-[2.6rem] font-extrabold text-white leading-tight drop-shadow-xs max-w-xl">
                                Selamat Datang Admin!
                            </h1>
                            <p className="text-xs sm:text-sm md:text-base text-white/80 font-medium mt-3.5 leading-relaxed max-w-xl">
                                Kelola komoditas Hasil Tani, Kebun, dan Laut dalam satu platform
                            </p>
                        </div>

                        {/* Feature Cards Stack (Glassy) */}
                        <div className="mt-8 space-y-3.5 max-w-lg">
                            <div className="px-5 py-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-white shadow-xs transition hover:bg-white/15">
                                <h4 className="font-bold text-sm sm:text-base text-white">
                                    Hasil Tani & Ternak
                                </h4>
                                <p className="text-xs text-white/70 mt-0.5">
                                    Sapi, Kambing, Bebek & Ayam
                                </p>
                            </div>
                            <div className="px-5 py-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-white shadow-xs transition hover:bg-white/15">
                                <h4 className="font-bold text-sm sm:text-base text-white">
                                    Kebun & Seafoods
                                </h4>
                                <p className="text-xs text-white/70 mt-0.5">
                                    Sayuran Segar & Hasil Laut
                                </p>
                            </div>
                            <div className="px-5 py-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-white shadow-xs transition hover:bg-white/15">
                                <h4 className="font-bold text-sm sm:text-base text-white">
                                    Hasil Tani & Ternak
                                </h4>
                                <p className="text-xs text-white/70 mt-0.5">
                                    Sapi, Kambing, Bebek & Ayam
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Footer (Tanpa tulisan Sistem Aman sesuai instruksi) */}
                    <div className="relative z-10 pt-6 mt-6 border-t border-white/15 flex items-center justify-between text-xs text-white/60 font-medium">
                        <span>© 2026 CibendaMart</span>
                    </div>
                </div>

                {/* Right Column: Clean Login Form */}
                <div className="p-6 sm:p-8 md:p-10 lg:p-12 xl:p-14 flex flex-col justify-center bg-white overflow-y-auto">
                    <div className="max-w-md w-full mx-auto space-y-7">
                        {/* Title & Subtitle */}
                        <div className="text-center sm:text-left">
                            <h2 className="text-3xl sm:text-4xl font-black text-brand-orange tracking-tight">
                                Login
                            </h2>
                            <p className="text-xs sm:text-sm text-gray-500 font-medium mt-2 leading-relaxed">
                                Masukkan kredensial Anda untuk mengakses dashboard.
                            </p>
                        </div>

                        {/* Form (2 Input: Email/Username dan Kata Sandi) */}
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
                                    placeholder="admin@cibendamart.com"
                                    className={`w-full px-4 py-3.5 bg-gray-50/80 border rounded-2xl text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:bg-white transition ${
                                        errors.email
                                            ? "border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 bg-rose-50/20"
                                            : "border-gray-200 focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/15"
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
                                                : "border-gray-200 focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/15"
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

                            {/* Checkbox Ingat Saya & Lupa Sandi */}
                            <div className="flex items-center justify-between pt-1">
                                <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-gray-600 font-medium">
                                    <input
                                        type="checkbox"
                                        checked={data.remember}
                                        onChange={(e) => setData("remember", e.target.checked)}
                                        className="w-4 h-4 rounded-md border-gray-300 text-brand-orange focus:ring-brand-orange/30 cursor-pointer"
                                    />
                                    <span>Ingat Saya</span>
                                </label>

                                <button
                                    type="button"
                                    onClick={() => setIsForgotModalOpen(true)}
                                    className="text-brand-orange hover:text-brand-orange-hover text-xs font-semibold transition-colors hover:underline cursor-pointer bg-transparent border-0"
                                >
                                    Lupa Kata Sandi?
                                </button>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full py-4 px-6 rounded-2xl bg-brand-orange hover:bg-brand-orange-hover text-white font-bold text-xs sm:text-sm shadow-xl shadow-brand-orange/25 transition hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2 mt-2"
                            >
                                {processing ? "Memproses Autentikasi..." : "Masuk ke Dashboard"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Modal Popup Lupa Password Admin */}
            {isForgotModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200">
                    <div className="relative w-full max-w-lg bg-slate-900 border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl text-white overflow-hidden">
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-orange/20 rounded-full blur-3xl pointer-events-none" />

                        {/* Modal Header */}
                        <div className="flex items-start justify-between mb-5">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-2xl bg-brand-orange/20 border border-brand-orange/30 text-brand-orange">
                                    <KeyRound className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">
                                        Pemulihan Akun Administrator
                                    </h3>
                                    <p className="text-xs text-slate-300">
                                        Protokol Keamanan Sistem CibendaMart
                                    </p>
                                </div>
                            </div>

                            <button
                                aria-label="Tutup Modal"
                                type="button"
                                onClick={() => setIsForgotModalOpen(false)}
                                className="p-1.5 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Security Notice Box */}
                        <div className="mb-5 p-4 rounded-2xl bg-black/30 border border-white/10 text-xs text-slate-200 space-y-2">
                            <div className="flex items-center gap-2 font-semibold text-brand-orange">
                                <ShieldAlert className="w-4 h-4 shrink-0" />
                                <span>Reset Mandiri Dinonaktifkan</span>
                            </div>
                            <p className="text-gray-300 leading-relaxed">
                                Demi mencegah pengambilalihan hak akses sistem, akun Administrator tidak menyediakan tautan reset sandi publik melalui email.
                            </p>
                        </div>

                        {/* Recovery Steps */}
                        <div className="space-y-3 mb-6">
                            <p className="text-xs font-semibold text-orange-300 uppercase tracking-wider">
                                Cara Mereset Kredensial:
                            </p>

                            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                                <Mail className="w-4 h-4 text-brand-orange shrink-0 mt-0.5" />
                                <div className="text-xs text-gray-200">
                                    <span className="font-semibold text-white">Hubungi Super Admin / Webmaster:</span>
                                    <p className="text-gray-400 mt-0.5">
                                        Minta reset kredensial langsung kepada pengelola server atau pemilik sistem CibendaMart.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={() => setIsForgotModalOpen(false)}
                                className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-brand-orange hover:bg-brand-orange-hover text-white font-bold text-xs transition shadow-lg shadow-brand-orange/30 cursor-pointer"
                            >
                                Mengerti
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminAuthLayout>
    );
}

import React, { useState } from "react";
import { Head, useForm } from "@inertiajs/react";
import { ShieldAlert, KeyRound, X, Mail } from "lucide-react";
import AuthGlassLayout from "@/Layouts/AuthGlassLayout";

export default function AdminLogin() {
    const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        name: "",
        email: "",
        password: "",
        expected_role: "admin",
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("login"));
    };

    return (
        <>
            <Head title="Masuk ke CibendaMart Admin" />

            <AuthGlassLayout
                title="Masuk ke CibendaMart Admin"
                subtitle="Kelola pedagang, produk, dan aktivitas marketplace CibendaMart."
            >
                <form onSubmit={submit} className="space-y-6 w-full">
                    {/* Input Full Name */}
                    <div>
                        <label htmlFor="field_32" className="block text-white text-sm mb-2 font-medium">
                            Full Name<span className="text-red-400">*</span>
                        </label>
                        <input aria-label="Input field" id="field_32"
                            type="text"
                            value={data.name}
                            onChange={(e) => setData("name", e.target.value)}
                            placeholder="Admin CibendaMart"
                            className="w-full px-4 py-3.5 rounded-2xl bg-[#EBE9E9] text-gray-900 border-0 focus:ring-4 focus:ring-[#41B9C5]/50 outline-none shadow-inner transition placeholder:text-gray-400 font-medium"
                            required
                        />
                        {errors.name && (
                            <div className="text-red-300 text-xs mt-1.5 font-medium">
                                {errors.name}
                            </div>
                        )}
                    </div>

                    {/* Input Email */}
                    <div>
                        <label htmlFor="field_52" className="block text-white text-sm mb-2 font-medium">
                            Email<span className="text-red-400">*</span>
                        </label>
                        <input aria-label="Input field" id="field_52"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData("email", e.target.value)}
                            placeholder="admin@cibendamart.com"
                            className="w-full px-4 py-3.5 rounded-2xl bg-[#EBE9E9] text-gray-900 border-0 focus:ring-4 focus:ring-[#41B9C5]/50 outline-none shadow-inner transition placeholder:text-gray-400 font-medium"
                            required
                        />
                        {errors.email && (
                            <div className="text-red-300 text-xs mt-1.5 font-medium">
                                {errors.email}
                            </div>
                        )}
                    </div>

                    {/* Input Password */}
                    <div>
                        <label htmlFor="field_72" className="block text-white text-sm mb-2 font-medium">
                            Password<span className="text-red-400">*</span>
                        </label>
                        <input aria-label="Input field" id="field_72"
                            type="password"
                            value={data.password}
                            onChange={(e) => setData("password", e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-4 py-3.5 rounded-2xl bg-[#EBE9E9] text-gray-900 border-0 focus:ring-4 focus:ring-[#41B9C5]/50 outline-none shadow-inner transition placeholder:text-gray-400 font-medium"
                            required
                        />
                        {errors.password && (
                            <div className="text-red-300 text-xs mt-1.5 font-medium">
                                {errors.password}
                            </div>
                        )}
                    </div>

                    {/* Tombol Masuk */}
                    <div className="pt-6 flex flex-col items-center justify-center w-full space-y-4">
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full max-w-56 px-6 py-3 rounded-full bg-[#467382] hover:bg-[#3b6370] text-white font-bold transition hover:scale-105 disabled:opacity-70 shadow-lg shadow-[#00383C]/60 cursor-pointer"
                        >
                            {processing ? "Memproses..." : "Masuk"}
                        </button>

                        <button
                            type="button"
                            onClick={() => setIsForgotModalOpen(true)}
                            className="text-[#41B9C5] hover:text-[#52d3e0] text-xs font-medium transition-colors hover:underline cursor-pointer bg-transparent border-0"
                        >
                            Lupa Password?
                        </button>
                    </div>
                </form>
            </AuthGlassLayout>

            {/* Modal Popup Lupa Password Admin */}
            {isForgotModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200">
                    <div className="relative w-full max-w-lg bg-[#004246] border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl text-white overflow-hidden">
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#41B9C5]/20 rounded-full blur-3xl pointer-events-none" />

                        {/* Modal Header */}
                        <div className="flex items-start justify-between mb-5">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-2xl bg-[#41B9C5]/20 border border-[#41B9C5]/30 text-[#41B9C5]">
                                    <KeyRound className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">
                                        Pemulihan Akun Administrator
                                    </h3>
                                    <p className="text-xs text-teal-200/80">
                                        Protokol Keamanan Sistem CibendaMart
                                    </p>
                                </div>
                            </div>

                            <button aria-label="Action"
                                type="button"
                                onClick={() => setIsForgotModalOpen(false)}
                                className="p-1.5 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Security Notice Box */}
                        <div className="mb-5 p-4 rounded-2xl bg-black/30 border border-teal-500/20 text-xs text-teal-100 space-y-2">
                            <div className="flex items-center gap-2 font-semibold text-[#41B9C5]">
                                <ShieldAlert className="w-4 h-4 shrink-0" />
                                <span>Reset Mandiri Dinonaktifkan</span>
                            </div>
                            <p className="text-gray-300 leading-relaxed">
                                Demi mencegah pengambilalihan hak akses sistem, akun Administrator tidak menyediakan tautan reset sandi publik melalui email.
                            </p>
                        </div>

                        {/* Recovery Steps */}
                        <div className="space-y-3 mb-6">
                            <p className="text-xs font-semibold text-teal-200 uppercase tracking-wider">
                                Cara Mereset Kredensial:
                            </p>

                            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                                <Mail className="w-4 h-4 text-[#41B9C5] shrink-0 mt-0.5" />
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
                                className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#41B9C5] hover:bg-[#359a9e] text-white font-bold text-xs transition shadow-lg shadow-[#004F54]/50 cursor-pointer"
                            >
                                Mengerti
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

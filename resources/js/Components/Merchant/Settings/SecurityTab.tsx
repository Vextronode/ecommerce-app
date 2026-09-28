import React, { useState } from "react";
import { useForm } from "@inertiajs/react";
import {
    KeyRound,
    Shield,
    Monitor,
    Smartphone,
    LogOut,
    Eye,
    EyeOff,
    CheckCircle2,
    Lock,
    X,
} from "lucide-react";
import InputError from "@/Components/InputError";
import Modal from "@/Components/Modal";
import PasswordStrengthMeter from "@/Components/Admin/Merchants/PasswordStrengthMeter";
import toast from "react-hot-toast";

interface SessionItem {
    id: string;
    agent: {
        is_desktop: boolean;
        platform: string;
        browser: string;
    };
    ip_address: string;
    is_current_device: boolean;
    last_active: string;
}

interface SecurityTabProps {
    sessions?: SessionItem[];
    isOAuth?: boolean;
}

const inputClass =
    "w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 transition bg-white";

export default function SecurityTab({
    sessions = [],
    isOAuth = false,
}: SecurityTabProps) {
    const [showCurrentPass, setShowCurrentPass] = useState(false);
    const [showNewPass, setShowNewPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    // Password Update Form
    const {
        data: passData,
        setData: setPassData,
        put: putPassword,
        reset: resetPassword,
        processing: passProcessing,
        errors: passErrors,
    } = useForm({
        current_password: "",
        password: "",
        password_confirmation: "",
    });

    // Logout Sessions Form
    const {
        data: sessionData,
        setData: setSessionData,
        delete: destroySessions,
        processing: sessionProcessing,
        errors: sessionErrors,
        reset: resetSession,
    } = useForm({
        password: "",
    });

    const handleUpdatePassword = (e: React.FormEvent) => {
        e.preventDefault();
        putPassword(route("password.update"), {
            preserveScroll: true,
            onSuccess: () => {
                resetPassword();
                toast.success("Kata sandi berhasil diperbarui dengan aman!");
            },
            onError: (errs) => {
                if (errs.current_password) {
                    toast.error(errs.current_password);
                } else if (errs.password) {
                    toast.error(errs.password);
                } else {
                    toast.error(
                        "Gagal memperbarui kata sandi. Periksa input Anda."
                    );
                }
            },
        });
    };

    const handleLogoutOtherSessions = (e: React.FormEvent) => {
        e.preventDefault();
        destroySessions(route("merchant.settings.sessions.destroy"), {
            preserveScroll: true,
            onSuccess: () => {
                setShowLogoutModal(false);
                resetSession();
                toast.success(
                    "Berhasil mengeluarkan semua sesi di perangkat lain."
                );
            },
            onError: (errs) => {
                toast.error(
                    errs.password || "Gagal mengeluarkan sesi perangkat lain."
                );
            },
        });
    };

    return (
        <div className="space-y-6">
            {/* Section 1: Ubah Kata Sandi */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-5 sm:p-7">
                <div className="flex items-center gap-3 pb-4 mb-5 border-b border-gray-100">
                    <div className="w-10 h-10 rounded-xl bg-brand-orange-tint text-brand-orange flex items-center justify-center shrink-0">
                        <KeyRound className="w-5 h-5 text-brand-orange" />
                    </div>
                    <div>
                        <h3 className="text-base sm:text-lg font-bold text-gray-900">
                            Ubah Kata Sandi
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Pastikan kata sandi Anda kuat untuk mengamankan saldo dan transaksi toko.
                        </p>
                    </div>
                </div>

                {isOAuth ? (
                    <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200/60 flex items-start gap-3">
                        <Shield className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="text-sm font-bold text-blue-900">
                                Akun Terhubung Google OAuth
                            </h4>
                            <p className="text-xs text-blue-700 mt-0.5 leading-relaxed">
                                Anda masuk menggunakan akun Google. Otentikasi dan perlindungan 2-faktor dikelola langsung secara aman oleh sistem keamanan Google.
                            </p>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-xl">
                        {/* Current Password */}
                        <div>
                            <label
                                htmlFor="curr_pass"
                                className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5"
                            >
                                Kata Sandi Saat Ini
                            </label>
                            <div className="relative">
                                <input
                                    id="curr_pass"
                                    type={showCurrentPass ? "text" : "password"}
                                    value={passData.current_password}
                                    onChange={(e) =>
                                        setPassData(
                                            "current_password",
                                            e.target.value
                                        )
                                    }
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    className={`${inputClass} pr-10`}
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowCurrentPass(!showCurrentPass)
                                    }
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                                    title={
                                        showCurrentPass
                                            ? "Sembunyikan"
                                            : "Tampilkan"
                                    }
                                >
                                    {showCurrentPass ? (
                                        <EyeOff className="w-4 h-4" />
                                    ) : (
                                        <Eye className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                            <InputError
                                message={passErrors.current_password}
                                className="mt-1"
                            />
                        </div>

                        {/* New Password */}
                        <div>
                            <label
                                htmlFor="new_pass"
                                className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5"
                            >
                                Kata Sandi Baru
                            </label>
                            <div className="relative">
                                <input
                                    id="new_pass"
                                    type={showNewPass ? "text" : "password"}
                                    value={passData.password}
                                    onChange={(e) =>
                                        setPassData("password", e.target.value)
                                    }
                                    placeholder="••••••••"
                                    autoComplete="new-password"
                                    className={`${inputClass} pr-10`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPass(!showNewPass)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                                    title={
                                        showNewPass
                                            ? "Sembunyikan"
                                            : "Tampilkan"
                                    }
                                >
                                    {showNewPass ? (
                                        <EyeOff className="w-4 h-4" />
                                    ) : (
                                        <Eye className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                            <InputError
                                message={passErrors.password}
                                className="mt-1"
                            />
                            <PasswordStrengthMeter password={passData.password} />
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label
                                htmlFor="conf_pass"
                                className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5"
                            >
                                Konfirmasi Kata Sandi Baru
                            </label>
                            <div className="relative">
                                <input
                                    id="conf_pass"
                                    type={showConfirmPass ? "text" : "password"}
                                    value={passData.password_confirmation}
                                    onChange={(e) =>
                                        setPassData(
                                            "password_confirmation",
                                            e.target.value
                                        )
                                    }
                                    placeholder="••••••••"
                                    autoComplete="new-password"
                                    className={`${inputClass} pr-10`}
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowConfirmPass(!showConfirmPass)
                                    }
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                                    title={
                                        showConfirmPass
                                            ? "Sembunyikan"
                                            : "Tampilkan"
                                    }
                                >
                                    {showConfirmPass ? (
                                        <EyeOff className="w-4 h-4" />
                                    ) : (
                                        <Eye className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                            <InputError
                                message={passErrors.password_confirmation}
                                className="mt-1"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={passProcessing || !passData.password}
                            className="mt-2 px-5 py-2.5 bg-brand-orange hover:bg-brand-orange-hover disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md shadow-brand-orange/20 cursor-pointer active:scale-95"
                        >
                            {passProcessing
                                ? "Menyimpan..."
                                : "Perbarui Kata Sandi"}
                        </button>
                    </form>
                )}
            </div>

            {/* Section 2: Manajemen Sesi & Perangkat Aktif */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-5 sm:p-7">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b border-gray-100 gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                            <Shield className="w-5 h-5 text-gray-700" />
                        </div>
                        <div>
                            <h3 className="text-base sm:text-lg font-bold text-gray-900">
                                Aktivitas Sesi & Perangkat
                            </h3>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Daftar browser dan perangkat yang sedang masuk menggunakan akun merchant Anda.
                            </p>
                        </div>
                    </div>

                    {sessions.length > 1 && (
                        <button
                            type="button"
                            onClick={() => setShowLogoutModal(true)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 rounded-xl transition cursor-pointer self-start sm:self-auto"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>Keluar Dari Perangkat Lain</span>
                        </button>
                    )}
                </div>

                <div className="space-y-3">
                    {sessions.map((sess) => (
                        <div
                            key={sess.id}
                            className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition ${
                                sess.is_current_device
                                    ? "bg-brand-orange-tint/20 border-brand-orange/40"
                                    : "bg-gray-50/50 border-gray-200/80"
                            }`}
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-600 shrink-0 shadow-2xs">
                                    {sess.agent.is_desktop ? (
                                        <Monitor className="w-5 h-5" />
                                    ) : (
                                        <Smartphone className="w-5 h-5" />
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <div className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                                        {sess.agent.browser} di {sess.agent.platform}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-500 mt-0.5">
                                        <span className="font-mono">
                                            IP: {sess.ip_address}
                                        </span>
                                        <span>•</span>
                                        <span>
                                            {sess.is_current_device
                                                ? "Perangkat Saat Ini"
                                                : `Aktif ${sess.last_active}`}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {sess.is_current_device && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60 shrink-0">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    <span>Aktif Sekarang</span>
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Section 3: Tips Keamanan Toko */}
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/60 border border-amber-200/60 flex items-start gap-3.5">
                <Lock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900 space-y-1">
                    <p className="font-bold">Tips Keamanan Akun Merchant:</p>
                    <ul className="list-disc list-inside space-y-0.5 text-amber-800">
                        <li>
                            Jangan pernah membagikan kata sandi, PIN penarikan, atau kode OTP kepada siapapun termasuk pihak yang mengaku tim admin.
                        </li>
                        <li>
                            Gunakan kombinasi kata sandi unik yang tidak digunakan di platform lain.
                        </li>
                        <li>
                            Jika merasa ada aktivitas mencurigakan, segera ganti kata sandi dan klik "Keluar Dari Perangkat Lain".
                        </li>
                    </ul>
                </div>
            </div>

            {/* Modal Konfirmasi Logout Sesi Lain */}
            <Modal
                show={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                maxWidth="md"
            >
                <div className="p-6 relative">
                    <button
                        type="button"
                        onClick={() => setShowLogoutModal(false)}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-full p-2 transition-colors cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>

                    <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
                        <LogOut className="w-6 h-6 text-rose-600" />
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                        Keluarkan Sesi di Perangkat Lain?
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 mb-5 leading-relaxed">
                        Semua browser dan perangkat lain yang sedang login dengan akun toko ini akan otomatis dikeluarkan. Anda harus login ulang di perangkat tersebut.
                    </p>

                    <form onSubmit={handleLogoutOtherSessions} className="space-y-4">
                        {!isOAuth && (
                            <div>
                                <label
                                    htmlFor="verify_pass"
                                    className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5"
                                >
                                    Masukkan Kata Sandi untuk Konfirmasi
                                </label>
                                <input
                                    id="verify_pass"
                                    type="password"
                                    value={sessionData.password}
                                    onChange={(e) =>
                                        setSessionData(
                                            "password",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Kata sandi akun Anda"
                                    className={inputClass}
                                    autoFocus
                                    required
                                />
                                <InputError
                                    message={sessionErrors.password}
                                    className="mt-1"
                                />
                            </div>
                        )}

                        <div className="flex items-center justify-end gap-2.5 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowLogoutModal(false)}
                                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={
                                    sessionProcessing ||
                                    (!isOAuth && !sessionData.password)
                                }
                                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 transition shadow-sm cursor-pointer"
                            >
                                {sessionProcessing
                                    ? "Memproses..."
                                    : "Ya, Keluarkan Perangkat Lain"}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </div>
    );
}

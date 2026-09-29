import React from "react";
import { useForm } from "@inertiajs/react";
import UpdatePasswordForm from "./UpdatePasswordForm";
import DeleteUserForm from "./DeleteUserForm";
import { Monitor, Smartphone, Globe, Shield, LogOut, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

export default function SecuritySettings({ sessions, isOAuth }: any) {
    const { delete: destroySession, processing } = useForm();

    const logoutOtherDevices = (e: React.FormEvent) => {
        e.preventDefault();
        if (confirm("Apakah Anda yakin ingin keluar dari semua sesi di perangkat lain?")) {
            destroySession(route("profile.other-sessions.destroy"), {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success("Berhasil keluar dari sesi perangkat lain.");
                },
                onError: () => {
                    toast.error("Gagal mengeluarkan sesi.");
                },
            });
        }
    };

    return (
        <div className="space-y-6">
            {/* Password Section */}
            <div className="bg-white rounded-2xl md:rounded-3xl p-5 md:p-7 border border-slate-200/80 shadow-sm">
                {!isOAuth ? (
                    <UpdatePasswordForm />
                ) : (
                    <section>
                        <div className="flex items-start gap-3 pb-4 mb-4 border-b border-slate-100">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                <Shield className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-base md:text-lg font-bold text-gray-900">
                                    Login dengan Google
                                </h3>
                                <p className="text-xs md:text-sm text-slate-500 mt-0.5 leading-relaxed">
                                    Akun Anda terhubung langsung dengan Google OAuth. Kata sandi dan otentikasi akun dikelola aman melalui akun Google Anda.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 bg-emerald-50/80 px-3.5 py-2 rounded-xl border border-emerald-200/60 w-fit">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Terotentikasi & Terlindungi oleh Google</span>
                        </div>
                    </section>
                )}
            </div>

            {/* Active Device Sessions & Account Actions */}
            <div className="bg-white rounded-2xl md:rounded-3xl p-5 md:p-7 border border-slate-200/80 shadow-sm">
                <section>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-slate-100 gap-3">
                        <div>
                            <h3 className="text-base md:text-lg font-bold text-gray-900">
                                Aktivitas Sesi & Perangkat
                            </h3>
                            <p className="text-xs md:text-sm text-slate-500 mt-0.5">
                                Pantau perangkat yang saat ini sedang login menggunakan akun Anda.
                            </p>
                        </div>
                        <DeleteUserForm buttonOnly={true} isOAuth={isOAuth} />
                    </div>

                    <div className="space-y-3">
                        {sessions.map((session: any) => (
                            <div
                                key={session.id}
                                className={`p-4 rounded-xl border flex items-center justify-between gap-4 transition ${
                                    session.is_current_device
                                        ? "bg-orange-50/20 border-orange-200/70"
                                        : "bg-slate-50/40 border-slate-200/70"
                                }`}
                            >
                                <div className="flex items-center gap-3.5 min-w-0">
                                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 shrink-0 shadow-2xs">
                                        {session.agent.is_desktop ? (
                                            <Monitor className="w-5 h-5" />
                                        ) : session.agent.is_mobile ? (
                                            <Smartphone className="w-5 h-5" />
                                        ) : (
                                            <Globe className="w-5 h-5" />
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-xs md:text-sm font-bold text-gray-900 truncate">
                                            {session.agent.browser
                                                ? `${session.agent.browser} di ${session.agent.platform}`
                                                : "Perangkat Web"}
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2 text-[11px] md:text-xs text-slate-500 mt-0.5">
                                            <span>IP: {session.ip_address}</span>
                                            <span>•</span>
                                            <span>{session.is_current_device ? "Perangkat Ini" : `Aktif ${session.last_active}`}</span>
                                        </div>
                                    </div>
                                </div>

                                {session.is_current_device ? (
                                    <span className="px-2.5 py-1 rounded-full text-[10px] md:text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                                        Sedang Aktif
                                    </span>
                                ) : (
                                    <span className="text-[11px] text-slate-400 shrink-0 hidden sm:inline">
                                        Sesi Lain
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>

                    {sessions.length > 1 && (
                        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
                            <button
                                type="button"
                                onClick={logoutOtherDevices}
                                disabled={processing}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-bold text-red-600 hover:bg-red-50 transition active:scale-95 disabled:opacity-50"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>Keluar dari Semua Perangkat Lain</span>
                            </button>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}

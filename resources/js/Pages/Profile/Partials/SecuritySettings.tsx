import React from "react";
import { useForm } from "@inertiajs/react";
import UpdatePasswordForm from "./UpdatePasswordForm";
import DeleteUserForm from "./DeleteUserForm";
import { Monitor, Smartphone, Globe } from "lucide-react";

export default function SecuritySettings({ sessions, isOAuth }: any) {
    const { delete: destroySession, processing } = useForm();

    const logoutOtherDevices = (e: React.FormEvent) => {
        e.preventDefault();
        if (confirm("Apakah Anda yakin ingin keluar dari semua perangkat lain?")) {
            destroySession(route("profile.other-sessions.destroy"));
        }
    };

    return (
        <div className="space-y-8">
            {!isOAuth ? (
                <div className="bg-white rounded-3xl shadow-sm p-6 md:p-8 border border-slate-100">
                    <UpdatePasswordForm />
                </div>
            ) : (
                <div className="bg-white rounded-3xl shadow-sm p-6 md:p-8 border border-slate-100">
                    <section>
                        <header>
                            <h2 className="text-xl font-bold text-gray-900">
                                Password
                            </h2>
                            <p className="mt-1 text-sm text-gray-600">
                                Akun Anda terhubung melalui Google. Kata sandi dan keamanan akun dikelola sepenuhnya oleh Google.
                            </p>
                        </header>
                    </section>
                </div>
            )}

            <div className="bg-white rounded-3xl shadow-sm p-6 md:p-8 border border-slate-100">
                <section>
                    <header className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">
                                Keamanan
                            </h2>
                            <p className="mt-1 text-sm text-gray-600">
                                Cek apakah ada aktivitas mencurigakan
                            </p>
                        </div>
                        <DeleteUserForm buttonOnly={true} isOAuth={isOAuth} />
                    </header>

                    <div className="mt-8 border-t border-gray-100 pt-6">
                        <h3 className="text-sm font-bold text-gray-900 mb-1">
                            Aktivitas Login
                        </h3>
                        <p className="text-sm text-gray-500 mb-6">
                            Aktivitas login saat ini
                        </p>

                        <div className="space-y-6">
                            {sessions.map((session: any) => (
                                <div key={session.id} className="flex items-start gap-4">
                                    <div className="p-2 bg-gray-50 rounded-lg">
                                        {session.agent.is_desktop ? (
                                            <Monitor className="w-6 h-6 text-gray-700" />
                                        ) : session.agent.is_mobile ? (
                                            <Smartphone className="w-6 h-6 text-gray-700" />
                                        ) : (
                                            <Globe className="w-6 h-6 text-gray-700" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-sm font-bold text-gray-900">
                                            {session.agent.browser ? `${session.agent.browser} di ${session.agent.platform}` : 'Perangkat Tidak Dikenal'}
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs text-gray-500">
                                                {session.ip_address},
                                            </span>
                                            {session.is_current_device ? (
                                                <span className="text-xs font-semibold text-[#0066CC] bg-[#E3EFFF] px-2 py-0.5 rounded-full">
                                                    Sedang Aktif
                                                </span>
                                            ) : (
                                                <span className="text-xs text-gray-500">
                                                    Aktif {session.last_active}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {sessions.length > 1 && (
                            <div className="mt-8 flex justify-end">
                                <button
                                    onClick={logoutOtherDevices}
                                    disabled={processing}
                                    className="text-sm text-[#0066CC] hover:text-[#0052a3] font-medium"
                                >
                                    Keluar dari semua perangkat
                                </button>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}

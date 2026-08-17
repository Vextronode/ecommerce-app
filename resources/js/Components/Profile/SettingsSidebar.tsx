import React from "react";
import { Link } from "@inertiajs/react";
import {
    User,
    MapPin,
    Bell,
    ShieldCheck,
    ShoppingBag,
    ShoppingCart,
    Store,
    LogOut,
    ChevronRight,
} from "lucide-react";

export interface SettingsSidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    userRole?: string;
    className?: string;
}

export default function SettingsSidebar({
    activeTab,
    setActiveTab,
    userRole,
    className = "",
}: SettingsSidebarProps) {
    const accountMenus = [
        { id: "biodata", name: "Biodata Diri", icon: User },
        { id: "alamat", name: "Daftar Alamat", icon: MapPin },
        { id: "keamanan", name: "Password & Keamanan", icon: ShieldCheck },
        { id: "notifikasi", name: "Pengaturan Notifikasi", icon: Bell },
    ];

    return (
        <aside className={`w-full lg:w-72 flex flex-col gap-4 ${className}`}>
            {/* Nav Card */}
            <div className="bg-white rounded-2xl md:rounded-3xl border border-slate-200/80 shadow-sm p-4 space-y-6">
                {/* Section 1: Akun Saya */}
                <div>
                    <div className="flex items-center gap-2 px-3 pb-2 mb-1 border-b border-slate-100">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            Akun Saya
                        </span>
                    </div>

                    <nav className="space-y-1 pt-1">
                        {accountMenus.map((menu) => {
                            const Icon = menu.icon;
                            const isActive = activeTab === menu.id;

                            return (
                                <button
                                    key={menu.id}
                                    type="button"
                                    onClick={() => setActiveTab(menu.id)}
                                    className={`flex w-full items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-sm transition duration-150 text-left ${
                                        isActive
                                            ? "bg-orange-50/80 text-[#ED7218] font-bold shadow-2xs"
                                            : "text-slate-600 hover:bg-slate-50 hover:text-gray-900"
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon
                                            className={`w-4.5 h-4.5 shrink-0 ${
                                                isActive ? "text-[#ED7218]" : "text-slate-400"
                                            }`}
                                        />
                                        <span>{menu.name}</span>
                                    </div>
                                    {isActive && (
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#ED7218]"></span>
                                    )}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Section 2: Pesanan & Belanja */}
                <div>
                    <div className="flex items-center gap-2 px-3 pb-2 mb-1 border-b border-slate-100">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            Aktivitas Belanja
                        </span>
                    </div>

                    <div className="space-y-1 pt-1">
                        <Link
                            href={route("history.index")}
                            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-sm text-slate-600 hover:bg-slate-50 hover:text-gray-900 transition duration-150"
                        >
                            <div className="flex items-center gap-3">
                                <ShoppingBag className="w-4.5 h-4.5 text-slate-400" />
                                <span>Pesanan Saya</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-300" />
                        </Link>

                        <Link
                            href={route("cart")}
                            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-sm text-slate-600 hover:bg-slate-50 hover:text-gray-900 transition duration-150"
                        >
                            <div className="flex items-center gap-3">
                                <ShoppingCart className="w-4.5 h-4.5 text-slate-400" />
                                <span>Keranjang</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-300" />
                        </Link>
                    </div>
                </div>

                {/* Section 3: Toko / Merchant Portal (if applicable) */}
                {userRole === "pedagang" && (
                    <div>
                        <div className="flex items-center gap-2 px-3 pb-2 mb-1 border-b border-slate-100">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                Portal Toko
                            </span>
                        </div>

                        <div className="pt-1">
                            <Link
                                href="/pedagang/dashboard"
                                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-sm bg-blue-50/60 text-blue-700 hover:bg-blue-100/60 transition duration-150"
                            >
                                <div className="flex items-center gap-3">
                                    <Store className="w-4.5 h-4.5 text-blue-600" />
                                    <span>Dashboard Pedagang</span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-blue-400" />
                            </Link>
                        </div>
                    </div>
                )}

                {/* Section 4: Logout */}
                <div className="pt-2 border-t border-slate-100">
                    <Link
                        href={route("logout")}
                        method="post"
                        as="button"
                        className="flex w-full items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition duration-150 text-left"
                    >
                        <LogOut className="w-4.5 h-4.5" />
                        <span>Keluar</span>
                    </Link>
                </div>
            </div>
        </aside>
    );
}

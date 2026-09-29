import React from "react";
import { Link } from "@inertiajs/react";
import {
    LayoutDashboard,
    Store,
    UserPlus,
    BarChart2,
    LogOut,
} from "lucide-react";
import parigiLogo from "@/assets/images/parigi_logo.png";

interface AdminSidebarProps {
    onCloseMobile?: () => void;
}

export default function AdminSidebar({ onCloseMobile }: AdminSidebarProps) {
    return (
        <aside className="w-64 bg-white border border-brand-orange/30 rounded-3xl flex flex-col h-full shrink-0 shadow-sm">
            {/* Brand Logo */}
            <div className="h-24 flex items-center px-7">
                <div className="flex items-center gap-3">
                    <img
                        src={parigiLogo}
                        alt="Logo CibendaMart"
                        className="w-9 h-9 object-contain"
                    />
                    <div className="flex flex-col">
                        <span className="text-xl font-extrabold tracking-tight">
                            <span className="text-brand-orange">Cibenda</span>
                            <span className="text-brand-orange-dark">Mart</span>
                        </span>
                        <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase -mt-0.5">
                            Admin Portal
                        </span>
                    </div>
                </div>
            </div>

            {/* Nav Menu */}
            <nav className="flex-1 px-4 py-2 space-y-2 overflow-y-auto">
                <Link
                    href={route("admin.dashboard")}
                    onClick={onCloseMobile}
                    className={`flex items-center gap-3.5 px-4 py-3 rounded-xl font-bold transition text-sm whitespace-nowrap ${
                        route().current("admin.dashboard")
                            ? "bg-brand-orange text-white shadow-lg shadow-brand-orange/30"
                            : "text-gray-600 hover:bg-orange-50/60 hover:text-brand-orange border border-transparent"
                    }`}
                >
                    <LayoutDashboard className="w-5 h-5 shrink-0" />
                    Dashboard
                </Link>

                <Link
                    href={route("admin.merchants.index")}
                    onClick={onCloseMobile}
                    className={`flex items-center gap-3.5 px-4 py-3 rounded-xl font-bold transition text-sm whitespace-nowrap ${
                        route().current("admin.merchants.index")
                            ? "bg-brand-orange text-white shadow-lg shadow-brand-orange/30"
                            : "text-gray-600 hover:bg-orange-50/60 hover:text-brand-orange border border-transparent"
                    }`}
                >
                    <Store className="w-5 h-5 shrink-0" />
                    Kelola Pedagang
                </Link>

                <Link
                    href={route("admin.merchants.create")}
                    onClick={onCloseMobile}
                    className={`flex items-center gap-3.5 px-4 py-3 rounded-xl font-bold transition text-sm whitespace-nowrap ${
                        route().current("admin.merchants.create")
                            ? "bg-brand-orange text-white shadow-lg shadow-brand-orange/30"
                            : "text-gray-600 hover:bg-orange-50/60 hover:text-brand-orange border border-transparent"
                    }`}
                >
                    <UserPlus className="w-5 h-5 shrink-0" />
                    Tambah Pedagang
                </Link>

                <Link
                    href={route("admin.reports.index")}
                    onClick={onCloseMobile}
                    className={`flex items-center gap-3.5 px-4 py-3 rounded-xl font-bold transition text-sm whitespace-nowrap ${
                        route().current("admin.reports.*")
                            ? "bg-brand-orange text-white shadow-lg shadow-brand-orange/30"
                            : "text-gray-600 hover:bg-orange-50/60 hover:text-brand-orange border border-transparent"
                    }`}
                >
                    <BarChart2 className="w-5 h-5 shrink-0" />
                    Laporan Penjualan
                </Link>
            </nav>

            {/* Bottom Logout Button */}
            <div className="p-4 border-t border-gray-100 mb-2">
                <Link
                    href={route("logout")}
                    method="post"
                    data={{ source: "admin" }}
                    as="button"
                    className="flex items-center justify-start gap-3 w-full px-4 py-2.5 text-rose-500 hover:bg-rose-50 border border-rose-200 rounded-2xl font-semibold transition text-sm cursor-pointer"
                >
                    <LogOut className="w-4 h-4 shrink-0 text-rose-500" />
                    Keluar Akun
                </Link>
            </div>
        </aside>
    );
}

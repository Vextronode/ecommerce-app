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
import toast from "react-hot-toast";

export default function AdminSidebar() {
    return (
        <aside className="w-64 bg-white border border-[#41B9C5]/30 rounded-3xl flex flex-col h-full shrink-0 shadow-sm">
            {/* Brand Logo */}
            <div className="h-24 flex items-center px-7">
                <div className="flex items-center gap-3">
                    <img
                        src={parigiLogo}
                        alt="Brand Logo"
                        className="w-9 h-9 object-contain"
                    />
                    <span className="text-xl font-extrabold tracking-tight">
                        <span className="text-[#41B9C5]">Cibenda</span>
                        <span className="text-[#004F54]">Mart</span>
                    </span>
                </div>
            </div>

            {/* Nav Menu */}
            <nav className="flex-1 px-4 py-2 space-y-2.5 overflow-y-auto">
                <Link
                    href={route("admin.dashboard")}
                    className={`flex items-center gap-3.5 px-4 py-3 rounded-xl font-bold transition-all text-sm whitespace-nowrap ${
                        route().current("admin.dashboard")
                            ? "bg-[#41B9C5] text-white shadow-lg shadow-[#41B9C5]/30"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-gray-100"
                    }`}
                >
                    <LayoutDashboard className="w-5 h-5 shrink-0" />
                    Dashboard
                </Link>

                <Link
                    href={route("admin.merchants.index")}
                    className={`flex items-center gap-3.5 px-4 py-3 rounded-xl font-bold transition-all text-sm whitespace-nowrap ${
                        route().current("admin.merchants.index")
                            ? "bg-[#41B9C5] text-white shadow-lg shadow-[#41B9C5]/30"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-gray-100"
                    }`}
                >
                    <Store className="w-5 h-5 shrink-0" />
                    Pedagang
                </Link>

                <Link
                    href={route("admin.merchants.create")}
                    className={`flex items-center gap-3.5 px-4 py-3 rounded-xl font-bold transition-all text-sm whitespace-nowrap ${
                        route().current("admin.merchants.create")
                            ? "bg-[#41B9C5] text-white shadow-lg shadow-[#41B9C5]/30"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-gray-100"
                    }`}
                >
                    <UserPlus className="w-5 h-5 shrink-0" />
                    Tambah User
                </Link>

                <Link
                    href={route("admin.reports.index")}
                    className={`flex items-center gap-3.5 px-4 py-3 rounded-xl font-bold transition-all text-sm whitespace-nowrap ${
                        route().current("admin.reports.*")
                            ? "bg-[#41B9C5] text-white shadow-lg shadow-[#41B9C5]/30"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-gray-100"
                    }`}
                >
                    <BarChart2 className="w-5 h-5 shrink-0" />
                    Laporan
                </Link>
            </nav>

            {/* Bottom Logout Button */}
            <div className="p-4 border-t border-gray-100 mb-2">
                <Link
                    href={route("logout")}
                    method="post"
                    data={{ source: "admin" }}
                    as="button"
                    className="flex items-center justify-start gap-3 w-full px-4 py-2.5 text-rose-500 hover:bg-rose-50 border border-rose-200 rounded-2xl font-semibold transition-all text-sm cursor-pointer"
                >
                    <LogOut className="w-4 h-4 shrink-0 text-rose-500" />
                    Logout
                </Link>
            </div>
        </aside>
    );
}

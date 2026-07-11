import React from "react";
import { Link } from "@inertiajs/react";
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    BarChart3,
    Settings,
    LogOut,
} from "lucide-react";
import parigiLogo from "@/assets/images/parigi_logo.png";

export default function Sidebar() {
    return (
        <aside className="w-65 bg-white border border-[#41B9C5]/30 rounded-3xl flex flex-col h-full shrink-0 shadow-sm">
            {/* Brand Logo */}
            <div className="h-24 flex items-center px-8">
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

            {/* nav Menu */}
            <nav className="flex-1 px-5 py-2 space-y-2 overflow-y-auto">
                <Link
                    href={route("merchant.dashboard")}
                    className={`flex items-center gap-4 px-4 py-3.5 rounded-xl font-semibold transition-all text-sm whitespace-nowrap ${
                        route().current("merchant.dashboard")
                            ? "bg-[#41B9C5] text-white shadow-lg shadow-[#41B9C5]/30"
                            : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                    }`}
                >
                    <LayoutDashboard className="w-5 h-5 shrink-0" />
                    Dashboard
                </Link>
                <Link
                    href={route("merchant.products.index")}
                    className={`flex items-center gap-4 px-4 py-3.5 rounded-xl font-medium transition-all text-sm whitespace-nowrap ${
                        route().current("merchant.products.*")
                            ? "bg-[#41B9C5] text-white shadow-md shadow-[#41B9C5]/30"
                            : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                    }`}
                >
                    <Package className="w-5 h-5 shrink-0" />
                    Product Management
                </Link>
                <Link
                    href="#"
                    className="flex items-center gap-4 px-4 py-3.5 text-gray-500 hover:bg-gray-50 hover:text-gray-800 rounded-xl font-medium transition-all text-sm whitespace-nowrap"
                >
                    <ShoppingCart className="w-5 h-5 shrink-0" />
                    Orders
                </Link>
                <Link
                    href="#"
                    className="flex items-center gap-4 px-4 py-3.5 text-gray-500 hover:bg-gray-50 hover:text-gray-800 rounded-xl font-medium transition-all text-sm whitespace-nowrap"
                >
                    <Users className="w-5 h-5 shrink-0" />
                    Customers
                </Link>
                <Link
                    href="#"
                    className="flex items-center gap-4 px-4 py-3.5 text-gray-500 hover:bg-gray-50 hover:text-gray-800 rounded-xl font-medium transition-all text-sm whitespace-nowrap"
                >
                    <BarChart3 className="w-5 h-5 shrink-0" />
                    Reports & Analytics
                </Link>
            </nav>

            {/* Bottom Actions */}
            <div className="p-5 border-t border-[#41B9C5]/30 space-y-1 mb-2">
                <Link
                    href="#"
                    className="flex items-center gap-4 px-4 py-3 text-gray-500 hover:bg-gray-50 hover:text-gray-800 rounded-xl font-medium transition-all text-sm whitespace-nowrap"
                >
                    <Settings className="w-5 h-5 shrink-0" />
                    Settings
                </Link>
                <Link
                    href={route("logout")}
                    method="post"
                    data={{ source: "merchant" }}
                    as="button"
                    className="flex items-center w-full gap-4 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl font-medium transition-all text-sm whitespace-nowrap"
                >
                    <LogOut className="w-5 h-5 shrink-0" />
                    Logout
                </Link>
            </div>
        </aside>
    );
}

import React, { ReactNode, useState } from "react";
import AdminSidebar from "@/Components/Admin/Dashboard/AdminSidebar";
import { User, Menu } from "lucide-react";
import { Toaster } from "react-hot-toast";
import { usePage } from "@inertiajs/react";

interface Props {
    children: ReactNode;
}

export default function AdminLayout({ children }: Props) {
    const { auth } = usePage().props as any;
    const profilePhoto = auth?.user?.profile_photo_path
        ? `/storage/${auth.user.profile_photo_path}`
        : null;

    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-[#F8F9FA] p-3 sm:p-4 md:p-6 gap-3 sm:gap-4 md:gap-6 font-sans overflow-hidden max-w-full w-full">
            {/* Mobile Backdrop */}
            {isMobileSidebarOpen && (
                <button
                    type="button"
                    aria-label="Tutup menu navigasi"
                    className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm transition-opacity cursor-pointer"
                    onClick={() => setIsMobileSidebarOpen(false)}
                />
            )}

            {/* Sidebar Wrapper */}
            <div
                className={`fixed inset-y-0 left-0 z-50 py-3 pl-3 md:py-6 md:pl-6 lg:p-0 transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
                    isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                <AdminSidebar onCloseMobile={() => setIsMobileSidebarOpen(false)} />
            </div>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden w-full max-w-full">
                {/* Topbar Pill Header */}
                <header className="h-16 md:h-18 px-4 md:px-7 flex items-center justify-between bg-white border border-brand-orange/25 rounded-full shrink-0 mb-4 md:mb-6 shadow-sm transition">
                    <div className="flex items-center gap-3 min-w-0">
                        <button
                            type="button"
                            aria-label="Buka menu navigasi"
                            onClick={() => setIsMobileSidebarOpen(true)}
                            className="lg:hidden p-2 text-gray-500 hover:text-brand-orange hover:bg-orange-50 rounded-xl transition-colors cursor-pointer shrink-0"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        <div className="min-w-0">
                            <h1 className="text-sm sm:text-base font-bold text-gray-900 truncate">
                                Panel Administrator
                            </h1>
                            <p className="text-[11px] text-gray-400 hidden sm:block truncate">
                                Kelola platform, mitra pedagang, dan laporan CibendaMart
                            </p>
                        </div>
                    </div>

                    {/* Header Right Profile */}
                    <div className="flex items-center gap-2.5 shrink-0 ml-2">
                        <div className="text-right hidden md:block">
                            <div className="text-xs font-bold text-gray-900 leading-tight">
                                {auth?.user?.name || "Admin"}
                            </div>
                            <div className="text-[10px] font-semibold text-brand-orange bg-orange-50 px-2 py-0.5 rounded-full inline-block mt-0.5">
                                Administrator
                            </div>
                        </div>
                        <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-orange-50 flex items-center justify-center overflow-hidden border border-brand-orange/30 shadow-xs shrink-0">
                            {profilePhoto ? (
                                <img
                                    src={profilePhoto}
                                    alt="Foto Admin"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <User className="w-4 h-4 md:w-5 md:h-5 text-brand-orange" />
                            )}
                        </div>
                    </div>
                </header>

                {/* Page View Body */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden min-w-0 w-full max-w-full pb-6 pr-1 md:pr-2">
                    <Toaster position="top-right" />
                    {children}
                </div>
            </main>
        </div>
    );
}

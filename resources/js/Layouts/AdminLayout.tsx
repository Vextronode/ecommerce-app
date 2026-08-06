import React, { ReactNode, useState } from "react";
import AdminSidebar from "@/Components/Admin/Dashboard/AdminSidebar";
import { Search, Bell, Mail, User, Menu } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { router, Link, usePage } from "@inertiajs/react";

interface Props {
    children: ReactNode;
}

export default function AdminLayout({ children }: Props) {
    const { auth } = usePage().props as any;
    const profilePhoto = auth?.user?.profile_photo_path
        ? `/storage/${auth.user.profile_photo_path}`
        : null;

    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState(
        new URLSearchParams(window.location.search).get("search") || "",
    );

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            const currentParams = Object.fromEntries(
                new URLSearchParams(window.location.search),
            );

            router.get(
                window.location.pathname,
                { ...currentParams, search: searchQuery },
                { preserveState: true, replace: true },
            );
        }
    };

    return (
        <div className="flex h-screen bg-[#F8F9FA] p-4 md:p-6 gap-4 md:gap-6 font-sans overflow-hidden">
            {/* Mobile Backdrop */}
            {isMobileSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setIsMobileSidebarOpen(false)}
                />
            )}

            {/* Sidebar Wrapper */}
            <div
                className={`fixed inset-y-0 left-0 z-50 py-4 pl-4 md:py-6 md:pl-6 lg:p-0 transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
                    isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                <AdminSidebar />
            </div>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0">
                {/* Topbar Pill Header */}
                <header className="h-16 md:h-18 px-4 md:px-8 flex items-center justify-between bg-white border border-[#41B9C5]/30 rounded-full shrink-0 mb-4 md:mb-6 shadow-sm transition-all">
                    <div className="flex items-center flex-1 max-w-2xl gap-3 md:gap-0">
                        <button
                            onClick={() => setIsMobileSidebarOpen(true)}
                            className="lg:hidden text-gray-400 hover:text-[#41B9C5] focus:outline-none transition-colors"
                        >
                            <Menu className="w-6 h-6" />
                        </button>

                        <div className="relative flex-1">
                            <Search className="w-4 h-4 md:w-5 md:h-5 absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={handleSearch}
                                className="w-full pl-9 md:pl-12 pr-4 py-2 md:py-2.5 bg-gray-50/50 border border-transparent rounded-full focus:outline-none focus:bg-white focus:border-[#41B9C5] focus:ring-1 focus:ring-[#41B9C5] text-xs md:text-sm transition-all"
                            />
                        </div>
                    </div>

                    {/* Header Right Icons */}
                    <div className="flex items-center gap-3 md:gap-6 ml-2 md:ml-4">
                        <button
                            onClick={() => toast("Tidak ada notifikasi baru")}
                            className="text-gray-400 hover:text-[#41B9C5] transition-colors relative hidden sm:block cursor-pointer"
                        >
                            <Bell className="w-5 h-5" />
                            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>

                        <button
                            onClick={() => toast("Kotak pesan kosong")}
                            className="text-gray-400 hover:text-[#41B9C5] transition-colors hidden sm:block cursor-pointer"
                        >
                            <Mail className="w-5 h-5" />
                        </button>

                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#F0FAFB] flex items-center justify-center overflow-hidden border border-[#41B9C5]/30 shadow-sm hover:shadow-md transition-all cursor-pointer shrink-0">
                            {profilePhoto ? (
                                <img
                                    src={profilePhoto}
                                    alt="Admin Profile"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <User className="w-4 h-4 md:w-5 md:h-5 text-[#41B9C5]" />
                            )}
                        </div>
                    </div>
                </header>

                {/* Page View Body */}
                <div className="flex-1 overflow-y-auto pb-6 pr-1 md:pr-2">
                    <Toaster position="top-right" />
                    {children}
                </div>
            </main>
        </div>
    );
}

import React, { ReactNode, useState } from "react";
import Sidebar from "@/Components/Merchant/Dashboard/Sidebar";
import NotificationBell from "@/Components/Global/NotificationBell";
import { Search, Mail, User, Menu } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { router, Link, usePage } from "@inertiajs/react";

interface Props {
    children: ReactNode;
}

export default function MerchantLayout({ children }: Props) {
    const { auth } = usePage().props as any;
    const profilePhoto = auth?.user?.profile_photo_path
        ? `/storage/${auth.user.profile_photo_path}`
        : null;
    // state buat ngatur sidebar di mobile
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    // state buat nyimpen ketikan search
    const [searchQuery, setSearchQuery] = useState(
        () => new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get("search") || "",
    );

    // fungsi buat nembak pencarian pas tekan Enter
    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            // ambil parameter yang lagi aktif (biar filter kategori/status ga ilang)
            const currentParams = Object.fromEntries(
                new URLSearchParams(window.location.search),
            );

            // tembak URL dengan gabungan parameter lama + search baru
            router.get(
                window.location.pathname,
                { ...currentParams, search: searchQuery },
                { preserveState: true, replace: true },
            );
        }
    };

    return (
        <div className="flex h-screen bg-[#F8F9FA] p-4 md:p-6 gap-4 md:gap-6 font-sans overflow-hidden">
            {isMobileSidebarOpen && (
                <button
                    type="button"
                    aria-label="Tutup menu sidebar"
                    className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setIsMobileSidebarOpen(false)}
                />
            )}

            <div
                className={`fixed inset-y-0 left-0 z-50 py-4 pl-4 md:py-6 md:pl-6 lg:p-0 transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
                    isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                <Sidebar />
            </div>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0">
                {/* Topbar */}
                <header className="h-16 md:h-18 px-4 md:px-8 flex items-center justify-between bg-white border border-[#41B9C5]/30 rounded-full shrink-0 mb-4 md:mb-6 shadow-sm transition">
                    <div aria-label="Pilih opsi yang tersedia" className="flex items-center flex-1 max-w-2xl gap-3 md:gap-0">
                        <button
                            aria-label="Tampilkan rincian lebih lanjut"
                            onClick={() => setIsMobileSidebarOpen(true)}
                            className="lg:hidden text-gray-400 hover:text-[#41B9C5] focus:outline-none transition-colors"
                        >
                            <Menu className="w-6 h-6" />
                        </button>

                        <div className="relative flex-1">
                            <Search className="w-4 h-4 md:w-5 md:h-5 absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                aria-label="Input field"
                                type="text"
                                placeholder="Search products... "
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={handleSearch}
                                className="w-full pl-9 md:pl-12 pr-4 py-2 md:py-2.5 bg-gray-50/50 border border-transparent rounded-full focus:outline-none focus:bg-white focus:border-[#41B9C5] focus:ring-1 focus:ring-[#41B9C5] text-xs md:text-sm transition"
                            />
                        </div>
                    </div>

                    {/* Header Right Section */}
                    <div aria-label="Pilih opsi yang tersedia" className="flex items-center gap-3 md:gap-6 ml-2 md:ml-4">
                        {/* Active Realtime Notification Bell for Merchant */}
                        <NotificationBell user={auth?.user} />

                        <button
                            aria-label="Tampilkan rincian lebih lanjut"
                            onClick={() =>
                                toast("Fitur Pesan segera hadir!", {
                                    icon: <Mail />,
                                })
                            }
                            className="text-gray-400 hover:text-[#41B9C5] transition-colors hidden sm:block"
                        >
                            <Mail className="w-5 h-5" />
                        </button>

                        <Link
                            href={route("merchant.settings.index")}
                            className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#F0FAFB] flex items-center justify-center overflow-hidden border border-[#41B9C5]/30 shadow-sm hover:shadow-md transition cursor-pointer shrink-0"
                        >
                            {profilePhoto ? (
                                <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-4 h-4 md:w-5 md:h-5 text-[#41B9C5]" />
                            )}
                        </Link>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto pb-6 pr-1 md:pr-2">
                    <Toaster position="top-right" />
                    {children}
                </div>
            </main>
        </div>
    );
}

import React, { ReactNode, useState } from "react";
import Sidebar from "@/Components/Merchant/Dashboard/Sidebar";
import NotificationBell from "@/Components/Global/NotificationBell";
import { Search, Mail, User, Menu, AlertTriangle } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { router, Link, usePage } from "@inertiajs/react";
import { MerchantOnboardingTour } from "@/Components/Merchant/Onboarding/MerchantOnboardingTour";
import { MerchantTourTabKey } from "@/types/tour";
import {
    hasViewedMerchantTab,
    consumeRequestedTour,
} from "@/utils/merchantTourProgress";

function getTourTabFromUrl(pathname: string): MerchantTourTabKey {
    if (pathname.includes("/pedagang/products/create")) return "products_create";
    if (pathname.includes("/pedagang/products/") && pathname.includes("/edit")) return "products_edit";
    if (pathname.includes("/pedagang/products")) return "products_index";
    if (pathname.includes("/pedagang/orders")) return "orders";
    if (pathname.includes("/pedagang/customers")) return "customers";
    if (pathname.includes("/pedagang/analytics")) return "analytics";
    if (pathname.includes("/pedagang/settings")) return "settings";
    if (pathname.includes("/pedagang/withdrawals")) return "withdrawals";
    return "dashboard";
}

interface Props {
    children: ReactNode;
}

export default function MerchantLayout({ children }: Props) {
    const { auth, flash, merchant_store } = usePage().props as any;
    const { url } = usePage();
    const profilePhoto = auth?.user?.profile_photo_path
        ? `/storage/${auth.user.profile_photo_path}`
        : null;
    // state buat ngatur sidebar di mobile
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    // state panduan interaktif per tab
    const [isTourActive, setIsTourActive] = useState(false);
    const currentTourTab = getTourTabFromUrl(url.split("?")[0]);
    const isSettingsPage = currentTourTab === "settings" || url.includes("/pedagang/settings");

    // Auto-trigger tour saat tab dibuka jika diminta secara eksplisit atau belum pernah dilihat
    React.useEffect(() => {
        if (isSettingsPage) {
            setIsTourActive(false);
            return;
        }

        const handleOpenTour = () => setIsTourActive(true);
        window.addEventListener("open-merchant-tour", handleOpenTour);

        // 1. Cek apakah ada permintaan eksplisit untuk membuka tour di tab ini (dari klik "Lanjut ke tab berikutnya")
        const isExplicitlyRequested = consumeRequestedTour(currentTourTab);

        // 2. Akun lama (has_completed_tour === true):
        // JANGAN PERNAH auto-trigger! Hanya buka jika ada permintaan eksplisit atau klik tombol "Panduan".
        if (merchant_store?.has_completed_tour === true) {
            if (isExplicitlyRequested) {
                setIsTourActive(true);
            } else {
                setIsTourActive(false);
            }
            return () => {
                window.removeEventListener("open-merchant-tour", handleOpenTour);
            };
        }

        // 3. Akun baru (has_completed_tour === false):
        // Auto-trigger HANYA jika tab ini belum pernah dibaca sebelumnya atau diminta eksplisit
        const alreadyViewed = hasViewedMerchantTab(currentTourTab);

        if (isExplicitlyRequested || !alreadyViewed) {
            const timer = setTimeout(() => {
                setIsTourActive(true);
            }, 300);
            return () => {
                clearTimeout(timer);
                window.removeEventListener("open-merchant-tour", handleOpenTour);
            };
        } else {
            setIsTourActive(false);
        }

        return () => {
            window.removeEventListener("open-merchant-tour", handleOpenTour);
        };
    }, [url, currentTourTab, isSettingsPage, merchant_store?.has_completed_tour]);

    // Otomatis tampilkan notifikasi toast jika ada session flash
    React.useEffect(() => {
        if (flash?.warning) {
            toast(flash.warning, {
                icon: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
                duration: 5000,
            });
        } else if (flash?.error) {
            toast.error(flash.error, { duration: 5000 });
        } else if (flash?.success) {
            toast.success(flash.success, { duration: 5000 });
        }
    }, [flash]);

    const isProductManagement =
        (typeof route === "function" && route().current("merchant.products.index")) ||
        url.split("?")[0] === "/pedagang/products";

    // state buat nyimpen ketikan search
    const [searchQuery, setSearchQuery] = useState(
        () => new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get("search") || "",
    );

    // sinkronkan searchQuery dengan parameter url saat navigasi
    React.useEffect(() => {
        const query = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get("search") || "";
        setSearchQuery(query);
    }, [url]);

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
        <div className="flex h-screen bg-[#F8F9FA] p-3 sm:p-4 md:p-6 gap-3 sm:gap-4 md:gap-6 font-sans overflow-hidden max-w-full w-full">
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
            <main className="flex-1 flex flex-col min-w-0 max-w-full overflow-hidden w-full">
                {/* Topbar */}
                <header className="h-16 md:h-18 px-4 md:px-8 flex items-center justify-between bg-white border border-brand-orange/30 rounded-full shrink-0 mb-4 md:mb-6 shadow-sm transition">
                    <div aria-label="Pilih opsi yang tersedia" className="flex items-center flex-1 max-w-2xl gap-3 md:gap-0">
                        <button
                            aria-label="Tampilkan rincian lebih lanjut"
                            onClick={() => setIsMobileSidebarOpen(true)}
                            className="lg:hidden text-gray-400 hover:text-brand-orange focus:outline-none transition-colors mr-2"
                        >
                            <Menu className="w-6 h-6" />
                        </button>

                        {isProductManagement && (
                            <div className="relative flex-1">
                                <Search className="w-4 h-4 md:w-5 md:h-5 absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    aria-label="Input field"
                                    type="text"
                                    placeholder="Cari produk..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={handleSearch}
                                    className="w-full pl-9 md:pl-12 pr-4 py-2 md:py-2.5 bg-gray-50/50 border border-transparent rounded-full focus:outline-none focus:bg-white focus:border-brand-orange focus:ring-1 focus:ring-brand-orange text-xs md:text-sm transition"
                                />
                            </div>
                        )}
                    </div>

                    {/* Header Right Section */}
                    <div aria-label="Pilih opsi yang tersedia" className="flex items-center gap-2.5 sm:gap-3 md:gap-5 ml-2 md:ml-4">
                        {/* Active Realtime Notification Bell for Merchant */}
                        <NotificationBell user={auth?.user} />

                        <button
                            aria-label="Tampilkan rincian lebih lanjut"
                            onClick={() =>
                                toast("Fitur Pesan segera hadir!", {
                                    icon: <Mail />,
                                })
                            }
                            className="text-gray-400 hover:text-brand-orange transition-colors hidden sm:block"
                        >
                            <Mail className="w-5 h-5" />
                        </button>

                        <Link
                            href={route("merchant.settings.index")}
                            className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-brand-orange-tint flex items-center justify-center overflow-hidden border border-brand-orange/30 shadow-sm hover:shadow-md transition cursor-pointer shrink-0"
                        >
                            {profilePhoto ? (
                                <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-4 h-4 md:w-5 md:h-5 text-brand-orange" />
                            )}
                        </Link>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto overflow-x-hidden pb-6 pr-1 md:pr-2 max-w-full w-full">
                    <Toaster position="top-right" />
                    {children}
                </div>
            </main>

            {/* Interactive Spotlight Tour Modal */}
            {!isSettingsPage && isTourActive && (
                <MerchantOnboardingTour
                    tabKey={currentTourTab}
                    merchantName={auth?.user?.name}
                    storeName={auth?.user?.store?.name}
                    onClose={() => setIsTourActive(false)}
                    markCompletedOnServer={currentTourTab === "withdrawals"}
                />
            )}
        </div>
    );
}

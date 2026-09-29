import React, { useState, useEffect } from "react";
import { PageProps } from "@/types";
import { Head, Link, usePage } from "@inertiajs/react";
import { ArrowLeft, User, MapPin, ShieldCheck, Bell, ShoppingBag } from "lucide-react";
import { Toaster } from "react-hot-toast";

import SettingsSidebar from "@/Components/Profile/SettingsSidebar";
import ProfileHeader from "@/Components/Profile/ProfileHeader";
import OrderStatusBar, { OrderCounts } from "@/Components/Profile/OrderStatusBar";
import UpdateProfileInformationForm from "./Partials/UpdateProfileInformationForm";
import AddressInformation, { Address } from "./Partials/AddressInformation";
import NotificationSettings from "./Partials/NotificationSettings";
import SecuritySettings from "./Partials/SecuritySettings";

type EditProfileProps = {
    mustVerifyEmail: boolean;
    status?: string;
    addresses: Address[];
    notificationSettings: Record<string, boolean>;
    orderCounts?: OrderCounts;
    [key: string]: unknown;
};

export default function Edit({
    mustVerifyEmail,
    status,
    addresses,
    notificationSettings,
    orderCounts,
}: PageProps<EditProfileProps>) {
    const { auth, sessions, isOAuth } = usePage().props as any;
    const user = auth.user;

    // Baca query param `tab` dari URL jika ada (misal /profile?tab=alamat)
    const getInitialTab = () => {
        if (typeof window !== "undefined") {
            const urlParams = new URLSearchParams(window.location.search);
            const tabParam = urlParams.get("tab");
            if (tabParam && ["biodata", "alamat", "keamanan", "notifikasi"].includes(tabParam)) {
                return tabParam;
            }
        }
        return "biodata";
    };

    const [activeTab, setActiveTab] = useState<string>(getInitialTab);

    // Sync tab to browser URL state seamlessly without reloading
    const handleTabChange = (tabId: string) => {
        setActiveTab(tabId);
        if (typeof window !== "undefined") {
            const url = new URL(window.location.href);
            url.searchParams.set("tab", tabId);
            window.history.replaceState({}, "", url.toString());
        }
    };

    useEffect(() => {
        const handlePopState = () => {
            setActiveTab(getInitialTab());
        };
        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, []);

    const mobileTabs = [
        { id: "biodata", name: "Biodata", icon: User },
        { id: "alamat", name: "Alamat", icon: MapPin },
        { id: "keamanan", name: "Keamanan", icon: ShieldCheck },
        { id: "notifikasi", name: "Notifikasi", icon: Bell },
    ];

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-16 font-sans text-gray-900">
            <Head title="Profil & Akun Saya - Cibenda Mart" />
            <Toaster position="top-right" />

            {/* Top Bar for Mobile & Desktop Navigation */}
            <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 md:h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/"
                            aria-label="Kembali ke Beranda"
                            className="w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-base md:text-lg font-black text-gray-900 tracking-tight">
                                Akun Saya
                            </h1>
                        </div>
                    </div>

                    <Link
                        href={route("history.index")}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-orange-50 text-[#ED7218] hover:bg-orange-100 transition"
                    >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Riwayat Pesanan</span>
                    </Link>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 md:pt-8">
                {/* Profile Header & Order Status Bar */}
                <div className="space-y-4 mb-6 md:mb-8">
                    <ProfileHeader user={user} />
                    <OrderStatusBar counts={orderCounts} />
                </div>

                {/* Mobile Tab Selector Pill Bar */}
                <div className="lg:hidden mb-6 overflow-x-auto no-scrollbar py-1">
                    <div className="flex items-center gap-2 min-w-max">
                        {mobileTabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;

                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => handleTabChange(tab.id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                        isActive
                                            ? "bg-[#ED7218] text-white shadow-xs shadow-orange-500/25"
                                            : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                                    }`}
                                >
                                    <Icon className="w-3.5 h-3.5" />
                                    <span>{tab.name}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Main Content Layout with Desktop Sidebar */}
                <div className="flex flex-col lg:flex-row gap-6 md:gap-8 items-start">
                    {/* Desktop Sidebar */}
                    <SettingsSidebar
                        activeTab={activeTab}
                        setActiveTab={handleTabChange}
                        userRole={user.role}
                        className="hidden lg:flex shrink-0 sticky top-24"
                    />

                    {/* Active Content Card */}
                    <div className="flex-1 w-full bg-white rounded-2xl md:rounded-3xl border border-slate-200/80 shadow-sm p-4 sm:p-6 md:p-8">
                        {activeTab === "biodata" && (
                            <UpdateProfileInformationForm
                                mustVerifyEmail={mustVerifyEmail}
                                status={status}
                            />
                        )}

                        {activeTab === "alamat" && (
                            <AddressInformation addresses={addresses} />
                        )}

                        {activeTab === "keamanan" && (
                            <SecuritySettings
                                sessions={sessions}
                                isOAuth={isOAuth}
                            />
                        )}

                        {activeTab === "notifikasi" && (
                            <NotificationSettings
                                settings={notificationSettings}
                            />
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

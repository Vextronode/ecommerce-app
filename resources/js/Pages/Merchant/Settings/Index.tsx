import React, { useState } from "react";
import { Head } from "@inertiajs/react";
import MerchantLayout from "@/Layouts/MerchantLayout";
import StoreInformationTab from "@/Components/Merchant/Settings/StoreInformationTab";
import NotificationTab from "@/Components/Merchant/Settings/NotificationTab";
import SecurityTab from "@/Components/Merchant/Settings/SecurityTab";

interface SettingsProps {
    merchantUser: {
        id: number;
        name: string;
        email: string;
        phone: string | null;
        role: string;
        profile_photo_path: string | null;
    };
    merchantStore: {
        id: number;
        name: string;
        username?: string | null;
        support_email: string | null;
        description: string | null;
        address: string | null;
        latitude: number | null;
        longitude: number | null;
    };
    notificationSettings?: Record<string, boolean>;
    sessions?: any[];
    isOAuth?: boolean;
}

const tabItems = [
    { id: "Information", label: "Informasi Toko" },
    { id: "Notifikasi", label: "Notifikasi" },
    { id: "Keamanan", label: "Keamanan" },
];

export default function Index({
    merchantUser,
    merchantStore,
    notificationSettings = {},
    sessions = [],
    isOAuth = false,
}: SettingsProps) {
    const [activeTab, setActiveTab] = useState("Information");

    return (
        <MerchantLayout>
            <Head title="Pengaturan Toko" />
            <div className="px-2 sm:px-4 py-4 sm:py-6 max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-xl sm:text-2xl font-extrabold text-brand-orange">
                        Pengaturan Toko
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                        Kelola rincian toko, profil merchant, integrasi, dan keamanan akun Anda.
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-start">
                    {/* Tab Navigation */}
                    <div className="w-full lg:w-52 lg:shrink-0 bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
                        <div className="flex flex-wrap lg:flex-col">
                            {tabItems.map((tab) => {
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex-1 lg:flex-none lg:w-full flex items-center justify-center lg:justify-between px-4 sm:px-5 py-3 lg:py-3.5 text-xs sm:text-sm font-semibold transition-colors border-b border-b-gray-100 border-r border-r-gray-100 lg:border-r-0 last:border-r-0 cursor-pointer ${
                                            isActive
                                                ? "bg-brand-orange-tint text-brand-orange font-bold"
                                                : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                                        }`}
                                    >
                                        <span>{tab.label}</span>
                                        {isActive && (
                                            <span className="text-lg text-brand-orange leading-none hidden lg:inline">
                                                ›
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Tab Content Panels */}
                    <div className="flex-1 w-full">
                        {activeTab === "Information" && (
                            <StoreInformationTab
                                merchantUser={merchantUser}
                                merchantStore={merchantStore}
                            />
                        )}

                        {activeTab === "Notifikasi" && (
                            <NotificationTab
                                initialSettings={notificationSettings}
                            />
                        )}

                        {activeTab === "Keamanan" && (
                            <SecurityTab
                                sessions={sessions}
                                isOAuth={isOAuth}
                            />
                        )}
                    </div>
                </div>
            </div>
        </MerchantLayout>
    );
}

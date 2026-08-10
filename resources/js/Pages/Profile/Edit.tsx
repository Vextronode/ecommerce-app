import React, { useState } from "react";
import { PageProps } from "@/types";
import { Head, Link, usePage } from "@inertiajs/react";
import { ArrowLeft } from "lucide-react";

import SettingsSidebar from "@/Components/Profile/SettingsSidebar";
import ProfileHeader from "@/Components/Profile/ProfileHeader";
import UpdateProfileInformationForm from "./Partials/UpdateProfileInformationForm";
import AddressInformation, { Address } from "./Partials/AddressInformation";
import NotificationSettings from "./Partials/NotificationSettings";
import SecuritySettings from "./Partials/SecuritySettings";

type EditProfileProps = {
    mustVerifyEmail: boolean;
    status?: string;
    addresses: Address[];
    notificationSettings: Record<string, boolean>;
};

export default function Edit({
    mustVerifyEmail,
    status,
    addresses,
    notificationSettings,
}: PageProps<EditProfileProps>) {
    const { auth, sessions, isOAuth } = usePage().props as any;
    const user = auth.user;

    // State buat ngatur tab, defaultnya nampilin 'biodata'
    const [activeTab, setActiveTab] = useState<string>("biodata");

    return (
        <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 md:px-8 font-sans">
            <Head title="Account Settings" />

            <div className="max-w-6xl mx-auto">
                <div className="mb-10">
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white border border-slate-200 shadow-sm hover:bg-slate-50 transition mb-6"
                    >
                        <ArrowLeft className="w-6 h-6 text-gray-700" />
                    </Link>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-950 tracking-tight">
                        Account Settings
                    </h1>
                    <p className="text-slate-500 mt-1.5 text-base">
                        Manage your personal information and security
                        preferences.
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    <SettingsSidebar
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                    />

                    <div className="flex-1 space-y-8">
                        <ProfileHeader user={user} />

                        {activeTab === "biodata" && (
                            <div className="bg-white rounded-3xl shadow-sm p-6 md:p-8 border border-slate-100">
                                <UpdateProfileInformationForm
                                    mustVerifyEmail={mustVerifyEmail}
                                    status={status}
                                />
                            </div>
                        )}

                        {activeTab === "alamat" && (
                            <AddressInformation addresses={addresses} />
                        )}

                        {activeTab === "notifikasi" && (
                            <NotificationSettings
                                settings={notificationSettings}
                            />
                        )}

                        {activeTab === "keamanan" && (
                            <SecuritySettings 
                                sessions={sessions}
                                isOAuth={isOAuth}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

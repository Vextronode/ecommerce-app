import React from 'react';
import { Head } from '@inertiajs/react';
import MerchantLayout from '@/Layouts/MerchantLayout';
import { Save, UserCircle, Store, MapPin } from 'lucide-react';
import InputError from '@/Components/InputError';
import { useMerchantSettings } from '@/Hooks/Merchant/useMerchantSettings';
import AddressMapSection from '@/Pages/Profile/Partials/AddressMapSection';
import { useAddressMap } from '@/Hooks/useAddressMap';

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
}

const tabItems = ['Information', 'Payment', 'Notifikasi', 'Keamanan'];
const inputClass = "w-full px-3 py-2 rounded-md border border-gray-200 text-sm text-gray-800 focus:outline-none focus:border-[#41B9C5] focus:ring-1 focus:ring-[#41B9C5]/30 transition";

export default function Index({ merchantUser, merchantStore }: SettingsProps) {
    const {
        activeTab,
        setActiveTab,
        photoInput,
        photoPreview,
        data,
        setData,
        processing,
        errors,
        isDirty,
        handlePhotoChange,
        handleSubmit,
    } = useMerchantSettings({ merchantUser, merchantStore });

    const { mapContainerRef, isLocating, handleGetLocation } = useAddressMap(
        true, // isOpen is always true here
        async (lat, lng) => {
            setData((prevData: any) => ({
                ...prevData,
                latitude: lat,
                longitude: lng
            }));

            // Auto fill address
            try {
                const baseUrl = import.meta.env.VITE_NOMINATIM_URL || "https://nominatim.openstreetmap.org";
                const response = await fetch(
                    `${baseUrl}/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
                );
                if (!response.ok) throw new Error("Failed");
                const result = await response.json();
                if (result.display_name) {
                    setData('store_address', result.display_name);
                }
            } catch (error) {
                console.error("Reverse geocoding error:", error);
            }
        },
        merchantStore.latitude,
        merchantStore.longitude
    );



    return (
        <MerchantLayout>
            <Head title="Settings" />
            <form onSubmit={handleSubmit}>
                <div className="px-3 sm:px-4 py-4 sm:py-6 max-w-5xl mx-auto">

                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-0 justify-between mb-6 sm:mb-7">
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Settings</h1>
                            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Manage your store details, integrations, and security preferences.</p>
                        </div>
                        <button
                            type="submit"
                            disabled={processing || !isDirty}
                            className="flex items-center gap-2 px-4 py-2.5 bg-[#1a4a44] hover:bg-[#133b36] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors shadow-sm self-start sm:self-auto whitespace-nowrap"
                        >
                            <Save className="w-4 h-4" />
                            Save All Changes
                        </button>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-4 lg:gap-5 items-start">

                        {/* Tab Nav */}
                        <div className="w-full lg:w-48 lg:shrink-0 bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                            <div className="flex flex-wrap lg:flex-col">
                                {tabItems.map((tab) => {
                                    const isActive = activeTab === tab;
                                    return (
                                        <button
                                            key={tab}
                                            type="button"
                                            onClick={() => setActiveTab(tab)}
                                            className={`flex-1 lg:flex-none lg:w-full flex items-center justify-center lg:justify-between px-4 sm:px-5 py-3 lg:py-3.5 text-sm font-medium transition-colors border-b border-b-gray-100 border-r border-r-gray-100 lg:border-r-0 last:border-r-0 ${isActive
                                                ? 'bg-[#d5eeec] text-[#1a4a44]'
                                                : 'text-gray-500 hover:bg-gray-50'
                                                }`}
                                        >
                                            {tab}
                                            {isActive && <span className="text-lg text-[#1a4a44] leading-none hidden lg:inline">›</span>}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Right Section */}
                        <div className="flex-1 w-full space-y-4 sm:space-y-5">
                            {activeTab === 'Information' && (
                                <>
                                    {/* Profile Card */}
                                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                                        <div role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.click(); }}
                                            className="flex flex-col items-center justify-center py-7 sm:py-8 px-6 cursor-pointer group relative"
                                            style={{ background: 'linear-gradient(135deg, #41B9C5 0%, #34a0aa 100%)' }}
                                            onClick={() => photoInput.current?.click()}
                                        >
                                            <div className="relative mb-3">
                                                <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-white/30 overflow-hidden flex items-center justify-center border-2 border-white/50">
                                                    {photoPreview ? (
                                                        <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <UserCircle className="w-14 h-14 sm:w-16 sm:h-16 text-white/80" strokeWidth={1} />
                                                    )}
                                                </div>
                                                <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <span className="text-white text-xs">Edit</span>
                                                </div>
                                            </div>
                                            <p className="text-white font-bold text-base sm:text-lg">{data.name}</p>
                                            <p className="text-white/80 text-xs sm:text-sm">{data.email}</p>
                                            <input
                                                type="file"
                                                className="hidden"
                                                ref={photoInput}
                                                onChange={handlePhotoChange}
                                                accept="image/*"
                                            />
                                        </div>

                                        {/* Form Fields */}
                                        <div className="px-4 sm:px-8 py-5 sm:py-7">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 sm:gap-y-5">
                                                <div aria-label="Action">
                                                    <label htmlFor="field_162" className="block text-sm text-gray-600 mb-1.5">Full Name</label>
                                                    <input id="field_162"
                                                        type="text"
                                                        value={data.name}
                                                        onChange={(e) => setData('name', e.target.value)}
                                                        className={inputClass}
                                                    />
                                                    <InputError message={errors.name} className="mt-1" />
                                                </div>
                                                <div aria-label="Action">
                                                    <label htmlFor="field_172" className="block text-sm text-gray-600 mb-1.5">Email Address</label>
                                                    <input id="field_172"
                                                        type="email"
                                                        value={data.email}
                                                        onChange={(e) => setData('email', e.target.value)}
                                                        className={inputClass}
                                                    />
                                                    <InputError message={errors.email} className="mt-1" />
                                                </div>
                                                <div>
                                                    <label htmlFor="field_182" className="block text-sm text-gray-600 mb-1.5">Phone Number</label>
                                                    <input aria-label="Input field" id="field_182"
                                                        type="text"
                                                        value={data.phone}
                                                        onChange={(e) => setData('phone', e.target.value)}
                                                        placeholder="+62812345679"
                                                        className={inputClass}
                                                    />
                                                    <InputError message={errors.phone} className="mt-1" />
                                                </div>
                                                <div aria-label="Action">
                                                    <label htmlFor="field_193" className="block text-sm text-gray-600 mb-1.5">Role</label>
                                                    <input id="field_193"
                                                        type="text"
                                                        value={merchantUser.role}
                                                        readOnly
                                                        className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm text-gray-400 bg-gray-50 cursor-not-allowed"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Store Information Card */}
                                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-7">
                                        <div className="flex items-center gap-2.5 mb-5 sm:mb-6">
                                            <Store className="w-5 h-5 text-[#41B9C5]" strokeWidth={1.5} />
                                            <h3 className="text-base font-semibold text-gray-900">Store Information</h3>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 sm:gap-y-5 mb-4 sm:mb-5">
                                            <div aria-label="Action">
                                                <label htmlFor="field_214" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Store Name</label>
                                                <input id="field_214"
                                                    type="text"
                                                    value={data.store_name}
                                                    onChange={(e) => setData('store_name', e.target.value)}
                                                    className={inputClass}
                                                />
                                                <InputError message={errors.store_name} className="mt-1" />
                                            </div>
                                            <div>
                                                <label htmlFor="field_224" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Store Username / URL Slug</label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">@</span>
                                                    <input aria-label="Input field" id="field_224"
                                                        type="text"
                                                        value={data.username}
                                                        onChange={(e) => setData('username', e.target.value.toLowerCase().replace(/[^a-z0-9_\-\.]/g, ''))}
                                                        placeholder="tokoudin"
                                                        className={`${inputClass} pl-7`}
                                                    />
                                                </div>
                                                <InputError message={errors.username} className="mt-1" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 sm:gap-y-5 mb-4 sm:mb-5">
                                            <div>
                                                <label htmlFor="field_241" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Support Email</label>
                                                <input aria-label="Input field" id="field_241"
                                                    type="email"
                                                    value={data.support_email}
                                                    onChange={(e) => setData('support_email', e.target.value)}
                                                    placeholder="support@yourstore.com"
                                                    className={inputClass}
                                                />
                                                <InputError message={errors.support_email} className="mt-1" />
                                            </div>
                                            <div>
                                                <label htmlFor="field_252" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Address</label>
                                                <div className="relative">
                                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                    <input aria-label="Input field" id="field_252"
                                                        type="text"
                                                        value={data.store_address}
                                                        onChange={(e) => setData('store_address', e.target.value)}
                                                        placeholder="Store physical address"
                                                        className="w-full pl-9 pr-3 py-2 rounded-md border border-gray-200 text-sm text-gray-800 focus:outline-none focus:border-[#41B9C5] focus:ring-1 focus:ring-[#41B9C5]/30 transition"
                                                    />
                                                </div>
                                                <InputError message={errors.store_address} className="mt-1" />
                                            </div>
                                        </div>

                                        <div className="mb-5">
                                            <label htmlFor="field_268" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Pin Lokasi Peta (Koordinat)</label>
                                            <AddressMapSection
                                                mapContainerRef={mapContainerRef}
                                                isLocating={isLocating}
                                                onGetLocation={handleGetLocation}
                                            />
                                        </div>

                                        <div aria-label="Action" className="mb-2">
                                            <label htmlFor="field_277" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Store Description</label>
                                            <textarea id="field_277"
                                                value={data.store_description}
                                                onChange={(e) => setData('store_description', e.target.value)}
                                                rows={3}
                                                className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm text-gray-800 focus:outline-none focus:border-[#41B9C5] focus:ring-1 focus:ring-[#41B9C5]/30 transition resize-none"
                                            />
                                            <InputError message={errors.store_description} className="mt-1" />
                                        </div>
                                    </div>
                                </>
                            )}

                            {activeTab !== 'Information' && (
                                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 sm:p-16 text-center">
                                    <Store className="w-10 h-10 text-gray-200 mx-auto mb-4" />
                                    <h3 className="text-base font-semibold text-gray-700 mb-1">Segera Hadir</h3>
                                    <p className="text-sm text-gray-400">Pengaturan {activeTab} sedang dalam pengembangan.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </form>
        </MerchantLayout>
    );
}

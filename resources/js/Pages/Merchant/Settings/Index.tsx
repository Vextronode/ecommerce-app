import React, { useRef, useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import MerchantLayout from '@/Layouts/MerchantLayout';
import { Save, UserCircle, Store, MapPin } from 'lucide-react';
import InputError from '@/Components/InputError';

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
        support_email: string | null;
        description: string | null;
        address: string | null;
    };
}

export default function Index({ merchantUser, merchantStore }: SettingsProps) {
    const [activeTab, setActiveTab] = useState('Information');
    const photoInput = useRef<HTMLInputElement>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(merchantUser.profile_photo_path);

    const { data, setData, post, processing, errors, isDirty } = useForm({
        name: merchantUser.name || '',
        email: merchantUser.email || '',
        phone: merchantUser.phone || '',
        photo: null as File | null,
        store_name: merchantStore.name || '',
        support_email: merchantStore.support_email || '',
        store_description: merchantStore.description || '',
        store_address: merchantStore.address || '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('merchant.settings.update'), { preserveScroll: true });
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('photo', file);
            const reader = new FileReader();
            reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
            reader.readAsDataURL(file);
        }
    };

    const tabItems = ['Information', 'Payment', 'Notifikasi', 'Keamanan'];

    return (
        <MerchantLayout>
            <Head title="Settings" />
            <form onSubmit={submit}>
                <div className="px-4 py-6 max-w-5xl mx-auto">

                    {/* Header */}
                    <div className="flex items-start justify-between mb-7">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                            <p className="text-sm text-gray-500 mt-0.5">Manage your store details, integrations, and security preferences.</p>
                        </div>
                        <button
                            type="submit"
                            disabled={processing || !isDirty}
                            className="flex items-center gap-2 px-4 py-2.5 bg-[#1a4a44] hover:bg-[#133b36] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
                        >
                            <Save className="w-4 h-4" />
                            Save All Changes
                        </button>
                    </div>

                    <div className="flex gap-5 items-start">

                        {/* Sidebar */}
                        <div className="w-48 shrink-0 bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                            {tabItems.map((tab) => {
                                const isActive = activeTab === tab;
                                return (
                                    <button
                                        key={tab}
                                        type="button"
                                        onClick={() => setActiveTab(tab)}
                                        className={`w-full flex items-center justify-between px-5 py-4 text-sm font-medium transition-colors border-b border-gray-100 last:border-0 ${isActive
                                            ? 'bg-[#d5eeec] text-[#1a4a44]'
                                            : 'text-gray-500 hover:bg-gray-50'
                                            }`}
                                    >
                                        {tab}
                                        {isActive && <span className="text-lg text-[#1a4a44] leading-none">›</span>}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Right Section */}
                        <div className="flex-1 space-y-5">
                            {activeTab === 'Information' && (
                                <>
                                    {/* Profile Card */}
                                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                                        <div
                                            className="flex flex-col items-center justify-center py-8 px-6 cursor-pointer group relative"
                                            style={{ background: 'linear-gradient(135deg, #41B9C5 0%, #34a0aa 100%)' }}
                                            onClick={() => photoInput.current?.click()}
                                        >
                                            <div className="relative mb-3">
                                                <div className="w-20 h-20 rounded-full bg-white/30 overflow-hidden flex items-center justify-center border-2 border-white/50">
                                                    {photoPreview ? (
                                                        <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <UserCircle className="w-16 h-16 text-white/80" strokeWidth={1} />
                                                    )}
                                                </div>
                                                <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <span className="text-white text-xs">Edit</span>
                                                </div>
                                            </div>
                                            <p className="text-white font-bold text-lg">{data.name}</p>
                                            <p className="text-white/80 text-sm">{data.email}</p>
                                            <input
                                                type="file"
                                                className="hidden"
                                                ref={photoInput}
                                                onChange={handlePhotoChange}
                                                accept="image/*"
                                            />
                                        </div>

                                        {/* Form Fields */}
                                        <div className="px-8 py-7">
                                            <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                                                <div>
                                                    <label className="block text-sm text-gray-600 mb-1.5">Full Name</label>
                                                    <input
                                                        type="text"
                                                        value={data.name}
                                                        onChange={(e) => setData('name', e.target.value)}
                                                        className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm text-gray-800 focus:outline-none focus:border-[#41B9C5] focus:ring-1 focus:ring-[#41B9C5]/30 transition-all"
                                                    />
                                                    <InputError message={errors.name} className="mt-1" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm text-gray-600 mb-1.5">Email Address</label>
                                                    <input
                                                        type="email"
                                                        value={data.email}
                                                        onChange={(e) => setData('email', e.target.value)}
                                                        className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm text-gray-800 focus:outline-none focus:border-[#41B9C5] focus:ring-1 focus:ring-[#41B9C5]/30 transition-all"
                                                    />
                                                    <InputError message={errors.email} className="mt-1" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm text-gray-600 mb-1.5">Phone Number</label>
                                                    <input
                                                        type="text"
                                                        value={data.phone}
                                                        onChange={(e) => setData('phone', e.target.value)}
                                                        placeholder="+62812345679"
                                                        className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm text-gray-800 focus:outline-none focus:border-[#41B9C5] focus:ring-1 focus:ring-[#41B9C5]/30 transition-all"
                                                    />
                                                    <InputError message={errors.phone} className="mt-1" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm text-gray-600 mb-1.5">Role</label>
                                                    <input
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
                                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-7">
                                        <div className="flex items-center gap-2.5 mb-6">
                                            <Store className="w-5 h-5 text-[#41B9C5]" strokeWidth={1.5} />
                                            <h3 className="text-base font-semibold text-gray-900">Store Information</h3>
                                        </div>

                                        <div className="grid grid-cols-2 gap-x-6 gap-y-5 mb-5">
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Store Name</label>
                                                <input
                                                    type="text"
                                                    value={data.store_name}
                                                    onChange={(e) => setData('store_name', e.target.value)}
                                                    className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm text-gray-800 focus:outline-none focus:border-[#41B9C5] focus:ring-1 focus:ring-[#41B9C5]/30 transition-all"
                                                />
                                                <InputError message={errors.store_name} className="mt-1" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Support Email</label>
                                                <input
                                                    type="email"
                                                    value={data.support_email}
                                                    onChange={(e) => setData('support_email', e.target.value)}
                                                    placeholder="support@yourstore.com"
                                                    className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm text-gray-800 focus:outline-none focus:border-[#41B9C5] focus:ring-1 focus:ring-[#41B9C5]/30 transition-all"
                                                />
                                                <InputError message={errors.support_email} className="mt-1" />
                                            </div>
                                        </div>

                                        <div className="mb-5">
                                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Store Description</label>
                                            <textarea
                                                value={data.store_description}
                                                onChange={(e) => setData('store_description', e.target.value)}
                                                rows={3}
                                                className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm text-gray-800 focus:outline-none focus:border-[#41B9C5] focus:ring-1 focus:ring-[#41B9C5]/30 transition-all resize-none"
                                            />
                                            <InputError message={errors.store_description} className="mt-1" />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Address</label>
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    type="text"
                                                    value={data.store_address}
                                                    onChange={(e) => setData('store_address', e.target.value)}
                                                    placeholder="Store physical address"
                                                    className="w-full pl-9 pr-3 py-2 rounded-md border border-gray-200 text-sm text-gray-800 focus:outline-none focus:border-[#41B9C5] focus:ring-1 focus:ring-[#41B9C5]/30 transition-all"
                                                />
                                            </div>
                                            <InputError message={errors.store_address} className="mt-1" />
                                        </div>
                                    </div>
                                </>
                            )}

                            {activeTab !== 'Information' && (
                                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-16 text-center">
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

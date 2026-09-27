import React from "react";
import { UserCircle, Store, MapPin, Save } from "lucide-react";
import InputError from "@/Components/InputError";
import AddressMapSection from "@/Pages/Profile/Partials/AddressMapSection";
import { useMerchantSettings } from "@/Hooks/Merchant/useMerchantSettings";
import { useAddressMap } from "@/Hooks/useAddressMap";

interface StoreInformationTabProps {
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

const inputClass =
    "w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 transition bg-white";

export default function StoreInformationTab({
    merchantUser,
    merchantStore,
}: StoreInformationTabProps) {
    const {
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
        true,
        async (lat, lng) => {
            setData((prevData: any) => ({
                ...prevData,
                latitude: lat,
                longitude: lng,
            }));

            try {
                const baseUrl =
                    import.meta.env.VITE_NOMINATIM_URL ||
                    "https://nominatim.openstreetmap.org";
                const response = await fetch(
                    `${baseUrl}/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
                );
                if (!response.ok) throw new Error("Failed");
                const result = await response.json();
                if (result.display_name) {
                    setData("store_address", result.display_name);
                }
            } catch (error) {
                console.error("Reverse geocoding error:", error);
            }
        },
        merchantStore.latitude,
        merchantStore.longitude
    );

    return (
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Profile Banner & Info */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
                <div
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") e.currentTarget.click();
                    }}
                    className="flex flex-col items-center justify-center py-7 sm:py-8 px-6 cursor-pointer group relative bg-gradient-to-r from-brand-orange to-brand-orange-hover"
                    onClick={() => photoInput.current?.click()}
                >
                    <div className="relative mb-3">
                        <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-white/20 overflow-hidden flex items-center justify-center border-2 border-white/50 backdrop-blur-xs shadow-sm">
                            {photoPreview ? (
                                <img
                                    src={photoPreview}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <UserCircle
                                    className="w-14 h-14 sm:w-16 sm:h-16 text-white/90"
                                    strokeWidth={1}
                                />
                            )}
                        </div>
                        <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-white text-xs font-bold">
                                Ubah
                            </span>
                        </div>
                    </div>
                    <p className="text-white font-extrabold text-base sm:text-lg">
                        {data.name}
                    </p>
                    <p className="text-white/80 text-xs sm:text-sm mt-0.5">
                        {data.email}
                    </p>
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
                        <div>
                            <label
                                htmlFor="user_name"
                                className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5"
                            >
                                Nama Lengkap
                            </label>
                            <input
                                id="user_name"
                                type="text"
                                value={data.name}
                                onChange={(e) => setData("name", e.target.value)}
                                className={inputClass}
                            />
                            <InputError message={errors.name} className="mt-1" />
                        </div>
                        <div>
                            <label
                                htmlFor="user_email"
                                className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5"
                            >
                                Alamat Email
                            </label>
                            <input
                                id="user_email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData("email", e.target.value)}
                                className={inputClass}
                            />
                            <InputError message={errors.email} className="mt-1" />
                        </div>
                        <div>
                            <label
                                htmlFor="user_phone"
                                className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5"
                            >
                                Nomor Telepon
                            </label>
                            <input
                                id="user_phone"
                                type="text"
                                value={data.phone}
                                onChange={(e) => setData("phone", e.target.value)}
                                placeholder="+62812345679"
                                className={inputClass}
                            />
                            <InputError message={errors.phone} className="mt-1" />
                        </div>
                        <div>
                            <label
                                htmlFor="user_role"
                                className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5"
                            >
                                Peran Akun
                            </label>
                            <input
                                id="user_role"
                                type="text"
                                value={merchantUser.role}
                                readOnly
                                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-400 bg-gray-50 cursor-not-allowed"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Store Information Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-4 sm:p-7">
                <div className="flex items-center gap-2.5 mb-5 sm:mb-6">
                    <div className="w-8 h-8 rounded-lg bg-brand-orange-tint text-brand-orange flex items-center justify-center">
                        <Store className="w-4 h-4 text-brand-orange" strokeWidth={2} />
                    </div>
                    <h3 className="text-base font-bold text-gray-900">
                        Informasi Toko
                    </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 sm:gap-y-5 mb-4 sm:mb-5">
                    <div>
                        <label
                            htmlFor="store_name"
                            className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5"
                        >
                            Nama Toko
                        </label>
                        <input
                            id="store_name"
                            type="text"
                            value={data.store_name}
                            onChange={(e) => setData("store_name", e.target.value)}
                            className={inputClass}
                        />
                        <InputError message={errors.store_name} className="mt-1" />
                    </div>
                    <div>
                        <label
                            htmlFor="store_slug"
                            className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5"
                        >
                            Username Toko / URL Slug
                        </label>
                        <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                                @
                            </span>
                            <input
                                id="store_slug"
                                type="text"
                                value={data.username}
                                onChange={(e) =>
                                    setData(
                                        "username",
                                        e.target.value
                                            .toLowerCase()
                                            .replace(/[^a-z0-9_\-\.]/g, "")
                                    )
                                }
                                placeholder="tokosaya"
                                className={`${inputClass} pl-8`}
                            />
                        </div>
                        <InputError message={errors.username} className="mt-1" />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 sm:gap-y-5 mb-4 sm:mb-5">
                    <div>
                        <label
                            htmlFor="store_email"
                            className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5"
                        >
                            Email Layanan Pelanggan
                        </label>
                        <input
                            id="store_email"
                            type="email"
                            value={data.support_email}
                            onChange={(e) =>
                                setData("support_email", e.target.value)
                            }
                            placeholder="support@tokoanda.com"
                            className={inputClass}
                        />
                        <InputError message={errors.support_email} className="mt-1" />
                    </div>
                    <div>
                        <label
                            htmlFor="store_address"
                            className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5"
                        >
                            Alamat Fisik Toko
                        </label>
                        <div className="relative">
                            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-orange" />
                            <input
                                id="store_address"
                                type="text"
                                value={data.store_address}
                                onChange={(e) =>
                                    setData("store_address", e.target.value)
                                }
                                placeholder="Alamat lengkap toko Anda"
                                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 transition bg-white"
                            />
                        </div>
                        <InputError message={errors.store_address} className="mt-1" />
                    </div>
                </div>

                <div className="mb-5">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                        Pin Lokasi Peta (Koordinat)
                    </label>
                    <AddressMapSection
                        mapContainerRef={mapContainerRef}
                        isLocating={isLocating}
                        onGetLocation={handleGetLocation}
                    />
                </div>

                <div className="mb-5">
                    <label
                        htmlFor="store_desc"
                        className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5"
                    >
                        Deskripsi Toko
                    </label>
                    <textarea
                        id="store_desc"
                        value={data.store_description}
                        onChange={(e) =>
                            setData("store_description", e.target.value)
                        }
                        rows={3}
                        placeholder="Ceritakan tentang toko dan produk yang Anda jual..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 transition bg-white resize-none"
                    />
                    <InputError message={errors.store_description} className="mt-1" />
                </div>

                {/* Submit Button Inside Card for easy mobile access */}
                <div className="pt-4 border-t border-gray-100 flex justify-end">
                    <button
                        type="submit"
                        disabled={processing || !isDirty}
                        className="flex items-center gap-2 px-6 py-2.5 bg-brand-orange hover:bg-brand-orange-hover disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md shadow-brand-orange/20 cursor-pointer active:scale-95"
                    >
                        <Save className="w-4 h-4" />
                        <span>Simpan Perubahan</span>
                    </button>
                </div>
            </div>
        </form>
    );
}

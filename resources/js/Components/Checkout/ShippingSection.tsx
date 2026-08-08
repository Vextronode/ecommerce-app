import React from "react";
import { MapPin, Plus } from "lucide-react";
import { CheckoutAddress } from "./AddressPickerModal";

interface Props {
    data: any;
    setData: (field: "name" | "phone" | "address", value: string) => void;
    errors: any;
    selectedAddress?: CheckoutAddress;
    onOpenAddressPicker: () => void;
}

export default function ShippingSection({
    data,
    setData,
    errors,
    selectedAddress,
    onOpenAddressPicker,
}: Props) {
    return (
        <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <MapPin className="w-6 h-6 text-[#245D56]" />
                    <h2 className="text-xl font-bold text-gray-900">
                        Shipping Details
                    </h2>
                </div>
                <button
                    type="button"
                    onClick={onOpenAddressPicker}
                    className="inline-flex w-fit items-center gap-2 rounded-xl border border-[#245D56] px-4 py-2 text-sm font-bold text-[#245D56] transition hover:bg-[#245D56]/5"
                >
                    <Plus className="h-4 w-4" />
                    Gunakan alamat lain
                </button>
            </div>
            {selectedAddress && (
                <div className="mb-5 rounded-2xl border border-[#245D56]/20 bg-[#245D56]/5 p-4">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#245D56]">
                            {selectedAddress.label}
                        </span>
                        {Boolean(selectedAddress.is_primary) && (
                            <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-500">
                                Utama
                            </span>
                        )}
                    </div>
                    <p className="text-sm font-bold text-slate-900">
                        {selectedAddress.recipient_name}
                    </p>
                    <p className="mt-1 text-xs font-medium text-slate-500">
                        {selectedAddress.phone}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                        {selectedAddress.full_address}
                    </p>
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                    <label className="text-xs font-bold text-slate-500 mb-2 block">
                        Full Name
                    </label>
                    <input
                        type="text"
                        value={data.name}
                        onChange={(e) => setData("name", e.target.value)}
                        className={`w-full px-4 py-3 rounded-xl border-slate-200 focus:ring-[#40E0D0] focus:border-[#40E0D0] text-sm font-medium ${errors.name ? "border-red-500" : ""}`}
                    />
                    {errors.name && (
                        <span className="text-red-500 text-xs mt-1">
                            {errors.name}
                        </span>
                    )}
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-500 mb-2 block">
                        Phone Number
                    </label>
                    <input
                        type="text"
                        value={data.phone}
                        onChange={(e) => setData("phone", e.target.value)}
                        className={`w-full px-4 py-3 rounded-xl border-slate-200 focus:ring-[#40E0D0] focus:border-[#40E0D0] text-sm font-medium ${errors.phone ? "border-red-500" : ""}`}
                    />
                    {errors.phone && (
                        <span className="text-red-500 text-xs mt-1">
                            {errors.phone}
                        </span>
                    )}
                </div>
                <div className="md:col-span-2">
                    <label className="text-xs font-bold text-slate-500 mb-2 block">
                        Full Address
                    </label>
                    <textarea
                        rows={3}
                        value={data.address}
                        onChange={(e) => setData("address", e.target.value)}
                        placeholder="Street name, building, house number..."
                        className={`w-full px-4 py-3 rounded-xl border-slate-200 focus:ring-[#40E0D0] focus:border-[#40E0D0] text-sm font-medium resize-none ${errors.address ? "border-red-500" : ""}`}
                    ></textarea>
                    {errors.address && (
                        <span className="text-red-500 text-xs mt-1">
                            {errors.address}
                        </span>
                    )}
                </div>
            </div>
        </section>
    );
}

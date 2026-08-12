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
                    <MapPin className="w-6 h-6 text-[#ED7218]" />
                    <h2 className="text-xl font-bold text-gray-900">
                        Rincian Pengiriman
                    </h2>
                </div>
                <button
                    type="button"
                    onClick={onOpenAddressPicker}
                    className="inline-flex w-fit items-center gap-2 rounded-xl border border-[#ED7218] px-4 py-2 text-sm font-bold text-[#ED7218] transition hover:bg-[#ED7218]/5"
                >
                    <Plus className="h-4 w-4" />
                    Gunakan alamat lain
                </button>
            </div>
            {selectedAddress && (
                <div className="mb-5 rounded-2xl border border-[#ED7218]/20 bg-[#ED7218]/5 p-4">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#ED7218]">
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
                    <label htmlFor="field_63" className="text-xs font-bold text-slate-500 mb-2 block">
                        Nama Lengkap
                    </label>
                    <input id="field_63"
                        type="text"
                        value={data.name}
                        onChange={(e) => setData("name", e.target.value)}
                        className={`w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#006591] focus:border-[#006591] text-sm font-medium outline-none transition ${errors.name ? "border-red-500" : ""}`}
                    />
                    {errors.name && (
                        <span className="text-red-500 text-xs mt-1">
                            {errors.name}
                        </span>
                    )}
                </div>
                <div>
                    <label htmlFor="field_79" className="text-xs font-bold text-slate-500 mb-2 block">
                        Nomor Telepon
                    </label>
                    <input id="field_79"
                        type="text"
                        value={data.phone}
                        onChange={(e) => setData("phone", e.target.value)}
                        className={`w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#006591] focus:border-[#006591] text-sm font-medium outline-none transition ${errors.phone ? "border-red-500" : ""}`}
                    />
                    {errors.phone && (
                        <span className="text-red-500 text-xs mt-1">
                            {errors.phone}
                        </span>
                    )}
                </div>
                <div className="md:col-span-2">
                    <label htmlFor="field_95" className="text-xs font-bold text-slate-500 mb-2 block">
                        Alamat Lengkap
                    </label>
                    <textarea aria-label="Input field" id="field_95"
                        rows={3}
                        value={data.address}
                        onChange={(e) => setData("address", e.target.value)}
                        placeholder="Nama jalan, gedung, nomor rumah..."
                        className={`w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#006591] focus:border-[#006591] text-sm font-medium resize-none outline-none transition ${errors.address ? "border-red-500" : ""}`}
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

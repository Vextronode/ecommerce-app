import React from "react";
import { MapPin, Plus } from "lucide-react";
import { CheckoutAddress } from "./AddressPickerModal";

interface Props {
    data: any;
    errors: any;
    selectedAddress?: CheckoutAddress;
    onOpenAddressPicker: () => void;
}

export default function ShippingSection({
    data,
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
            {selectedAddress ? (
                <div className="rounded-2xl border border-[#ED7218]/20 bg-[#ED7218]/5 p-4">
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
            ) : (
                <div className="rounded-2xl border border-dashed border-red-300 bg-red-50 p-6 text-center">
                    <p className="text-sm font-bold text-red-600 mb-2">Belum ada alamat pengiriman terpilih</p>
                    <p className="text-xs text-red-500 mb-4">Anda wajib menambahkan atau memilih alamat pengiriman dari Buku Alamat agar sistem dapat menghitung ongkos kirim dan fitur Live Tracking berfungsi.</p>
                    <button
                        type="button"
                        onClick={onOpenAddressPicker}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#ED7218] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#ED7218]/30 transition hover:bg-[#d66311]"
                    >
                        <Plus className="h-4 w-4" />
                        Pilih / Tambah Alamat
                    </button>
                </div>
            )}
            
            {errors.address_id && (
                <p className="mt-3 text-sm text-red-500 font-medium text-center">
                    Silakan pilih alamat pengiriman terlebih dahulu.
                </p>
            )}
        </section>
    );
}

import React, { useState } from "react";
import { MapPin, Plus, X } from "lucide-react";
import AddressModal from "@/Pages/Profile/Partials/AddressModal";

export interface CheckoutAddress {
    id: number;
    label: string;
    is_primary: boolean | number;
    recipient_name: string;
    phone: string;
    full_address: string;
}

interface Props {
    isOpen: boolean;
    addresses: CheckoutAddress[];
    selectedAddressId: number | null;
    onClose: () => void;
    onSelect: (address: CheckoutAddress) => void;
}

export default function AddressPickerModal({
    isOpen,
    addresses,
    selectedAddressId,
    onClose,
    onSelect,
}: Props) {
    const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 z-900 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
                <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-xl md:p-8">
                    <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">
                                Pilih Alamat
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Gunakan alamat yang sudah tersimpan atau tambahkan alamat baru.
                            </p>
                        </div>
                        <button aria-label="Action"
                            type="button"
                            onClick={onClose}
                            className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="space-y-3">
                        {addresses.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center">
                                <MapPin className="mx-auto mb-3 h-8 w-8 text-slate-300" />
                                <p className="text-sm font-semibold text-slate-600">
                                    Belum ada alamat tersimpan.
                                </p>
                            </div>
                        ) : (
                            addresses.map((address) => (
                                <button
                                    type="button"
                                    key={address.id}
                                    onClick={() => {
                                        onSelect(address);
                                        onClose();
                                    }}
                                    className={`w-full rounded-2xl border p-4 text-left transition ${
                                        selectedAddressId === address.id
                                            ? "border-brand-blue bg-brand-blue-tint/30"
                                            : "border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                                    }`}
                                >
                                    <div className="mb-2 flex flex-wrap items-center gap-2">
                                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                                            {address.label}
                                        </span>
                                        {Boolean(address.is_primary) && (
                                            <span className="rounded-full bg-brand-blue-tint px-3 py-1 text-xs font-bold text-brand-blue">
                                                Utama
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm font-bold text-slate-900">
                                        {address.recipient_name}
                                    </p>
                                    <p className="mt-1 text-xs font-medium text-slate-500">
                                        {address.phone}
                                    </p>
                                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                                        {address.full_address}
                                    </p>
                                </button>
                            ))
                        )}
                    </div>

                    <div className="mt-6 flex justify-end">
                        <button
                            type="button"
                            onClick={() => setIsAddressFormOpen(true)}
                            className="inline-flex items-center gap-2 rounded-xl bg-brand-orange px-5 py-3 text-sm font-bold text-white shadow-lg shadow-brand-orange/20 transition hover:bg-brand-orange-hover cursor-pointer"
                        >
                            <Plus className="h-4 w-4" />
                            Tambah Alamat Baru
                        </button>
                    </div>
                </div>
            </div>

            <AddressModal
                isOpen={isAddressFormOpen}
                onClose={() => setIsAddressFormOpen(false)}
            />
        </>
    );
}

import React, { useState } from "react";
import { router } from "@inertiajs/react";
import { Plus } from "lucide-react";
import AddressModal from "./AddressModal";

export interface Address {
    id: number;
    label: string;
    is_primary: boolean;
    recipient_name: string;
    phone: string;
    full_address: string;
}

export default function AddressInformation({
    addresses,
}: {
    addresses: Address[];
}) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [editingAddress, setEditingAddress] = useState<Address | null>(null);

    const handleDelete = (id: number) => {
        if (confirm("Yakin mau hapus alamat ini bang?")) {
            router.delete(route("profile.address.destroy", id), {
                preserveScroll: true,
            });
        }
    };

    const handleEdit = (address: Address) => {
        setEditingAddress(address);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setTimeout(() => setEditingAddress(null), 300);
    };

    return (
        <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 w-full relative">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-gray-900">Alamat Saya</h2>

                <button
                    onClick={() => {
                        setEditingAddress(null);
                        setIsModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#245D56] text-white font-medium text-sm hover:bg-[#1a443f] transition shadow-md shadow-[#245D56]/20"
                >
                    <Plus className="w-4 h-4" />
                    Tambahkan Alamat
                </button>
            </div>

            <div className="space-y-4">
                {addresses.length === 0 ? (
                    <p className="text-slate-500 text-sm py-4">
                        Belum ada alamat yang ditambahkan.
                    </p>
                ) : (
                    addresses.map((address) => (
                        <div
                            key={address.id}
                            className="p-5 rounded-xl bg-slate-50/50 border border-slate-100 flex justify-between items-start hover:border-slate-200 transition"
                        >
                            <div className="space-y-1.5">
                                <div className="flex items-center gap-3">
                                    <h3 className="font-bold text-gray-900 text-sm">
                                        {address.label}
                                    </h3>
                                    {address.is_primary === 1 ||
                                    address.is_primary === true ? (
                                        <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded">
                                            Utama
                                        </span>
                                    ) : null}
                                </div>
                                <p className="font-bold text-gray-900 text-sm">
                                    {address.recipient_name}
                                </p>
                                <p className="text-slate-600 text-sm">
                                    {address.phone}
                                </p>
                                <p className="text-slate-600 text-sm max-w-xl leading-relaxed mt-1">
                                    {address.full_address}
                                </p>
                            </div>

                            <div className="flex gap-4 items-center ml-4 shrink-0 mt-1">
                                <button
                                    onClick={() => handleEdit(address)}
                                    className="text-sm font-bold text-[#245D56] hover:text-[#1a443f] transition"
                                >
                                    Ubah
                                </button>

                                <button
                                    onClick={() => handleDelete(address.id)}
                                    className="text-sm font-bold text-red-500 hover:text-red-700 transition"
                                >
                                    Hapus
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <AddressModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                addressToEdit={editingAddress} // Lempar data edit ke Modal
            />
        </section>
    );
}

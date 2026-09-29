import React, { useState } from "react";
import { router } from "@inertiajs/react";
import { Plus, Trash2, MapPin, Building2, Home } from "lucide-react";
import AddressModal from "./AddressModal";
import toast from "react-hot-toast";

export interface Address {
    id: number;
    label: string;
    is_primary: boolean | number;
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
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [addressToDelete, setAddressToDelete] = useState<number | null>(null);

    const confirmDelete = (id: number) => {
        setAddressToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const executeDelete = () => {
        if (addressToDelete !== null) {
            router.delete(route("profile.address.destroy", addressToDelete), {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success("Alamat berhasil dihapus.");
                    setIsDeleteModalOpen(false);
                    setAddressToDelete(null);
                },
                onError: () => {
                    toast.error("Gagal menghapus alamat.");
                },
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
        <section>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-slate-100 gap-3">
                <div>
                    <h3 className="text-base md:text-lg font-bold text-gray-900">
                        Daftar Alamat
                    </h3>
                    <p className="text-xs md:text-sm text-slate-500 mt-0.5">
                        Kelola alamat pengiriman untuk kemudahan checkout belanja Anda.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => {
                        setEditingAddress(null);
                        setIsModalOpen(true);
                    }}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#ED7218] text-white font-bold text-xs md:text-sm hover:bg-[#d66311] transition shadow-sm shadow-orange-500/20 active:scale-95 shrink-0"
                >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Alamat Baru</span>
                </button>
            </div>

            <div className="space-y-3.5">
                {addresses.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
                        <MapPin className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-slate-600">
                            Belum ada alamat pengiriman.
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                            Tambahkan alamat sekarang agar proses checkout lebih cepat.
                        </p>
                    </div>
                ) : (
                    addresses.map((address) => {
                        const isPrimary = Boolean(address.is_primary);
                        const isOffice = address.label.toLowerCase() === "kantor";

                        return (
                            <div
                                key={address.id}
                                className={`p-4 md:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row justify-between items-start gap-4 ${
                                    isPrimary
                                        ? "bg-orange-50/30 border-orange-200/80 shadow-2xs"
                                        : "bg-white border-slate-200/80 hover:border-slate-300"
                                }`}
                            >
                                <div className="space-y-1.5 flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700">
                                            {isOffice ? (
                                                <Building2 className="w-3 h-3 text-slate-500" />
                                            ) : (
                                                <Home className="w-3 h-3 text-slate-500" />
                                            )}
                                            <span>{address.label}</span>
                                        </span>

                                        {isPrimary && (
                                            <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-[#ED7218] text-white">
                                                Utama
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-baseline gap-2 pt-0.5">
                                        <h4 className="font-bold text-gray-900 text-sm md:text-base">
                                            {address.recipient_name}
                                        </h4>
                                        <span className="text-slate-300">|</span>
                                        <span className="text-xs md:text-sm text-slate-600 font-medium">
                                            {address.phone}
                                        </span>
                                    </div>

                                    <p className="text-xs md:text-sm text-slate-600 leading-relaxed max-w-2xl">
                                        {address.full_address}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2 self-end sm:self-center shrink-0 pt-2 sm:pt-0">
                                    <button
                                        type="button"
                                        onClick={() => handleEdit(address)}
                                        className="px-3 py-1.5 rounded-lg text-xs md:text-sm font-bold text-[#ED7218] hover:bg-orange-50 transition"
                                    >
                                        Ubah
                                    </button>

                                    {!isPrimary && (
                                        <button
                                            type="button"
                                            onClick={() => confirmDelete(address.id)}
                                            className="px-3 py-1.5 rounded-lg text-xs md:text-sm font-bold text-red-500 hover:bg-red-50 transition"
                                        >
                                            Hapus
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Modal Update/Create Address */}
            <AddressModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                addressToEdit={editingAddress}
            />

            {/* Modal Delete Confirmation */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl text-center border border-slate-100">
                        <div className="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Trash2 className="w-6 h-6" />
                        </div>

                        <h4 className="text-base md:text-lg font-bold text-gray-900 mb-1.5">
                            Hapus Alamat?
                        </h4>
                        <p className="text-xs md:text-sm text-slate-500 mb-6">
                            Alamat ini akan dihapus secara permanen dari daftar alamat pengiriman Anda.
                        </p>

                        <div className="flex gap-2.5 justify-center">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsDeleteModalOpen(false);
                                    setAddressToDelete(null);
                                }}
                                className="px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 transition flex-1"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={executeDelete}
                                className="px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm text-white bg-red-500 hover:bg-red-600 transition flex-1 shadow-sm shadow-red-500/20"
                            >
                                Ya, Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}

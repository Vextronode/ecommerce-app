import React, { useState, useRef, useEffect } from "react";
import { MoreHorizontal, Edit, Trash2, AlertCircle } from "lucide-react";
import { Link, useForm } from "@inertiajs/react";

interface Props {
    product: any;
}

export default function ProductActions({ product }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { delete: destroy, processing } = useForm();

    // fungsi buat nutup dropdown kalau klik di luar
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const confirmDelete = (e: React.FormEvent) => {
        e.preventDefault();
        setIsOpen(false);
        setShowDeleteModal(true);
    };

    const handleDelete = () => {
        destroy(route("merchant.products.destroy", product.slug), {
            onSuccess: () => setShowDeleteModal(false),
            preserveScroll: true,
        });
    };

    return (
        <>
            <div aria-label="Pilih opsi yang tersedia" className="relative inline-block text-left" ref={dropdownRef}>
                <button aria-label="Tampilkan rincian lebih lanjut"
                    onClick={() => setIsOpen(!isOpen)}
                    className="text-gray-400 hover:text-[#41B9C5] p-1 md:p-2 rounded-lg hover:bg-[#E0F7FA] transition-colors focus:outline-none"
                >
                    <MoreHorizontal className="w-4 h-4 md:w-5 md:h-5" />
                </button>

                {isOpen && (
                    <div className="absolute right-0 mt-2 w-36 bg-white rounded-2xl shadow-lg border border-[#41B9C5]/20 z-10 overflow-hidden">
                        <div className="py-1">
                            <Link
                                href={route(
                                    "merchant.products.edit",
                                    product.slug,
                                )}
                                className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors w-full text-left whitespace-nowrap"
                            >
                                <Edit className="w-4 h-4 text-[#41B9C5]" />
                                Edit Produk
                            </Link>
                            <button
                                onClick={confirmDelete}
                                className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors w-full text-left whitespace-nowrap"
                            >
                                <Trash2 className="w-4 h-4" />
                                Hapus
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Custom Modal Delete */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <button type="button" aria-label="Tutup modal"
                        className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity w-full cursor-default"
                        onClick={() => !processing && setShowDeleteModal(false)}
                    />

                    {/* Modal Content */}
                    <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full relative z-10 shadow-xl border border-[#41B9C5]/30 transform transition flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4 border-4 border-red-100">
                            <AlertCircle className="w-8 h-8 text-red-500" />
                        </div>

                        <h3 className="text-xl font-extrabold text-gray-900 mb-2">
                            Hapus Produk?
                        </h3>
                        <p className="text-sm text-gray-500 mb-8 px-2">
                            Yakin mau menghapus{" "}
                            <span className="font-bold text-gray-800">
                                "{product.name}"
                            </span>{" "}
                            dari katalog? Data yang dihapus tidak bisa
                            dikembalikan.
                        </p>

                        <div className="flex w-full gap-3 mt-auto">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                disabled={processing}
                                className="flex-1 py-3 rounded-full border border-gray-200 text-gray-600 text-sm font-bold text-center hover:bg-gray-50 hover:border-gray-300 transition disabled:opacity-70 whitespace-nowrap"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={processing}
                                className="flex-1 py-3 rounded-full bg-red-500 hover:bg-red-600 text-white text-sm font-bold text-center transition disabled:opacity-70 shadow-md shadow-red-500/30 whitespace-nowrap"
                            >
                                {processing ? "Menghapus..." : "Ya, Hapus"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

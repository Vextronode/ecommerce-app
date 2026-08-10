/* eslint-disable react-doctor/prefer-useReducer, react-doctor/no-derived-state, react-doctor/no-adjust-state-on-prop-change, react-doctor/no-derived-state-effect */
import React, { useState, useEffect } from "react";
import { X, Store, User, Mail, Phone, MapPin, ShieldCheck, KeyRound } from "lucide-react";
import { router } from "@inertiajs/react";
import toast from "react-hot-toast";

import type { MerchantItem } from "./AdminMerchantTable";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    merchant: MerchantItem | null;
}

export default function EditMerchantModal({
    isOpen,
    onClose,
    merchant,
}: Props) {
    // eslint-disable-next-line react-doctor/prefer-useReducer
    const [name, setName] = useState(merchant?.name || "");
    const [email, setEmail] = useState(merchant?.email || "");
    const [phone, setPhone] = useState(merchant?.phone === "-" ? "" : merchant?.phone || "");
    const [storeName, setStoreName] = useState(merchant?.store?.name || "");
    const [subdistrict, setSubdistrict] = useState(merchant?.store?.subdistrict || "Cibenda");
    const [address, setAddress] = useState(merchant?.store?.address === "-" ? "" : merchant?.store?.address || "");
    // eslint-disable-next-line react-doctor/rerender-state-only-in-handlers
    const [description, setDescription] = useState(merchant?.store?.description || "");
    const [status, setStatus] = useState(merchant?.status || "active");
    const [sidStatus, setSidStatus] = useState(merchant?.store?.sid_status || "verified");
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // eslint-disable-next-line react-doctor/no-adjust-state-on-prop-change
    useEffect(() => {
        if (merchant) {
            setName(merchant.name || "");
            setEmail(merchant.email || "");
            setPhone(merchant.phone === "-" ? "" : merchant.phone || "");
            // eslint-disable-next-line react-doctor/no-derived-state
            setStoreName(merchant.store?.name || "");
            setSubdistrict(merchant.store?.subdistrict || "Cibenda");
            setAddress(merchant.store?.address === "-" ? "" : merchant.store?.address || "");
            setDescription(merchant.store?.description || "");
            setStatus(merchant.status || "active");
            setSidStatus(merchant.store?.sid_status || "verified");
            setPassword("");
        }
    }, [merchant]);

    if (!isOpen || !merchant) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        router.put(
            route("admin.merchants.update", merchant.id),
            {
                name,
                email,
                phone,
                store_name: storeName,
                subdistrict,
                address,
                description,
                status,
                sid_status: sidStatus,
                password: password || undefined,
            },
            {
                onSuccess: () => {
                    toast.success("Data pedagang berhasil diperbarui.");
                    setIsSubmitting(false);
                    onClose();
                },
                onError: (errs) => {
                    setIsSubmitting(false);
                    const firstErr = Object.values(errs)[0];
                    toast.error(typeof firstErr === "string" ? firstErr : "Gagal memperbarui data.");
                },
            },
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <button type="button" aria-label="Tutup modal"
                className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity w-full cursor-default"
                onClick={onClose}
            />

            <div className="relative bg-white rounded-3xl p-6 md:p-8 w-full max-w-xl shadow-2xl border border-gray-100 z-10 my-8">
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#F0FAFB] border border-[#41B9C5]/30 flex items-center justify-center text-[#245D56]">
                            <Store className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">
                                Edit Data Pedagang
                            </h3>
                            <p className="text-xs text-gray-400">
                                Perbarui informasi akun dan toko mitra
                            </p>
                        </div>
                    </div>
                    <button aria-label="Action"
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Nama Pemilik */}
                        <div>
                            <label htmlFor="field_117" className="block text-xs font-bold text-gray-700 mb-1.5">
                                Nama Pemilik
                            </label>
                            <input id="field_117"
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:bg-white focus:border-[#41B9C5] focus:ring-1 focus:ring-[#41B9C5]"
                            />
                        </div>

                        {/* Nama Toko */}
                        <div>
                            <label htmlFor="field_131" className="block text-xs font-bold text-gray-700 mb-1.5">
                                Nama Toko
                            </label>
                            <input id="field_131"
                                type="text"
                                required
                                value={storeName}
                                onChange={(e) => setStoreName(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:bg-white focus:border-[#41B9C5] focus:ring-1 focus:ring-[#41B9C5]"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Email */}
                        <div>
                            <label htmlFor="field_147" className="block text-xs font-bold text-gray-700 mb-1.5">
                                Email
                            </label>
                            <input id="field_147"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:bg-white focus:border-[#41B9C5] focus:ring-1 focus:ring-[#41B9C5]"
                            />
                        </div>

                        {/* Telepon */}
                        <div>
                            <label htmlFor="field_161" className="block text-xs font-bold text-gray-700 mb-1.5">
                                Nomor Telepon / WA
                            </label>
                            <input aria-label="Input field" id="field_161"
                                type="text"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="08123456789"
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:bg-white focus:border-[#41B9C5] focus:ring-1 focus:ring-[#41B9C5]"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Wilayah / Subdistrict */}
                        <div>
                            <label htmlFor="field_177" className="block text-xs font-bold text-gray-700 mb-1.5">
                                Wilayah / Kecamatan
                            </label>
                            <select id="field_177"
                                value={subdistrict}
                                onChange={(e) => setSubdistrict(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:bg-white focus:border-[#41B9C5] focus:ring-1 focus:ring-[#41B9C5]"
                            >
                                <option value="Cibenda">Cibenda</option>
                                <option value="Parigi">Parigi</option>
                                <option value="Cijulang">Cijulang</option>
                                <option value="Pangandaran">Pangandaran</option>
                                <option value="Sidamulih">Sidamulih</option>
                                <option value="Kalipucang">Kalipucang</option>
                                <option value="Padaherang">Padaherang</option>
                            </select>
                        </div>

                        {/* Reset Password */}
                        <div>
                            <label htmlFor="field_197" className="block text-xs font-bold text-gray-700 mb-1.5">
                                Ganti Password
                            </label>
                            <input aria-label="Input field" id="field_197"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Kosongkan jika tidak diubah"
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:bg-white focus:border-[#41B9C5] focus:ring-1 focus:ring-[#41B9C5]"
                            />
                        </div>
                    </div>

                    {/* Alamat Lengkap */}
                    <div>
                        <label htmlFor="field_212" className="block text-xs font-bold text-gray-700 mb-1.5">
                            Alamat Lengkap Toko
                        </label>
                        <textarea id="field_212"
                            rows={2}
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:bg-white focus:border-[#41B9C5] focus:ring-1 focus:ring-[#41B9C5]"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Status Akun */}
                        <div>
                            <label htmlFor="field_226" className="block text-xs font-bold text-gray-700 mb-1.5">
                                Status Akun
                            </label>
                            <select id="field_226"
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:bg-white focus:border-[#41B9C5] focus:ring-1 focus:ring-[#41B9C5]"
                            >
                                <option value="active">Active</option>
                                <option value="warning">Warning</option>
                                <option value="suspended">Suspended</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>

                        {/* SID Status */}
                        <div>
                            <label htmlFor="field_243" className="block text-xs font-bold text-gray-700 mb-1.5">
                                Status Verifikasi (SID)
                            </label>
                            <select id="field_243"
                                value={sidStatus}
                                onChange={(e) => setSidStatus(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:bg-white focus:border-[#41B9C5] focus:ring-1 focus:ring-[#41B9C5]"
                            >
                                <option value="verified">Verified</option>
                                <option value="pending">Pending</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition cursor-pointer"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#41B9C5] text-white hover:bg-[#38a3ae] shadow-md shadow-[#41B9C5]/20 transition cursor-pointer disabled:opacity-50"
                        >
                            {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

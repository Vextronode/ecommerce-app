import React, { useState } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import {
    ArrowLeft,
    Store,
    User,
    Mail,
    Phone,
    Lock,
    MapPin,
    ShieldCheck,
    Sparkles,
    CheckCircle2,
    FileText,
} from "lucide-react";
import toast from "react-hot-toast";

export default function AdminMerchantsCreate() {
    const { data, setData, post, processing, errors } = useForm({
        name: "",
        email: "",
        phone: "",
        password: "",
        store_name: "",
        subdistrict: "Cibenda",
        address: "",
        description: "",
        status: "active",
        sid_status: "verified",
    });

    const generateRandomPassword = () => {
        const chars =
            "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
        let result = "";
        for (let i = 0; i < 10; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setData("password", result);
        toast.success("Password aman berhasil dibuat!");
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("admin.merchants.store"), {
            onSuccess: () => {
                toast.success("Akun pedagang dan toko berhasil didaftarkan!");
            },
            onError: (errs) => {
                const firstErr = Object.values(errs)[0];
                toast.error(
                    typeof firstErr === "string"
                        ? firstErr
                        : "Gagal membuat akun pedagang.",
                );
            },
        });
    };

    return (
        <AdminLayout>
            <Head title="Buat Akun Pedagang - CibendaMart Admin" />

            <div className="max-w-4xl mx-auto space-y-6">
                {/* Back Link & Header */}
                <div>
                    <Link
                        href={route("admin.merchants.index")}
                        className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-[#245D56] transition-colors mb-3"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Kembali ke Manajemen Pedagang
                    </Link>

                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-[#E6F8F9] border border-[#41B9C5]/30 flex items-center justify-center text-[#245D56] shadow-2xs">
                            <Store className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
                                Buat Akun Pedagang Baru
                            </h1>
                            <p className="text-xs md:text-sm text-gray-400 mt-0.5 font-medium">
                                Daftarkan pedagang dan toko mitra baru ke platform CibendaMart.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form Card */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Section 1: Data Akun Pemilik */}
                    <div className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-sm space-y-5">
                        <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
                            <User className="w-4 h-4 text-[#41B9C5]" />
                            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                                Informasi Pemilik / Pengguna
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* Nama Pemilik */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                                    Nama Lengkap Pemilik{" "}
                                    <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        required
                                        value={data.name}
                                        onChange={(e) =>
                                            setData("name", e.target.value)
                                        }
                                        placeholder="Contoh: Kang Asep Suryadi"
                                        className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:bg-white focus:border-[#41B9C5] focus:ring-1 focus:ring-[#41B9C5] transition-all"
                                    />
                                </div>
                                {errors.name && (
                                    <p className="text-rose-500 text-[11px] mt-1">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                                    Alamat Email{" "}
                                    <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="email"
                                        required
                                        value={data.email}
                                        onChange={(e) =>
                                            setData("email", e.target.value)
                                        }
                                        placeholder="asep@pedagang.com"
                                        className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:bg-white focus:border-[#41B9C5] focus:ring-1 focus:ring-[#41B9C5] transition-all"
                                    />
                                </div>
                                {errors.email && (
                                    <p className="text-rose-500 text-[11px] mt-1">
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            {/* Nomor Telepon */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                                    Nomor Telepon / WhatsApp
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={data.phone}
                                        onChange={(e) =>
                                            setData("phone", e.target.value)
                                        }
                                        placeholder="081234567890"
                                        className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:bg-white focus:border-[#41B9C5] focus:ring-1 focus:ring-[#41B9C5] transition-all"
                                    />
                                </div>
                                {errors.phone && (
                                    <p className="text-rose-500 text-[11px] mt-1">
                                        {errors.phone}
                                    </p>
                                )}
                            </div>

                            {/* Password */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="block text-xs font-bold text-gray-700">
                                        Password Akun{" "}
                                        <span className="text-rose-500">*</span>
                                    </label>
                                    <button
                                        type="button"
                                        onClick={generateRandomPassword}
                                        className="text-[11px] font-bold text-[#245D56] hover:underline flex items-center gap-1 cursor-pointer"
                                    >
                                        <Sparkles className="w-3 h-3" />
                                        Auto-Generate
                                    </button>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        required
                                        value={data.password}
                                        onChange={(e) =>
                                            setData("password", e.target.value)
                                        }
                                        placeholder="Minimal 8 karakter"
                                        className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 font-mono focus:outline-none focus:bg-white focus:border-[#41B9C5] focus:ring-1 focus:ring-[#41B9C5] transition-all"
                                    />
                                </div>
                                {errors.password && (
                                    <p className="text-rose-500 text-[11px] mt-1">
                                        {errors.password}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Data Toko Mitra */}
                    <div className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-sm space-y-5">
                        <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
                            <Store className="w-4 h-4 text-[#41B9C5]" />
                            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                                Informasi Toko Mitra
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* Nama Toko */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                                    Nama Toko{" "}
                                    <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={data.store_name}
                                    onChange={(e) =>
                                        setData("store_name", e.target.value)
                                    }
                                    placeholder="Contoh: Toko Sayur Berkah"
                                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:bg-white focus:border-[#41B9C5] focus:ring-1 focus:ring-[#41B9C5] transition-all"
                                />
                                {errors.store_name && (
                                    <p className="text-rose-500 text-[11px] mt-1">
                                        {errors.store_name}
                                    </p>
                                )}
                            </div>

                            {/* Wilayah / Kecamatan */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                                    Wilayah / Kecamatan{" "}
                                    <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={data.subdistrict}
                                    onChange={(e) =>
                                        setData("subdistrict", e.target.value)
                                    }
                                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:bg-white focus:border-[#41B9C5] focus:ring-1 focus:ring-[#41B9C5] transition-all"
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
                        </div>

                        {/* Alamat Lengkap */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1.5">
                                Alamat Lengkap Toko
                            </label>
                            <textarea
                                rows={2}
                                value={data.address}
                                onChange={(e) =>
                                    setData("address", e.target.value)
                                }
                                placeholder="Contoh: Jl. Raya Cibenda No. 12, RT 02/RW 03"
                                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:bg-white focus:border-[#41B9C5] focus:ring-1 focus:ring-[#41B9C5] transition-all"
                            />
                        </div>

                        {/* Deskripsi Toko */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1.5">
                                Deskripsi Toko
                            </label>
                            <textarea
                                rows={2}
                                value={data.description}
                                onChange={(e) =>
                                    setData("description", e.target.value)
                                }
                                placeholder="Jelaskan produk atau komoditas utama yang dijual oleh toko ini..."
                                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:bg-white focus:border-[#41B9C5] focus:ring-1 focus:ring-[#41B9C5] transition-all"
                            />
                        </div>
                    </div>

                    {/* Section 3: Status & Verifikasi */}
                    <div className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-sm space-y-5">
                        <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
                            <ShieldCheck className="w-4 h-4 text-[#41B9C5]" />
                            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                                Status & Hak Akses Platform
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* Status Akun */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                                    Status Akun Awal
                                </label>
                                <select
                                    value={data.status}
                                    onChange={(e) =>
                                        setData("status", e.target.value)
                                    }
                                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:bg-white focus:border-[#41B9C5] focus:ring-1 focus:ring-[#41B9C5] transition-all"
                                >
                                    <option value="active">Active (Dapat Login & Berjualan)</option>
                                    <option value="warning">Warning (Peringatan)</option>
                                    <option value="suspended">Suspended (Ditangguhkan)</option>
                                    <option value="inactive">Inactive (Non-aktif)</option>
                                </select>
                            </div>

                            {/* Status SID */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                                    Status Verifikasi SID Toko
                                </label>
                                <select
                                    value={data.sid_status}
                                    onChange={(e) =>
                                        setData("sid_status", e.target.value)
                                    }
                                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:bg-white focus:border-[#41B9C5] focus:ring-1 focus:ring-[#41B9C5] transition-all"
                                >
                                    <option value="verified">Verified (Toko Resmi Terverifikasi)</option>
                                    <option value="pending">Pending (Menunggu Peninjauan Dokumen)</option>
                                    <option value="rejected">Rejected (Verifikasi Ditolak)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                        <Link
                            href={route("admin.merchants.index")}
                            className="px-6 py-3 rounded-2xl text-xs font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-all cursor-pointer"
                        >
                            Batal
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex items-center gap-2 px-7 py-3 rounded-2xl text-xs font-bold bg-[#41B9C5] text-white hover:bg-[#38a3ae] shadow-lg shadow-[#41B9C5]/30 transition-all cursor-pointer disabled:opacity-50"
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            {processing ? "Menyimpan Data..." : "Simpan & Buat Akun Pedagang"}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}

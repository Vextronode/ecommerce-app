import React from "react";
import { Head, Link } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import CreateMerchantForm from "@/Components/Admin/Merchants/CreateMerchantForm";
import { ApplicationInitialData } from "@/Hooks/Admin/useCreateMerchantForm";
import { ChevronLeft } from "lucide-react";

interface Props {
    application?: ApplicationInitialData | null;
}

export default function AdminMerchantsCreate({ application }: Props) {
    return (
        <AdminLayout>
            <Head title="Tambah Pedagang Baru - CibendaMart Admin" />

            <div className="space-y-4">
                {/* Back button */}
                <div>
                    <Link
                        href={route("admin.merchants.index", {
                            tab: application ? "applications" : "merchants",
                        })}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-brand-orange transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        <span>
                            Kembali ke{" "}
                            {application
                                ? "Permohonan Masuk SID"
                                : "Kelola Pedagang"}
                        </span>
                    </Link>
                </div>

                <div className="bg-white rounded-3xl p-5 sm:p-8 md:p-10 border border-gray-100 shadow-sm w-full min-w-0 max-w-full overflow-hidden">
                    {/* Header Title & Subtitle */}
                    <div className="pb-4 border-b border-gray-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
                                {application
                                    ? "Aktivasi Akun Pedagang SID"
                                    : "Tambah Pedagang Baru"}
                            </h1>
                            <p className="text-xs md:text-sm text-gray-500 mt-1 font-normal">
                                {application
                                    ? `Membuat akun untuk toko "${application.business_name}" berdasarkan verifikasi SKU SIDUTama.`
                                    : "Masukkan detail di bawah ini untuk menambahkan akun pedagang baru ke dalam sistem."}
                            </p>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] font-semibold text-gray-400">
                            <span className="text-rose-500 font-bold">*</span> Bidang
                            wajib diisi
                        </div>
                    </div>

                    {/* Main Modular Form */}
                    <CreateMerchantForm application={application} />
                </div>
            </div>
        </AdminLayout>
    );
}

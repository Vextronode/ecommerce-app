import React from "react";
import { Head } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import CreateMerchantForm from "@/Components/Admin/Merchants/CreateMerchantForm";

export default function AdminMerchantsCreate() {
    return (
        <AdminLayout>
            <Head title="Membuat Pedagang Baru - CibendaMart Admin" />

            <div className="bg-white rounded-3xl p-6 sm:p-8 md:p-10 border border-gray-100 shadow-sm w-full">
                {/* Header Title & Subtitle */}
                <div className="pb-4 border-b border-gray-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-extrabold text-[#004F54] tracking-tight">
                            Membuat Pedagang Baru
                        </h1>
                        <p className="text-xs md:text-sm text-gray-500 mt-1 font-normal">
                            Masukkan detail di bawah ini untuk menambahkan pengguna baru ke dalam sistem.
                        </p>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-gray-400">
                        <span className="text-rose-500 font-bold">*</span> Bidang wajib diisi
                    </div>
                </div>

                {/* Main Modular Form */}
                <CreateMerchantForm />
            </div>
        </AdminLayout>
    );
}

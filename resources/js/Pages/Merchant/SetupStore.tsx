import React from "react";
import { Head } from "@inertiajs/react";
import AuthGlassLayout from "@/Layouts/AuthGlassLayout";
import { useSetupStoreForm } from "@/Hooks/Merchant/useSetupStoreForm";

interface Props {
    initialStoreName?: string;
}

export default function SetupStore({ initialStoreName = "" }: Props) {
    const { data, setData, processing, errors, handleSubmit } =
        useSetupStoreForm(initialStoreName);

    return (
        <>
            <Head title="Setup Toko & Password" />

            <AuthGlassLayout
                title="Lengkapi Profil"
                subtitle="Atur password baru dan nama toko Anda"
            >
                <form onSubmit={handleSubmit} className="space-y-7 w-full">
                    {/* Input Store Name */}
                    <div>
                        <label htmlFor="field_25" className="block text-white text-sm mb-2 font-medium">
                            Store name<span aria-label="Action" className="text-red-500">*</span>
                        </label>
                        <input id="field_25"
                            type="text"
                            value={data.store_name}
                            onChange={(e) =>
                                setData("store_name", e.target.value)
                            }
                            className="w-full px-4 py-3.5 rounded-2xl bg-white border-0 focus:ring-4 focus:ring-[#41B9C5]/50 outline-none text-gray-900 shadow-inner transition"
                            required
                        />
                        {errors.store_name && (
                            <div className="text-red-400 text-xs mt-1.5 font-medium">
                                {errors.store_name}
                            </div>
                        )}
                    </div>

                    {/* Input New Password */}
                    <div>
                        <label htmlFor="field_46" className="block text-white text-sm mb-2 font-medium">
                            New password<span aria-label="Action" className="text-red-500">*</span>
                        </label>
                        <input id="field_46"
                            type="password"
                            value={data.password}
                            onChange={(e) =>
                                setData("password", e.target.value)
                            }
                            className="w-full px-4 py-3.5 rounded-2xl bg-white border-0 focus:ring-4 focus:ring-[#41B9C5]/50 outline-none text-gray-900 shadow-inner transition"
                            required
                        />
                        {errors.password && (
                            <div className="text-red-400 text-xs mt-1.5 font-medium">
                                {errors.password}
                            </div>
                        )}
                    </div>

                    {/* Input Confirm Password */}
                    <div>
                        <label htmlFor="field_67" className="block text-white text-sm mb-2 font-medium">
                            Confirm password
                            <span aria-label="Action" className="text-red-500">*</span>
                        </label>
                        <input id="field_67"
                            type="password"
                            value={data.password_confirmation}
                            onChange={(e) =>
                                setData("password_confirmation", e.target.value)
                            }
                            className="w-full px-4 py-3.5 rounded-2xl bg-white border-0 focus:ring-4 focus:ring-[#41B9C5]/50 outline-none text-gray-900 shadow-inner transition"
                            required
                        />
                        {errors.password_confirmation && (
                            <div className="text-red-400 text-xs mt-1.5 font-medium">
                                {errors.password_confirmation}
                            </div>
                        )}
                    </div>

                    <div className="pt-10 flex justify-center w-full">
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full max-w-50 px-4 py-3 rounded-full bg-[#41B9C5] hover:bg-[#359a9e] text-white font-bold transition hover:scale-105 disabled:opacity-70 disabled:hover:scale-100 shadow-lg shadow-[#004F54]/50"
                        >
                            {processing ? "Menyimpan..." : "Simpan & Lanjut"}
                        </button>
                    </div>
                </form>
            </AuthGlassLayout>
        </>
    );
}

import React from "react";
import { Head, useForm } from "@inertiajs/react";

import AuthGlassLayout from "@/Layouts/AuthGlassLayout";

export default function SetupStore() {
    const { data, setData, post, processing, errors } = useForm({
        store_name: "",
        password: "",
        password_confirmation: "",
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        post(route("merchant.store.store"));
    };

    return (
        <>
            <Head title="Setup Toko & Password" />

            <AuthGlassLayout
                title="Login ke Akun"
                subtitle="Untuk mendaftar sebagai Pedagang"
            >
                <form onSubmit={submit} className="space-y-7 w-full">
                    {/* Input Store Name */}
                    <div>
                        <label className="block text-white text-sm mb-2 font-medium">
                            Store name<span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={data.store_name}
                            onChange={(e) =>
                                setData("store_name", e.target.value)
                            }
                            className="w-full px-4 py-3.5 rounded-2xl bg-white border-0 focus:ring-4 focus:ring-[#41B9C5]/50 outline-none text-gray-900 shadow-inner transition-all"
                            required
                        />
                        {errors.store_name && (
                            <div className="text-red-400 text-xs mt-1.5">
                                {errors.store_name}
                            </div>
                        )}
                    </div>

                    {/* Input New Password */}
                    <div>
                        <label className="block text-white text-sm mb-2 font-medium">
                            New password<span className="text-red-500">*</span>
                        </label>
                        <input
                            type="password"
                            value={data.password}
                            onChange={(e) =>
                                setData("password", e.target.value)
                            }
                            className="w-full px-4 py-3.5 rounded-2xl bg-white border-0 focus:ring-4 focus:ring-[#41B9C5]/50 outline-none text-gray-900 shadow-inner transition-all"
                            required
                        />
                        {errors.password && (
                            <div className="text-red-400 text-xs mt-1.5">
                                {errors.password}
                            </div>
                        )}
                    </div>

                    {/* Input Confirm Password */}
                    <div>
                        <label className="block text-white text-sm mb-2 font-medium">
                            Confirm password
                            <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="password"
                            value={data.password_confirmation}
                            onChange={(e) =>
                                setData("password_confirmation", e.target.value)
                            }
                            className="w-full px-4 py-3.5 rounded-2xl bg-white border-0 focus:ring-4 focus:ring-[#41B9C5]/50 outline-none text-gray-900 shadow-inner transition-all"
                            required
                        />
                        {errors.password_confirmation && (
                            <div className="text-red-400 text-xs mt-1.5">
                                {errors.password_confirmation}
                            </div>
                        )}
                    </div>

                    <div className="pt-10 flex justify-center w-full">
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full max-w-50 px-4 py-3 rounded-full bg-[#41B9C5] hover:bg-[#359a9e] text-white font-bold transition-all hover:scale-105 disabled:opacity-70 shadow-lg shadow-[#004F54]/50"
                        >
                            Masuk
                        </button>
                    </div>
                </form>
            </AuthGlassLayout>
        </>
    );
}

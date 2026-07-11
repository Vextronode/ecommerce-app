import React from "react";
import { Head, useForm } from "@inertiajs/react";

import AuthGlassLayout from "@/Layouts/AuthGlassLayout";

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: "",
        password: "",
        expected_role: "pedagang",
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("login"));
    };

    return (
        <>
            <Head title="Login Pedagang" />

            <AuthGlassLayout
                title="Login Account!"
                subtitle="Masukkan informasi yg sesuai admin berikan"
            >
                <form onSubmit={submit} className="space-y-7 w-full">
                    {/* Input Email */}
                    <div>
                        <label className="block text-white text-sm mb-2 font-medium">
                            Email Address<span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            value={data.email}
                            onChange={(e) => setData("email", e.target.value)}
                            className="w-full px-4 py-3.5 rounded-2xl bg-white border-0 focus:ring-4 focus:ring-[#41B9C5]/50 outline-none text-gray-900 shadow-inner transition-all"
                            required
                        />
                        {errors.email && (
                            <div className="text-red-400 text-xs mt-1.5">
                                {errors.email}
                            </div>
                        )}
                    </div>

                    {/* Input Password */}
                    <div>
                        <label className="block text-white text-sm mb-2 font-medium">
                            Password<span className="text-red-500">*</span>
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

                    {/* Tombol Masuk */}
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

import React, { useState } from "react";
import { Head, useForm } from "@inertiajs/react";
import { Eye, EyeOff } from "lucide-react";

import AuthGlassLayout from "@/Layouts/AuthGlassLayout";

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);
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
                    {/* Input Email/Username */}
                    <div>
                        <label htmlFor="field_29" className="block text-white text-sm mb-2 font-medium">
                            Username / Email<span aria-label="Action" className="text-red-500">*</span>
                        </label>
                        <input id="field_29"
                            type="text"
                            value={data.email}
                            onChange={(e) => setData("email", e.target.value)}
                            placeholder="Masukkan username atau email"
                            className="w-full px-4 py-3.5 rounded-2xl bg-white border-0 focus:ring-4 focus:ring-brand-orange/40 outline-none text-gray-900 shadow-inner transition placeholder:text-gray-400"
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
                        <label htmlFor="field_48" className="block text-white text-sm mb-2 font-medium">
                            Password<span aria-label="Action" className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input id="field_48"
                                type={showPassword ? "text" : "password"}
                                value={data.password}
                                onChange={(e) =>
                                    setData("password", e.target.value)
                                }
                                placeholder="Masukkan password"
                                className="w-full px-4 py-3.5 pr-11 rounded-2xl bg-white border-0 focus:ring-4 focus:ring-brand-orange/40 outline-none text-gray-900 shadow-inner transition"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                tabIndex={-1}
                                aria-label={showPassword ? "Sembunyikan password" : "Lihat password"}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors cursor-pointer"
                            >
                                {showPassword ? (
                                    <EyeOff className="w-5 h-5" />
                                ) : (
                                    <Eye className="w-5 h-5" />
                                )}
                            </button>
                        </div>
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
                            className="w-full max-w-50 px-4 py-3 rounded-full bg-brand-orange hover:bg-brand-orange-hover text-white font-bold transition hover:scale-105 disabled:opacity-70 shadow-lg shadow-brand-orange/30 cursor-pointer"
                        >
                            Masuk
                        </button>
                    </div>
                </form>
            </AuthGlassLayout>
        </>
    );
}

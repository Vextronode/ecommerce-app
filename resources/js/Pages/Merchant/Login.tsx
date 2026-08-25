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
                        <label htmlFor="field_29" className="block text-white text-sm mb-2 font-medium">
                            Email Address<span aria-label="Action" className="text-red-500">*</span>
                        </label>
                        <input id="field_29"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData("email", e.target.value)}
                            className="w-full px-4 py-3.5 rounded-2xl bg-white border-0 focus:ring-4 focus:ring-brand-orange/40 outline-none text-gray-900 shadow-inner transition"
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
                        <input id="field_48"
                            type="password"
                            value={data.password}
                            onChange={(e) =>
                                setData("password", e.target.value)
                            }
                            className="w-full px-4 py-3.5 rounded-2xl bg-white border-0 focus:ring-4 focus:ring-brand-orange/40 outline-none text-gray-900 shadow-inner transition"
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

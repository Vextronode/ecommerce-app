import React, { useRef } from "react";
import { useForm } from "@inertiajs/react";
import { Transition } from "@headlessui/react";
import toast from "react-hot-toast";

export default function UpdatePasswordForm({
    className = "",
}: {
    className?: string;
}) {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
    } = useForm({
        current_password: "",
        password: "",
        password_confirmation: "",
    });

    const updatePassword = (e: React.FormEvent) => {
        e.preventDefault();

        put(route("password.update"), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                toast.success("Kata sandi berhasil diperbarui!");
            },
            onError: (errs) => {
                if (errs.password) {
                    reset("password", "password_confirmation");
                    passwordInput.current?.focus();
                }
                if (errs.current_password) {
                    reset("current_password");
                    currentPasswordInput.current?.focus();
                }
                toast.error("Gagal memperbarui kata sandi. Periksa inputan Anda.");
            },
        });
    };

    return (
        <section className={className}>
            <div className="pb-4 mb-6 border-b border-slate-100">
                <h3 className="text-base md:text-lg font-bold text-gray-900">
                    Ubah Kata Sandi
                </h3>
                <p className="text-xs md:text-sm text-slate-500 mt-0.5">
                    Pastikan akun Anda menggunakan kata sandi yang panjang dan acak untuk menjaga keamanan.
                </p>
            </div>

            <form onSubmit={updatePassword} className="space-y-4 max-w-xl">
                <div className="space-y-1.5">
                    <label htmlFor="current_password_input" className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                        Kata Sandi Saat Ini
                    </label>
                    <input
                        id="current_password_input"
                        ref={currentPasswordInput}
                        value={data.current_password}
                        onChange={(e) => setData("current_password", e.target.value)}
                        type="password"
                        placeholder="••••••••"
                        autoComplete="current-password"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#ED7218] focus:ring-2 focus:ring-[#ED7218]/20 bg-slate-50/50 text-sm font-medium text-gray-900 transition"
                    />
                    {errors.current_password && (
                        <p className="text-xs text-red-600 mt-1">{errors.current_password}</p>
                    )}
                </div>

                <div className="space-y-1.5">
                    <label htmlFor="new_password_input" className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                        Kata Sandi Baru
                    </label>
                    <input
                        id="new_password_input"
                        ref={passwordInput}
                        value={data.password}
                        onChange={(e) => setData("password", e.target.value)}
                        type="password"
                        placeholder="••••••••"
                        autoComplete="new-password"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#ED7218] focus:ring-2 focus:ring-[#ED7218]/20 bg-slate-50/50 text-sm font-medium text-gray-900 transition"
                    />
                    {errors.password && (
                        <p className="text-xs text-red-600 mt-1">{errors.password}</p>
                    )}
                </div>

                <div className="space-y-1.5">
                    <label htmlFor="confirm_password_input" className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                        Konfirmasi Kata Sandi Baru
                    </label>
                    <input
                        id="confirm_password_input"
                        value={data.password_confirmation}
                        onChange={(e) => setData("password_confirmation", e.target.value)}
                        type="password"
                        placeholder="••••••••"
                        autoComplete="new-password"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#ED7218] focus:ring-2 focus:ring-[#ED7218]/20 bg-slate-50/50 text-sm font-medium text-gray-900 transition"
                    />
                    {errors.password_confirmation && (
                        <p className="text-xs text-red-600 mt-1">{errors.password_confirmation}</p>
                    )}
                </div>

                <div className="flex items-center gap-4 pt-4">
                    <button
                        type="submit"
                        disabled={processing}
                        className="px-6 py-2.5 rounded-xl bg-[#ED7218] text-white font-bold text-xs md:text-sm hover:bg-[#d66311] transition shadow-sm shadow-orange-500/20 active:scale-95 disabled:opacity-50"
                    >
                        {processing ? "Menyimpan..." : "Simpan Kata Sandi"}
                    </button>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out duration-200"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out duration-200"
                        leaveTo="opacity-0"
                    >
                        <span className="text-xs font-bold text-[#ED7218]">
                            Tersimpan.
                        </span>
                    </Transition>
                </div>
            </form>
        </section>
    );
}

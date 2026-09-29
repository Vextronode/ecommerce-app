import React, { useState, useEffect } from "react";
import { useForm, usePage } from "@inertiajs/react";
import { Transition } from "@headlessui/react";
import { PageProps } from "@/types";
import toast from "react-hot-toast";

const extractNames = (fullName: string) => {
    const parts = fullName.split(" ");
    return {
        first: parts[0] || "",
        last: parts.slice(1).join(" ") || "",
    };
};

export default function UpdateProfileInformation({
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const user = usePage<PageProps>().props.auth.user;

    const maxBirthDate = new Date();
    maxBirthDate.setFullYear(maxBirthDate.getFullYear() - 13);
    const maxDob = maxBirthDate.toISOString().split("T")[0];

    const initialNames = extractNames(user.name);
    const [firstName, setFirstName] = useState(initialNames.first);
    const [lastName, setLastName] = useState(initialNames.last);

    const {
        data,
        setData,
        patch,
        errors,
        processing,
        recentlySuccessful,
        clearErrors,
    } = useForm({
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        gender: user.gender || "",
        dob: user.dob || "",
    });

    useEffect(() => {
        setData("name", `${firstName} ${lastName}`.trim());
    }, [firstName, lastName]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(route("profile.update"), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success("Biodata profil berhasil diperbarui!");
            },
            onError: () => {
                toast.error("Gagal menyimpan. Periksa inputan Anda.");
            },
        });
    };

    const handleCancel = () => {
        setFirstName(initialNames.first);
        setLastName(initialNames.last);
        setData({
            name: user.name,
            email: user.email,
            phone: user.phone || "",
            gender: user.gender || "",
            dob: user.dob || "",
        });
        clearErrors();
    };

    return (
        <section>
            <div className="pb-4 mb-6 border-b border-slate-100">
                <h3 className="text-base md:text-lg font-bold text-gray-900">
                    Biodata Diri
                </h3>
                <p className="text-xs md:text-sm text-slate-500 mt-0.5">
                    Kelola informasi profil Anda untuk kenyamanan bertransaksi di Cibenda Mart.
                </p>
            </div>

            <form onSubmit={submit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* First Name */}
                    <div className="space-y-1.5">
                        <label htmlFor="first_name" className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                            Nama Depan
                        </label>
                        <input
                            id="first_name"
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="Nama depan"
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#ED7218] focus:ring-2 focus:ring-[#ED7218]/20 bg-slate-50/50 text-sm font-medium text-gray-900 transition"
                        />
                    </div>

                    {/* Last Name */}
                    <div className="space-y-1.5">
                        <label htmlFor="last_name" className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                            Nama Belakang
                        </label>
                        <input
                            id="last_name"
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="Nama belakang"
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#ED7218] focus:ring-2 focus:ring-[#ED7218]/20 bg-slate-50/50 text-sm font-medium text-gray-900 transition"
                        />
                        {errors.name && (
                            <p className="text-xs text-red-600 mt-1">{errors.name}</p>
                        )}
                    </div>

                    {/* Email (Readonly) */}
                    <div className="space-y-1.5">
                        <label htmlFor="email_field" className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                            Alamat Email
                        </label>
                        <input
                            id="email_field"
                            type="email"
                            value={data.email}
                            readOnly
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100/80 text-slate-500 cursor-not-allowed text-sm font-medium"
                        />
                        <p className="text-[11px] text-slate-400">
                            Email terhubung dengan keamanan akun Anda.
                        </p>
                    </div>

                    {/* Phone Number */}
                    <div className="space-y-1.5">
                        <label htmlFor="phone_field" className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                            Nomor WhatsApp / HP
                        </label>
                        <div className="flex">
                            <span className="inline-flex items-center px-3.5 rounded-l-xl border border-r-0 border-slate-200 bg-slate-100 text-slate-600 text-xs font-bold select-none">
                                +62
                            </span>
                            <input
                                id="phone_field"
                                type="tel"
                                value={data.phone}
                                onChange={(e) => setData("phone", e.target.value)}
                                placeholder="81234567890"
                                className="flex-1 w-full px-4 py-2.5 rounded-r-xl border border-slate-200 focus:border-[#ED7218] focus:ring-2 focus:ring-[#ED7218]/20 bg-slate-50/50 text-sm font-medium text-gray-900 transition"
                            />
                        </div>
                        {errors.phone && (
                            <p className="text-xs text-red-600 mt-1">{errors.phone}</p>
                        )}
                    </div>

                    {/* Gender */}
                    <div className="space-y-1.5">
                        <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                            Jenis Kelamin
                        </span>
                        <div className="flex items-center gap-6 pt-2">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="radio"
                                    name="gender"
                                    value="male"
                                    checked={data.gender === "male"}
                                    onChange={() => setData("gender", "male")}
                                    className="w-4 h-4 text-[#ED7218] focus:ring-[#ED7218] accent-[#ED7218] border-slate-300"
                                />
                                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                                    Laki-laki
                                </span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="radio"
                                    name="gender"
                                    value="female"
                                    checked={data.gender === "female"}
                                    onChange={() => setData("gender", "female")}
                                    className="w-4 h-4 text-[#ED7218] focus:ring-[#ED7218] accent-[#ED7218] border-slate-300"
                                />
                                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                                    Perempuan
                                </span>
                            </label>
                        </div>
                        {errors.gender && (
                            <p className="text-xs text-red-600 mt-1">{errors.gender}</p>
                        )}
                    </div>

                    {/* Date of Birth */}
                    <div className="space-y-1.5">
                        <label htmlFor="dob_field" className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                            Tanggal Lahir
                        </label>
                        <input
                            id="dob_field"
                            type="date"
                            value={data.dob}
                            onChange={(e) => setData("dob", e.target.value)}
                            max={maxDob}
                            min="1900-01-01"
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#ED7218] focus:ring-2 focus:ring-[#ED7218]/20 bg-slate-50/50 text-sm font-medium text-gray-900 transition"
                        />
                        {errors.dob && (
                            <p className="text-xs text-red-600 mt-1">{errors.dob}</p>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out duration-200"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out duration-200"
                        leaveTo="opacity-0"
                    >
                        <span className="text-xs font-bold text-[#ED7218] mr-2">
                            Tersimpan.
                        </span>
                    </Transition>

                    <button
                        type="button"
                        onClick={handleCancel}
                        disabled={processing}
                        className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs md:text-sm hover:bg-slate-50 transition active:scale-95 disabled:opacity-50"
                    >
                        Batal
                    </button>

                    <button
                        type="submit"
                        disabled={processing}
                        className="px-6 py-2.5 rounded-xl bg-[#ED7218] text-white font-bold text-xs md:text-sm hover:bg-[#d66311] transition shadow-sm shadow-orange-500/20 active:scale-95 disabled:opacity-50"
                    >
                        {processing ? "Menyimpan..." : "Simpan Perubahan"}
                    </button>
                </div>
            </form>
        </section>
    );
}

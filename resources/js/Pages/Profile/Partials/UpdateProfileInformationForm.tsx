import React, { useState, useEffect } from "react";
import { useForm, usePage } from "@inertiajs/react";
import { Transition } from "@headlessui/react";
import { PageProps } from "@/types";

// helper function untuk ekstrak nama
const extractNames = (fullName: string) => {
    const parts = fullName.split(" ");
    return {
        first: parts[0] || "",
        last: parts.slice(1).join(" ") || "",
    };
};

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    // ambil user dari page props
    const user = usePage<PageProps>().props.auth.user;

    // validasi tanggal lahir minimal umur 13 tahun
    const maxBirthDate = new Date();
    maxBirthDate.setFullYear(maxBirthDate.getFullYear() - 13);
    const maxDob = maxBirthDate.toISOString().split("T")[0];

    // ambil nama dari user
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [firstName, lastName]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(route("profile.update"));
    };

    // handle cancel logic
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
        clearErrors(); // clear errors on cancel
    };

    return (
        <section>
            <h3 className="text-lg font-bold text-gray-950 mb-8 pb-4 border-b border-slate-100">
                Informasi Pribadi
            </h3>

            <form onSubmit={submit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <div className="space-y-2">
                        <label htmlFor="field_85" className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                            First Name
                        </label>
                        <input id="field_85"
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="w-full px-5 py-3.5 rounded-xl border-slate-200 focus:border-[#40E0D0] focus:ring-[#40E0D0] bg-slate-50/50 text-sm font-medium"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="field_97" className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                            Last Name
                        </label>
                        <input id="field_97"
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="w-full px-5 py-3.5 rounded-xl border-slate-200 focus:border-[#40E0D0] focus:ring-[#40E0D0] bg-slate-50/50 text-sm font-medium"
                        />
                        {errors.name && (
                            <p className="text-sm text-red-600">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    {/* email */}
                    <div className="space-y-2">
                        <label htmlFor="field_115" className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                            Email
                        </label>
                        <input id="field_115"
                            type="email"
                            value={data.email}
                            readOnly
                            className="w-full px-5 py-3.5 rounded-xl border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed text-sm"
                        />
                        <p className="text-[11px] text-slate-400">
                            Email cannot be changed directly.
                        </p>
                    </div>

                    {/* no hp */}
                    <div className="space-y-2">
                        <label htmlFor="field_131" className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                            Mobile Number
                        </label>
                        <div className="flex">
                            <span className="inline-flex items-center px-5 rounded-l-xl border border-r-0 border-slate-200 bg-slate-100 text-slate-600 text-sm font-bold shadow-inner">
                                +62
                            </span>
                            <input aria-label="Input field" id="field_131"
                                type="text"
                                value={data.phone}
                                onChange={(e) =>
                                    setData("phone", e.target.value)
                                }
                                placeholder="81234567890"
                                className="flex-1 w-full px-5 py-3.5 rounded-r-xl border-slate-200 focus:border-[#40E0D0] focus:ring-[#40E0D0] bg-slate-50/50 text-sm font-medium"
                            />
                        </div>
                        {errors.phone && (
                            <p className="text-sm text-red-600 mt-1">
                                {errors.phone}
                            </p>
                        )}
                    </div>

                    {/* gender */}
                    <div className="space-y-2">
                        <label htmlFor="field_157" className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">
                            Gender
                        </label>
                        <div className="flex gap-8 pt-2.5">
                            <label className="flex items-center gap-2.5 cursor-pointer group">
                                <input id="field_157"
                                    type="radio"
                                    name="gender"
                                    checked={data.gender === "male"}
                                    onChange={() => setData("gender", "male")}
                                    className="w-4 h-4 text-[#ED7218] focus:ring-[#ED7218] accent-[#ED7218] border-slate-300"
                                />
                                <span className="text-sm font-medium text-gray-800 group-hover:text-black">
                                    Male
                                </span>
                            </label>
                            <label className="flex items-center gap-2.5 cursor-pointer group">
                                <input
                                    type="radio"
                                    name="gender"
                                    checked={data.gender === "female"}
                                    onChange={() => setData("gender", "female")}
                                    className="w-4 h-4 text-[#ED7218] focus:ring-[#ED7218] accent-[#ED7218] border-slate-300"
                                />
                                <span className="text-sm font-medium text-gray-800 group-hover:text-black">
                                    Female
                                </span>
                            </label>
                        </div>
                        {errors.gender && (
                            <p className="text-sm text-red-600 mt-1">
                                {errors.gender}
                            </p>
                        )}
                    </div>

                    {/* dob */}
                    <div className="space-y-2">
                        <label htmlFor="field_193" className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                            Tanggal Lahir
                        </label>
                        <input id="field_193"
                            type="date"
                            value={data.dob}
                            onChange={(e) => setData("dob", e.target.value)}
                            max={maxDob}
                            min="1900-01-01"
                            className="w-full px-5 py-3.5 rounded-xl border-slate-200 focus:border-[#40E0D0] focus:ring-[#40E0D0] bg-slate-50/50 text-sm font-medium text-slate-700"
                        />
                        {errors.dob && (
                            <p className="text-sm text-red-600 mt-1">
                                {errors.dob}
                            </p>
                        )}
                    </div>
                </div>

                {/* action buttons */}
                <div className="flex items-center justify-end gap-4 mt-12 pt-8 border-t border-slate-100">
                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm font-bold text-[#ED7218]">
                            Tersimpan.
                        </p>
                    </Transition>

                    <button
                        type="button"
                        onClick={handleCancel}
                        className="px-8 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition"
                    >
                        Batal
                    </button>

                    <button
                        type="submit"
                        disabled={processing}
                        className="px-8 py-3 rounded-xl bg-[#ED7218] text-white font-bold text-sm hover:bg-[#d66311] transition shadow-lg shadow-[#ED7218]/15 disabled:opacity-50"
                    >
                        {processing ? "Menyimpan..." : "Simpan Perubahan"}
                    </button>
                </div>
            </form>
        </section>
    );
}

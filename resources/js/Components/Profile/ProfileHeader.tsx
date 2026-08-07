import React, { useRef } from "react";
import { Camera, BadgeCheck } from "lucide-react";
import { router } from "@inertiajs/react";
import toast from "react-hot-toast";

export default function ProfileHeader({ user }: { user: any }) {
    // referensi untuk input file yang disembunyiin
    const fileInputRef = useRef<HTMLInputElement>(null);

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n: string) => n[0])
            .join("")
            .toUpperCase()
            .substring(0, 2);
    };

    // handle change photo
    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 2 * 1024 * 1024) {
                toast.error("Ukuran foto maksimal 2MB.");
                return;
            }

            const formData = new FormData();
            formData.append("photo", file);

            // kirim request ke backend untuk update foto profil
            router.post("/profile/photo", formData, {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success("Foto profil berhasil diperbarui!");
                },
                onError: () => {
                    toast.error("Gagal mengunggah foto profil.");
                },
            });
        }
    };

    return (
        <div className="bg-white rounded-3xl shadow-sm p-6 border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
                {/* avatar */}
                <div className="relative group">
                    <div className="w-19 h-19 rounded-full bg-[#F6F8EC] border border-slate-100 flex items-center justify-center text-2xl font-medium text-gray-900 shadow-sm overflow-hidden">
                        {user.profile_photo_path ? (
                            <img
                                src={`/storage/${user.profile_photo_path}`}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            getInitials(user.name)
                        )}
                    </div>

                    {/* input file untuk change pp (hidden) */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handlePhotoChange}
                    />

                    {/* change pp button */}
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-0 right-0 p-1.5 bg-[#245D56] rounded-full text-white cursor-pointer hover:bg-[#1a443f] transition shadow-sm"
                    >
                        <Camera className="w-3.5 h-3.5" />
                    </div>
                </div>

                {/* nama */}
                <div>
                    <div className="flex items-center gap-2">
                        <h2 className="text-xl md:text-2xl font-bold text-gray-950 tracking-tight">
                            {user.name}
                        </h2>
                        <BadgeCheck className="w-5 h-5 text-blue-500" />
                        <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
                            Verified
                        </span>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">
                        Pangandaran, Indonesia
                    </p>
                </div>
            </div>

            <button className="px-5 py-2.5 rounded-xl border-2 border-[#245D56] text-[#245D56] font-bold text-sm hover:bg-slate-50 transition">
                Ubah Akun
            </button>
        </div>
    );
}

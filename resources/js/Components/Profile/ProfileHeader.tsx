import React, { useRef, useState } from "react";
import { Camera, Loader2, CheckCircle2, Store, Shield } from "lucide-react";
import { router } from "@inertiajs/react";
import toast from "react-hot-toast";
import { compressImage } from "@/Utils/imageCompressor";

interface UserProfile {
    id: number;
    name: string;
    email: string;
    role?: string;
    profile_photo_path?: string | null;
    email_verified_at?: string | null;
    created_at?: string;
    store?: {
        name: string;
        slug: string;
    } | null;
}

interface ProfileHeaderProps {
    user: UserProfile;
    className?: string;
}

function getInitials(name: string): string {
    if (!name) return "U";
    return name
        .split(" ")
        .map((n) => n[0])
        .filter(Boolean)
        .join("")
        .toUpperCase()
        .substring(0, 2);
}

function formatJoinDate(dateStr?: string): string {
    if (!dateStr) return "Pelanggan Cibenda Mart";
    try {
        const date = new Date(dateStr);
        return `Member sejak ${date.toLocaleDateString("id-ID", {
            month: "short",
            year: "numeric",
        })}`;
    } catch {
        return "Pelanggan Cibenda Mart";
    }
}

export default function ProfileHeader({ user, className = "" }: ProfileHeaderProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files[0]) return;

        const rawFile = e.target.files[0];
        setIsUploading(true);

        try {
            // Instant client-side compression: converts 5MB-15MB phone photos into ~50KB-80KB in ~50ms
            const optimizedFile = await compressImage(rawFile, 600, 600, 0.85);

            // Instant local preview
            const tempPreview = URL.createObjectURL(optimizedFile);
            setPreviewUrl(tempPreview);

            const formData = new FormData();
            formData.append("photo", optimizedFile);

            router.post("/profile/photo", formData, {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success("Foto profil berhasil diperbarui!");
                    setIsUploading(false);
                },
                onError: () => {
                    toast.error("Gagal mengunggah foto profil. Coba lagi.");
                    setPreviewUrl(null);
                    setIsUploading(false);
                },
            });
        } catch (error) {
            console.error("Image compression error:", error);
            toast.error("Gagal memproses gambar.");
            setIsUploading(false);
        } finally {
            // Reset input so re-selecting same file triggers change
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const currentPhotoUrl = previewUrl || (user.profile_photo_path ? `/storage/${user.profile_photo_path}` : null);

    return (
        <div className={`bg-white rounded-2xl md:rounded-3xl border border-slate-200/80 shadow-sm p-4 md:p-6 transition-all ${className}`}>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 md:gap-6">
                {/* Avatar with Camera Trigger */}
                <div className="relative group shrink-0">
                    <div className="w-20 h-20 md:w-22 md:h-22 rounded-full ring-4 ring-orange-50 bg-gradient-to-tr from-slate-100 to-slate-200 flex items-center justify-center text-xl md:text-2xl font-bold text-gray-800 shadow-sm overflow-hidden select-none">
                        {currentPhotoUrl ? (
                            <img
                                src={currentPhotoUrl}
                                alt={user.name}
                                className={`w-full h-full object-cover transition-opacity duration-200 ${isUploading ? "opacity-40" : "opacity-100"}`}
                            />
                        ) : (
                            <span>{getInitials(user.name)}</span>
                        )}

                        {/* Uploading Overlay */}
                        {isUploading && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white">
                                <Loader2 className="w-6 h-6 animate-spin text-white" />
                            </div>
                        )}
                    </div>

                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/jpeg,image/png,image/webp,image/jpg"
                        onChange={handlePhotoChange}
                        disabled={isUploading}
                    />

                    {/* Camera Edit Button */}
                    <button
                        type="button"
                        aria-label="Ubah foto profil"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="absolute bottom-0 right-0 w-7 h-7 md:w-8 md:h-8 bg-[#ED7218] hover:bg-[#d66311] active:scale-95 disabled:opacity-50 rounded-full text-white flex items-center justify-center transition-all shadow-md cursor-pointer border-2 border-white"
                    >
                        {isUploading ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                            <Camera className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        )}
                    </button>
                </div>

                {/* User Info Details */}
                <div className="flex-1 text-center sm:text-left min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                        <h2 className="text-lg md:text-xl font-black text-gray-900 tracking-tight truncate max-w-full">
                            {user.name}
                        </h2>

                        {user.role === "pedagang" && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200/60">
                                <Store className="w-3 h-3" />
                                <span>Pedagang</span>
                            </span>
                        )}

                        {user.role === "admin" && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200/60">
                                <Shield className="w-3 h-3" />
                                <span>Admin</span>
                            </span>
                        )}
                    </div>

                    <p className="text-xs md:text-sm text-slate-500 font-medium truncate">
                        {user.email}
                    </p>

                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1 text-[11px] md:text-xs text-slate-500">
                        <span className="flex items-center gap-1 text-emerald-600 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            <span>{user.email_verified_at ? "Email Terverifikasi" : "Akun Aktif"}</span>
                        </span>
                        <span className="text-slate-300">•</span>
                        <span>{formatJoinDate(user.created_at)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

import React, { useState, useMemo } from "react";
import { useForm } from "@inertiajs/react";
import toast from "react-hot-toast";

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_REGEX = /^(\+62|62|08)[0-9]{7,13}$/;

export function useCreateMerchantForm() {
    const { data, setData, post, processing, errors } = useForm({
        merchant_name: "",
        owner_name: "",
        username: "",
        email: "",
        phone: "",
        password: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    // Client-side validation
    const fieldErrors = useMemo(() => {
        const errs: Record<string, string> = {};

        if (touched.merchant_name) {
            if (!data.merchant_name.trim()) {
                errs.merchant_name = "Nama toko wajib diisi.";
            } else if (data.merchant_name.trim().length < 3) {
                errs.merchant_name = "Nama toko minimal 3 karakter.";
            }
        }

        if (touched.owner_name) {
            if (!data.owner_name.trim()) {
                errs.owner_name = "Nama lengkap pemilik wajib diisi.";
            } else if (data.owner_name.trim().length < 3) {
                errs.owner_name = "Nama pemilik minimal 3 karakter.";
            }
        }

        if (touched.email) {
            if (!data.email.trim()) {
                errs.email = "Alamat email wajib diisi.";
            } else if (!EMAIL_REGEX.test(data.email.trim())) {
                errs.email = "Format email tidak valid (contoh: nama@domain.com).";
            }
        }

        if (touched.phone && data.phone.trim()) {
            if (!PHONE_REGEX.test(data.phone.trim())) {
                errs.phone =
                    "Gunakan format nomor telepon Indonesia (contoh: 081234567890 atau +6281234567890).";
            }
        }

        if (touched.password) {
            if (!data.password) {
                errs.password = "Password akun wajib diisi.";
            } else if (data.password.length < 8) {
                errs.password = "Password minimal terdiri dari 8 karakter.";
            }
        }

        if (touched.username && data.username.trim()) {
            if (data.username.trim().length < 3) {
                errs.username = "Username minimal 3 karakter.";
            } else if (!/^[a-z0-9_\-\.]+$/i.test(data.username.trim())) {
                errs.username = "Username hanya boleh huruf, angka, (-), (_), dan (.).";
            }
        }

        return errs;
    }, [data, touched]);

    // Input handlers with auto-sanitization
    const handleMerchantNameChange = (val: string) => {
        setData("merchant_name", val);
        if (!touched.username) {
            const autoSlug = val
                .toLowerCase()
                .replace(/[^a-z0-9]/g, "")
                .slice(0, 30);
            setData((prev) => ({ ...prev, merchant_name: val, username: autoSlug }));
        }
    };

    const handleOwnerNameChange = (val: string) => {
        setData("owner_name", val);
    };

    const handleUsernameChange = (val: string) => {
        const sanitized = val.toLowerCase().replace(/[^a-z0-9_\-\.]/g, "");
        setData("username", sanitized);
    };

    const handlePhoneChange = (val: string) => {
        let sanitized = val.replace(/[^0-9+]/g, "");
        if (sanitized.indexOf("+") > 0) {
            sanitized = sanitized.replace(/\+/g, "");
        }
        setData("phone", sanitized);
    };

    const handleGeneratePassword = () => {
        const uppers = "ABCDEFGHJKLMNPQRSTUVWXYZ";
        const lowers = "abcdefghijkmnpqrstuvwxyz";
        const numbers = "23456789";
        const specials = "!@#$%^&*";

        let gen = "";
        gen += uppers.charAt(Math.floor(Math.random() * uppers.length));
        gen += lowers.charAt(Math.floor(Math.random() * lowers.length));
        gen += numbers.charAt(Math.floor(Math.random() * numbers.length));
        gen += specials.charAt(Math.floor(Math.random() * specials.length));

        const all = uppers + lowers + numbers + specials;
        for (let i = 0; i < 8; i++) {
            gen += all.charAt(Math.floor(Math.random() * all.length));
        }

        gen = gen
            .split("")
            .sort(() => 0.5 - Math.random())
            .join("");

        setData("password", gen);
        setShowPassword(true);
        setTouched((prev) => ({ ...prev, password: true }));
        toast.success("Password aman berhasil dibuat dan diterapkan!");
    };

    const handleBlur = (field: string) => {
        setTouched((prev) => ({ ...prev, [field]: true }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        setTouched({
            merchant_name: true,
            owner_name: true,
            username: true,
            email: true,
            phone: true,
            password: true,
        });

        if (!data.merchant_name.trim()) {
            toast.error("Nama toko wajib diisi.");
            return;
        }

        if (!data.owner_name.trim()) {
            toast.error("Nama lengkap pemilik wajib diisi.");
            return;
        }

        if (!data.email.trim() || !EMAIL_REGEX.test(data.email.trim())) {
            toast.error("Alamat email tidak valid. Periksa kembali.");
            return;
        }

        if (data.phone.trim() && !PHONE_REGEX.test(data.phone.trim())) {
            toast.error("Format nomor telepon tidak sesuai.");
            return;
        }

        if (!data.password || data.password.length < 8) {
            toast.error("Password minimal 8 karakter.");
            return;
        }

        post(route("admin.merchants.store"), {
            onSuccess: () => {
                toast.success("Akun pedagang dan toko berhasil didaftarkan!");
            },
            onError: (errs) => {
                const firstErr = Object.values(errs)[0];
                toast.error(
                    typeof firstErr === "string"
                        ? firstErr
                        : "Gagal membuat akun pedagang. Periksa input formulir.",
                );
            },
        });
    };

    return {
        data,
        setData,
        errors,
        fieldErrors,
        processing,
        showPassword,
        setShowPassword,
        handleMerchantNameChange,
        handleOwnerNameChange,
        handleUsernameChange,
        handlePhoneChange,
        handleGeneratePassword,
        handleBlur,
        handleSubmit,
    };
}

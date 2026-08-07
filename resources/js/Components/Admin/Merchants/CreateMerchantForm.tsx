import React from "react";
import { Link } from "@inertiajs/react";
import { Eye, EyeOff, Sparkles, AlertCircle } from "lucide-react";
import PasswordStrengthMeter from "./PasswordStrengthMeter";
import { useCreateMerchantForm } from "@/Hooks/Admin/useCreateMerchantForm";

export default function CreateMerchantForm() {
    const {
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
    } = useCreateMerchantForm();

    return (
        <form onSubmit={handleSubmit} className="mt-8 space-y-6" noValidate>
            {/* Store Name */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-semibold text-gray-700">
                        Store Name <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[11px] text-gray-400">
                        Nama toko atau brand usaha pedagang
                    </span>
                </div>
                <div className="relative">
                    <input
                        type="text"
                        required
                        value={data.merchant_name}
                        onChange={(e) =>
                            handleMerchantNameChange(e.target.value)
                        }
                        onBlur={() => handleBlur("merchant_name")}
                        placeholder="Contoh: Toko Udin Sembako"
                        className={`w-full px-4 py-3 bg-[#EEF2F4]/60 border rounded-2xl text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:bg-white transition-all ${errors.merchant_name || fieldErrors.merchant_name
                            ? "border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 bg-rose-50/20"
                            : "border-gray-300/70 focus:border-[#41B9C5] focus:ring-1 focus:ring-[#41B9C5]"
                            }`}
                    />
                </div>
                {(errors.merchant_name || fieldErrors.merchant_name) && (
                    <p className="flex items-center gap-1.5 text-rose-500 text-[11px] mt-1.5 font-medium">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        {errors.merchant_name || fieldErrors.merchant_name}
                    </p>
                )}
            </div>

            {/* Owner Full Name & Store Username */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Owner Name */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-semibold text-gray-700">
                            Nama Pemilik (Owner Name) <span className="text-rose-500">*</span>
                        </label>
                        <span className="text-[11px] text-gray-400">
                            Nama lengkap penanggung jawab
                        </span>
                    </div>
                    <div className="relative">
                        <input
                            type="text"
                            required
                            value={data.owner_name}
                            onChange={(e) =>
                                handleOwnerNameChange(e.target.value)
                            }
                            onBlur={() => handleBlur("owner_name")}
                            placeholder="Contoh: Udin Sutarman"
                            className={`w-full px-4 py-3 bg-[#EEF2F4]/60 border rounded-2xl text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:bg-white transition-all ${errors.owner_name || fieldErrors.owner_name
                                ? "border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 bg-rose-50/20"
                                : "border-gray-300/70 focus:border-[#41B9C5] focus:ring-1 focus:ring-[#41B9C5]"
                                }`}
                        />
                    </div>
                    {(errors.owner_name || fieldErrors.owner_name) && (
                        <p className="flex items-center gap-1.5 text-rose-500 text-[11px] mt-1.5 font-medium">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            {errors.owner_name || fieldErrors.owner_name}
                        </p>
                    )}
                </div>

                {/* Username */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-semibold text-gray-700">
                            Store Username / URL Slug
                        </label>
                        {data.username && (
                            <span className="text-[11px] font-mono text-[#245D56] font-semibold bg-[#E6F8F9] px-2 py-0.5 rounded-lg border border-[#41B9C5]/30">
                                @{data.username}
                            </span>
                        )}
                    </div>
                    <div className="relative">
                        <input
                            type="text"
                            value={data.username}
                            onChange={(e) =>
                                handleUsernameChange(e.target.value)
                            }
                            onBlur={() => handleBlur("username")}
                            placeholder="tokoudin (otomatis dari nama toko)"
                            className={`w-full px-4 py-3 bg-[#EEF2F4]/60 border rounded-2xl text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:bg-white transition-all ${errors.username || fieldErrors.username
                                ? "border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 bg-rose-50/20"
                                : "border-gray-300/70 focus:border-[#41B9C5] focus:ring-1 focus:ring-[#41B9C5]"
                                }`}
                        />
                    </div>
                    {errors.username || fieldErrors.username ? (
                        <p className="flex items-center gap-1.5 text-rose-500 text-[11px] mt-1.5 font-medium">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            {errors.username || fieldErrors.username}
                        </p>
                    ) : (
                        <p className="text-[11px] text-gray-400 mt-1">
                            Pengenal unik toko (hanya huruf kecil dan angka).
                        </p>
                    )}
                </div>
            </div>

            {/* Email Address & Phone Number */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Email Address */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-semibold text-gray-700">
                            Email Address <span className="text-rose-500">*</span>
                        </label>
                        <span className="text-[11px] text-gray-400">
                            Untuk akses login portal
                        </span>
                    </div>
                    <div className="relative">
                        <input
                            type="email"
                            required
                            value={data.email}
                            onChange={(e) =>
                                setData("email", e.target.value)
                            }
                            onBlur={() => handleBlur("email")}
                            placeholder="pedagang@domain.com"
                            className={`w-full px-4 py-3 bg-[#EEF2F4]/60 border rounded-2xl text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:bg-white transition-all ${errors.email || fieldErrors.email
                                ? "border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 bg-rose-50/20"
                                : "border-gray-300/70 focus:border-[#41B9C5] focus:ring-1 focus:ring-[#41B9C5]"
                                }`}
                        />
                    </div>
                    {(errors.email || fieldErrors.email) && (
                        <p className="flex items-center gap-1.5 text-rose-500 text-[11px] mt-1.5 font-medium">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            {errors.email || fieldErrors.email}
                        </p>
                    )}
                </div>
                {/* Phone Number */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-semibold text-gray-700">
                            Phone Number
                        </label>
                        <span className="text-[11px] text-gray-400">
                            Hanya angka (08xxx / +62xxx)
                        </span>
                    </div>
                    <div className="relative">
                        <input
                            type="tel"
                            inputMode="numeric"
                            value={data.phone}
                            onChange={(e) =>
                                handlePhoneChange(e.target.value)
                            }
                            onBlur={() => handleBlur("phone")}
                            placeholder="081234567890"
                            className={`w-full px-4 py-3 bg-[#EEF2F4]/60 border rounded-2xl text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:bg-white transition-all ${errors.phone || fieldErrors.phone
                                ? "border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 bg-rose-50/20"
                                : "border-gray-300/70 focus:border-[#41B9C5] focus:ring-1 focus:ring-[#41B9C5]"
                                }`}
                        />
                    </div>
                    {(errors.phone || fieldErrors.phone) && (
                        <p className="flex items-center gap-1.5 text-rose-500 text-[11px] mt-1.5 font-medium">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            {errors.phone || fieldErrors.phone}
                        </p>
                    )}
                </div>
            </div>

            {/* Password */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-semibold text-gray-700">
                        Password <span className="text-rose-500">*</span>
                    </label>
                    <button
                        type="button"
                        onClick={handleGeneratePassword}
                        className="text-[11px] font-bold text-[#245D56] hover:text-[#41B9C5] flex items-center gap-1 transition-colors cursor-pointer"
                    >
                        <Sparkles className="w-3 h-3 text-[#41B9C5]" />
                        Auto-Generate Aman
                    </button>
                </div>
                <div className="relative">
                    <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={data.password}
                        onChange={(e) =>
                            setData("password", e.target.value)
                        }
                        onBlur={() => handleBlur("password")}
                        placeholder="Minimal 8 karakter"
                        className={`w-full pl-4 pr-11 py-3 bg-[#EEF2F4]/60 border rounded-2xl text-xs text-gray-800 font-mono placeholder:font-sans placeholder:text-gray-400 focus:outline-none focus:bg-white transition-all ${errors.password || fieldErrors.password
                            ? "border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 bg-rose-50/20"
                            : "border-gray-300/70 focus:border-[#41B9C5] focus:ring-1 focus:ring-[#41B9C5]"
                            }`}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors p-1"
                    >
                        {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                        ) : (
                            <Eye className="w-4 h-4" />
                        )}
                    </button>
                </div>

                {/* Modular Password Strength Meter */}
                <PasswordStrengthMeter password={data.password} />

                {(errors.password || fieldErrors.password) && (
                    <p className="flex items-center gap-1.5 text-rose-500 text-[11px] mt-1.5 font-medium">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        {errors.password || fieldErrors.password}
                    </p>
                )}
            </div>

            {/* Divider Line */}
            <div className="pt-4 border-t border-gray-200/70" />

            {/* Bottom Action Buttons */}
            <div className="flex items-center justify-end gap-3.5">
                <Link
                    href={route("admin.merchants.index")}
                    className="px-6 py-2.5 rounded-xl text-xs font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-all cursor-pointer shadow-2xs"
                >
                    Cancel
                </Link>
                <button
                    type="submit"
                    disabled={processing}
                    className="px-7 py-2.5 rounded-xl text-xs font-bold bg-[#319EA8] text-white hover:bg-[#28838c] transition-all cursor-pointer shadow-sm disabled:opacity-50 flex items-center gap-2"
                >
                    {processing ? "Submitting..." : "Submit"}
                </button>
            </div>
        </form>
    );
}

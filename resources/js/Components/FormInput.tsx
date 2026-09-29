import { InputHTMLAttributes, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    errorMessage?: string;
    required?: boolean;
}

export default function FormInput({
    label,
    errorMessage,
    required,
    className = "",
    id,
    type,
    ...props
}: FormInputProps) {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const inputId = id || `field_${label.toLowerCase().replace(/\s+/g, "_")}`;
    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
        <div className={className}>
            <label htmlFor={inputId} className="block text-sm font-semibold text-gray-800 mb-1 pl-1">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
                <input
                    id={inputId}
                    {...props}
                    type={inputType}
                    required={required}
                    className={`w-full bg-[#f8f9fa] border border-slate-200/80 rounded-xl px-4 py-3 text-gray-700 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue focus:bg-white focus:outline-none transition duration-300 shadow-sm ${
                        isPassword ? "pr-11" : ""
                    }`}
                />
                {isPassword && (
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
                )}
            </div>
            {errorMessage && (
                <p className="text-red-500 text-xs mt-1 pl-1">{errorMessage}</p>
            )}
        </div>
    );
}

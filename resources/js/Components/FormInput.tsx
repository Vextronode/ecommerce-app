import { InputHTMLAttributes } from "react";

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
    ...props
}: FormInputProps) {
    return (
        <div className={className}>
            <label className="block text-sm font-semibold text-gray-800 mb-1 pl-1">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
                {...props}
                required={required}
                className="w-full bg-[#f8f9fa] border-0 rounded-xl px-4 py-3 text-gray-700 focus:ring-2 focus:ring-[#245D56] focus:bg-white focus:outline-none transition-all duration-300 shadow-sm inset-shadow-sm"
            />
            {errorMessage && (
                <p className="text-red-500 text-xs mt-1 pl-1">{errorMessage}</p>
            )}
        </div>
    );
}

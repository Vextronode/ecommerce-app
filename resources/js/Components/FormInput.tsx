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
            <label htmlFor="field_18" className="block text-sm font-semibold text-gray-800 mb-1 pl-1">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input id="field_18"
                {...props}
                required={required}
                className="w-full bg-[#f8f9fa] border border-slate-200/80 rounded-xl px-4 py-3 text-gray-700 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue focus:bg-white focus:outline-none transition duration-300 shadow-sm"
            />
            {errorMessage && (
                <p className="text-red-500 text-xs mt-1 pl-1">{errorMessage}</p>
            )}
        </div>
    );
}

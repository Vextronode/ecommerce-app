import { ButtonHTMLAttributes } from "react";

export default function PrimaryButton({
    className = "",
    disabled,
    children,
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            {...props}
            disabled={disabled}
            className={`w-full bg-[#F77F00] hover:bg-[#ED7218] text-white font-bold rounded-2xl px-6 py-3 shadow-md transition duration-300 disabled:opacity-70 disabled:cursor-not-allowed ${className}`}
        >
            {children}
        </button>
    );
}

import { AlertCircle } from "lucide-react";

interface AuthErrorBannerProps {
    message?: string;
    className?: string;
}

export default function AuthErrorBanner({
    message,
    className = "",
}: AuthErrorBannerProps) {
    if (!message) return null;

    return (
        <div
            role="alert"
            aria-live="assertive"
            className={`animate-auth-banner flex items-start gap-3 rounded-2xl border border-brand-danger bg-brand-danger-tint px-4 py-3 ${className}`}
        >
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-brand-danger" />
            <p className="text-sm font-medium leading-relaxed text-brand-danger-dark">
                {message}
            </p>
        </div>
    );
}

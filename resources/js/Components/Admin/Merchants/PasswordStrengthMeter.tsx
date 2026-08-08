import React, { useMemo } from "react";
import { Check, X } from "lucide-react";

interface Props {
    password: string;
}

export default function PasswordStrengthMeter({ password }: Props) {
    const checks = useMemo(() => {
        return {
            length: password.length >= 8,
            hasUpper: /[A-Z]/.test(password),
            hasLower: /[a-z]/.test(password),
            hasNumber: /[0-9]/.test(password),
        };
    }, [password]);

    const strength = useMemo(() => {
        if (!password) return 0;
        let score = 0;
        if (checks.length) score += 25;
        if (checks.hasUpper) score += 25;
        if (checks.hasLower) score += 25;
        if (checks.hasNumber) score += 25;
        return score;
    }, [checks, password]);

    if (!password) return null;

    return (
        <div className="mt-2.5 p-3 rounded-2xl bg-gray-50/80 border border-gray-100 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-gray-500">
                    Kekuatan Password:
                </span>
                <span
                    className={`font-bold ${
                        strength <= 50
                            ? "text-rose-500"
                            : strength <= 75
                            ? "text-amber-500"
                            : "text-emerald-600"
                    }`}
                >
                    {strength <= 50
                        ? "Lemah"
                        : strength <= 75
                        ? "Sedang"
                        : "Kuat & Aman"}
                </span>
            </div>

            {/* Strength Bar */}
            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                    className={`h-full transition-all duration-300 ${
                        strength <= 50
                            ? "bg-rose-500"
                            : strength <= 75
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                    }`}
                    style={{ width: `${strength}%` }}
                />
            </div>

            {/* Checklist */}
            <div className="grid grid-cols-2 gap-1.5 pt-1 text-[10px]">
                <div
                    className={`flex items-center gap-1 ${
                        checks.length
                            ? "text-emerald-600 font-semibold"
                            : "text-gray-400"
                    }`}
                >
                    {checks.length ? (
                        <Check className="w-3 h-3" />
                    ) : (
                        <X className="w-3 h-3" />
                    )}
                    Minimal 8 karakter
                </div>
                <div
                    className={`flex items-center gap-1 ${
                        checks.hasNumber
                            ? "text-emerald-600 font-semibold"
                            : "text-gray-400"
                    }`}
                >
                    {checks.hasNumber ? (
                        <Check className="w-3 h-3" />
                    ) : (
                        <X className="w-3 h-3" />
                    )}
                    Ada angka (0-9)
                </div>
                <div
                    className={`flex items-center gap-1 ${
                        checks.hasUpper
                            ? "text-emerald-600 font-semibold"
                            : "text-gray-400"
                    }`}
                >
                    {checks.hasUpper ? (
                        <Check className="w-3 h-3" />
                    ) : (
                        <X className="w-3 h-3" />
                    )}
                    Huruf besar (A-Z)
                </div>
                <div
                    className={`flex items-center gap-1 ${
                        checks.hasLower
                            ? "text-emerald-600 font-semibold"
                            : "text-gray-400"
                    }`}
                >
                    {checks.hasLower ? (
                        <Check className="w-3 h-3" />
                    ) : (
                        <X className="w-3 h-3" />
                    )}
                    Huruf kecil (a-z)
                </div>
            </div>
        </div>
    );
}

import React, { useState, useEffect, InputHTMLAttributes } from "react";
import {
    parseRupiahInput,
    formatRupiahNumber,
    handleRupiahInputChange,
} from "@/utils/formatters";

export interface RupiahInputProps
    extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
    value: number | string | null | undefined;
    onChange?: (value: string | number) => void;
    onValueChange?: (raw: number, formatted: string) => void;
    prefix?: string;
    outputType?: "number" | "string";
}

export default function RupiahInput({
    value,
    onChange,
    onValueChange,
    prefix,
    className = "",
    placeholder = "0",
    outputType = "string",
    id,
    disabled,
    ...rest
}: RupiahInputProps) {
    const [displayVal, setDisplayVal] = useState<string>(() =>
        value !== undefined && value !== null && value !== ""
            ? formatRupiahNumber(value)
            : ""
    );

    // Sync state if external value changes (e.g. form reset or server response)
    useEffect(() => {
        const numericCurrent = parseRupiahInput(displayVal);
        const numericProp = parseRupiahInput(value);
        if (numericCurrent !== numericProp) {
            setDisplayVal(numericProp > 0 ? formatRupiahNumber(numericProp) : "");
        }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputStr = e.target.value;
        const { raw, formatted } = handleRupiahInputChange(inputStr);

        setDisplayVal(formatted);

        const emitted =
            raw === 0
                ? ""
                : outputType === "number"
                ? raw
                : String(raw);

        onChange?.(emitted);
        onValueChange?.(raw, formatted);
    };

    if (prefix) {
        return (
            <div className="relative w-full">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-xs select-none pointer-events-none">
                    {prefix}
                </span>
                <input
                    type="text"
                    inputMode="numeric"
                    id={id}
                    disabled={disabled}
                    value={displayVal}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className={`${className} pl-9`}
                    {...rest}
                />
            </div>
        );
    }

    return (
        <input
            type="text"
            inputMode="numeric"
            id={id}
            disabled={disabled}
            value={displayVal}
            onChange={handleChange}
            placeholder={placeholder}
            className={className}
            {...rest}
        />
    );
}


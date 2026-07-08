import React, { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";

interface SuggestionItem {
    display_name: string;
    lat: string;
    lon: string;
    address: any;
}

interface AddressSuggestionInputProps {
    label: string;
    value: string;
    placeholder: string;
    suggestions: SuggestionItem[];
    searchLoading: boolean;
    type: "input" | "textarea";
    activeDropdown: string | null;
    dropdownType: "provinsi" | "jalan";
    onChange: (val: string) => void;
    onSelect: (item: SuggestionItem) => void;
    setActiveDropdown: (type: any) => void;
}

export default function AddressSuggestionInput({
    label,
    value,
    placeholder,
    suggestions,
    searchLoading,
    type,
    activeDropdown,
    dropdownType,
    onChange,
    onSelect,
    setActiveDropdown,
}: AddressSuggestionInputProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function clickOutside(e: MouseEvent) {
            if (
                activeDropdown === dropdownType &&
                containerRef.current &&
                !containerRef.current.contains(e.target as Node)
            ) {
                setActiveDropdown(null);
            }
        }
        document.addEventListener("mousedown", clickOutside);
        return () => document.removeEventListener("mousedown", clickOutside);
    }, [activeDropdown, dropdownType, setActiveDropdown]);

    return (
        <div className="relative" ref={containerRef}>
            <label className="text-sm font-bold text-gray-700 mb-2 block">
                {label}
            </label>
            <div className="relative">
                {type === "input" ? (
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        required
                        placeholder={placeholder}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-[#245D56] text-sm bg-slate-50/50"
                    />
                ) : (
                    <textarea
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        required
                        rows={2}
                        placeholder={placeholder}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-[#245D56] text-sm bg-slate-50/50 resize-none"
                    ></textarea>
                )}
                {searchLoading && activeDropdown === dropdownType && (
                    <Loader2 className="w-4 h-4 animate-spin text-[#245D56] absolute right-4 top-3.5" />
                )}
            </div>

            {activeDropdown === dropdownType && suggestions.length > 0 && (
                <div className="absolute left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-slate-100 max-h-48 overflow-y-auto z-1000 divide-y divide-slate-50">
                    {(suggestions || []).map((item, idx) => (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => onSelect(item)}
                            className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-xs text-gray-700 truncate block"
                        >
                            {item.display_name}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

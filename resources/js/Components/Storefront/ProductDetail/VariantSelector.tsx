import React from "react";

interface Props {
    variants: any[];
    selectedVariants: Record<string, string>;
    onSelectVariant: (variantName: string, option: string) => void;
}

export default function VariantSelector({
    variants,
    selectedVariants,
    onSelectVariant,
}: Props) {
    // Kalau gaada varian, jangan render nanaon
    if (!variants || variants.length === 0) return null;

    return (
        <div className="flex flex-col gap-5 py-4 border-y border-gray-100 my-4">
            {variants.map((variant: any, idx: number) => (
                <div key={variant.name} className="flex flex-col gap-2.5">
                    <span className="text-sm font-extrabold text-gray-800">
                        {variant.name}
                    </span>
                    <div className="flex flex-wrap gap-2">
                        {variant.options.map((opt: any, oIdx: number) => {
                            const isSelected =
                                selectedVariants[variant.name] === opt.name;
                            return (
                                <button
                                    key={oIdx}
                                    onClick={() =>
                                        onSelectVariant(variant.name, opt.name)
                                    }
                                    className={`px-4 py-1.5 rounded-xl text-sm font-bold border transition-colors ${
                                        isSelected
                                            ? "bg-[#ED7218]/10 border-[#ED7218] text-[#ED7218]"
                                            : "bg-white border-gray-200 text-gray-600 hover:border-[#ED7218]/50 hover:bg-gray-50"
                                    }`}
                                >
                                    {opt.name}
                                </button>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}

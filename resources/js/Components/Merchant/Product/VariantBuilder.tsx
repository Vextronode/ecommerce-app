import React, { useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { VariantType } from "./ProductPreview";

interface Props {
    data: any;
    setData: (key: string, value: any) => void;
}

export default function VariantBuilder({ data, setData }: Props) {
    const [optionInputs, setOptionInputs] = useState<{ [key: number]: string }>(
        {},
    );

    const addVariant = () => {
        setData("variants", [...data.variants, { name: "", options: [] }]);
    };

    const removeVariant = (index: number) => {
        const newVariants = [...data.variants];
        newVariants.splice(index, 1);
        setData("variants", newVariants);
    };

    const updateVariantName = (index: number, name: string) => {
        const newVariants = [...data.variants];
        newVariants[index].name = name;
        setData("variants", newVariants);
    };

    const addOption = (index: number, e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const text = optionInputs[index]?.trim();
        if (!text) return;

        const newVariants = [...data.variants];
        if (!newVariants[index].options.includes(text)) {
            newVariants[index].options.push(text);
            setData("variants", newVariants);
        }
        setOptionInputs({ ...optionInputs, [index]: "" });
    };

    const removeOption = (vIndex: number, optIndex: number) => {
        const newVariants = [...data.variants];
        newVariants[vIndex].options.splice(optIndex, 1);
        setData("variants", newVariants);
    };

    return (
        <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h4 className="text-sm font-bold text-gray-800">
                        Varian Produk
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                        Tambahkan variasi seperti Ukuran, Warna, atau Jenis
                        Potongan.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={addVariant}
                    className="flex items-center gap-1 bg-[#E0F7FA] text-[#245D56] px-4 py-2 rounded-full text-xs font-bold hover:bg-[#41B9C5] hover:text-white transition-colors"
                >
                    <Plus className="w-4 h-4" /> Tambah Varian
                </button>
            </div>

            {data.variants.length > 0 ? (
                <div className="space-y-4">
                    {data.variants.map(
                        (variant: VariantType, vIndex: number) => (
                            <div
                                key={vIndex}
                                className="bg-gray-50 border border-gray-200 rounded-2xl p-4 relative"
                            >
                                <button
                                    type="button"
                                    onClick={() => removeVariant(vIndex)}
                                    className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>

                                <div className="mb-3 pr-8">
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                        Nama Tipe Varian
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Contoh: Ukuran, Warna, Potongan..."
                                        value={variant.name}
                                        onChange={(e) =>
                                            updateVariantName(
                                                vIndex,
                                                e.target.value,
                                            )
                                        }
                                        className="w-full md:w-1/2 px-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#41B9C5]/50 outline-none text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                                        Pilihan (Options)
                                    </label>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {variant.options.map(
                                            (opt, optIndex) => (
                                                <div
                                                    key={optIndex}
                                                    className="bg-white border border-gray-300 px-3 py-1 rounded-full text-xs font-medium text-gray-700 flex items-center gap-2 shadow-sm"
                                                >
                                                    {opt}
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeOption(
                                                                vIndex,
                                                                optIndex,
                                                            )
                                                        }
                                                        className="text-gray-400 hover:text-red-500"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ),
                                        )}
                                    </div>

                                    <div className="flex gap-2 w-full md:w-1/2">
                                        <input
                                            type="text"
                                            placeholder="Contoh: XL, Merah, Fillet..."
                                            value={optionInputs[vIndex] || ""}
                                            onChange={(e) =>
                                                setOptionInputs({
                                                    ...optionInputs,
                                                    [vIndex]: e.target.value,
                                                })
                                            }
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault();
                                                    addOption(vIndex);
                                                }
                                            }}
                                            className="flex-1 px-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#41B9C5]/50 outline-none text-sm"
                                        />
                                        <button
                                            type="button"
                                            onClick={(e) =>
                                                addOption(vIndex, e)
                                            }
                                            className="bg-gray-800 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-gray-700 transition-colors"
                                        >
                                            Tambah
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ),
                    )}
                </div>
            ) : (
                <div className="text-center py-6 bg-gray-50 border border-dashed border-gray-300 rounded-2xl">
                    <p className="text-sm text-gray-500 font-medium">
                        Belum ada varian. Produk akan dijual dengan harga
                        tunggal.
                    </p>
                </div>
            )}
        </div>
    );
}

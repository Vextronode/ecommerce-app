import React from "react";

interface SkuType {
    variant_name: string;
    price: string | number;
    stock: string | number;
}

interface Props {
    data: any;
    setData: (key: string, value: any) => void;
}

export default function SkuMatrix({ data, setData }: Props) {
    // klo gaada SKU yang kegenerate, jangan tampilin tabelnya
    if (!data.skus || data.skus.length === 0) return null;

    const updateSku = (index: number, field: keyof SkuType, value: string) => {
        const newSkus = [...data.skus];
        newSkus[index][field] = value;
        setData("skus", newSkus);
    };

    return (
        <div className="mt-6 border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h4 className="text-sm font-bold text-gray-800">
                    Detail Harga & Stok Varian
                </h4>
                <p className="text-xs text-gray-500">
                    Atur harga dan stok untuk masing-masing kombinasi.
                </p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                        <tr>
                            <th className="px-4 py-3">Kombinasi Varian</th>
                            <th className="px-4 py-3 w-48">Harga (Rp)</th>
                            <th className="px-4 py-3 w-32">Stok</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {data.skus.map((sku: SkuType, index: number) => (
                            <tr
                                key={sku.variant_name || index}
                                className="hover:bg-gray-50/50 transition-colors"
                            >
                                <td className="px-4 py-3 font-medium text-gray-800">
                                    {sku.variant_name}
                                </td>
                                <td className="px-4 py-3">
                                    <input aria-label="Input field"
                                        type="number"
                                        placeholder="Harga..."
                                        value={sku.price}
                                        onChange={(e) =>
                                            updateSku(
                                                index,
                                                "price",
                                                e.target.value,
                                            )
                                        }
                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#41B9C5]/50 outline-none text-sm"
                                        required
                                    />
                                </td>
                                <td className="px-4 py-3">
                                    <input aria-label="Input field"
                                        type="number"
                                        placeholder="Stok..."
                                        value={sku.stock}
                                        onChange={(e) =>
                                            updateSku(
                                                index,
                                                "stock",
                                                e.target.value,
                                            )
                                        }
                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#41B9C5]/50 outline-none text-sm"
                                        required
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

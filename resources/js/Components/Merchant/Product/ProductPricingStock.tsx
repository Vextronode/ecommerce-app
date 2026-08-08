import React from "react";
import { MessageCircleWarning } from "lucide-react";

interface Props {
    data: any;
    setData: (key: string, value: any) => void;
    errors: any;
    hasVariants: boolean;
}

export default function ProductPricingStock({
    data,
    setData,
    errors,
    hasVariants,
}: Props) {
    const currentUnit = data.unit || "";
    const match = currentUnit.match(/^([\d.,]*)\s*(.*)$/);
    const amount = match ? match[1] : "";
    const type = match && match[2] ? match[2] : "pcs";

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newAmount = e.target.value;
        setData("unit", `${newAmount} ${type}`.trim());
    };

    const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newType = e.target.value;
        setData("unit", `${amount} ${newType}`.trim());
    };

    return (
        <div className="mb-8 border-b border-gray-100 pb-8">
            {hasVariants ? (
                <div className="bg-[#E0F7FA] border border-[#41B9C5]/30 p-4 rounded-xl flex gap-3 items-start">
                    <span className="text-[#41B9C5] text-xl leading-none mt-2">
                        <MessageCircleWarning />
                    </span>
                    <div>
                        <p className="text-sm font-bold text-[#245D56] mb-1">
                            Harga dan Stok Mengikuti Varian
                        </p>
                        <p className="text-xs text-[#245D56]/80">
                            Karena Anda mengaktifkan Varian Produk, Harga Dasar
                            dan Total Stok akan dihitung secara otomatis dari
                            tabel Detail Harga & Stok di bawah.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Harga */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Harga Dasar (Rp)
                        </label>
                        <input
                            type="number"
                            placeholder="Harga dasar produk"
                            value={data.price}
                            onChange={(e) => setData("price", e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#41B9C5]/50 outline-none text-sm transition-all bg-white"
                            required={!hasVariants}
                        />
                        {errors.price && (
                            <p className="text-red-500 text-xs mt-1">
                                {errors.price}
                            </p>
                        )}
                    </div>

                    {/* Stok */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Total Stok
                        </label>
                        <input
                            type="number"
                            placeholder="Jumlah stok tersedia"
                            value={data.stock}
                            onChange={(e) => setData("stock", e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#41B9C5]/50 outline-none text-sm transition-all bg-white"
                            required={!hasVariants}
                        />
                        {errors.stock && (
                            <p className="text-red-500 text-xs mt-1">
                                {errors.stock}
                            </p>
                        )}
                    </div>

                    {/* Unit */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-semibold text-gray-700">
                                Satuan Jual
                            </label>
                            <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">
                                Opsional
                            </span>
                        </div>

                        {/* Form Qty dan Deropdown */}
                        <div className="flex w-full rounded-xl border border-gray-200 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-[#41B9C5]/50 transition-all shadow-sm">
                            <input
                                type="number"
                                placeholder="Misal: 1, 500"
                                value={amount}
                                onChange={handleAmountChange}
                                className="w-full px-4 py-3 outline-none border-transparent focus:border-transparent focus:ring-0 text-sm font-medium text-gray-700"
                            />

                            {/* Dropdown */}
                            <div className="bg-slate-50 border-l border-gray-200 flex items-center shrink-0">
                                <select
                                    value={type}
                                    onChange={handleTypeChange}
                                    className="h-full pl-4 pr-8 py-3 outline-none bg-transparent border-transparent focus:border-transparent focus:ring-0 text-sm font-bold text-gray-600 appearance-none cursor-pointer"
                                    style={{
                                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                                        backgroundPosition: `right 0.5rem center`,
                                        backgroundRepeat: `no-repeat`,
                                        backgroundSize: `1.5em 1.5em`,
                                    }}
                                >
                                    <option value="pcs">Pcs / Ekor</option>
                                    <option value="kg">kg</option>
                                    <option value="gr">gr</option>
                                    <option value="ikat">ikat</option>
                                    <option value="liter">Liter</option>
                                    <option value="pack">pack</option>
                                </select>
                            </div>
                        </div>

                        {errors.unit && (
                            <p className="text-red-500 text-xs mt-1">
                                {errors.unit}
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

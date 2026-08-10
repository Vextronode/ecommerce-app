import React from "react";
import { Clock } from "lucide-react";

interface Props {
    data: any;
    setData: (key: string, value: any) => void;
}

export default function ProductPreorder({ data, setData }: Props) {
    return (
        <div className="mb-8 border-b border-gray-100 pb-8 mt-8">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#41B9C5]" />
                        Pre-Order (PO)
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                        Aktifkan jika produk butuh waktu proses/tangkapan.
                    </p>
                </div>
                <label htmlFor="field_22" className="relative inline-flex items-center cursor-pointer">
                    <input aria-label="Tampilkan rincian lebih lanjut" id="field_22"
                        type="checkbox"
                        className="sr-only peer"
                        checked={data.is_preorder}
                        onChange={(e) =>
                            setData("is_preorder", e.target.checked)
                        }
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition peer-checked:bg-[#41B9C5]"></div>
                </label>
            </div>

            {data.is_preorder && (
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-200">
                    <div>
                        <label htmlFor="field_38" className="block text-xs font-semibold text-gray-700 mb-1">
                            Waktu (Hari)
                        </label>
                        <input id="field_38"
                            type="number"
                            min="0"
                            value={data.po_days}
                            onChange={(e) => setData("po_days", e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#41B9C5]/50 outline-none text-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="field_50" className="block text-xs font-semibold text-gray-700 mb-1">
                            Waktu (Jam)
                        </label>
                        <input id="field_50"
                            type="number"
                            min="0"
                            max="23"
                            value={data.po_hours}
                            onChange={(e) =>
                                setData("po_hours", e.target.value)
                            }
                            className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#41B9C5]/50 outline-none text-sm"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

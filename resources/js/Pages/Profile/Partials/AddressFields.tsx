import React from "react";

export default function AddressFields({
    data,
    setData,
}: {
    data: any;
    setData: any;
}) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
                <label htmlFor="field_13" className="text-sm font-bold text-gray-700 mb-2 block">
                    Nama Lengkap
                </label>
                <input aria-label="Input field" id="field_13"
                    type="text"
                    value={data.recipient_name}
                    onChange={(e) => setData("recipient_name", e.target.value)}
                    required
                    placeholder="Nama"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-[#245D56] text-sm"
                />
            </div>
            <div>
                <label htmlFor="field_26" className="text-sm font-bold text-gray-700 mb-2 block">
                    Mobile Number
                </label>
                <div className="flex">
                    <span className="inline-flex items-center px-4 rounded-l-xl border border-r-0 border-slate-200 bg-slate-50 text-slate-500 text-sm font-bold">
                        +62
                    </span>
                    <input aria-label="Input field" id="field_26"
                        type="number"
                        value={data.phone}
                        onChange={(e) => setData("phone", e.target.value)}
                        required
                        placeholder="81234567890"
                        className="flex-1 px-4 py-3 rounded-r-xl border border-slate-200 focus:ring-[#245D56] text-sm"
                    />
                </div>
            </div>
        </div>
    );
}

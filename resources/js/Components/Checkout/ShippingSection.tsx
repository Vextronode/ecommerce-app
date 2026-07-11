import React from "react";
import { MapPin } from "lucide-react";

interface Props {
    data: any;
    setData: (field: string, value: string) => void;
    errors: any;
}

export default function ShippingSection({ data, setData, errors }: Props) {
    return (
        <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
                <MapPin className="w-6 h-6 text-[#245D56]" />
                <h2 className="text-xl font-bold text-gray-900">
                    Shipping Details
                </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                    <label className="text-xs font-bold text-slate-500 mb-2 block">
                        Full Name
                    </label>
                    <input
                        type="text"
                        value={data.name}
                        onChange={(e) => setData("name", e.target.value)}
                        className={`w-full px-4 py-3 rounded-xl border-slate-200 focus:ring-[#40E0D0] focus:border-[#40E0D0] text-sm font-medium ${errors.name ? "border-red-500" : ""}`}
                    />
                    {errors.name && (
                        <span className="text-red-500 text-xs mt-1">
                            {errors.name}
                        </span>
                    )}
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-500 mb-2 block">
                        Phone Number
                    </label>
                    <input
                        type="text"
                        value={data.phone}
                        onChange={(e) => setData("phone", e.target.value)}
                        className={`w-full px-4 py-3 rounded-xl border-slate-200 focus:ring-[#40E0D0] focus:border-[#40E0D0] text-sm font-medium ${errors.phone ? "border-red-500" : ""}`}
                    />
                    {errors.phone && (
                        <span className="text-red-500 text-xs mt-1">
                            {errors.phone}
                        </span>
                    )}
                </div>
                <div className="md:col-span-2">
                    <label className="text-xs font-bold text-slate-500 mb-2 block">
                        Full Address
                    </label>
                    <textarea
                        rows={3}
                        value={data.address}
                        onChange={(e) => setData("address", e.target.value)}
                        placeholder="Street name, building, house number..."
                        className={`w-full px-4 py-3 rounded-xl border-slate-200 focus:ring-[#40E0D0] focus:border-[#40E0D0] text-sm font-medium resize-none ${errors.address ? "border-red-500" : ""}`}
                    ></textarea>
                    {errors.address && (
                        <span className="text-red-500 text-xs mt-1">
                            {errors.address}
                        </span>
                    )}
                </div>
            </div>
        </section>
    );
}

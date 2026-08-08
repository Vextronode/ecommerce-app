import { MapPin } from "lucide-react";

interface Props {
    location: string;
    name: string;
    price: number | string;
    unit: string;
}

export default function ProductSummary({ location, name, price, unit }: Props) {
    return (
        <div className="flex flex-col">
            {/* lokasi */}
            <div className="flex items-center justify-end text-gray-500 text-sm mb-4">
                <MapPin className="w-4 h-4 mr-1 text-[#40E0D0]" /> {location}
            </div>

            {/* title */}
            <h1 className="text-3xl md:text-[2.5rem] font-bold text-gray-900 leading-tight mb-4 tracking-tight">
                {name}
            </h1>

            {/* price */}
            <div className="flex items-baseline gap-2 mb-6">
                <span className="text-3xl font-black text-[#1a443f]">
                    Rp{" "}
                    {typeof price === "number"
                        ? price.toLocaleString("id-ID")
                        : price}
                </span>
                <span className="text-gray-500 font-medium">/ {unit}</span>
            </div>
        </div>
    );
}

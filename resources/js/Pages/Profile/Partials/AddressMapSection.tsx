import React from "react";
import { MapPin } from "lucide-react";

interface AddressMapSectionProps {
    mapContainerRef: React.RefObject<HTMLDivElement>;
    isLocating: boolean;
    onGetLocation: () => void;
}

export default function AddressMapSection({
    mapContainerRef,
    isLocating,
    onGetLocation,
}: AddressMapSectionProps) {
    return (
        <div className="w-full h-44 bg-slate-100 rounded-xl relative overflow-hidden border border-slate-200 z-0">
            <div ref={mapContainerRef} className="w-full h-full z-10"></div>

            <button
                type="button"
                onClick={onGetLocation}
                disabled={isLocating}
                className="absolute bottom-3 left-3 z-400 flex items-center gap-2 text-blue-700 font-bold bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-md hover:bg-white transition text-xs disabled:opacity-70"
            >
                <MapPin className="w-4 h-4" />
                {isLocating ? "Mencari..." : "Gunakan Lokasi Saat Ini"}
            </button>
        </div>
    );
}

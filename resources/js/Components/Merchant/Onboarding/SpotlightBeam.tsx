import React from "react";
import { Sparkles } from "lucide-react";
import { SpotlightRect } from "@/types/tour";

interface SpotlightBeamProps {
    spotlightRect: SpotlightRect | null;
    label?: string;
}

export const SpotlightBeam: React.FC<SpotlightBeamProps> = ({
    spotlightRect,
    label = "Fokus Misi",
}) => {
    if (!spotlightRect) {
        return (
            <div
                aria-hidden="true"
                className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-40 transition-opacity duration-300"
            />
        );
    }

    return (
        <div
            aria-hidden="true"
            style={{
                top: `${spotlightRect.top}px`,
                left: `${spotlightRect.left}px`,
                width: `${spotlightRect.width}px`,
                height: `${spotlightRect.height}px`,
            }}
            className="fixed z-40 pointer-events-none rounded-2xl border-2 border-brand-orange shadow-[0_0_0_9999px_rgba(15,23,42,0.80),0_0_35px_8px_rgba(250,130,50,0.65)] transition-all duration-300 ease-out"
        >
            <div className="absolute -top-3.5 left-4 px-2.5 py-0.5 rounded-full bg-brand-orange text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-brand-orange/40 animate-pulse">
                <Sparkles className="w-3 h-3 text-white" />
                <span>{label}</span>
            </div>
        </div>
    );
};

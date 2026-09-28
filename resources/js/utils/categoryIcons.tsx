import React from "react";
import {
    Fish,
    Leaf,
    Drumstick,
    Wheat,
    Flame,
    Shirt,
    Package,
} from "lucide-react";

export const renderCategoryIcon = (slugOrName: string, size = 15, className = "") => {
    const s = slugOrName.toLowerCase();
    if (s.includes("seafood") || s.includes("ikan") || s.includes("laut")) {
        return <Fish size={size} className={className || "text-sky-600"} />;
    }
    if (s.includes("sayur")) {
        return <Leaf size={size} className={className || "text-emerald-600"} />;
    }
    if (s.includes("daging") || s.includes("ternak")) {
        return <Drumstick size={size} className={className || "text-rose-600"} />;
    }
    if (s.includes("sembako") || s.includes("pokok")) {
        return <Wheat size={size} className={className || "text-amber-600"} />;
    }
    if (s.includes("bumbu") || s.includes("rempah")) {
        return <Flame size={size} className={className || "text-orange-600"} />;
    }
    if (s.includes("pakaian") || s.includes("baju")) {
        return <Shirt size={size} className={className || "text-indigo-600"} />;
    }
    return <Package size={size} className={className || "text-slate-600"} />;
};

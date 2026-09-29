import React from "react";
import { Link } from "@inertiajs/react";

export default function Pagination({ pagination }: { pagination: any }) {
    if (!pagination || !pagination.links || pagination.links.length <= 3)
        return null;

    return (
        <div className="p-4 md:p-6 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs md:text-sm text-gray-500">
                Menampilkan{" "}
                <span className="font-semibold text-gray-700">
                    {pagination.from || 0}
                </span>{" "}
                sampai{" "}
                <span className="font-semibold text-gray-700">
                    {pagination.to || 0}
                </span>{" "}
                dari{" "}
                <span className="font-semibold text-gray-700">
                    {pagination.total || 0}
                </span>{" "}
                data
            </p>
            <div className="flex items-center gap-1.5">
                {pagination.links.map((link: any, idx: number) => {
                    let label = link.label;
                    if (label.includes("Previous") || label.includes("&laquo;")) label = "‹";
                    if (label.includes("Next") || label.includes("&raquo;")) label = "›";

                    return link.url ? (
                        <Link
                            key={idx}
                            href={link.url}
                            className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs md:text-sm font-semibold transition-colors ${
                                link.active
                                    ? "bg-brand-orange text-white shadow-sm shadow-brand-orange/30"
                                    : "hover:bg-brand-orange-tint hover:text-brand-orange text-gray-600 border border-transparent hover:border-brand-orange/20"
                            }`}
                        >
                            {label}
                        </Link>
                    ) : (
                        <span
                            key={idx}
                            className="w-8 h-8 flex items-center justify-center text-gray-300 text-xs md:text-sm"
                        >
                            {label}
                        </span>
                    );
                })}
            </div>
        </div>
    );
}

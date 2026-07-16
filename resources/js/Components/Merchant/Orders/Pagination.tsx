import React from "react";
import { Link } from "@inertiajs/react";

export default function Pagination({ pagination }: { pagination: any }) {
    if (!pagination || !pagination.links || pagination.links.length <= 3)
        return null;

    return (
        <div className="p-6 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
                Showing{" "}
                <span className="font-medium text-gray-700">
                    {pagination.from || 0}
                </span>{" "}
                to{" "}
                <span className="font-medium text-gray-700">
                    {pagination.to || 0}
                </span>{" "}
                of{" "}
                <span className="font-medium text-gray-700">
                    {pagination.total || 0}
                </span>{" "}
                entries
            </p>
            <div className="flex items-center gap-1">
                {pagination.links.map((link: any, idx: number) => {
                    let label = link.label;
                    if (label.includes("Previous")) label = "‹";
                    if (label.includes("Next")) label = "›";

                    return link.url ? (
                        <Link
                            key={idx}
                            href={link.url}
                            className={`w-8 h-8 flex items-center justify-center rounded text-sm font-medium transition-colors ${
                                link.active
                                    ? "bg-[#14433D] text-white"
                                    : "hover:bg-gray-50 text-gray-600 border border-transparent hover:border-gray-200"
                            }`}
                            dangerouslySetInnerHTML={{ __html: label }}
                        />
                    ) : (
                        <span
                            key={idx}
                            className="w-8 h-8 flex items-center justify-center text-gray-400 text-sm"
                            dangerouslySetInnerHTML={{ __html: label }}
                        />
                    );
                })}
            </div>
        </div>
    );
}

import React from "react";
import { Link } from "@inertiajs/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ data }: { data: any }) {
    if (!data) return null;

    return (
        <div className="mt-4 px-4 md:px-6 py-4 border border-[#41B9C5]/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 bg-white shadow-sm">
            <span className="text-[10px] md:text-xs font-medium text-gray-500">
                Showing{" "}
                <span className="text-[#41B9C5] font-bold">
                    {data.from || 0}
                </span>{" "}
                to{" "}
                <span className="text-[#41B9C5] font-bold">{data.to || 0}</span>{" "}
                of{" "}
                <span className="text-[#41B9C5] font-bold">
                    {data.total || 0}
                </span>{" "}
                results
            </span>

            {data.links && data.links.length > 3 && (
                <div className="flex items-center gap-1">
                    {data.links.map((link: any, index: number) => {
                        const isPrev = link.label.includes("Previous");
                        const isNext = link.label.includes("Next");

                        if (isPrev) {
                            return (
                                <Link
                                    key={link.label}
                                    href={link.url || "#"}
                                    preserveState
                                    className={`p-1 ${
                                        link.url
                                            ? "text-gray-400 hover:text-[#41B9C5]"
                                            : "text-gray-300 pointer-events-none"
                                    }`}
                                >
                                    <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
                                </Link>
                            );
                        }

                        if (isNext) {
                            return (
                                <Link
                                    key={link.label}
                                    href={link.url || "#"}
                                    preserveState
                                    className={`p-1 ${
                                        link.url
                                            ? "text-gray-400 hover:text-[#41B9C5]"
                                            : "text-gray-300 pointer-events-none"
                                    }`}
                                >
                                    <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                                </Link>
                            );
                        }

                        return (
                            <Link
                                key={link.label}
                                href={link.url || "#"}
                                preserveState
                                className={`w-6 h-6 md:w-7 md:h-7 rounded-md text-[10px] md:text-xs font-bold flex items-center justify-center transition-colors ${
                                    link.active
                                        ? "bg-[#E0F7FA] border border-[#41B9C5] text-[#41B9C5]"
                                        : "bg-white text-gray-500 hover:bg-gray-50 border border-transparent"
                                } ${!link.url && "pointer-events-none opacity-50"}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
}

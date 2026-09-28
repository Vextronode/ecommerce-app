import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { formatNumberEn } from '@/utils/formatters';
import { formatPaginationLabel } from '@/utils/formatPaginationLabel';

interface LinkType {
    url: string | null;
    label: string;
    active: boolean;
}

interface CustomerPaginationProps {
    from: number;
    to: number;
    total: number;
    links: LinkType[];
}

export default function CustomerPagination({ from, to, total, links }: CustomerPaginationProps) {
    if (!links || links.length <= 3) return null;

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-white border-t border-gray-100 gap-4">
            <div className="text-xs md:text-sm text-gray-500 font-medium">
                Menampilkan <span className="font-semibold text-gray-700">{from || 0}</span> sampai{" "}
                <span className="font-semibold text-gray-700">{to || 0}</span> dari{" "}
                <span className="font-semibold text-gray-700">{formatNumberEn(total)}</span> data
            </div>

            <div className="flex items-center gap-1.5">
                {links.map((link, i) => {
                    const isPrevious = link.label.includes('Previous') || link.label.includes('&laquo;');
                    const isNext = link.label.includes('Next') || link.label.includes('&raquo;');
                    const isDots = link.label === '...';

                    if (isPrevious || isNext) {
                        return (
                            <Link
                                key={link.label + i}
                                href={link.url || '#'}
                                className={`w-8 h-8 flex items-center justify-center rounded-lg border ${
                                    link.url
                                        ? 'border-gray-200 text-gray-600 hover:bg-brand-orange-tint hover:border-brand-orange/30 hover:text-brand-orange cursor-pointer'
                                        : 'border-transparent text-gray-300 cursor-not-allowed pointer-events-none'
                                } transition-colors`}
                                preserveScroll
                                preserveState
                                as={link.url ? 'a' : 'button'}
                                disabled={!link.url}
                            >
                                {isPrevious ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </Link>
                        );
                    }

                    return (
                        <Link
                            key={link.label + i}
                            href={link.url || '#'}
                            className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs md:text-sm font-bold transition-colors ${
                                link.active
                                    ? 'bg-brand-orange text-white shadow-sm shadow-brand-orange/30'
                                    : isDots
                                        ? 'text-gray-400 cursor-default pointer-events-none'
                                        : 'text-gray-600 hover:bg-brand-orange-tint hover:text-brand-orange'
                            }`}
                            preserveScroll
                            preserveState
                            as={link.url ? 'a' : 'button'}
                        >
                            <span>{formatPaginationLabel(link.label)}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}

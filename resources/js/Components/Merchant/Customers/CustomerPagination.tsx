import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from '@inertiajs/react';

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
    if (links.length <= 3) return null;

    return (
        <div className="flex items-center justify-between px-6 py-5 bg-white border-t border-gray-100 rounded-b-2xl">
            <div className="text-[13px] text-gray-500 font-medium">
                Showing {from || 0} to {to || 0} of {new Intl.NumberFormat('en-US').format(total)} entries
            </div>
            
            <div className="flex items-center gap-1.5">
                {links.map((link, i) => {
                    const isPrevious = link.label.includes('Previous');
                    const isNext = link.label.includes('Next');
                    const isDots = link.label === '...';

                    if (isPrevious || isNext) {
                        return (
                            <Link
                                key={i}
                                href={link.url || '#'}
                                className={`p-2 rounded-lg border ${link.url ? 'border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300' : 'border-transparent text-gray-300 cursor-not-allowed'} transition-all`}
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
                            key={i}
                            href={link.url || '#'}
                            className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-all ${
                                link.active 
                                    ? 'bg-[#14433D] text-white shadow-md' 
                                    : isDots 
                                        ? 'text-gray-400 cursor-default pointer-events-none' 
                                        : 'text-gray-600 hover:bg-gray-100'
                            }`}
                            preserveScroll
                            preserveState
                            as={link.url ? 'a' : 'button'}
                        >
                            <span dangerouslySetInnerHTML={{ __html: link.label }} />
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}

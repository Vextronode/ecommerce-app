import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface Props {
    currentFilter: string;
    onFilterChange: (filter: string) => void;
}

export default function StoreFilters({ currentFilter, onFilterChange }: Props) {
    const isHarga = currentFilter === 'harga_rendah' || currentFilter === 'harga_tinggi';
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleHargaClick = (filter: string) => {
        onFilterChange(filter);
        setIsOpen(false);
    };

    return (
        <div className="bg-white/50 border border-gray-100 rounded-xl p-2 flex flex-wrap items-center gap-3 w-full">
            <span className="text-sm font-medium text-gray-600 px-3 whitespace-nowrap">Berdasarkan</span>
            
            <div className="flex flex-wrap items-center gap-2">
                {['populer', 'terbaru', 'terlaris'].map(filter => (
                    <button
                        key={filter}
                        onClick={() => onFilterChange(filter)}
                        className={`px-5 py-2 rounded-md text-sm font-medium transition-colors ${
                            currentFilter === filter 
                            ? "bg-white text-gray-900 shadow-sm" 
                            : "bg-transparent text-gray-600 hover:bg-gray-200"
                        }`}
                    >
                        {filter.charAt(0).toUpperCase() + filter.slice(1)}
                    </button>
                ))}
                
                {/* Harga Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button 
                        onClick={() => setIsOpen(!isOpen)}
                        className={`px-5 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${
                            isHarga || isOpen
                            ? "bg-white text-gray-900 shadow-sm" 
                            : "bg-white/50 text-gray-600 hover:bg-gray-200"
                        }`}
                    >
                        Harga
                        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {/* Dropdown Menu */}
                    <div className={`absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-100 transition z-20 overflow-hidden ${
                        isOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
                    }`}>
                        <button 
                            onClick={() => handleHargaClick('harga_rendah')}
                            className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 ${currentFilter === 'harga_rendah' ? 'text-brand-teal font-bold bg-teal-50/30' : 'text-gray-700'}`}
                        >
                            Rendah ke Tinggi
                        </button>
                        <button 
                            onClick={() => handleHargaClick('harga_tinggi')}
                            className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 ${currentFilter === 'harga_tinggi' ? 'text-brand-teal font-bold bg-teal-50/30' : 'text-gray-700'}`}
                        >
                            Tinggi ke Rendah
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

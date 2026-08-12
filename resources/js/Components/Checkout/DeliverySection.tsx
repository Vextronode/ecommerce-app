import React from 'react';
import { Truck, ShieldCheck } from 'lucide-react';

interface Props {
    selected: string;
    onSelect: (val: string) => void;
    deliveryFee: number;
}

export default function DeliverySection({ selected, onSelect, deliveryFee }: Props) {
    return (
        <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
                <Truck className="w-6 h-6 text-[#ED7218]" />
                <h2 className="text-xl font-bold text-gray-900">Metode Pengiriman</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.click(); }}
                    onClick={() => onSelect('local_delivery')}
                    className={`relative p-5 rounded-2xl border-2 cursor-pointer transition ${selected === 'local_delivery' ? 'border-[#ED7218] bg-[#ED7218]/5' : 'border-slate-100 hover:border-slate-200'}`}
                >
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-gray-900">Kurir Toko (Lokal)</span>
                            <span className="text-[10px] font-bold bg-[#ED7218]/10 text-[#ED7218] px-2 py-0.5 rounded-full">DIANTAR</span>
                        </div>
                        {selected === 'local_delivery' && <ShieldCheck className="w-5 h-5 text-[#ED7218]" />}
                    </div>
                    <p className="text-xs text-slate-500 mb-3">Diantar langsung oleh toko</p>
                    <p className="font-bold text-sm text-[#ED7218]">
                        {selected === 'local_delivery' ? `Rp ${deliveryFee.toLocaleString('id-ID')}` : 'Dihitung otomatis'}
                    </p>
                </div>

                <div role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.click(); }}
                    onClick={() => onSelect('self_pickup')}
                    className={`relative p-5 rounded-2xl border-2 cursor-pointer transition ${selected === 'self_pickup' ? 'border-[#ED7218] bg-[#ED7218]/5' : 'border-slate-100 hover:border-slate-200'}`}
                >
                    <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-sm text-gray-900">Ambil Sendiri</span>
                        {selected === 'self_pickup' && <ShieldCheck className="w-5 h-5 text-[#ED7218]" />}
                    </div>
                    <p className="text-xs text-slate-500 mb-3">Ambil langsung ke toko</p>
                    <p className="font-bold text-sm text-[#ED7218]">Gratis (Rp 0)</p>
                </div>
            </div>
        </section>
    );
}

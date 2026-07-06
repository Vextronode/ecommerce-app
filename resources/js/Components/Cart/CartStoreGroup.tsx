import React from 'react';
import { Trash2, Plus, Minus } from 'lucide-react';

export default function CartStoreGroup({ store }: { store: any }) {
    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" className="w-5 h-5 rounded text-[#245D56] focus:ring-[#245D56] border-slate-300" defaultChecked />
                    <span className="font-bold text-gray-900">{store.storeName}</span>
                </label>
                <span className="text-sm font-medium text-slate-500">{store.items.length} Items</span>
            </div>

            <div className="space-y-6">
                {store.items.map((item: any) => (
                    <div key={item.id} className="flex gap-3 md:gap-4 items-start">
                        <input type="checkbox" className="w-5 h-5 rounded text-[#245D56] focus:ring-[#245D56] border-slate-300 mt-2 cursor-pointer" defaultChecked />

                        <div className="relative shrink-0">
                            <img src={item.img} alt={item.name} className="w-20 h-20 md:w-24 md:h-24 rounded-2xl object-cover bg-slate-100" />
                            {item.stock && (
                                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] font-bold text-center py-1 rounded-b-2xl">
                                    Sisa {item.stock}
                                </div>
                            )}
                        </div>

                        <div className="flex-1">
                            <h3 className="font-bold text-gray-900 text-sm md:text-base">{item.name}</h3>
                            <p className="text-xs text-slate-500 mt-0.5">{item.weight}</p>
                            <p className="font-bold text-[#245D56] text-sm md:text-base mt-2">
                                Rp {item.price.toLocaleString('id-ID')}
                            </p>
                        </div>

                        <div className="flex items-center gap-4 shrink-0">
                            <button className="text-slate-400 hover:text-red-500 transition">
                                <Trash2 className="w-5 h-5" />
                            </button>

                            <div className="flex items-center justify-end gap-3 bg-white border border-slate-200 rounded-full px-2 py-1 shadow-sm w-fit">
                                <button className="text-slate-400 hover:text-gray-900 p-1"><Minus className="w-3.5 h-3.5" /></button>
                                <span className="text-sm font-bold w-4 text-center">{item.qty}</span>
                                <button className="text-slate-400 hover:text-gray-900 p-1"><Plus className="w-3.5 h-3.5" /></button>
                            </div>
                        </div>                    </div>
                ))}
            </div>
        </div>
    );
}

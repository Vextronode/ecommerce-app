import React from 'react';
import { MapPin, Phone, Store } from 'lucide-react';

interface DeliveryOrderSummaryProps {
    order: any;
}

export default function DeliveryOrderSummary({ order }: DeliveryOrderSummaryProps) {
    return (
        <div className="space-y-4">
            {/* Detail Pesanan & Tujuan */}
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 space-y-4">
                <div className="flex items-start gap-4 pb-4 border-b border-gray-100">
                    <div className="w-10 h-10 bg-red-50 text-red-500 rounded-full flex items-center justify-center shrink-0">
                        <MapPin className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Tujuan Pengiriman</p>
                        <h3 className="font-bold text-gray-900 text-sm">{order.customer_name}</h3>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">{order.shipping_address}</p>
                        <a 
                            href={`https://wa.me/${order.customer_phone.replace(/\D/g, '').replace(/^0/, '62')}`} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="inline-flex items-center gap-1.5 mt-2 text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg transition-colors"
                        >
                            <Phone className="w-3.5 h-3.5" /> Chat via WhatsApp
                        </a>
                    </div>
                </div>

                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center shrink-0">
                        <Store className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Penjual / Toko</p>
                        <h3 className="font-bold text-gray-900 text-sm">{order.store_name}</h3>
                    </div>
                </div>
            </div>

            {/* Ringkasan Belanja */}
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="text-sm font-bold text-gray-900 mb-3">Ringkasan Pesanan</h3>
                <div className="space-y-2 mb-4">
                    {order.items.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center text-xs text-gray-600">
                            <span>{item.qty}x {item.name}</span>
                            <span className="font-medium">Rp {(item.qty * item.price).toLocaleString('id-ID')}</span>
                        </div>
                    ))}
                </div>
                <div className="pt-3 border-t border-gray-100 space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Subtotal Produk</span>
                        <span className="text-xs font-medium text-gray-700">Rp {Number(order.subtotal).toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Ongkos Kirim</span>
                        <span className="text-xs font-medium text-gray-700">Rp {Number(order.shipping_cost).toLocaleString('id-ID')}</span>
                    </div>
                    {(order.total_amount - order.subtotal - order.shipping_cost) > 0 && (
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500">Biaya Layanan/Admin</span>
                            <span className="text-xs font-medium text-gray-700">Rp {Number(order.total_amount - order.subtotal - order.shipping_cost).toLocaleString('id-ID')}</span>
                        </div>
                    )}
                    <div className="flex justify-between items-center pt-2">
                        <span className="text-xs font-bold text-gray-900">Total Tagihan</span>
                        <span className="text-sm font-extrabold text-[#004F54]">Rp {Number(order.total_amount).toLocaleString('id-ID')}</span>
                    </div>
                </div>
                
                <div className="mt-4 bg-[#F0FAFB] p-3 rounded-xl border border-[#41B9C5]/20 flex justify-between items-center text-xs">
                    <span className="font-medium text-gray-600">Metode Pembayaran</span>
                    <span className={`font-bold uppercase tracking-wide ${order.payment_status === 'paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {order.payment_method === 'cod' ? 'Bayar di Tempat (COD)' : 'Transfer (Lunas)'}
                    </span>
                </div>
            </div>
        </div>
    );
}

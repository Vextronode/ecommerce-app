import React from 'react';
import { formatNumberId } from "@/utils/formatters";
import { MoreVertical, Download, MessageSquare, ShoppingBag, Calendar } from 'lucide-react';
import { router } from '@inertiajs/react';
import CustomerPagination from './CustomerPagination';

export interface Customer {
    id: number;
    customer_id: string;
    name: string;
    avatar: string | null;
    email?: string;
    phone: string;
    orders_count: number;
    total_spent: number;
    join_date: string;
    status: 'Active' | 'New';
}

interface CustomerTableProps {
    customers: Customer[];
    currentStatus: string;
    pagination?: {
        from: number;
        to: number;
        total: number;
        links: any[];
    };
}

export default function CustomerTable({ customers, currentStatus, pagination }: CustomerTableProps) {
    // eslint-disable-next-line react-doctor/prefer-module-scope-pure-function
    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        router.get(route('merchant.customers.index'), { status: e.target.value }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleExportCSV = () => {
        if (!customers || customers.length === 0) return;
        const headers = ["ID Pelanggan", "Nama", "Email", "No. Telepon", "Pesanan", "Total Belanja", "Tanggal Bergabung", "Status"];
        const rows = customers.map((c) => [
            `"${c.customer_id}"`,
            `"${c.name}"`,
            `"${c.email || ''}"`,
            `"${c.phone}"`,
            c.orders_count,
            c.total_spent,
            `"${c.join_date}"`,
            `"${c.status === 'Active' ? 'Aktif' : 'Baru'}"`,
        ]);
        const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `pelanggan_cibenda_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="bg-white rounded-3xl border border-brand-orange/30 shadow-sm overflow-hidden flex flex-col w-full max-w-full">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100">
                <h2 className="text-base sm:text-xl font-extrabold text-brand-orange">Semua Pelanggan</h2>
                <div aria-label="Filter status pelanggan" className="flex items-center gap-2 sm:gap-3">
                    <select
                        aria-label="Pilih status pelanggan"
                        value={currentStatus}
                        onChange={handleStatusChange}
                        className="bg-gray-100/90 hover:bg-gray-100 border border-gray-200 text-xs sm:text-sm font-semibold text-gray-700 rounded-xl focus:ring-2 focus:ring-brand-orange/50 focus:border-brand-orange cursor-pointer pl-3 pr-7 sm:pl-4 sm:pr-8 py-2 outline-none transition"
                    >
                        <option value="All Status">Semua Status</option>
                        <option value="Active">Aktif</option>
                        <option value="New">Baru</option>
                    </select>
                    <button
                        type="button"
                        onClick={handleExportCSV}
                        aria-label="Ekspor CSV"
                        title="Ekspor CSV"
                        className="p-2 sm:p-2.5 bg-gray-100 hover:bg-brand-orange-tint text-gray-600 hover:text-brand-orange rounded-xl transition-colors cursor-pointer border border-transparent hover:border-brand-orange/30"
                    >
                        <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                </div>
            </div>

            {/* Desktop Table View (>= 768px) */}
            <div className="hidden md:block overflow-x-auto no-scrollbar">
                <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                        <tr className="bg-white border-b border-gray-100">
                            <th className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-wider">PELANGGAN</th>
                            <th className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-wider">KONTAK</th>
                            <th className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-wider">PESANAN</th>
                            <th className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-wider">TOTAL BELANJA</th>
                            <th className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-wider">TANGGAL BERGABUNG</th>
                            <th className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-wider">STATUS</th>
                            <th className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">AKSI</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {customers.map((customer) => (
                            <tr key={customer.id} className="hover:bg-gray-50/50 transition-colors group">
                                <td className="py-4 px-6">
                                    <div className="flex items-center gap-3">
                                        {customer.avatar ? (
                                            <img
                                                src={customer.avatar}
                                                alt={customer.name}
                                                className="w-10 h-10 rounded-full object-cover bg-gray-100 border border-brand-orange/20"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-brand-orange-tint flex items-center justify-center text-brand-orange font-bold border border-brand-orange/20 text-sm">
                                                {customer.name.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">{customer.name}</p>
                                            <p className="text-xs text-gray-400 font-medium mt-0.5">ID: {customer.customer_id}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 px-6">
                                    {customer.email && (
                                        <p className="text-sm text-gray-700 font-medium truncate max-w-48">
                                            {customer.email}
                                        </p>
                                    )}
                                    <p className="text-xs text-gray-500 font-medium">{customer.phone}</p>
                                </td>

                                <td className="py-4 px-6">
                                    <span className="text-sm font-bold text-gray-800">{customer.orders_count}</span>
                                </td>
                                <td className="py-4 px-6">
                                    <span className="text-sm font-bold text-brand-orange">
                                        Rp. {formatNumberId(customer.total_spent)}
                                    </span>
                                </td>
                                <td className="py-4 px-6">
                                    <span className="text-xs md:text-sm text-gray-600 font-medium">{customer.join_date}</span>
                                </td>
                                <td className="py-4 px-6">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold tracking-wide border ${
                                        customer.status === 'Active' 
                                            ? 'bg-brand-orange-tint text-brand-orange border-brand-orange/30' 
                                            : 'bg-amber-50 text-amber-700 border-amber-200'
                                    }`}>
                                        {customer.status === 'Active' ? 'Aktif' : 'Baru'}
                                    </span>
                                </td>
                                <td className="py-4 px-6 text-center">
                                    <div className="flex items-center justify-center gap-1.5">
                                        {customer.phone && customer.phone !== '-' && (
                                            <a
                                                href={`https://wa.me/${customer.phone.replace(/\D/g, "").replace(/^0/, "62")}?text=${encodeURIComponent(
                                                    `Halo kak ${customer.name}, terima kasih telah berbelanja di toko kami...`
                                                )}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-teal-600 bg-teal-50 hover:bg-teal-600 hover:text-white p-1.5 rounded-lg transition-colors shadow-xs"
                                                title="Hubungi via WhatsApp"
                                            >
                                                <MessageSquare className="w-4 h-4" />
                                            </a>
                                        )}
                                        <button
                                            type="button"
                                            aria-label="Opsi pelanggan"
                                            className="text-gray-400 hover:text-brand-orange p-1.5 rounded-lg hover:bg-brand-orange-tint transition-colors cursor-pointer"
                                            title="Opsi"
                                        >
                                            <MoreVertical className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {customers.length === 0 && (
                            <tr>
                                <td colSpan={7} className="py-12 text-center text-gray-500 font-medium">
                                    Belum ada data pelanggan.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card List View (< 768px) */}
            <div className="block md:hidden p-3.5 space-y-3 bg-gray-50/60">
                {customers.length > 0 ? (
                    customers.map((customer) => (
                        <div
                            key={customer.id}
                            className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-xs hover:border-brand-orange/40 transition-all flex flex-col gap-3"
                        >
                            {/* Header: Avatar, Name, ID, & Status */}
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-3 min-w-0">
                                    {customer.avatar ? (
                                        <img
                                            src={customer.avatar}
                                            alt={customer.name}
                                            className="w-10 h-10 rounded-full object-cover bg-gray-100 border border-brand-orange/20 shrink-0"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-brand-orange-tint text-brand-orange font-bold flex items-center justify-center border border-brand-orange/20 text-sm shrink-0">
                                            {customer.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-gray-900 truncate">
                                            {customer.name}
                                        </p>
                                        <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                                            ID: {customer.customer_id}
                                        </p>
                                    </div>
                                </div>

                                <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide border shrink-0 ${
                                        customer.status === 'Active'
                                            ? 'bg-brand-orange-tint text-brand-orange border-brand-orange/30'
                                            : 'bg-amber-50 text-amber-700 border-amber-200'
                                    }`}
                                >
                                    {customer.status === 'Active' ? 'Aktif' : 'Baru'}
                                </span>
                            </div>

                            {/* Contact Box */}
                            <div className="flex items-center justify-between gap-2 py-2 px-3 rounded-xl bg-gray-50 border border-gray-100">
                                <div className="min-w-0 text-xs text-gray-600 space-y-0.5">
                                    {customer.email && (
                                        <p className="truncate font-medium text-gray-700">
                                            {customer.email}
                                        </p>
                                    )}
                                    <p className="text-gray-500 font-mono text-[11px]">
                                        {customer.phone}
                                    </p>
                                </div>

                                {customer.phone && customer.phone !== '-' && (
                                    <a
                                        href={`https://wa.me/${customer.phone.replace(/\D/g, "").replace(/^0/, "62")}?text=${encodeURIComponent(
                                            `Halo kak ${customer.name}, terima kasih telah berbelanja di toko kami...`
                                        )}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200/60 transition shrink-0"
                                        title="Hubungi via WhatsApp"
                                    >
                                        <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                                        <span>Chat WA</span>
                                    </a>
                                )}
                            </div>

                            {/* Metrics: Orders & Spent */}
                            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-100">
                                <div>
                                    <p className="text-[10px] text-gray-400 font-medium">Total Pesanan</p>
                                    <p className="text-xs sm:text-sm font-bold text-gray-800 mt-0.5 flex items-center gap-1">
                                        <ShoppingBag className="w-3.5 h-3.5 text-brand-orange" />
                                        <span>{customer.orders_count} Pesanan</span>
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-gray-400 font-medium">Total Belanja</p>
                                    <p className="text-xs sm:text-sm font-extrabold text-brand-orange mt-0.5">
                                        Rp. {formatNumberId(customer.total_spent)}
                                    </p>
                                </div>
                            </div>

                            {/* Footer: Join Date */}
                            <div className="pt-2 border-t border-gray-100/80 flex items-center justify-between text-[11px] text-gray-400">
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    Bergabung: {customer.join_date}
                                </span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-12 text-center text-gray-500 font-medium text-xs bg-white rounded-2xl border border-gray-100">
                        Belum ada data pelanggan.
                    </div>
                )}
            </div>

            {pagination && pagination.total > 0 && (
                <CustomerPagination
                    from={pagination.from}
                    to={pagination.to}
                    total={pagination.total}
                    links={pagination.links}
                />
            )}
        </div>
    );
}

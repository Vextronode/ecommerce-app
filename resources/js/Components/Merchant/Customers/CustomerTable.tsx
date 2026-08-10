import React from 'react';
import { formatRupiah, formatNumberId, formatNumberEn } from "@/utils/formatters";
import { MoreVertical, Download } from 'lucide-react';
import { router } from '@inertiajs/react';

export interface Customer {
    id: number;
    customer_id: string;
    name: string;
    avatar: string | null;
    email: string;
    phone: string;
    orders_count: number;
    total_spent: number;
    join_date: string;
    status: 'Active' | 'New';
}

interface CustomerTableProps {
    customers: Customer[];
    currentStatus: string;
}

export default function CustomerTable({ customers, currentStatus }: CustomerTableProps) {
    // eslint-disable-next-line react-doctor/prefer-module-scope-pure-function
    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        router.get(route('merchant.customers.index'), { status: e.target.value }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <div className="bg-white rounded-[20px] border border-[#41B9C5]/20 shadow-sm overflow-hidden flex flex-col mt-6">
            <div className="flex items-center justify-between p-5 md:p-6 border-b border-gray-100">
                <h2 className="text-lg font-bold text-[#14433D]">All Customers</h2>
                <div aria-label="Pilih opsi yang tersedia" className="flex items-center gap-3">
                    <select aria-label="Tampilkan rincian lebih lanjut"
                        value={currentStatus}
                        onChange={handleStatusChange}
                        className="bg-gray-100 border-none text-sm font-medium text-gray-700 rounded-lg focus:ring-0 cursor-pointer pl-4 pr-8 py-2.5 outline-none"
                    >
                        <option value="All Status">All Status</option>
                        <option value="Active">Active</option>
                        <option value="New">New</option>
                    </select>
                    <button aria-label="Pilih opsi yang tersedia" className="p-2.5 bg-gray-100 rounded-lg text-gray-600 hover:bg-gray-200 transition-colors">
                        <Download className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                        <tr className="bg-white border-b border-gray-100">
                            <th className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Customer</th>
                            <th className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Contact</th>
                            <th className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Orders</th>
                            <th className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Spent</th>
                            <th className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Join Date</th>
                            <th className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
                            <th className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {customers.map((customer) => (
                            <tr key={customer.id} className="hover:bg-gray-50/50 transition-colors group">
                                <td className="py-4 px-6">
                                    <div className="flex items-center gap-3">
                                        {customer.avatar ? (
                                            <img src={customer.avatar} alt={customer.name} className="w-10 h-10 rounded-full object-cover bg-gray-100 border border-gray-200" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold border border-gray-200">
                                                {customer.name.charAt(0)}
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-sm font-bold text-[#14433D] group-hover:text-[#41B9C5] transition-colors">{customer.name}</p>
                                            <p className="text-xs text-gray-500 font-medium mt-0.5">ID: {customer.customer_id}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 px-6">
                                    <p className="text-sm text-[#14433D] font-medium">{customer.email}</p>
                                    <p className="text-xs text-gray-500 font-medium mt-0.5">{customer.phone}</p>
                                </td>
                                <td className="py-4 px-6">
                                    <span className="text-sm font-bold text-[#14433D]">{customer.orders_count}</span>
                                </td>
                                <td className="py-4 px-6">
                                    <span className="text-sm font-bold text-[#14433D]">
                                        Rp. {formatNumberId(customer.total_spent)}
                                    </span>
                                </td>
                                <td className="py-4 px-6">
                                    <span className="text-sm text-[#14433D] font-medium">{customer.join_date}</span>
                                </td>
                                <td className="py-4 px-6">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold tracking-wide ${
                                        customer.status === 'Active' 
                                            ? 'bg-teal-400/20 text-[#41B9C5]' 
                                            : 'bg-orange-100 text-orange-600'
                                    }`}>
                                        {customer.status}
                                    </span>
                                </td>
                                <td className="py-4 px-6 text-center">
                                    <button aria-label="Pilih opsi yang tersedia" className="text-gray-400 hover:text-[#14433D] p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                                        <MoreVertical className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {customers.length === 0 && (
                            <tr>
                                <td colSpan={7} className="py-12 text-center text-gray-500 font-medium">
                                    No customers found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

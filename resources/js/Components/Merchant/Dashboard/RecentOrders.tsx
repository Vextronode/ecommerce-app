import React from "react";
import { Inbox } from "lucide-react";

interface Props {
    orders: any[];
}

export default function RecentOrders({ orders }: Props) {
    return (
        <div className="bg-white rounded-3xl p-5 md:p-6 border border-[#41B9C5]/30 shadow-sm flex flex-col w-full mb-8">
            <div className="flex justify-between items-center mb-4 md:mb-6">
                <h3 className="text-base md:text-lg font-bold text-gray-800">
                    Recent Orders
                </h3>
                <button className="text-xs md:text-sm font-bold text-[#41B9C5] hover:text-[#004F54] transition-colors">
                    View All
                </button>
            </div>

            <div className="overflow-x-auto pb-2 -mx-5 px-5 md:mx-0 md:px-0">
                <table className="w-full text-left border-collapse min-w-150">
                    <thead>
                        <tr className="border-b border-gray-100">
                            <th className="pb-3 text-[10px] md:text-xs font-extrabold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                CUSTOMER
                            </th>
                            <th className="pb-3 text-[10px] md:text-xs font-extrabold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                PRODUCT
                            </th>
                            <th className="pb-3 text-[10px] md:text-xs font-extrabold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                DATE
                            </th>
                            <th className="pb-3 text-[10px] md:text-xs font-extrabold text-gray-400 uppercase tracking-wider whitespace-nowrap text-right md:text-left">
                                AMOUNT
                            </th>
                            <th className="pb-3 text-[10px] md:text-xs font-extrabold text-gray-400 uppercase tracking-wider whitespace-nowrap text-right">
                                STATUS
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {orders && orders.length > 0 ? (
                            orders.map((order, index) => (
                                <tr
                                    key={index}
                                    className="hover:bg-gray-50/50 transition-colors"
                                >
                                    {/* nanti isi datanya bakal dimasukin ke sini */}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="py-10 text-center">
                                    <div className="flex flex-col items-center justify-center text-gray-400 gap-2">
                                        <Inbox className="w-8 h-8 text-gray-300" />
                                        <p className="text-xs md:text-sm font-medium">
                                            Belum ada pesanan masuk.
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

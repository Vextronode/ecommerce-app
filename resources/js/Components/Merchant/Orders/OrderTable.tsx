import React from "react";
import TableToolbar from "./TableToolbar";
import OrderTableRow from "./OrderTableRow";
import OrderMobileCard from "./OrderMobileCard";
import Pagination from "./Pagination";

export default function OrderTable({
    orders,
    onOpenAction,
}: {
    orders: any;
    onOpenAction: (order: any) => void;
}) {
    return (
        <div className="bg-white rounded-[20px] border border-[#41B9C5]/20 shadow-sm overflow-hidden flex flex-col">
            <TableToolbar />

            {/* Desktop View */}
            <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-200">
                    <thead>
                        <tr className="border-b border-gray-100 bg-white">
                            {[
                                "ORDER ID",
                                "CUSTOMER",
                                "ITEMS",
                                "DATE",
                                "TOTAL",
                                "PAYMENT",
                                "SHIPPING",
                                "ACTIONS",
                            ].map((th, idx) => (
                                <th
                                    key={th}
                                    className={`py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-wider ${th === "ACTIONS" ? "text-center" : ""}`}
                                >
                                    {th}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {orders?.data?.length > 0 ? (
                            orders.data.map((order: any, idx: number) => (
                                <OrderTableRow
                                    key={order.id}
                                    order={order}
                                    onOpenAction={onOpenAction}
                                />
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={8}
                                    className="py-8 text-center text-gray-400 font-medium"
                                >
                                    Belum ada pesanan masuk.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile View */}
            <div className="block lg:hidden divide-y divide-gray-100">
                {orders?.data?.length > 0 ? (
                    orders.data.map((order: any, idx: number) => (
                        <OrderMobileCard
                            key={order.id}
                            order={order}
                            onOpenAction={onOpenAction}
                        />
                    ))
                ) : (
                    <div className="py-12 text-center text-gray-400 font-medium">
                        Belum ada pesanan masuk.
                    </div>
                )}
            </div>

            <Pagination pagination={orders} />
        </div>
    );
}

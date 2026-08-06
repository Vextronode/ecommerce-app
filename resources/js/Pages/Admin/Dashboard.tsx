import React from "react";
import { Head, Link } from "@inertiajs/react";
import {
    ShieldCheck,
    Store,
    Users,
    ShoppingBag,
    DollarSign,
    Clock,
    ArrowUpRight,
    LogOut,
    PackageCheck,
} from "lucide-react";

interface Props {
    stats: {
        total_users: number;
        total_merchants: number;
        total_stores: number;
        total_products: number;
        total_orders: number;
        total_revenue: number;
        pending_withdrawals: number;
    };
    recent_orders: Array<{
        id: number;
        invoice_number: string;
        customer_name?: string;
        total_amount: number;
        payment_status: string;
        shipping_status: string;
        created_at: string;
        user?: {
            id: number;
            name: string;
            email: string;
        };
    }>;
}

export default function AdminDashboard({ stats, recent_orders }: Props) {
    const formatRupiah = (val: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0,
        }).format(val || 0);
    };

    const statCards = [
        {
            title: "Total Pengguna",
            value: stats?.total_users ?? 0,
            icon: Users,
            color: "text-blue-600 bg-blue-50 border-blue-100",
            description: "Pembeli terdaftar",
        },
        {
            title: "Mitra Pedagang",
            value: stats?.total_merchants ?? 0,
            icon: Store,
            color: "text-[#245D56] bg-emerald-50 border-emerald-100",
            description: `${stats?.total_stores ?? 0} Toko Aktif`,
        },
        {
            title: "Total Produk",
            value: stats?.total_products ?? 0,
            icon: ShoppingBag,
            color: "text-indigo-600 bg-indigo-50 border-indigo-100",
            description: "Katalog UMKM",
        },
        {
            title: "Total Transaksi",
            value: stats?.total_orders ?? 0,
            icon: PackageCheck,
            color: "text-amber-600 bg-amber-50 border-amber-100",
            description: "Semua pesanan",
        },
        {
            title: "Omset Penjualan",
            value: formatRupiah(stats?.total_revenue ?? 0),
            icon: DollarSign,
            color: "text-teal-600 bg-teal-50 border-teal-100",
            description: "Pesanan Lunas (Paid)",
        },
        {
            title: "Pengajuan Saldo",
            value: stats?.pending_withdrawals ?? 0,
            icon: Clock,
            color: "text-rose-600 bg-rose-50 border-rose-100",
            description: "Penarikan pending",
        },
    ];

    return (
        <main className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-12">
            <Head title="Dashboard Administrator - CibendaMart" />

            {/* Top Navigation Bar */}
            <nav className="bg-[#004F54] text-white sticky top-0 z-30 shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-3">
                            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                                <ShieldCheck className="w-5 h-5 text-[#41B9C5]" />
                            </div>
                            <div>
                                <span className="font-bold text-lg tracking-tight">
                                    CibendaMart
                                </span>
                                <span className="ml-2 text-xs bg-[#41B9C5]/30 text-teal-200 px-2 py-0.5 rounded-full font-semibold border border-[#41B9C5]/40">
                                    Control Panel
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <span className="text-xs text-teal-200 hidden sm:inline-block">
                                Administrator
                            </span>
                            <Link
                                href={route("logout")}
                                method="post"
                                as="button"
                                data={{ source: "admin" }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-all cursor-pointer border border-white/20"
                            >
                                <LogOut className="w-3.5 h-3.5" />
                                Keluar
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                {/* Header Welcome Card */}
                <div className="bg-gradient-to-r from-[#004F54] to-[#0A6B72] rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-8 relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-teal-100 mb-3 border border-white/20">
                            <ShieldCheck className="w-3.5 h-3.5 text-[#41B9C5]" />
                            Sistem Terproteksi & Role Guard Aktif
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                            Selamat Datang di Portal Admin
                        </h1>
                        <p className="text-teal-100 text-sm mt-1 max-w-2xl font-light">
                            Kelola pedagang, pantau aktivitas transaksi pasar digital Cibenda, dan pantau kesehatan ekosistem secara real-time.
                        </p>
                    </div>

                    {/* Decorative Watermark Waves */}
                    <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-12 translate-y-12">
                        <ShieldCheck className="w-80 h-80 text-white" />
                    </div>
                </div>

                {/* Metric Statistics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
                    {statCards.map((card, idx) => {
                        const Icon = card.icon;
                        return (
                            <div
                                key={idx}
                                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow flex items-start justify-between"
                            >
                                <div>
                                    <p className="text-xs font-medium text-slate-500">
                                        {card.title}
                                    </p>
                                    <h3 className="text-2xl font-bold text-slate-900 mt-1">
                                        {card.value}
                                    </h3>
                                    <p className="text-xs text-slate-400 mt-1">
                                        {card.description}
                                    </p>
                                </div>
                                <div
                                    className={`p-3 rounded-xl border ${card.color}`}
                                >
                                    <Icon className="w-6 h-6" />
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Recent Transactions Table Card */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                    <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
                        <div>
                            <h2 className="font-bold text-slate-900 text-base">
                                Transaksi Terkini
                            </h2>
                            <p className="text-xs text-slate-500">
                                5 aktivitas pesanan terbaru dalam sistem
                            </p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-600">
                            <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-3.5">Invoice</th>
                                    <th className="px-6 py-3.5">Pelanggan</th>
                                    <th className="px-6 py-3.5">Total</th>
                                    <th className="px-6 py-3.5">Status Bayar</th>
                                    <th className="px-6 py-3.5">Pengiriman</th>
                                    <th className="px-6 py-3.5 text-right">Tanggal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium">
                                {recent_orders && recent_orders.length > 0 ? (
                                    recent_orders.map((order) => (
                                        <tr
                                            key={order.id}
                                            className="hover:bg-slate-50/50 transition-colors"
                                        >
                                            <td className="px-6 py-4 font-bold text-slate-900">
                                                {order.invoice_number}
                                            </td>
                                            <td className="px-6 py-4 text-slate-800">
                                                {order.user?.name || order.customer_name || "Pelanggan"}
                                                <div className="text-[11px] text-slate-400 font-normal">
                                                    {order.user?.email || "-"}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-slate-900">
                                                {formatRupiah(Number(order.total_amount))}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                                                        order.payment_status === "paid"
                                                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                            : order.payment_status === "pending"
                                                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                                                            : "bg-rose-50 text-rose-700 border border-rose-200"
                                                    }`}
                                                >
                                                    {order.payment_status?.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="capitalize text-slate-700">
                                                    {order.shipping_status || "Pending"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right text-slate-500">
                                                {new Date(order.created_at).toLocaleDateString("id-ID", {
                                                    day: "numeric",
                                                    month: "short",
                                                    year: "numeric",
                                                })}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-6 py-8 text-center text-slate-400"
                                        >
                                            Belum ada data transaksi yang tercatat.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </main>
    );
}

import { Head, Link, router } from "@inertiajs/react";
import Navbar from "@/Components/Global/Navbar";
import { Store, ChevronRight } from "lucide-react";

type OrderItem = {
    id: number;
    product_id: number;
    product_slug?: string;
    product_name: string;
    variant_name: string | null;
    quantity: number;
    price: string | number;
    image: string;
};

type Order = {
    id: number;
    invoice_number: string;
    store_name: string;
    status: string;
    total_amount: string | number;
    items: OrderItem[];
};

export default function Index({
    orders,
    currentStatus,
}: {
    orders: Order[];
    currentStatus: string;
}) {
    const tabs = [
        { key: "all", label: "Semua" },
        { key: "unpaid", label: "Belum Bayar" },
        { key: "processing", label: "Dikemas" },
        { key: "shipped", label: "Dikirim" },
        { key: "delivered", label: "Selesai" },
        { key: "cancelled", label: "Dibatalkan" },
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Selesai":
                return "text-[#245D56] border-[#245D56]";
            case "Dibatalkan":
                return "text-red-600 border-red-600";
            case "Belum Bayar":
                return "text-orange-500 border-orange-500";
            case "Dikemas":
            case "Dikirim":
                return "text-blue-500 border-blue-500";
            default:
                return "text-gray-600 border-gray-600";
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <Head title="Riwayat Pesanan" />
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 pt-32">
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Sidebar */}
                    <div className="w-full md:w-64 shrink-0">
                        <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">
                                Pesanan Saya
                            </h2>
                            <div className="flex flex-col space-y-2">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.key}
                                        onClick={() =>
                                            router.get(
                                                route("history.index"),
                                                { status: tab.key },
                                                { preserveState: true }
                                            )
                                        }
                                        className={`text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${currentStatus === tab.key
                                                ? "bg-[#245D56] text-white"
                                                : "text-gray-600 hover:bg-gray-50 border border-transparent hover:border-gray-200"
                                            }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Order List */}
                    <div className="flex-1 space-y-4">
                        {orders.length === 0 ? (
                            <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                                <div className="text-gray-400 mb-4">
                                    <Store className="w-16 h-16 mx-auto opacity-50" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">
                                    Belum ada pesanan
                                </h3>
                                <p className="text-gray-500 mt-1">
                                    Anda belum memiliki pesanan dengan status ini.
                                </p>
                                <Link
                                    href={route("shop")}
                                    className="inline-block mt-6 px-6 py-2 bg-[#245D56] text-white rounded-lg hover:bg-[#1a4540] transition-colors"
                                >
                                    Mulai Belanja
                                </Link>
                            </div>
                        ) : (
                            orders.map((order) => (
                                <Link
                                    href={route("history.show", order.id)}
                                    key={order.id}
                                    className="block bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                                >
                                    {/* Card Header */}
                                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="bg-[#245D56] text-white p-1.5 rounded-md">
                                                <Store className="w-4 h-4" />
                                            </div>
                                            <span className="font-semibold text-gray-900 text-sm">
                                                {order.store_name}
                                            </span>
                                        </div>
                                        <div
                                            className={`px-3 py-1 rounded-md border text-xs font-medium ${getStatusColor(
                                                order.status
                                            )}`}
                                        >
                                            {order.status}
                                        </div>
                                    </div>

                                    {/* Order Items */}
                                    <div className="px-6 py-4">
                                        {order.items.map((item) => (
                                            <div
                                                key={item.id}
                                                className="flex items-start gap-4 mb-4 last:mb-0"
                                            >
                                                <img
                                                    src={item.image}
                                                    alt={item.product_name}
                                                    className="w-20 h-20 rounded-lg object-cover bg-gray-100"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-gray-900 font-medium truncate">
                                                        {item.product_name}
                                                    </h4>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Variasi:{" "}
                                                        {item.variant_name ||
                                                            "Default"}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        x{item.quantity}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold text-[#245D56]">
                                                        Rp
                                                        {Number(
                                                            item.price
                                                        ).toLocaleString("id-ID")}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Card Footer */}
                                    <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                                        <div>
                                            <span className="text-sm text-gray-600">
                                                Total Pesanan:{" "}
                                            </span>
                                            <span className="text-lg font-bold text-[#245D56]">
                                                Rp
                                                {Number(
                                                    order.total_amount
                                                ).toLocaleString("id-ID")}
                                            </span>
                                        </div>
                                        <div className="flex gap-3">
                                            {order.status === "Selesai" && (
                                                <>
                                                    <button className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                                                        Tampilkan Rincian Pengembalian
                                                    </button>
                                                    <Link
                                                        href={route("product.detail", order.items[0]?.product_slug || order.items[0]?.product_id)}
                                                        className="px-6 py-2 bg-[#245D56] text-white text-sm font-medium rounded-lg hover:bg-[#1a4540] transition-colors"
                                                    >
                                                        Beli Lagi
                                                    </Link>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

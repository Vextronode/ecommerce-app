import React from "react";
import { Store, Package, ShoppingCart, Flame, TrendingUp } from "lucide-react";

interface Props {
    stats: {
        total_merchants?: number | string;
        total_products?: number | string;
        total_sold?: number | string;
        top_product_name?: string;
        top_category_name?: string;
        merchants_trend?: string;
        products_trend?: string;
        sold_trend?: string;
    };
}

export default function AdminStatCards({ stats }: Props) {
    // eslint-disable-next-line react-doctor/prefer-module-scope-pure-function
    const formatCompactNumber = (val: number | string | undefined) => {
        if (!val) return "0";
        if (typeof val === "string") return val;
        if (val >= 1000) {
            return (val / 1000).toFixed(1).replace(/\.0$/, "") + "K";
        }
        return val.toLocaleString("id-ID");
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5 mb-6">
            {/* TOTAL PEDAGANG */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow min-h-[148px]">
                <div className="flex justify-between items-start">
                    <div>
                        <span className="text-[11px] font-bold text-gray-400 tracking-wider uppercase block">
                            Total Pedagang
                        </span>
                        <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1 tracking-tight">
                            {stats?.total_merchants ? Number(stats.total_merchants).toLocaleString("id-ID") : "1,248"}
                        </h3>
                    </div>
                    <div className="w-11 h-11 rounded-xl bg-[#E6F7F8] flex items-center justify-center text-[#245D56] shrink-0">
                        <Store className="w-5 h-5" />
                    </div>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-50 flex items-center text-xs font-semibold text-emerald-600 gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>{stats?.merchants_trend || "+12.5%"}</span>
                    <span className="text-gray-400 font-normal">vs akhir bulan</span>
                </div>
            </div>

            {/* TOTAL PRODUK */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow min-h-[148px]">
                <div className="flex justify-between items-start">
                    <div>
                        <span className="text-[11px] font-bold text-gray-400 tracking-wider uppercase block">
                            Total Produk
                        </span>
                        <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1 tracking-tight">
                            {stats?.total_products ? Number(stats.total_products).toLocaleString("id-ID") : "15,892"}
                        </h3>
                    </div>
                    <div className="w-11 h-11 rounded-xl bg-[#FAF0E6] flex items-center justify-center text-[#C05621] shrink-0">
                        <Package className="w-5 h-5" />
                    </div>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-50 flex items-center text-xs font-semibold text-emerald-600 gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>{stats?.products_trend || "+4.2%"}</span>
                    <span className="text-gray-400 font-normal">vs akhir bulan</span>
                </div>
            </div>

            {/* PRODUK TERJUAL */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow min-h-[148px]">
                <div className="flex justify-between items-start">
                    <div>
                        <span className="text-[11px] font-bold text-gray-400 tracking-wider uppercase block">
                            Produk Terjual
                        </span>
                        <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1 tracking-tight">
                            {stats?.total_sold ? formatCompactNumber(stats.total_sold) : "45.2K"}
                        </h3>
                    </div>
                    <div className="w-11 h-11 rounded-xl bg-[#E8F8F8] flex items-center justify-center text-[#0D9488] shrink-0">
                        <ShoppingCart className="w-5 h-5" />
                    </div>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-50 flex items-center text-xs font-semibold text-emerald-600 gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>{stats?.sold_trend || "+18.7%"}</span>
                    <span className="text-gray-400 font-normal">vs akhir bulan</span>
                </div>
            </div>

            {/* PRODUK TERLARIS */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow min-h-[148px]">
                <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                        <span className="text-[11px] font-bold text-gray-400 tracking-wider uppercase block">
                            Produk Terlaris
                        </span>
                        <h3
                            className="text-base sm:text-lg font-bold text-gray-900 mt-1 tracking-tight leading-tight line-clamp-2"
                            title={stats?.top_product_name || "Toko Ola"}
                        >
                            {stats?.top_product_name || "Toko Ola"}
                        </h3>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-[#FEE2E2] flex items-center justify-center text-[#EF4444] shrink-0">
                        <Flame className="w-5 h-5" />
                    </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-50 flex items-center">
                    <span className="bg-gray-100/90 text-gray-700 text-xs px-3 py-1 rounded-full font-medium">
                        {stats?.top_category_name || "Sembako"}
                    </span>
                </div>
            </div>
        </div>
    );
}

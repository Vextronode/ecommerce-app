import { Link } from "@inertiajs/react";
import parigiMerchantImg from "@/assets/images/parigi_merchant.png";

export default function AuthMerchantNotice() {
    return (
        <div className="mt-4 pt-3.5 border-t border-gray-100 shrink-0">
            <div className="p-2.5 sm:p-3 rounded-xl bg-orange-50/70 border border-brand-orange/20 flex items-center gap-2.5 text-left">
                <div className="w-8 h-8 rounded-lg bg-white border border-brand-orange/25 shadow-xs p-1 flex items-center justify-center shrink-0 overflow-hidden">
                    <img
                        src={parigiMerchantImg}
                        alt="Logo Mitra Pedagang"
                        className="w-full h-full object-contain"
                    />
                </div>
                <div className="text-xs text-gray-600 min-w-0 flex-1">
                    <span className="font-semibold text-gray-800">
                        Ingin berjualan di CibendaMart?
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5 text-[11px] sm:text-xs">
                        <Link
                            href={route("merchant.guide")}
                            className="text-brand-orange hover:text-brand-orange-hover font-bold hover:underline"
                        >
                            Panduan Mitra
                        </Link>
                        <span className="text-gray-300">&bull;</span>
                        <Link
                            href={route("merchant.login.view")}
                            className="text-brand-orange hover:text-brand-orange-hover font-bold hover:underline"
                        >
                            Masuk Pedagang
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

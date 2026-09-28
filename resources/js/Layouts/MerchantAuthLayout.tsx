import React, { ReactNode } from "react";
import { Toaster } from "react-hot-toast";

interface Props {
    children: ReactNode;
}

export default function MerchantAuthLayout({ children }: Props) {
    return (
        <div className="min-h-screen w-full bg-[#EAECEF] flex items-center justify-center p-2.5 sm:p-4 md:p-6 lg:p-7 font-sans overflow-x-hidden">
            <Toaster position="top-right" />
            <div className="w-full max-w-420 h-[93vh] min-h-170 bg-white rounded-3xl md:rounded-[2.75rem] shadow-2xl shadow-slate-400/30 border border-gray-200/70 overflow-hidden flex flex-col my-auto">
                {children}
            </div>
        </div>
    );
}

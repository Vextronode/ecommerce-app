import React, { ReactNode } from "react";
import Sidebar from "@/Components/Merchant/Dashboard/Sidebar";
import { Search, Bell, Mail, User } from "lucide-react";

interface Props {
    children: ReactNode;
}

export default function MerchantLayout({ children }: Props) {
    return (
        <div className="flex h-screen bg-[#F8F9FA] p-6 gap-6 font-sans overflow-hidden">
            <Sidebar />

            <main className="flex-1 flex flex-col min-w-0">
                <header className="h-18 px-8 flex items-center justify-between bg-white border border-[#41B9C5]/30 rounded-full shrink-0 mb-6 shadow-sm">
                    <div className="flex-1 max-w-2xl">
                        <div className="relative">
                            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search products"
                                className="w-full pl-12 pr-4 py-2.5 bg-gray-50/50 border border-transparent rounded-full focus:outline-none focus:bg-white focus:border-[#41B9C5] focus:ring-1 focus:ring-[#41B9C5] text-sm transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-6 ml-4">
                        <button className="text-gray-400 hover:text-[#41B9C5] transition-colors relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>

                        <button className="text-gray-400 hover:text-[#41B9C5] transition-colors">
                            <Mail className="w-5 h-5" />
                        </button>

                        <button className="w-10 h-10 rounded-full bg-[#F0FAFB] flex items-center justify-center overflow-hidden border border-[#41B9C5]/30 shadow-sm hover:shadow-md transition-all cursor-pointer">
                            <User className="w-5 h-5 text-[#41B9C5]" />
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto pb-6 pr-2">
                    {children}
                </div>
            </main>
        </div>
    );
}

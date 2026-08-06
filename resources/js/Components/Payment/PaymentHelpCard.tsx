import React from "react";
import { MessageSquare, HelpCircle } from "lucide-react";

export default function PaymentHelpCard() {
    return (
        <div className="bg-[#F0F2F5] rounded-2xl sm:rounded-3xl p-4 sm:p-5 text-center border border-slate-200/40 space-y-1.5">
            <p className="text-xs text-slate-500 font-medium">
                Ada kendala dalam pembayaran?
            </p>
            <a
                href="https://wa.me/6281234567890?text=Halo%20Admin%20CiMart,%20saya%20butuh%20bantuan%20pembayaran%20pesanan"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#281B7A] underline hover:text-[#1a1154] transition"
            >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Hubungi Layanan Bantuan CiMart</span>
            </a>
        </div>
    );
}

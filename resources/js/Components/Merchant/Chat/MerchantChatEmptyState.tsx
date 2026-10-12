import React from "react";
import { MessageSquare } from "lucide-react";

export default function MerchantChatEmptyState() {
    return (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8 text-brand-orange" />
            </div>
            <h3 className="text-base font-bold text-gray-800 mb-1">
                Pusat Obrolan Pelanggan
            </h3>
            <p className="text-xs text-gray-500 max-w-sm">
                Pilih percakapan dari daftar di sebelah kiri untuk membaca dan membalas pesan pelanggan secara realtime.
            </p>
        </div>
    );
}

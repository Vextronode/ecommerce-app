import React from "react";
import { BuyerChatRoomItem } from "@/types/chat";
import { MessageSquare, X, Search, Store as StoreIcon, Loader2 } from "lucide-react";

interface Props {
    rooms: BuyerChatRoomItem[];
    searchQuery: string;
    isLoading: boolean;
    onSearchChange: (query: string) => void;
    onSelectRoom: (room: BuyerChatRoomItem) => void;
    onClose: () => void;
}

export default function StorefrontChatRoomsList({
    rooms,
    searchQuery,
    isLoading,
    onSearchChange,
    onSelectRoom,
    onClose,
}: Props) {
    const filteredRooms = rooms.filter((r) =>
        r.store?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full bg-white">
            <div className="px-4 py-3.5 bg-brand-orange text-white flex items-center justify-between shadow-sm shrink-0">
                <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-white" />
                    <h2 className="text-sm font-bold">Obrolan Saya</h2>
                </div>
                <button
                    onClick={onClose}
                    className="p-1.5 text-white/90 hover:text-white hover:bg-white/10 rounded-full transition cursor-pointer"
                    aria-label="Tutup Obrolan"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            <div className="p-3 border-b border-gray-100 bg-gray-50/50 shrink-0">
                <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Cari toko..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <Loader2 className="w-5 h-5 animate-spin mb-1 text-brand-orange" />
                        <p className="text-xs">Memuat daftar obrolan...</p>
                    </div>
                ) : filteredRooms.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full p-6 text-center text-gray-400">
                        <StoreIcon className="w-8 h-8 mb-2 text-gray-300" />
                        <p className="text-xs font-semibold text-gray-700">
                            Belum ada obrolan aktif
                        </p>
                        <p className="text-[11px] text-gray-400 mt-1 max-w-[200px]">
                            Klik tombol &quot;Chat Penjual&quot; di halaman produk atau toko untuk mulai mengobrol!
                        </p>
                    </div>
                ) : (
                    filteredRooms.map((room) => {
                        const isOnline = room.store?.is_online;

                        return (
                            <button
                                key={room.id}
                                onClick={() => onSelectRoom(room)}
                                className="w-full text-left p-3 flex items-start gap-3 hover:bg-orange-50/50 transition cursor-pointer"
                            >
                                <div className="relative shrink-0">
                                    <div className="w-10 h-10 rounded-full bg-brand-orange/10 flex items-center justify-center overflow-hidden border border-brand-orange/20">
                                        {room.store?.logo_path ? (
                                            <img
                                                src={`/storage/${room.store.logo_path}`}
                                                alt={room.store.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <StoreIcon className="w-4 h-4 text-brand-orange" />
                                        )}
                                    </div>
                                    <span
                                        className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-white ${
                                            isOnline ? "bg-emerald-500" : "bg-gray-300"
                                        }`}
                                        title={isOnline ? "Online" : room.store?.last_seen}
                                    />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-0.5">
                                        <h4 className="text-xs font-bold text-gray-800 truncate">
                                            {room.store?.name}
                                        </h4>
                                        {room.last_message && (
                                            <span className="text-[10px] text-gray-400 shrink-0 ml-1">
                                                {room.last_message.created_at}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className="text-[11px] text-gray-500 truncate pr-2">
                                            {room.last_message ? (
                                                <>
                                                    {room.last_message.sender_type === "user" && (
                                                        <span className="text-gray-400">
                                                            Anda:{" "}
                                                        </span>
                                                    )}
                                                    {room.last_message.message}
                                                </>
                                            ) : (
                                                <span className="italic text-gray-400">
                                                    Mulai obrolan
                                                </span>
                                            )}
                                        </p>
                                        {room.unread_count > 0 && (
                                            <span className="shrink-0 px-1.5 py-0.5 bg-brand-orange text-white text-[10px] font-bold rounded-full">
                                                {room.unread_count}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </button>
                        );
                    })
                )}
            </div>
        </div>
    );
}

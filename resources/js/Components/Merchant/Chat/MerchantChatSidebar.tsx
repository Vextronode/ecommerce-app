import React from "react";
import { MerchantChatRoomItem } from "@/types/chat";
import { MessageSquare, Search, User } from "lucide-react";

interface Props {
    rooms: MerchantChatRoomItem[];
    selectedRoomId: number | null;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onSelectRoom: (roomId: number) => void;
}

export default function MerchantChatSidebar({
    rooms,
    selectedRoomId,
    searchQuery,
    onSearchChange,
    onSelectRoom,
}: Props) {
    const filteredRooms = rooms.filter((r) =>
        r.customer.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <aside
            className={`w-full md:w-80 lg:w-96 flex flex-col border-r border-gray-100 bg-[#FAFBFD] ${
                selectedRoomId ? "hidden md:flex" : "flex"
            }`}
        >
            <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between mb-3">
                    <h1 className="text-base font-bold text-gray-900 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-brand-orange" />
                        Pesan Masuk
                    </h1>
                    <span className="text-xs font-semibold px-2 py-0.5 bg-orange-100 text-brand-orange rounded-full">
                        {rooms.length} Kontak
                    </span>
                </div>

                <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Cari nama pelanggan..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
                {filteredRooms.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">
                        <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        <p className="text-xs">Belum ada percakapan pelanggan</p>
                    </div>
                ) : (
                    filteredRooms.map((room) => {
                        const isSelected = room.id === selectedRoomId;
                        const isOnline = room.customer.is_online;

                        return (
                            <button
                                key={room.id}
                                onClick={() => onSelectRoom(room.id)}
                                className={`w-full text-left p-3.5 flex items-start gap-3 transition-colors ${
                                    isSelected
                                        ? "bg-orange-50/80 border-l-4 border-brand-orange"
                                        : "hover:bg-gray-100/60"
                                }`}
                            >
                                <div className="relative shrink-0">
                                    <div className="w-11 h-11 rounded-full bg-brand-orange/10 flex items-center justify-center overflow-hidden border border-brand-orange/20">
                                        {room.customer.profile_photo_path ? (
                                            <img
                                                src={`/storage/${room.customer.profile_photo_path}`}
                                                alt={room.customer.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <User className="w-5 h-5 text-brand-orange" />
                                        )}
                                    </div>
                                    <span
                                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ring-2 ring-white ${
                                            isOnline ? "bg-emerald-500" : "bg-gray-300"
                                        }`}
                                        title={isOnline ? "Online" : room.customer.last_seen}
                                    />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3
                                            className={`text-xs font-bold truncate ${
                                                isSelected
                                                    ? "text-brand-orange"
                                                    : "text-gray-800"
                                            }`}
                                        >
                                            {room.customer.name}
                                        </h3>
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
                                                    {room.last_message.sender_type === "merchant" && (
                                                        <span className="text-gray-400">
                                                            Anda:{" "}
                                                        </span>
                                                    )}
                                                    {room.last_message.message}
                                                </>
                                            ) : (
                                                <span className="italic text-gray-400">
                                                    Percakapan dimulai
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
        </aside>
    );
}

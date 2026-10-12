export interface CustomerInfo {
    id: number;
    name: string;
    email?: string;
    phone?: string;
    profile_photo_path?: string;
    is_online: boolean;
    last_seen: string;
}

export interface StoreInfo {
    id: number;
    name: string;
    slug?: string;
    logo_path?: string;
    is_online: boolean;
    last_seen: string;
}

export interface ProductAttachment {
    id: number;
    name: string;
    slug: string;
    price: number;
    image_path?: string;
}

export interface ChatMessageItem {
    id: number;
    chat_room_id: number;
    sender_id: number;
    sender_name?: string;
    sender_avatar?: string | null;
    sender_type: "user" | "merchant";
    message: string;
    product?: ProductAttachment | null;
    media_path?: string | null;
    media_type?: "image" | "video" | null;
    is_read: boolean;
    created_at: string;
    formatted_time: string;
}

export interface MerchantChatRoomItem {
    id: number;
    customer: CustomerInfo;
    last_message?: {
        message: string;
        created_at: string;
        sender_type: "user" | "merchant";
    } | null;
    unread_count: number;
    last_message_at?: string;
}

export interface BuyerChatRoomItem {
    id: number;
    store: StoreInfo;
    last_message?: {
        message: string;
        created_at: string;
        sender_type: "user" | "merchant";
    } | null;
    unread_count: number;
    last_message_at?: string;
}

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

export interface NegotiationItem {
    id: number;
    chat_room_id: number;
    status: "pending" | "accepted" | "rejected" | "countered" | "expired" | "purchased";
    original_price: number;
    offered_price: number;
    counter_price?: number | null;
    quantity: number;
    po_days?: number | null;
    note?: string | null;
    last_action_by: "user" | "merchant";
    expires_at?: string | null;
    is_expired?: boolean;
    agreed_price: number;
    purchased_at?: string | null;
    product?: {
        id: number;
        name: string;
        slug: string;
        image_path?: string;
        unit?: string;
    } | null;
    variant_name?: string | null;
}

export interface ChatMessageItem {
    id: number;
    chat_room_id: number;
    sender_id: number;
    sender_name?: string;
    sender_avatar?: string | null;
    sender_type: "user" | "merchant";
    message_type?: "text" | "negotiation";
    negotiation_id?: number | null;
    negotiation?: NegotiationItem | null;
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

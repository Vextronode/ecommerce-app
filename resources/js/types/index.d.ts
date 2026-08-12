export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: string;

    profile_photo_path?: string;
    phone?: string;
    gender?: string;
    dob?: string;
    role?: "user" | "pedagang" | "admin";
    is_password_changed?: boolean;
}

export type CartPreviewItem = {
    id: number;
    name: string;
    price: number;
    quantity: number;
    variant_name?: string | null;
    img: string;
};

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
    cart_count?: number;
    cart_preview?: {
        items: CartPreviewItem[];
        total_count: number;
    } | null;
};

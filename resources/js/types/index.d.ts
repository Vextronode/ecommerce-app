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

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
};

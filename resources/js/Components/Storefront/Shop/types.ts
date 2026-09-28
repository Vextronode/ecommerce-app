export interface StoreData {
    id: number;
    name: string;
    slug: string;
    description: string;
    logo_path: string | null;
    products_count: number;
    followers_count: number;
    average_rating: string;
    created_at: string;
}

export interface CategoryItem {
    id: number;
    name: string;
    slug: string;
    products_count?: number;
}

export interface ShopProduct {
    id: number;
    name: string;
    slug: string;
    store?: { name: string; slug?: string };
    store_name?: string;
    category?: { name: string; slug?: string };
    category_name?: string;
    price: number;
    rating?: number;
    sold?: number;
    image?: string;
    image_path?: string;
    [key: string]: any;
}

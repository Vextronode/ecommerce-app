export interface ProductDetailImage {
    src: string;
    alt: string;
    objectPosition?: string;
}

export interface PreparationOption {
    id: string;
    label: string;
    description: string;
}

export interface GuaranteeItem {
    title: string;
    description: string;
    icon: "snowflake" | "clock" | "shield";
    tone: "blue" | "green";
}

export interface ProductDetailData {
    id: number | string;
    name: string;
    price: number | string;
    unit: string;
    location: string;
    availableStock: number;
    description: string;
    images: ProductDetailImage[];
    preparationOptions: PreparationOption[];
    guarantees: GuaranteeItem[];
}

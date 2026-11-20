# Entity Relationship Diagram - Cibenda Mart

| Field | Detail |
|---|---|
| Versi | 1.0 |
| Tanggal | 20 November 2026 |
| Status | Aktif |
| Pemilik Dokumen | Project Manager |
| Dokumen Terkait | `index.md` dan seluruh `DD_*.md` |

Sumber: foreign key dan unique constraint pada `database/migrations/`. Tabel bawaan Laravel (`sessions`, `password_reset_tokens`, `cache`, `cache_locks`, `jobs`, `job_batches`, `failed_jobs`) dan `platform_settings` tidak memiliki relasi foreign key, sehingga tidak digambarkan.

## 1. Gambaran Umum

```mermaid
erDiagram
    users ||--o| stores : "memiliki"
    users ||--o{ addresses : "menyimpan"
    users ||--o{ carts : "mengisi"
    users ||--o{ orders : "membuat"
    users ||--o{ store_followers : "mengikuti"
    users ||--o{ product_reviews : "menulis"
    users ||--o{ chat_rooms : "membuka"
    users |o--o{ seller_applications : "dibuat dari"

    stores ||--o{ products : "menjual"
    stores ||--o{ orders : "menerima"
    stores ||--o{ withdrawals : "mencairkan"
    stores ||--o{ store_followers : "diikuti"
    stores ||--o{ chat_rooms : "melayani"
    stores |o--o{ seller_applications : "dibuat dari"

    categories ||--o{ products : "mengelompokkan"
    products ||--o{ product_variants : "memiliki"
    product_variants ||--o{ product_variant_options : "berisi"
    products ||--o{ product_skus : "memiliki"
    products ||--o{ product_images : "memiliki"
    products ||--o{ product_reviews : "diulas"

    orders ||--|{ order_items : "berisi"
    order_items ||--o| product_reviews : "diulas"
    products |o--o{ order_items : "dipesan"

    chat_rooms ||--o{ chat_messages : "berisi"
    chat_rooms ||--o{ chat_negotiations : "memuat"
    chat_negotiations |o--o{ carts : "dipakai"
    chat_negotiations |o--o{ chat_messages : "dirujuk"
    orders |o--o{ chat_negotiations : "hasil"
```

Kardinalitas `users` ke `stores` adalah satu ke nol-atau-satu karena `stores.user_id` bersifat UNIQUE. Kardinalitas `order_items` ke `product_reviews` adalah satu ke nol-atau-satu karena `product_reviews.order_item_id` bersifat UNIQUE.

## 2. Domain Pengguna dan Toko

```mermaid
erDiagram
    users {
        bigint id PK
        varchar email UK
        varchar google_id UK
        varchar nik UK
        varchar role
        varchar status
    }
    addresses {
        bigint id PK
        bigint user_id FK
        boolean is_primary
        decimal latitude
        decimal longitude
    }
    stores {
        bigint id PK
        bigint user_id FK,UK
        uuid business_ref UK
        varchar slug UK
        varchar sid_status
        decimal available_balance
        decimal pending_balance
    }
    seller_applications {
        bigint id PK
        uuid business_ref UK
        varchar status
        bigint store_id FK
        bigint user_id FK
    }
    store_followers {
        bigint id PK
        bigint user_id FK
        bigint store_id FK
    }
    withdrawals {
        bigint id PK
        bigint store_id FK
        varchar reference_no UK
        decimal amount
        varchar status
        boolean needs_reconciliation
    }

    users ||--o{ addresses : ""
    users ||--o| stores : ""
    users ||--o{ store_followers : ""
    stores ||--o{ store_followers : ""
    stores ||--o{ withdrawals : ""
    users |o--o{ seller_applications : ""
    stores |o--o{ seller_applications : ""
```

`stores.business_ref` dan `seller_applications.business_ref` memuat referensi usaha yang sama dari SID. Hubungan ini tidak dikunci dengan foreign key.

## 3. Domain Katalog

```mermaid
erDiagram
    categories {
        bigint id PK
        varchar slug UK
    }
    products {
        bigint id PK
        bigint store_id FK
        bigint category_id FK
        varchar slug UK
        decimal price
        int stock
        boolean is_active
        boolean is_preorder
    }
    product_variants {
        bigint id PK
        bigint product_id FK
    }
    product_variant_options {
        bigint id PK
        bigint product_variant_id FK
    }
    product_skus {
        bigint id PK
        bigint product_id FK
        varchar variant_name
        decimal price
        int stock
    }
    product_images {
        bigint id PK
        bigint product_id FK
    }
    product_reviews {
        bigint id PK
        bigint user_id FK
        bigint store_id FK
        bigint product_id FK
        bigint order_item_id FK,UK
        int rating
    }

    categories ||--o{ products : ""
    products ||--o{ product_variants : ""
    product_variants ||--o{ product_variant_options : ""
    products ||--o{ product_skus : ""
    products ||--o{ product_images : ""
    products ||--o{ product_reviews : ""
```

## 4. Domain Transaksi

```mermaid
erDiagram
    carts {
        bigint id PK
        bigint user_id FK
        bigint product_id FK
        varchar preparation_option
        bigint negotiation_id FK
    }
    orders {
        bigint id PK
        bigint store_id FK
        bigint user_id FK
        varchar invoice_number UK
        varchar parent_transaction_id
        varchar payment_status
        enum shipping_status
        decimal total_amount
    }
    order_items {
        bigint id PK
        bigint order_id FK
        bigint product_id FK
        varchar product_name
        decimal price
        int quantity
    }
    product_reviews {
        bigint id PK
        bigint order_item_id FK,UK
    }

    orders ||--|{ order_items : ""
    order_items ||--o| product_reviews : ""
```

`carts.user_id`, `carts.product_id`, `orders.user_id`, `orders.store_id`, dan `order_items.product_id` merujuk ke `users`, `products`, dan `stores` seperti pada Gambaran Umum. `order_items.product_id` menjadi NULL bila produk dihapus. Pesanan dari satu checkout dikelompokkan melalui `parent_transaction_id` tanpa tabel induk.

## 5. Domain Obrolan dan Tawar-Menawar

```mermaid
erDiagram
    chat_rooms {
        bigint id PK
        bigint user_id FK
        bigint store_id FK
    }
    chat_messages {
        bigint id PK
        bigint chat_room_id FK
        bigint sender_id FK
        varchar message_type
        bigint product_id FK
        bigint negotiation_id FK
    }
    chat_negotiations {
        bigint id PK
        bigint chat_room_id FK
        bigint user_id FK
        bigint store_id FK
        bigint product_id FK
        bigint product_sku_id FK
        enum status
        timestamp expires_at
        bigint order_id FK
    }
    carts {
        bigint id PK
        bigint negotiation_id FK
    }
    orders {
        bigint id PK
    }

    chat_rooms ||--o{ chat_messages : ""
    chat_rooms ||--o{ chat_negotiations : ""
    chat_negotiations |o--o{ chat_messages : ""
    chat_negotiations |o--o{ carts : ""
    orders |o--o{ chat_negotiations : ""
```

Unique: `chat_rooms` (`user_id`, `store_id`), sehingga setiap pasangan pembeli dan toko hanya memiliki satu ruang obrolan.

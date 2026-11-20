# Data Dictionary - Domain: Katalog Produk

Sumber: `2026_07_09_061349_create_categories_table.php`, `2026_07_09_061349_create_products_table.php` dan migrasi lanjutan pada tabel `products`, `2026_07_10_141934_create_product_variants_table.php`, `2026_07_10_141935_create_product_variant_options_table.php`, `2026_07_11_051158_create_product_skus_table.php`, `2026_07_10_141935_create_product_images_table.php`, `2026_07_18_144828_create_product_reviews_table.php`, `app/Models/Product.php`.

## Entity: `categories`

| Field | Tipe Data | Deskripsi |
|---|---|---|
| id | BIGINT UNSIGNED | Primary key |
| name | VARCHAR(255) | Nama kategori |
| slug | VARCHAR(255), UNIQUE | Slug URL kategori |
| timestamps | | |

Data kategori diisi oleh `CatalogSeeder`.

## Entity: `products`

| Field | Tipe Data | Deskripsi |
|---|---|---|
| id | BIGINT UNSIGNED | Primary key |
| store_id | BIGINT UNSIGNED, FK ke `stores.id`, cascade | Toko penjual |
| category_id | BIGINT UNSIGNED, FK ke `categories.id`, cascade | Kategori produk |
| name | VARCHAR(255) | Nama produk |
| slug | VARCHAR(255), UNIQUE | Slug URL produk |
| description | TEXT, NULLABLE | Deskripsi produk |
| price | DECIMAL(12,2) | Harga dasar |
| unit | VARCHAR(20), NULLABLE | Satuan jual, misalnya kg, gram, ekor |
| stock | INTEGER, default 0 | Stok total produk |
| image_path | VARCHAR(255), NULLABLE | Foto utama |
| is_active | BOOLEAN, default true | Produk tampil di etalase |
| is_preorder | BOOLEAN, default false | Produk pra-pesan |
| po_days | INTEGER, default 0 | Estimasi waktu penyiapan pra-pesan, dalam hari |
| po_hours | INTEGER, default 0 | Estimasi waktu penyiapan pra-pesan, dalam jam |
| timestamps | | |

Index: `products_store_active_idx` (`store_id`, `is_active`).

Saat produk dibuat atau diubah, nama produk, deskripsi, nama varian, pilihan varian, dan nama SKU diperiksa terhadap kata kunci produk terlarang (aturan validasi `NoProhibitedKeywords` yang memakai `ProhibitedItemGuardService`).

## Entity: `product_variants`

Kelompok varian sebuah produk.

| Field | Tipe Data | Deskripsi |
|---|---|---|
| id | BIGINT UNSIGNED | Primary key |
| product_id | BIGINT UNSIGNED, FK ke `products.id`, cascade | Produk induk |
| name | VARCHAR(255) | Nama kelompok varian |
| timestamps | | |

## Entity: `product_variant_options`

Pilihan dalam satu kelompok varian, misalnya "Fillet" atau "Utuh".

| Field | Tipe Data | Deskripsi |
|---|---|---|
| id | BIGINT UNSIGNED | Primary key |
| product_variant_id | BIGINT UNSIGNED, FK ke `product_variants.id`, cascade | Kelompok varian |
| name | VARCHAR(255) | Nama pilihan |
| timestamps | | |

## Entity: `product_skus`

Kombinasi varian yang dapat dibeli, dengan harga dan stok sendiri.

| Field | Tipe Data | Deskripsi |
|---|---|---|
| id | BIGINT UNSIGNED | Primary key |
| product_id | BIGINT UNSIGNED, FK ke `products.id`, cascade | Produk induk |
| variant_name | VARCHAR(255) | Nama kombinasi varian, dicocokkan dengan `carts.preparation_option` dan `order_items.variant_name` |
| price | DECIMAL(15,2) | Harga SKU |
| stock | INTEGER, default 0 | Stok SKU |
| timestamps | | |

Checkout mengurangi stok SKU dan stok `products` sekaligus.

## Entity: `product_images`

| Field | Tipe Data | Deskripsi |
|---|---|---|
| id | BIGINT UNSIGNED | Primary key |
| product_id | BIGINT UNSIGNED, FK ke `products.id`, cascade | Produk induk |
| image_path | VARCHAR(255) | Path foto tambahan di storage |
| timestamps | | |

## Entity: `product_reviews`

Ulasan pembeli untuk satu item pesanan.

| Field | Tipe Data | Deskripsi |
|---|---|---|
| id | BIGINT UNSIGNED | Primary key |
| user_id | BIGINT UNSIGNED, FK ke `users.id`, cascade | Pemberi ulasan |
| store_id | BIGINT UNSIGNED, FK ke `stores.id`, cascade | Toko yang diulas |
| product_id | BIGINT UNSIGNED, FK ke `products.id`, cascade | Produk yang diulas |
| order_item_id | BIGINT UNSIGNED, FK ke `order_items.id`, cascade, UNIQUE | Item pesanan yang diulas. Satu item hanya dapat diulas satu kali |
| rating | INTEGER, default 5 | Nilai produk, 1 sampai 5 |
| comment | TEXT, NULLABLE | Isi ulasan, maksimal 1.000 karakter |
| is_anonymous | BOOLEAN, default false | Sembunyikan nama pengulas |
| seller_rating | INTEGER, NULLABLE | Nilai pelayanan penjual, 1 sampai 5 |
| shipping_rating | INTEGER, NULLABLE | Nilai kecepatan pengiriman, 1 sampai 5 |
| courier_rating | INTEGER, NULLABLE | Nilai pelayanan kurir |
| images | JSON, NULLABLE | Daftar path foto ulasan (cast `array`) |
| timestamps | | |

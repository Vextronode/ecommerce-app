# Data Dictionary - Domain: Keranjang dan Pesanan

Sumber: `2026_07_09_113359_create_carts_table.php`, `2026_07_09_160903_create_orders_table.php`, `2026_07_09_160904_create_order_items_table.php` dan migrasi lanjutan pada ketiga tabel tersebut, `app/Models/Order.php`, `app/Http/Controllers/CheckoutController.php`, `app/Services/PaymentSyncService.php`.

## Entity: `carts`

Isi keranjang belanja pengguna.

| Field | Tipe Data | Deskripsi |
|---|---|---|
| id | BIGINT UNSIGNED | Primary key |
| user_id | BIGINT UNSIGNED, FK ke `users.id`, cascade | Pemilik keranjang |
| product_id | BIGINT UNSIGNED, FK ke `products.id`, cascade | Produk |
| quantity | INTEGER | Jumlah |
| preparation_option | VARCHAR(255) | Nama varian (`product_skus.variant_name`), atau string kosong untuk produk tanpa varian |
| negotiation_id | BIGINT UNSIGNED, NULLABLE, FK ke `chat_negotiations.id`, set null | Hasil tawar yang dipakai sebagai harga |
| timestamps | | |

Unique: `carts_user_product_preparation_unique` (`user_id`, `product_id`, `preparation_option`).

## Entity: `orders`

Satu baris mewakili pesanan untuk satu toko. Checkout yang memuat beberapa toko menghasilkan beberapa baris dengan `parent_transaction_id` yang sama.

### Identitas dan pelanggan

| Field | Tipe Data | Deskripsi |
|---|---|---|
| id | BIGINT UNSIGNED | Primary key |
| store_id | BIGINT UNSIGNED, FK ke `stores.id`, cascade | Toko penjual |
| user_id | BIGINT UNSIGNED, FK ke `users.id`, cascade | Pembeli |
| invoice_number | VARCHAR(255), UNIQUE | Nomor invoice, juga dipakai pada URL pelacakan |
| parent_transaction_id | VARCHAR(255), NULLABLE, INDEX | Pengelompok pesanan dari satu checkout |
| customer_name | VARCHAR(255) | Nama penerima (*data pribadi*) |
| customer_phone | VARCHAR(255) | Telepon penerima (*data pribadi*) |
| notes | TEXT, NULLABLE | Catatan pembeli |

### Pengiriman

| Field | Tipe Data | Deskripsi |
|---|---|---|
| shipping_address | TEXT | Alamat tujuan, disalin dari `addresses` (*data pribadi*) |
| shipping_latitude | DECIMAL(10,8), NULLABLE | Titik tujuan |
| shipping_longitude | DECIMAL(11,8), NULLABLE | Titik tujuan |
| delivery_method | VARCHAR(255), default `Standard` | Nilai yang diterima checkout: `local_delivery`, `self_pickup` |
| shipping_status | ENUM, default `pending` | `pending`, `processing`, `shipped`, `delivered`, `cancelled` |
| shipping_pin | VARCHAR(4), NULLABLE | PIN serah terima 4 digit. Diisi sistem, tidak termasuk kolom fillable |
| delivery_batch_token | VARCHAR(64), NULLABLE, INDEX | Token pengantaran serentak (batch) |

### Rincian biaya

| Field | Tipe Data | Deskripsi |
|---|---|---|
| subtotal | DECIMAL(12,2), default 0 | Total harga produk |
| shipping_cost | DECIMAL(12,2), default 0 | Ongkos kirim. `local_delivery`: Rp5.000 untuk 2 km pertama ditambah Rp2.000 per km berikutnya (jarak garis lurus), atau Rp15.000 bila koordinat tidak tersedia. `self_pickup`: 0 |
| service_fee | DECIMAL(12,2), default 0 | Biaya layanan platform. Dalam satu checkout hanya dibebankan pada pesanan toko pertama; pesanan toko lainnya bernilai 0 |
| tax_amount | DECIMAL(12,2), default 0 | Nominal pajak sesuai pengaturan `enable_tax` dan `tax_percentage` |
| total_amount | DECIMAL(12,2) | `subtotal` + `shipping_cost` + `service_fee` + `tax_amount` |

Nominal yang dikreditkan ke saldo toko adalah `subtotal` + `shipping_cost` (`Order::merchantNetAmount`).

### Pembayaran

| Field | Tipe Data | Deskripsi |
|---|---|---|
| payment_method | VARCHAR(255), default `COD` | Nilai yang diterima checkout: `va`, `qris`, `gopay`, `cod` |
| payment_type | VARCHAR(255), NULLABLE | Tipe pembayaran dari respons Midtrans, misalnya `bank_transfer` |
| payment_channel | VARCHAR(255), NULLABLE | `bca_va`, `bni_va`, `bri_va`, `permata_va`, `mandiri_bill`, `qris`, `gopay`, `cod` |
| va_number | VARCHAR(255), NULLABLE | Nomor Virtual Account |
| bill_key | VARCHAR(255), NULLABLE | Bill key Mandiri Bill |
| biller_code | VARCHAR(255), NULLABLE | Biller code Mandiri Bill |
| qr_code_url | TEXT, NULLABLE | URL QRIS atau GoPay |
| payment_expiry_time | TIMESTAMP, NULLABLE | Batas waktu pembayaran, 24 jam sejak charge |
| payment_payload | JSON, NULLABLE | Respons charge dari Midtrans (cast `array`) |
| payment_status | VARCHAR(50), default `pending` | `pending`, `paid`, `failed`, `refunded`. Pada MySQL diubah dari ENUM ke VARCHAR oleh migrasi |

### Penanda proses

Kolom berikut menjaga agar proses saldo dan stok hanya terjadi satu kali (idempoten).

| Field | Tipe Data | Deskripsi |
|---|---|---|
| escrow_credited_at | TIMESTAMP, NULLABLE | Nominal pesanan sudah ditambahkan ke `stores.pending_balance` |
| balance_credited_at | TIMESTAMP, NULLABLE | Nominal pesanan sudah dipindahkan ke `stores.available_balance` |
| stock_restored_at | TIMESTAMP, NULLABLE | Stok sudah dikembalikan karena pembatalan |
| timestamps | | |

Kolom yang disembunyikan dari serialisasi model: `payment_payload`, `shipping_pin`, `delivery_batch_token`, `balance_credited_at`, `escrow_credited_at`, `stock_restored_at`.

Index: `orders_store_status_created_idx` (`store_id`, `shipping_status`, `created_at`), `orders_user_created_idx` (`user_id`, `created_at`), `orders_payment_status_idx` (`payment_status`), `orders_status_updated_idx` (`shipping_status`, `updated_at`).

## Entity: `order_items`

Rincian produk dalam pesanan. Nama, harga, dan varian disalin saat transaksi sehingga tidak berubah meskipun produk diubah atau dihapus.

| Field | Tipe Data | Deskripsi |
|---|---|---|
| id | BIGINT UNSIGNED | Primary key |
| order_id | BIGINT UNSIGNED, FK ke `orders.id`, cascade | Pesanan |
| product_id | BIGINT UNSIGNED, NULLABLE, FK ke `products.id`, set null | Produk asal |
| product_name | VARCHAR(255) | Nama produk saat transaksi |
| price | DECIMAL(12,2) | Harga satuan saat transaksi, termasuk harga hasil tawar |
| quantity | INTEGER | Jumlah |
| unit | VARCHAR(255), default `pcs` | Satuan |
| variant_name | VARCHAR(255), NULLABLE | Nama varian saat transaksi |
| timestamps | | |

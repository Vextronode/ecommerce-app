# Data Dictionary - Cibenda Mart

| Field | Detail |
|---|---|
| Versi | 1.0 |
| Tanggal | 20 November 2026 |
| Status | Aktif |
| Pemilik Dokumen | Project Manager |
| Dokumen Terkait | `ERD_cimart.md`, `../PANDUAN_AKUN_DAN_AUTENTIKASI.md`, `../sid-thirdparty.md` |

## 1. Cakupan

Data Dictionary mencatat seluruh tabel pada database aplikasi Cibenda Mart. Sumber skema adalah status akhir dari 57 file migrasi di `database/migrations/`, dilengkapi cast dan konstanta pada `app/Models/`. Database yang digunakan adalah MySQL 8.0. Pengujian otomatis memakai SQLite in-memory.

## 2. Struktur Dokumen

| Dokumen | Domain | Tabel |
|---|---|---|
| `DD_users_auth.md` | Pengguna dan autentikasi | `users`, `addresses`, `password_reset_tokens`, `sessions` |
| `DD_toko_pedagang.md` | Toko dan pedagang | `stores`, `seller_applications`, `store_followers`, `withdrawals` |
| `DD_katalog.md` | Katalog produk | `categories`, `products`, `product_variants`, `product_variant_options`, `product_skus`, `product_images`, `product_reviews` |
| `DD_transaksi.md` | Keranjang dan pesanan | `carts`, `orders`, `order_items` |
| `DD_chat.md` | Obrolan dan tawar-menawar | `chat_rooms`, `chat_messages`, `chat_negotiations` |
| `DD_sistem.md` | Sistem | `platform_settings`, `notifications`, `cache`, `cache_locks`, `jobs`, `job_batches`, `failed_jobs` |
| `ERD_cimart.md` | Relasi antartabel | Seluruh tabel domain |

## 3. Konvensi

- Primary key `id` bertipe `BIGINT UNSIGNED` auto-increment, kecuali `notifications.id` (UUID), `sessions.id`, `password_reset_tokens.email`, `cache.key`, `cache_locks.key`, dan `job_batches.id` (string).
- Foreign key memakai pola `<entitas>_id`. Aturan hapus dicatat pada kolom Tipe Data: `cascade` (ikut terhapus) atau `set null`.
- Nominal uang bertipe `DECIMAL(12,2)` dalam Rupiah, kecuali `product_skus.price` yang bertipe `DECIMAL(15,2)`.
- Koordinat bertipe `DECIMAL(10,8)` untuk latitude dan `DECIMAL(11,8)` untuk longitude.
- `created_at` dan `updated_at` (`TIMESTAMP`, NULLABLE) diisi otomatis oleh Laravel. Pada tabel di dokumen domain, kedua kolom ini disingkat menjadi `timestamps`.
- Kolom bertanda *data pribadi* memuat data yang dilindungi UU 27/2022 tentang Pelindungan Data Pribadi.

## 4. Nilai Status dan Enumerasi

Sebagian besar kolom status bertipe `VARCHAR`. Nilai yang berlaku ditetapkan oleh validasi dan konstanta di kode.

| Kolom | Nilai | Sumber |
|---|---|---|
| `users.role` | `user` (pembeli), `pedagang`, `admin` | Middleware `role:` di `routes/web.php` |
| `users.status` | `active`, `warning`, `suspended`, `inactive` | `Admin\MerchantController` |
| `stores.sid_status` | `verified`, `pending`, `rejected` | `Admin\MerchantController` |
| `seller_applications.status` | `pending`, `accepted`, `rejected`, `cancelled` | `SellerApplication` |
| `seller_applications.category` | `kelontong`, `kuliner`, `non_kuliner` | `SellerApplication` |
| `orders.payment_status` | `pending`, `paid`, `failed`, `refunded` | `PaymentSyncService` |
| `orders.shipping_status` | `pending`, `processing`, `shipped`, `delivered`, `cancelled` | Migrasi `create_orders_table` |
| `orders.payment_method` | `va`, `qris`, `gopay`, `cod` | `CheckoutController` |
| `orders.payment_channel` | `bca_va`, `bni_va`, `bri_va`, `permata_va`, `mandiri_bill`, `qris`, `gopay`, `cod` | `CheckoutController` |
| `orders.delivery_method` | `local_delivery`, `self_pickup` | `CheckoutController` |
| `withdrawals.status` | `pending`, `processing`, `completed`, `failed` | `WithdrawalController`, `ProcessWithdrawalPayout` |
| `chat_messages.sender_type` | `user`, `merchant` | Migrasi `create_live_chat_tables` |
| `chat_messages.message_type` | `text`, `negotiation` | Chat dan negotiation controller |
| `chat_messages.media_type` | `image`, `video` | `ChatMediaProcessor` |
| `chat_negotiations.status` | `pending`, `countered`, `accepted`, `rejected`, `expired`, `purchased` | Migrasi `create_chat_negotiations_table` |
| `chat_negotiations.last_action_by` | `user`, `merchant` | Migrasi `create_chat_negotiations_table` |
| `platform_settings.type` | `boolean`, `number`, `string`, `json` | `PlatformSetting` |
| `platform_settings.group` | `finance`, `feature_flags`, `general` | `PlatformSetting` |

Label `orders.shipping_status` pada tab riwayat pesanan pembeli (`resources/js/Pages/History/Index.tsx`):

| Nilai | Label |
|---|---|
| `processing` | Dikemas |
| `shipped` | Dikirim |
| `delivered` | Selesai |
| `cancelled` | Dibatalkan |

Nilai `pending` tidak memiliki tab tersendiri.

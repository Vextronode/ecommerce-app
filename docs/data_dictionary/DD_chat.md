# Data Dictionary - Domain: Obrolan dan Tawar-Menawar

Sumber: `2026_09_29_164500_create_live_chat_tables.php`, `2026_09_29_183000_add_media_to_chat_messages_table.php`, `2026_10_18_211500_create_chat_negotiations_table.php`, `app/Models/ChatNegotiation.php`, `app/Services/ChatMediaProcessor.php`, `app/Http/Controllers/Storefront/NegotiationController.php`, `app/Http/Controllers/Merchant/NegotiationController.php`.

## Entity: `chat_rooms`

Ruang obrolan antara satu pembeli dan satu toko.

| Field | Tipe Data | Deskripsi |
|---|---|---|
| id | BIGINT UNSIGNED | Primary key |
| user_id | BIGINT UNSIGNED, FK ke `users.id`, cascade | Pembeli |
| store_id | BIGINT UNSIGNED, FK ke `stores.id`, cascade | Toko |
| last_message_at | TIMESTAMP, NULLABLE, INDEX | Waktu pesan terakhir, dipakai untuk urutan daftar obrolan |
| timestamps | | |

Unique: (`user_id`, `store_id`).

## Entity: `chat_messages`

| Field | Tipe Data | Deskripsi |
|---|---|---|
| id | BIGINT UNSIGNED | Primary key |
| chat_room_id | BIGINT UNSIGNED, FK ke `chat_rooms.id`, cascade | Ruang obrolan |
| sender_id | BIGINT UNSIGNED, FK ke `users.id`, cascade | Pengirim |
| sender_type | ENUM(`user`, `merchant`) | Pihak pengirim |
| message_type | VARCHAR(30), default `text` | `text` atau `negotiation` |
| message | TEXT, NULLABLE | Isi pesan. Kosong bila pesan hanya berisi media |
| product_id | BIGINT UNSIGNED, NULLABLE, FK ke `products.id`, set null | Produk yang dirujuk pesan |
| negotiation_id | BIGINT UNSIGNED, NULLABLE, FK ke `chat_negotiations.id`, set null | Tawaran yang dirujuk pesan bertipe `negotiation` |
| media_path | VARCHAR(255), NULLABLE | Path lampiran di storage |
| media_type | VARCHAR(50), NULLABLE | `image` (dienkode ulang oleh `ChatMediaProcessor`) atau `video` |
| is_read | BOOLEAN, default false | Sudah dibaca penerima |
| read_at | TIMESTAMP, NULLABLE | Waktu dibaca |
| timestamps | | |

Index: (`chat_room_id`, `created_at`), (`chat_room_id`, `is_read`).

## Entity: `chat_negotiations`

Tawaran harga dari pembeli beserta penawaran balik pedagang.

| Field | Tipe Data | Deskripsi |
|---|---|---|
| id | BIGINT UNSIGNED | Primary key |
| chat_room_id | BIGINT UNSIGNED, FK ke `chat_rooms.id`, cascade | Ruang obrolan |
| user_id | BIGINT UNSIGNED, FK ke `users.id`, cascade | Pembeli yang menawar |
| store_id | BIGINT UNSIGNED, FK ke `stores.id`, cascade | Toko |
| product_id | BIGINT UNSIGNED, FK ke `products.id`, cascade | Produk yang ditawar |
| product_sku_id | BIGINT UNSIGNED, NULLABLE, FK ke `product_skus.id`, set null | Varian yang ditawar |
| original_price | DECIMAL(12,2) | Harga asli saat penawaran dibuat |
| offered_price | DECIMAL(12,2) | Harga yang ditawarkan pembeli |
| counter_price | DECIMAL(12,2), NULLABLE | Harga tawaran balik pedagang |
| quantity | INT UNSIGNED, default 1 | Jumlah yang ditawar, 1 sampai 9999 |
| po_days | INT UNSIGNED, NULLABLE | Waktu pra-pesan yang diminta, 1 sampai 30 hari |
| note | VARCHAR(500), NULLABLE | Catatan penawaran |
| status | ENUM, default `pending` | `pending`, `countered`, `accepted`, `rejected`, `expired`, `purchased` |
| last_action_by | ENUM(`user`, `merchant`), default `user` | Pihak yang terakhir bertindak |
| expires_at | TIMESTAMP, INDEX | Batas berlaku tawaran, 24 jam sejak tawaran atau tawaran balik terakhir |
| purchased_at | TIMESTAMP, NULLABLE | Waktu tawaran dipakai checkout |
| order_id | BIGINT UNSIGNED, NULLABLE, FK ke `orders.id`, set null | Pesanan hasil tawaran |
| timestamps | | |

Index: (`chat_room_id`, `status`), (`user_id`, `status`), (`store_id`, `status`), (`product_id`, `status`), (`expires_at`).

Tawaran berstatus `pending`, `countered`, atau `accepted` yang melewati `expires_at` dianggap kedaluwarsa oleh `ChatNegotiation::isExpired()`. Nilai `status` di database baru diubah menjadi `expired` ketika ada aksi atas tawaran tersebut, yaitu terima atau tawar balik oleh pedagang, serta terima tawaran balik atau checkout oleh pembeli. Tawaran kedaluwarsa yang tidak pernah ditindaklanjuti tetap menyimpan status lamanya.

# Data Dictionary - Domain: Toko dan Pedagang

Sumber: `2026_07_08_160422_create_stores_table.php` dan migrasi lanjutan pada tabel `stores`, `2026_11_12_100000_create_seller_applications_table.php`, `2026_07_18_153713_create_store_followers_table.php`, `2026_07_22_230000_create_withdrawals_table.php` dan migrasi lanjutannya, `app/Models/SellerApplication.php`, `app/Models/Withdrawal.php`.

## Entity: `stores`

Toko milik pedagang. Satu pengguna maksimal memiliki satu toko.

| Field | Tipe Data | Deskripsi |
|---|---|---|
| id | BIGINT UNSIGNED | Primary key |
| user_id | BIGINT UNSIGNED, FK ke `users.id`, cascade, UNIQUE | Pemilik toko |
| business_ref | CHAR(36) UUID, NULLABLE, UNIQUE | Referensi usaha dari SID, menghubungkan toko dengan `seller_applications` |
| name | VARCHAR(255) | Nama toko |
| support_email | VARCHAR(255), NULLABLE | Email layanan toko |
| slug | VARCHAR(255), UNIQUE | Slug URL toko |
| logo_path | VARCHAR(255), NULLABLE | Path logo di storage |
| description | TEXT, NULLABLE | Deskripsi toko |
| sid_status | VARCHAR(255), default `verified`, INDEX | Status verifikasi: `verified`, `pending`, `rejected`. Hanya toko `verified` yang dapat menerima pesanan |
| has_completed_tour | BOOLEAN, default false | Pedagang sudah menyelesaikan tur panduan dashboard |
| address | TEXT, NULLABLE | Alamat toko |
| latitude | DECIMAL(10,8), NULLABLE | Titik lokasi toko, dasar perhitungan ongkir |
| longitude | DECIMAL(11,8), NULLABLE | Titik lokasi toko |
| subdistrict | VARCHAR(255), NULLABLE | Kecamatan |
| available_balance | DECIMAL(12,2), default 0 | Saldo penjualan yang dapat dicairkan |
| pending_balance | DECIMAL(12,2), default 0 | Saldo escrow dari pesanan yang sudah dibayar tetapi belum selesai |
| bank_name | VARCHAR(255), NULLABLE | Bank tujuan pencairan |
| bank_account_number | VARCHAR(255), NULLABLE | Nomor rekening (*data pribadi*) |
| bank_account_holder | VARCHAR(255), NULLABLE | Nama pemilik rekening (*data pribadi*) |
| timestamps | | |

Kolom yang disembunyikan dari serialisasi model: `available_balance`, `pending_balance`, `bank_name`, `bank_account_number`, `bank_account_holder`, `has_completed_tour`.

Alur saldo: pembayaran berhasil menambah `pending_balance`. Pesanan selesai memindahkan nominal ke `available_balance`. Pencairan mengurangi `available_balance`.

## Entity: `seller_applications`

Permohonan pendaftaran pedagang yang diambil dari SIDUTama. Kolom data pribadi bersifat NULLABLE agar dapat dikosongkan ketika permohonan dibatalkan.

| Field | Tipe Data | Deskripsi |
|---|---|---|
| id | BIGINT UNSIGNED | Primary key |
| business_ref | CHAR(36) UUID, UNIQUE | Referensi usaha dari SID |
| status | VARCHAR(30), default `pending`, INDEX | `pending`, `accepted`, `rejected`, `cancelled` |
| requested_at | TIMESTAMP, INDEX | Waktu permohonan dibuat di SID |
| decided_at | TIMESTAMP, NULLABLE | Waktu keputusan admin |
| note | TEXT, NULLABLE | Catatan keputusan, misalnya alasan penolakan |
| nik | VARCHAR(16), NULLABLE, INDEX | NIK pemohon (*data pribadi*) |
| name | VARCHAR(255), NULLABLE | Nama pemohon (*data pribadi*) |
| business_name | VARCHAR(255), NULLABLE | Nama usaha |
| business_activity | VARCHAR(255), NULLABLE | Kegiatan usaha |
| category | VARCHAR(50), NULLABLE, INDEX | Kategori dari SID: `kelontong`, `kuliner`, `non_kuliner` |
| category_label | VARCHAR(100), NULLABLE | Label kategori dari SID |
| email | VARCHAR(255), NULLABLE, INDEX | Email pemohon (*data pribadi*) |
| phone | VARCHAR(25), NULLABLE | Telepon pemohon (*data pribadi*) |
| address | TEXT, NULLABLE | Alamat usaha |
| letter_number | VARCHAR(100), NULLABLE, INDEX | Nomor Surat Keterangan Usaha |
| issued_at | TIMESTAMP, NULLABLE | Tanggal terbit SKU |
| expires_at | TIMESTAMP, NULLABLE | Tanggal kedaluwarsa SKU |
| store_id | BIGINT UNSIGNED, NULLABLE, FK ke `stores.id`, set null | Toko yang dibuat dari permohonan ini |
| user_id | BIGINT UNSIGNED, NULLABLE, FK ke `users.id`, set null | Akun yang dibuat dari permohonan ini |
| raw_payload | JSON, NULLABLE | Respons asli dari API SID (cast `array`) |
| timestamps | | |

## Entity: `store_followers`

Relasi pengikut toko.

| Field | Tipe Data | Deskripsi |
|---|---|---|
| id | BIGINT UNSIGNED | Primary key |
| user_id | BIGINT UNSIGNED, FK ke `users.id`, cascade | Pengguna yang mengikuti |
| store_id | BIGINT UNSIGNED, FK ke `stores.id`, cascade | Toko yang diikuti |
| timestamps | | |

Unique: (`user_id`, `store_id`).

## Entity: `withdrawals`

Permintaan pencairan saldo pedagang melalui Midtrans IRIS.

| Field | Tipe Data | Deskripsi |
|---|---|---|
| id | BIGINT UNSIGNED | Primary key |
| store_id | BIGINT UNSIGNED, FK ke `stores.id`, cascade | Toko pemohon |
| reference_no | VARCHAR(255), UNIQUE | Nomor referensi pencairan |
| amount | DECIMAL(12,2) | Nominal pencairan, minimum Rp10.000 |
| bank_name | VARCHAR(255) | Bank tujuan, disalin dari toko saat pengajuan |
| account_number | VARCHAR(255) | Nomor rekening tujuan (*data pribadi*) |
| account_holder | VARCHAR(255) | Nama pemilik rekening (*data pribadi*) |
| status | VARCHAR(50), default `pending` | `pending`, `processing`, `completed`, `failed` |
| payout_sent_at | TIMESTAMP, NULLABLE | Waktu permintaan payout dikirim ke IRIS |
| needs_reconciliation | BOOLEAN, default false, INDEX | Diisi `true` saat pencairan ditandai `failed` tetapi payout mungkin sudah terkirim ke IRIS. Saldo tidak dikembalikan otomatis dan pencairan dicek ulang oleh perintah `withdrawals:reconcile` |
| notes | TEXT, NULLABLE | Catatan, misalnya alasan gagal |
| timestamps | | |

Index: `withdrawals_store_status_idx` (`store_id`, `status`), `withdrawals_status_payout_sent_idx` (`status`, `payout_sent_at`).

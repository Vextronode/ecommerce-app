# Data Dictionary - Domain: Pengguna dan Autentikasi

Sumber: `database/migrations/0001_01_01_000000_create_users_table.php` dan migrasi lanjutan pada tabel `users`, `2026_06_27_012322_create_addresses_table.php`, `2026_08_09_083447_add_coordinates_to_locations_tables.php`, `app/Models/User.php`.

## Entity: `users`

Menyimpan seluruh akun pengguna: pembeli, pedagang, dan admin.

| Field | Tipe Data | Deskripsi |
|---|---|---|
| id | BIGINT UNSIGNED | Primary key |
| name | VARCHAR(255) | Nama pengguna |
| email | VARCHAR(255), UNIQUE | Email login (*data pribadi*) |
| google_id | VARCHAR(255), NULLABLE, UNIQUE | ID akun Google yang tertaut |
| role | VARCHAR(255), default `user` | Peran: `user`, `pedagang`, `admin` |
| status | VARCHAR(255), default `active`, INDEX | Status akun: `active`, `warning`, `suspended`, `inactive` |
| profile_photo_path | VARCHAR(255), NULLABLE | Path foto profil di storage |
| phone | VARCHAR(255), NULLABLE | Nomor telepon (*data pribadi*) |
| nik | VARCHAR(16), NULLABLE, UNIQUE | NIK pedagang dari SID (*data pribadi*) |
| last_seen_at | TIMESTAMP, NULLABLE | Waktu terakhir aktif, dipakai indikator online di chat |
| gender | VARCHAR(255), NULLABLE | Jenis kelamin |
| dob | DATE, NULLABLE | Tanggal lahir (*data pribadi*) |
| email_verified_at | TIMESTAMP, NULLABLE | Waktu verifikasi email |
| password | VARCHAR(255), NULLABLE | Hash password (cast `hashed`) |
| is_password_changed | BOOLEAN, default true | `false` untuk pedagang yang belum mengganti password awal dari admin |
| remember_token | VARCHAR(100), NULLABLE | Token "ingat saya" |
| fcm_token | VARCHAR(255), NULLABLE, UNIQUE, collation `utf8mb4_bin` | Token Firebase Cloud Messaging untuk push notification |
| notification_settings | JSON, NULLABLE | Preferensi notifikasi (cast `array`), lihat di bawah |
| timestamps | | |

Kunci `notification_settings` (semua boolean): `menunggu_pembayaran`, `menunggu_konfirmasi`, `pesanan_diproses`, `pesanan_dikirim`, `pesanan_selesai`, `pengingat`.

Kolom yang disembunyikan dari serialisasi model (atribut `#[Hidden]`): `password`, `remember_token`, `fcm_token`, `google_id`, `nik`, `email`, `phone`, `dob`, `gender`, `notification_settings`, `is_password_changed`, `email_verified_at`.

## Entity: `addresses`

Buku alamat pengiriman milik pembeli.

| Field | Tipe Data | Deskripsi |
|---|---|---|
| id | BIGINT UNSIGNED | Primary key |
| user_id | BIGINT UNSIGNED, FK ke `users.id`, cascade | Pemilik alamat |
| label | VARCHAR(255) | Label alamat, misalnya Rumah |
| is_primary | BOOLEAN, default false | Alamat utama |
| recipient_name | VARCHAR(255) | Nama penerima (*data pribadi*) |
| phone | VARCHAR(255) | Telepon penerima (*data pribadi*) |
| full_address | TEXT | Alamat lengkap (*data pribadi*) |
| latitude | DECIMAL(10,8), NULLABLE | Titik lokasi dari peta |
| longitude | DECIMAL(11,8), NULLABLE | Titik lokasi dari peta |
| timestamps | | |

Pesanan tidak merujuk ke tabel ini. Alamat dan koordinat disalin ke `orders` saat checkout.

## Entity: `password_reset_tokens`

| Field | Tipe Data | Deskripsi |
|---|---|---|
| email | VARCHAR(255), PRIMARY KEY | Email pemohon reset |
| token | VARCHAR(255) | Hash token reset |
| created_at | TIMESTAMP, NULLABLE | Waktu token dibuat |

## Entity: `sessions`

Penyimpanan sesi bawaan Laravel.

| Field | Tipe Data | Deskripsi |
|---|---|---|
| id | VARCHAR(255), PRIMARY KEY | ID sesi |
| user_id | BIGINT UNSIGNED, NULLABLE, INDEX | Pengguna yang login (tanpa foreign key constraint) |
| ip_address | VARCHAR(45), NULLABLE | Alamat IP |
| user_agent | TEXT, NULLABLE | User agent peramban |
| payload | LONGTEXT | Data sesi terenkode |
| last_activity | INTEGER, INDEX | Unix timestamp aktivitas terakhir |

# Data Dictionary - Domain: Sistem

Sumber: `2026_11_17_100000_create_platform_settings_table.php`, `database/seeders/PlatformSettingSeeder.php`, `app/Models/PlatformSetting.php`, `2026_08_12_000000_create_notifications_table.php`, `routes/console.php`, `0001_01_01_000001_create_cache_table.php`, `0001_01_01_000002_create_jobs_table.php`.

## Entity: `platform_settings`

Pengaturan platform yang dapat diubah admin tanpa deploy ulang. Nilai dibaca melalui cache dan cache dihapus setiap kali nilai disimpan.

| Field | Tipe Data | Deskripsi |
|---|---|---|
| id | BIGINT UNSIGNED | Primary key |
| key | VARCHAR(60), UNIQUE | Nama pengaturan |
| value | TEXT, NULLABLE | Nilai tersimpan dalam bentuk string |
| type | VARCHAR(20), default `string` | Tipe konversi nilai: `boolean`, `number`, `string`, `json` |
| group | VARCHAR(50), default `general`, INDEX | Kelompok: `finance`, `feature_flags`, `general` |
| label | VARCHAR(100) | Label pada panel admin |
| description | TEXT, NULLABLE | Penjelasan pengaturan |
| timestamps | | |

Pengaturan yang tersedia (dari `PlatformSettingSeeder`):

| key | Group | Type | Nilai awal | Label |
|---|---|---|---|---|
| `enable_tax` | finance | boolean | `0` | Aktifkan Pajak (PPN) |
| `tax_percentage` | finance | number | `0` | Persentase Pajak PPN (%) |
| `enable_service_fee` | finance | boolean | `0` | Aktifkan Biaya Layanan |
| `service_fee_amount` | finance | number | `1000` | Nominal Biaya Layanan (Rp) |
| `enable_online_payment` | feature_flags | boolean | `1` | Pembayaran Online (Virtual Payment Gateway) |
| `enable_negotiation` | feature_flags | boolean | `1` | Fitur Tawar-Menawar Harga (Chat) |
| `enable_sid_sync` | feature_flags | boolean | `1` | Sinkronisasi Otomatis SIDUTama |
| `enable_withdrawal` | feature_flags | boolean | `1` | Pencairan Saldo Pedagang (Withdrawal) |
| `enable_local_delivery` | feature_flags | boolean | `1` | Pengiriman Kurir Lokal |

## Entity: `notifications`

Notifikasi dalam aplikasi (database channel Laravel).

| Field | Tipe Data | Deskripsi |
|---|---|---|
| id | CHAR(36) UUID, PRIMARY KEY | ID notifikasi |
| type | VARCHAR(255) | Kelas notifikasi |
| notifiable_type | VARCHAR(255) | Tipe model penerima |
| notifiable_id | BIGINT UNSIGNED | ID penerima |
| data | TEXT | Isi notifikasi dalam format JSON |
| read_at | TIMESTAMP, NULLABLE | Waktu dibaca |
| timestamps | | |

Index: (`notifiable_type`, `notifiable_id`), `notifications_created_at_idx` (`created_at`). Baris yang lebih tua dari 60 hari dihapus setiap hari oleh scheduler.

## Tabel Bawaan Laravel

| Tabel | Fungsi | Kolom |
|---|---|---|
| `cache` | Penyimpanan cache database | `key` (PK), `value` MEDIUMTEXT, `expiration` BIGINT INDEX |
| `cache_locks` | Atomic lock | `key` (PK), `owner`, `expiration` BIGINT INDEX |
| `jobs` | Antrean job | `id`, `queue` INDEX, `payload` LONGTEXT, `attempts`, `reserved_at`, `available_at`, `created_at` |
| `job_batches` | Batch job | `id` (PK string), `name`, `total_jobs`, `pending_jobs`, `failed_jobs`, `failed_job_ids`, `options`, `cancelled_at`, `created_at`, `finished_at` |
| `failed_jobs` | Job yang gagal | `id`, `uuid` UNIQUE, `connection`, `queue`, `payload`, `exception`, `failed_at`; index (`connection`, `queue`, `failed_at`) |

Konfigurasi `.env.example` memakai driver `database` untuk cache, sesi, dan antrean, sehingga tabel-tabel ini dipakai pada lingkungan lokal. Konfigurasi `.env.docker.example` memakai Redis untuk ketiganya, sehingga tabel-tabel ini tetap dibuat oleh migrasi tetapi tidak diisi.

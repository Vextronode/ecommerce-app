# Temuan - Infrastruktur, CI, Repositori, dan Dokumentasi Repo

## INF-06 Redis tanpa persistensi menyimpan antrean job dan data operasional

| Field | Isi |
|---|---|
| Keparahan | High |
| Status | Terbuka |
| Lokasi | `docker-compose.yml` (layanan `redis_cibenda`); `.env.docker.example` (`QUEUE_CONNECTION`, `CACHE_STORE`, `SESSION_DRIVER`); `app/Http/Controllers/Merchant/WithdrawalController.php`; `app/Console/Commands/AlertStuckWithdrawals.php:31-33`; `app/Console/Commands/ReconcileWithdrawals.php:132` |
| Kondisi Aktual | Redis dijalankan dengan `--appendonly no --save ""`, sehingga isinya hilang setiap kali container dimulai ulang. Container aplikasi membaca konfigurasi dari `.env.docker`; contohnya (`.env.docker.example`) memakai Redis untuk antrean job, cache, dan sesi. Isi `.env.docker` di server production tidak tersimpan di repositori. Data yang hanya ada di cache antara lain penanda kedatangan kurir (`order_arrived_*`), data pengantaran batch (`delivery_batch_*`), dan lokasi terakhir kurir (`driver_loc_*`). Pengajuan pencairan dana mengurangi saldo dan membuat `withdrawals` berstatus `pending`, lalu mengirim job `ProcessWithdrawalPayout` ke antrean. Peringatan dan rekonsiliasi pencairan hanya memeriksa status `processing` dan `failed`. |
| Dampak | Bila Redis dimulai ulang sebelum job pencairan dijalankan, pencairan tertahan di `pending` dengan saldo yang sudah terpotong, tanpa peringatan ke admin. Selama pencairan itu masih `pending`, pedagang juga tidak dapat mengajukan pencairan baru. Job notifikasi yang belum dijalankan hilang, seluruh pengguna keluar dari sesinya, dan data pengantaran batch serta penanda kedatangan kurir ikut hilang. |
| Bukti | `command: redis-server --appendonly no --save ""`; `.env.docker.example`: `QUEUE_CONNECTION=redis`, `CACHE_STORE=redis`, `SESSION_DRIVER=redis`. Query `AlertStuckWithdrawals` hanya memuat `status = 'processing'` atau `status = 'failed'` dengan `needs_reconciliation`. |
| Rekomendasi | Aktifkan persistensi Redis atau pindahkan antrean ke database, dan tambahkan pemeriksaan untuk pencairan `pending` yang tertahan. |

## INF-07 Peta dan rute bergantung pada server publik OSRM dan OpenStreetMap

| Field | Isi |
|---|---|
| Keparahan | Low |
| Status | Perlu konfirmasi |
| Lokasi | `resources/js/Components/Delivery/Map/osrmRouting.ts:85`; `resources/js/Components/Delivery/DeliveryMap.tsx:100`; `resources/js/Components/Delivery/BatchMap.tsx:89`; `resources/js/Hooks/useAddressMap.ts:32` |
| Kondisi Aktual | Rute jalan untuk pelacakan kurir diambil dari `https://router.project-osrm.org`, dan tile peta dari `https://{s}.tile.openstreetmap.org`. Keduanya adalah layanan publik yang dikelola pihak lain, dipanggil langsung dari peramban pengguna. |
| Dampak | Layanan publik tersebut tidak memberi jaminan ketersediaan dan memiliki kebijakan pemakaian sendiri. Bila dibatasi atau tidak tersedia, rute dan peta pelacakan tidak tampil. |
| Bukti | ``const url = `https://router.project-osrm.org/route/v1/driving/${queryParams}?overview=full&geometries=geojson`;`` |
| Rekomendasi | Pastikan pemakaian sesuai kebijakan masing-masing layanan, atau siapkan server rute dan tile sendiri untuk production. |

## INF-01 Commit langsung ke branch `dev` tanpa pull request

| Field | Isi |
|---|---|
| Keparahan | Medium |
| Status | Terbuka |
| Lokasi | Riwayat `origin/dev`; `docs/GIT_WORKFLOW.md` (bagian Larangan) |
| Kondisi Aktual | GIT_WORKFLOW melarang push langsung ke `dev`, dan branch `dev` berstatus terlindungi di GitHub. Riwayat first-parent `dev` memuat commit tanpa nomor pull request, antara lain `c17e637` (20 November 2026), `0b6207f`, `50003e9`, `fa3a6fc`, `857d5da`, `cfe19d9`, `6a7a69f` (19 November 2026), `891da08` (2 November 2026), dan `ba42787` (31 Oktober 2026). |
| Dampak | Perubahan masuk tanpa review dan tanpa jejak diskusi, termasuk perubahan konfigurasi deployment dan pengaturan platform. |
| Bukti | `git log --first-parent origin/dev` menampilkan commit tanpa akhiran `(#nomor)`. |
| Rekomendasi | Pastikan aturan proteksi branch tidak dapat dilewati, atau catat pengecualian yang diizinkan di GIT_WORKFLOW. |

## INF-02 Tidak ada status check wajib pada branch terlindungi

| Field | Isi |
|---|---|
| Keparahan | Medium |
| Status | Terbuka |
| Lokasi | Pengaturan branch protection `dev` di GitHub; `.github/workflows/ci.yml` |
| Kondisi Aktual | Proteksi branch `dev` tidak mewajibkan status check (`enforcement_level: off`, daftar check kosong). |
| Dampak | Pull request tetap dapat di-merge walaupun test atau build di CI gagal. |
| Bukti | `gh api repos/Vextronode/ecommerce-app/branches/dev` mengembalikan `required_status_checks` dengan `checks: []`. |
| Rekomendasi | Jadikan job `backend-tests` dan `frontend-build` sebagai status check wajib. |

## INF-03 Pemeriksaan gaya kode Pint tidak memblokir CI

| Field | Isi |
|---|---|
| Keparahan | Low |
| Status | Terbuka |
| Lokasi | `.github/workflows/ci.yml` (langkah "Code Style Check") |
| Kondisi Aktual | Langkah `./vendor/bin/pint --test` memakai `continue-on-error: true`. |
| Dampak | Pelanggaran gaya kode tidak menggagalkan CI. |
| Bukti | `continue-on-error: true` pada langkah Pint. |
| Rekomendasi | Tentukan apakah Pint wajib. Bila ya, hapus `continue-on-error`. |

## INF-04 Dua konfigurasi formatter dan file cache formatter ikut di-commit

| Field | Isi |
|---|---|
| Keparahan | Low |
| Status | Terbuka |
| Lokasi | `.php-cs-fixer.dist.php`, `.php-cs-fixer.cache`; `composer.json` (`laravel/pint`) |
| Kondisi Aktual | Repositori memiliki konfigurasi PHP-CS-Fixer sekaligus memakai Laravel Pint di CI. File cache `.php-cs-fixer.cache` ter-track di git. |
| Dampak | Dua formatter dapat menghasilkan gaya yang berbeda. File cache berubah setiap formatter dijalankan dan menambah diff yang tidak relevan. |
| Bukti | `git ls-files` memuat `.php-cs-fixer.cache` dan `.php-cs-fixer.dist.php`. |
| Rekomendasi | Pilih satu formatter dan keluarkan file cache dari git. |

## INF-05 Dokumen repositori tidak sesuai kondisi aktual

| Field | Isi |
|---|---|
| Keparahan | Low |
| Status | Terbuka |
| Lokasi | `README.md`; `docs/GIT_WORKFLOW.md`; `.github/workflows/ci.yml`; `docs/PANDUAN_AKUN_DAN_AUTENTIKASI.md` |
| Kondisi Aktual | (1) README menyebut Laravel 11 dan PHP >= 8.2, sedangkan `composer.json` memakai `laravel/framework ^13.8` dan `php ^8.3`, dan CI serta Docker memakai PHP 8.4. (2) README mencantumkan 5 container, sedangkan `docker-compose.yml` dan `deploy.sh` memiliki 6 (termasuk `scheduler_cibenda`). (3) GIT_WORKFLOW memakai prefix branch `feature/`, sedangkan CI dipicu oleh `feat/*` dan branch yang ada memakai `feat/`. (4) GIT_WORKFLOW memakai nama remote `org`, sedangkan clone memakai `origin`. (5) `docs/PANDUAN_AKUN_DAN_AUTENTIKASI.md` menyatakan pembeli mendaftar hanya melalui Google, sedangkan aplikasi juga menyediakan pendaftaran email di `/register` yang ditautkan dari halaman login. |
| Dampak | Developer baru mengikuti instruksi yang tidak sesuai. Branch berprefix `feature/` tidak memicu CI saat push. |
| Bukti | Lihat file pada kolom Lokasi. |
| Rekomendasi | Perbarui README dan GIT_WORKFLOW, serta samakan prefix branch dengan pemicu CI. |

# Temuan - Integrasi SIDUTama

## SID-01 Saklar `enable_sid_sync` tidak dibaca backend

| Field | Isi |
|---|---|
| Keparahan | Medium |
| Status | Terbuka |
| Lokasi | `routes/console.php` (jadwal `sync-sid-seller-applications`); `app/Jobs/SyncSidSellerApplicationsJob.php`; `resources/js/Pages/Admin/Settings/Index.tsx:401` |
| Kondisi Aktual | Pengaturan "Sinkronisasi Otomatis SIDUTama" dapat diubah di panel admin, tetapi nilainya tidak dibaca oleh scheduler maupun job. Sinkronisasi tetap berjalan setiap 2 menit apa pun nilai saklarnya. |
| Dampak | Admin mengira sinkronisasi sudah dihentikan, misalnya saat gangguan API SID, padahal permintaan ke SID tetap dikirim. |
| Bukti | Kata kunci `enable_sid_sync` hanya ditemukan di seeder dan halaman pengaturan admin. |
| Rekomendasi | Baca saklar di job atau scheduler sebelum memanggil API SID. |

## SID-04 Status `accepted` dikirim ke SID sebelum akun lokal tersimpan

| Field | Isi |
|---|---|
| Keparahan | Medium |
| Status | Terbuka |
| Lokasi | `app/Http/Controllers/Admin/MerchantController.php:289-329` |
| Kondisi Aktual | Di dalam `DB::transaction`, Cimart lebih dulu memanggil `updateApplicationStatus(..., 'accepted')` ke SID, baru kemudian membuat user, toko, dan memperbarui permohonan. Pemanggilan API SID tidak ikut dibatalkan bila langkah database setelahnya gagal. |
| Dampak | Bila pembuatan akun lokal gagal setelah SID menerima status `accepted`, warga melihat permohonannya diterima di SID, tetapi akun pedagang tidak ada di Cimart, sementara permohonan lokal tetap `pending`. |
| Bukti | Komentar kode: "Notify SID with status accepted BEFORE committing local account". Kegagalan umum ditangkap oleh `catch (\Throwable $e)` tanpa pelaporan balik ke SID. |
| Rekomendasi | Tambahkan kompensasi bila langkah lokal gagal, atau sediakan cara bagi admin untuk menyelesaikan permohonan yang tertahan. |

## SID-02 `business_ref` antara toko dan permohonan tidak diikat foreign key

| Field | Isi |
|---|---|
| Keparahan | Low |
| Status | Terbuka |
| Lokasi | `database/migrations/2026_11_12_100100_add_business_ref_to_stores_table.php` |
| Kondisi Aktual | `stores.business_ref` dan `seller_applications.business_ref` memuat nilai yang sama, tetapi tidak dihubungkan dengan foreign key. Satu-satunya foreign key antara kedua tabel adalah `seller_applications.store_id`. |
| Dampak | Kedua nilai dapat berbeda tanpa terdeteksi database. |
| Bukti | Kolom dibuat dengan `->uuid('business_ref')->nullable()->unique()` tanpa `constrained()`. |
| Rekomendasi | Tetapkan satu sumber relasi, atau tambahkan pengecekan konsistensi. |

## SID-03 Status kontrak `openapi.yaml` tidak sesuai implementasi

| Field | Isi |
|---|---|
| Keparahan | Low |
| Status | Terbuka |
| Lokasi | `docs/openapi.yaml:11`; `docs/sid-thirdparty.md` (tabel status) |
| Kondisi Aktual | Kedua dokumen menyatakan integrasi berstatus "disepakati, belum diimplementasikan (2026-11-12)". Sinkronisasi, penerimaan, penolakan, dan penanganan pembatalan sudah berjalan di kode. |
| Dampak | Pembaca dokumen integrasi mendapat gambaran status yang keliru. |
| Bukti | `SyncSidSellerApplicationsJob`, `SidApiService`, dan `MerchantController::store` memanggil API SID. |
| Rekomendasi | Perbarui status dokumen, dan bila perlu cocokkan isi spesifikasi dengan implementasi. |

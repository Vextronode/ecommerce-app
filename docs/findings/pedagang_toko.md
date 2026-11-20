# Temuan - Pedagang dan Toko

## MER-01 Akun pedagang dapat dibuat tanpa permohonan SID

| Field | Isi |
|---|---|
| Keparahan | Medium |
| Status | Selesai (2026-11-20) |
| Lokasi | `app/Http/Controllers/Admin/MerchantController.php`; `resources/js/Components/Admin/Merchants/CreateMerchantForm.tsx`; `resources/js/Components/Admin/Merchants/AdminMerchantTable.tsx` |
| Kondisi Aktual | Validasi pembuatan pedagang menerima `business_ref` bernilai kosong (`nullable`). Halaman daftar pedagang memiliki tombol "Tambah Pedagang" yang membuka formulir tanpa `business_ref`. Bila kosong, akun pedagang dan toko `verified` tetap dibuat tanpa permohonan SID, tanpa pelaporan ke SID, dan tanpa penanda yang membedakannya dari pedagang hasil SID. |
| Dampak | Perjanjian Kemitraan Pasal 1 dan `docs/sid-thirdparty.md` mensyaratkan Surat Keterangan Usaha dari SID untuk setiap pedagang. Jalur ini memungkinkan pedagang terdaftar tanpa jejak verifikasi SID. |
| Bukti | `'business_ref' => ['nullable', 'uuid', 'exists:seller_applications,business_ref']` |
| Keputusan | Ditetapkan Project Manager pada 20 November 2026: pembuatan pedagang tanpa SID tetap diizinkan dengan syarat tambahan (opsi tengah). |
| Rekomendasi | (1) `business_ref` tetap opsional. (2) Pembuatan tanpa `business_ref` wajib disertai alasan. (3) Toko dan akun yang dibuat tanpa SID diberi penanda "dibuat manual". Penanda hanya terlihat oleh admin, sistem, dan pemilik akun tersebut; tidak tampil kepada pembeli maupun pedagang lain. (4) Setiap pembuatan manual dicatat dalam log audit berisi admin pembuat, waktu, dan alasan. (5) Jalur ini dicatat pada dokumen pendaftaran pedagang. |
| Resolusi | (1) `manual_creation_reason` diwajibkan saat pendaftaran manual tanpa SID. (2) `is_manual_creation = true` disimpan pada toko dan ditampilkan sebagai badge khusus "Manual (Non-SID)" di tabel admin. (3) Pendaftaran dicatat di log audit administratif admin. |

## MER-02 Query analitik memakai nilai `payment_status` yang tidak pernah disimpan

| Field | Isi |
|---|---|
| Keparahan | Low |
| Status | Selesai (2026-11-20) |
| Lokasi | `app/Http/Controllers/Merchant/AnalyticsController.php`; `app/Http/Controllers/Admin/ReportController.php`; `app/Http/Controllers/Admin/DashboardController.php` |
| Kondisi Aktual | Beberapa query memfilter `payment_status` dengan nilai `settlement`, `capture`, `success`, dan `delivered`. `PaymentSyncService` hanya menyimpan `pending`, `paid`, `failed`, dan `refunded`. |
| Dampak | Tidak mengubah hasil saat ini, tetapi menyulitkan pembacaan kode dan menyamarkan nilai status yang sebenarnya. |
| Bukti | `->whereIn('payment_status', ['paid', 'settlement', 'capture', 'success'])` |
| Rekomendasi | Batasi filter pada nilai yang tercatat di `../data_dictionary/index.md`. |
| Resolusi | Seluruh query analitik, dashboard, dan laporan disanitasi hanya menyaring `payment_status = 'paid'`, menghapus pseudo status `settlement`, `capture`, `success`, dan `delivered`. |

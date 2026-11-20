# Temuan - Cibenda Mart

| Field | Detail |
|---|---|
| Versi | 1.0 |
| Tanggal | 20 November 2026 |
| Status | Aktif |
| Pemilik Dokumen | Project Manager |
| Dokumen Terkait | `../data_dictionary/`, `../business/business_workflow/bw_cimart.md` |

## 1. Cakupan

Folder ini mencatat kelemahan pada aplikasi dan repositori Cibenda Mart: celah logika bisnis, konsistensi data, keamanan, proses tim, dokumentasi, serta kepatuhan terhadap kebijakan dan hukum. Temuan diperoleh dari penelusuran kode saat menyusun dokumentasi kondisi aktual. Dokumen kondisi aktual (Data Dictionary, Business Workflow, dan seterusnya) tidak memuat temuan; semua temuan dicatat di sini.

## 2. Struktur

Temuan dikelompokkan per modul aplikasi.

| Dokumen | Modul | Prefix ID |
|---|---|---|
| `checkout_pembayaran.md` | Checkout dan pembayaran | `CHK` |
| `pesanan_pengiriman.md` | Pemrosesan pesanan dan pengiriman | `ORD` |
| `tawar_menawar.md` | Tawar-menawar harga | `NEG` |
| `pedagang_toko.md` | Pedagang dan toko | `MER` |
| `integrasi_sid.md` | Integrasi SIDUTama | `SID` |
| `akun_autentikasi.md` | Akun dan autentikasi | `AUTH` |
| `kebijakan_legal.md` | Halaman kebijakan dan kepatuhan hukum | `LEG` |
| `infra_repo.md` | Infrastruktur, CI, repositori, dan dokumentasi repo | `INF` |

## 3. Tingkat Keparahan

Tingkat keparahan adalah usulan awal dan dapat dikoreksi oleh pemilik dokumen.

| Tingkat | Kriteria |
|---|---|
| Critical | Kerugian finansial, kebocoran data, atau pelanggaran hukum yang sedang terjadi |
| High | Dapat menimbulkan kerugian finansial, pesanan tidak dapat diselesaikan, atau kewajiban hukum tidak terpenuhi |
| Medium | Perilaku tidak sesuai dokumen atau harapan pengguna, dengan dampak terbatas atau bergantung kondisi |
| Low | Inkonsistensi atau risiko kecil yang tidak langsung berdampak pada pengguna |

## 4. Status

| Status | Arti |
|---|---|
| Terbuka | Temuan terkonfirmasi dari kode dan belum ditindaklanjuti |
| Perlu konfirmasi | Fakta kode tercatat, tetapi maksud atau dampaknya perlu dipastikan oleh tim |
| Selesai | Sudah ditindaklanjuti; tanggal dan referensi perubahan dicatat pada temuan |

## 5. Daftar Temuan

Diurutkan berdasarkan tingkat keparahan.

| ID | Judul | Keparahan | Status | Dokumen |
|---|---|---|---|---|
| CHK-01 | Refund pembatalan pedagang memakai ID transaksi induk tanpa nominal | High | Selesai | `checkout_pembayaran.md` |
| CHK-05 | Pengalihan ke COD membatalkan transaksi gabungan tetapi hanya mengubah satu pesanan | High | Selesai | `checkout_pembayaran.md` |
| ORD-01 | Pesanan COD dengan ambil sendiri tidak memiliki jalur ke `delivered` | High | Selesai | `pesanan_pengiriman.md` |
| LEG-01 | Halaman Kebijakan Privasi tidak tersedia | High | Terbuka | `kebijakan_legal.md` |
| INF-06 | Redis tanpa persistensi menyimpan antrean job dan data operasional | High | Selesai | `infra_repo.md` |
| CHK-02 | Perhitungan pajak tidak sesuai skema perpajakan mana pun | Medium | Terbuka | `checkout_pembayaran.md` |
| MER-01 | Akun pedagang dapat dibuat tanpa permohonan SID | Medium | Terbuka | `pedagang_toko.md` |
| SID-01 | Saklar `enable_sid_sync` tidak dibaca backend | Medium | Terbuka | `integrasi_sid.md` |
| SID-04 | Status `accepted` dikirim ke SID sebelum akun lokal tersimpan | Medium | Terbuka | `integrasi_sid.md` |
| LEG-02 | Janji pembatalan otomatis 1x24 jam tidak diterapkan sistem | Medium | Terbuka | `kebijakan_legal.md` |
| LEG-03 | Kebijakan Refund merujuk mekanisme klaim yang tidak tersedia di aplikasi | Medium | Terbuka | `kebijakan_legal.md` |
| LEG-04 | Keputusan mediasi dinyatakan mengikat kedua pihak | Medium | Terbuka | `kebijakan_legal.md` |
| LEG-05 | Perjanjian Mitra menyebut pajak dipotong otomatis dan saldo sebagai dompet | Medium | Terbuka | `kebijakan_legal.md` |
| INF-01 | Commit langsung ke branch `dev` tanpa pull request | Medium | Terbuka | `infra_repo.md` |
| INF-02 | Tidak ada status check wajib pada branch terlindungi | Medium | Terbuka | `infra_repo.md` |
| CHK-03 | Nilai default kolom pesanan berbeda dengan nilai yang diterima checkout | Low | Terbuka | `checkout_pembayaran.md` |
| CHK-04 | Tipe kolom `payment_status` berbeda antara MySQL dan driver lain | Low | Terbuka | `checkout_pembayaran.md` |
| ORD-02 | Penanda kedatangan kurir hanya tersimpan di cache | Low | Selesai | `pesanan_pengiriman.md` |
| ORD-03 | Batas 4 jam penyelesaian otomatis dihitung dari `updated_at` | Low | Selesai | `pesanan_pengiriman.md` |
| NEG-01 | Status `expired` tidak tersimpan untuk tawaran yang dibiarkan | Low | Terbuka | `tawar_menawar.md` |
| MER-02 | Query analitik memakai nilai `payment_status` yang tidak pernah disimpan | Low | Terbuka | `pedagang_toko.md` |
| SID-02 | `business_ref` antara toko dan permohonan tidak diikat foreign key | Low | Terbuka | `integrasi_sid.md` |
| SID-03 | Status kontrak `openapi.yaml` tidak sesuai implementasi | Low | Terbuka | `integrasi_sid.md` |
| INF-03 | Pemeriksaan gaya kode Pint tidak memblokir CI | Low | Selesai | `infra_repo.md` |
| INF-04 | Dua konfigurasi formatter dan file cache formatter ikut di-commit | Low | Selesai | `infra_repo.md` |
| INF-05 | Dokumen repositori tidak sesuai kondisi aktual | Low | Terbuka | `infra_repo.md` |
| INF-07 | Peta dan rute bergantung pada server publik OSRM dan OpenStreetMap | Low | Perlu konfirmasi | `infra_repo.md` |
| AUTH-01 | Pendaftaran dengan email tidak mensyaratkan verifikasi email | Low | Terbuka | `akun_autentikasi.md` |

## 6. Format Temuan

| Field | Isi |
|---|---|
| Keparahan | Critical, High, Medium, atau Low |
| Status | Terbuka, Perlu konfirmasi, atau Selesai |
| Lokasi | File dan baris kode |
| Kondisi Aktual | Fakta yang terlihat di kode |
| Dampak | Akibat yang dapat terjadi |
| Bukti | Potongan kode atau langkah pemeriksaan |
| Referensi | Sumber eksternal yang mendukung temuan (opsional) |
| Keputusan | Keputusan Project Manager atas temuan beserta tanggalnya (opsional) |
| Rekomendasi | Arah tindak lanjut |

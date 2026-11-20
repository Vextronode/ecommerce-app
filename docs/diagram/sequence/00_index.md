# Sequence Diagram - Cibenda Mart

| Field | Detail |
|---|---|
| Versi | 1.0 |
| Tanggal | 20 November 2026 |
| Status | Aktif |
| Pemilik Dokumen | Project Manager |
| Dokumen Terkait | `../../business/business_workflow/bw_cimart.md`, `../../data_dictionary/index.md` |

Diagram sequence mencatat urutan interaksi antarkomponen untuk alur utama aplikasi. Setiap file mencantumkan sumber kode yang menjadi acuan.

## Daftar Diagram

| No | Diagram | Proses BW |
|---|---|---|
| 01 | `01_Sequence_SinkronisasiSID.md` - Sinkronisasi SID dan pembuatan akun pedagang | 1 |
| 02 | `02_Sequence_LoginGoogle.md` - Login dan penautan akun Google | 12 |
| 03 | `03_Sequence_Checkout.md` - Checkout dan charge Midtrans | 3 |
| 04 | `04_Sequence_CallbackPembayaran.md` - Notifikasi Midtrans dan kredit escrow | 4 |
| 05 | `05_Sequence_TawarCheckout.md` - Tawar-menawar sampai keranjang | 5 |
| 06 | `06_Sequence_PengirimanKurir.md` - Serah terima, pelacakan, dan PIN kurir | 6 |
| 07 | `07_Sequence_PenyelesaianOtomatis.md` - Penyelesaian pesanan dan kredit saldo | 7 |
| 08 | `08_Sequence_PembatalanRefund.md` - Pembatalan oleh pedagang dan refund | 8 |
| 09 | `09_Sequence_PencairanDana.md` - Pencairan dana dan rekonsiliasi | 9 |

## Konvensi Partisipan

| Partisipan | Arti |
|---|---|
| Browser | Antarmuka React/Inertia yang dipakai aktor |
| Laravel | Controller dan service aplikasi |
| DB | Database MySQL |
| Redis | Cache, sesi, dan antrean pada konfigurasi Docker |
| Reverb | Server WebSocket untuk siaran realtime |
| Queue Worker | Pemroses job antrean, termasuk notifikasi push |
| Scheduler | Penjadwal tugas berkala (`routes/console.php`) |

Notifikasi kepada pengguna dikirim melalui `PushNotification`, yang diproses di antrean dan disimpan ke tabel `notifications` serta dikirim ke Firebase Cloud Messaging.

# Use Case - Admin, Operator Server, dan Sistem Otomatis

Sumber: `routes/web.php` (grup `prefix($adminPrefix)` dengan middleware `role:admin`), `app/Console/Commands/AdminInit.php`, `routes/console.php`, `app/Http/Controllers/MidtransCallbackController.php`.

## 1. Admin dan Operator Server

```mermaid
flowchart LR
    AD((Admin))
    OP((Operator Server))
    SID[["SIDUTama"]]

    subgraph CM["Cibenda Mart - Panel Admin"]
        UC60(["UC-60 Masuk sebagai admin"])
        UC61(["UC-61 Melihat dashboard admin"])
        UC62(["UC-62 Mengelola permohonan pedagang dari SID"])
        UC63(["UC-63 Mengelola pedagang"])
        UC64(["UC-64 Melihat dan mengekspor laporan"])
        UC65(["UC-65 Mengelola pengaturan platform"])
        UC66(["UC-66 Membuat akun admin pertama"])
        UC21(["UC-21 Mengelola notifikasi"])
    end

    OP --- UC66
    AD --- UC60
    AD --- UC61
    AD --- UC62
    AD --- UC63
    AD --- UC64
    AD --- UC65
    AD --- UC21
    UC62 --- SID
    UC60 -. "syarat: akun dibuat" .-> UC66
```

| Use Case | Ketentuan |
|---|---|
| UC-60 | Halaman login di `/{adminPrefix}/login`. Bila prefix bukan `admin`, URL `/admin*`, `/cibenda-admin*`, dan `/login/admin*` mengembalikan 404 |
| UC-62 | Sinkronisasi manual, menyetujui (membuat akun pedagang dan toko), atau menolak dengan alasan. Hasilnya dilaporkan ke SID |
| UC-63 | Mengubah data, status akun (`active`, `warning`, `suspended`, `inactive`), status verifikasi toko, dan menghapus pedagang |
| UC-64 | Peringkat produk terlaris dengan filter periode, toko, dan kategori. Ekspor ke CSV |
| UC-65 | Pajak, biaya layanan, dan saklar fitur. Perubahan disiarkan secara realtime |

## 2. Sistem Otomatis

```mermaid
flowchart LR
    SCH[["Scheduler"]]
    SID[["SIDUTama"]]
    MT[["Midtrans"]]

    subgraph CM["Cibenda Mart - Tugas Otomatis"]
        UC70(["UC-70 Sinkronisasi permohonan SID"])
        UC71(["UC-71 Menyelesaikan pesanan otomatis"])
        UC72(["UC-72 Merekonsiliasi pencairan"])
        UC73(["UC-73 Memperingatkan pencairan tertahan"])
        UC74(["UC-74 Menghapus notifikasi lama"])
        UC75(["UC-75 Memproses notifikasi pembayaran"])
    end

    SCH --- UC70
    SCH --- UC71
    SCH --- UC72
    SCH --- UC73
    SCH --- UC74
    MT --- UC75
    UC70 --- SID
    UC72 --- MT
```

| Use Case | Jadwal | Ketentuan |
|---|---|---|
| UC-70 | Setiap 2 menit | Mengambil permohonan `pending` dan menyelaraskan status permohonan lokal |
| UC-71 | Setiap 15 menit | Pesanan `shipped`, `local_delivery`, non-COD, `paid`, tidak diperbarui lebih dari 4 jam |
| UC-72 | Setiap 15 menit | Pencairan `processing` atau `failed` dengan `needs_reconciliation` |
| UC-73 | Setiap 15 menit | Memberi tahu admin bila pencairan tertahan lebih dari 30 menit |
| UC-74 | Harian | Menghapus notifikasi lebih tua dari 60 hari |
| UC-75 | Saat notifikasi masuk | Memverifikasi signature dan gross amount, lalu memperbarui status pembayaran |

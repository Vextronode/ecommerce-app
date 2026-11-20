# Use Case - Pedagang

Sumber: `routes/web.php` (grup `prefix('pedagang')` dengan middleware `role:pedagang` dan `CheckMerchantSetup`), `app/Http/Middleware/CheckMerchantSetup.php`.

```mermaid
flowchart LR
    PD((Pedagang))
    PB((Pembeli))
    MT[["Midtrans IRIS"]]

    subgraph CM["Cibenda Mart - Dashboard Pedagang"]
        UC30(["UC-30 Masuk sebagai pedagang"])
        UC31(["UC-31 Menyiapkan toko dan mengganti password awal"])
        UC32(["UC-32 Mengikuti tur panduan dashboard"])
        UC33(["UC-33 Mengelola produk"])
        UC34(["UC-34 Mengelola status pesanan"])
        UC35(["UC-35 Membuat QR serah terima batch"])
        UC36(["UC-36 Mengobrol dengan pembeli"])
        UC37(["UC-37 Menanggapi tawaran pembeli"])
        UC38(["UC-38 Melihat analitik penjualan"])
        UC39(["UC-39 Melihat data pelanggan"])
        UC40(["UC-40 Mengelola pengaturan toko dan akun"])
        UC41(["UC-41 Mengelola rekening bank"])
        UC42(["UC-42 Mengajukan pencairan saldo"])
    end

    PD --- UC30
    PD --- UC31
    PD --- UC32
    PD --- UC33
    PD --- UC34
    PD --- UC35
    PD --- UC36
    PD --- UC37
    PD --- UC38
    PD --- UC39
    PD --- UC40
    PD --- UC41
    PD --- UC42
    UC36 --- PB
    UC37 --- PB
    UC42 --- MT

    UC31 -. "wajib sebelum fitur lain" .-> UC30
    UC37 -. "include" .-> UC36
    UC42 -. "syarat: rekening lengkap" .-> UC41
```

| Use Case | Ketentuan |
|---|---|
| UC-31 | Selama toko belum disiapkan atau password awal belum diganti, semua halaman pedagang diarahkan ke halaman ini |
| UC-33 | Nama, deskripsi, varian, dan SKU diperiksa terhadap kata kunci produk terlarang |
| UC-34 | Status yang dapat dipilih: `pending`, `processing`, `shipped`, `cancelled`. Pesanan non-COD harus `paid` sebelum diproses. Pesanan `shipped` non-COD yang sudah dibayar tidak dapat dibatalkan |
| UC-35 | Hanya pesanan `local_delivery` berstatus `pending` atau `processing` yang COD atau sudah `paid` |
| UC-37 | Terima, tolak, atau tawar balik minimal Rp100. Hanya bila `enable_negotiation` aktif |
| UC-41 | Perubahan rekening menahan pencairan selama 30 menit |
| UC-42 | Minimal Rp10.000, hanya bila `enable_withdrawal` aktif dan tidak ada pencairan `pending` atau `processing` |

Pedagang juga dapat menjalankan UC-09 sampai UC-21 di `uc_pembeli.md` untuk toko lain.

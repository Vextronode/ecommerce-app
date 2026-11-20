# Use Case - Pengunjung, Pembeli, dan Kurir Toko

Sumber: `routes/web.php` (grup `storefront.user`, `role:user,pedagang`, rute `/tracker`), `routes/auth.php`, `app/Http/Controllers/Auth/SocialiteController.php`, `app/Http/Controllers/DeliveryTrackerController.php`.

## 1. Pengunjung dan Pembeli

```mermaid
flowchart LR
    PG((Pengunjung))
    PB((Pembeli))
    GO[["Google"]]
    MT[["Midtrans"]]

    subgraph CM["Cibenda Mart"]
        UC01(["UC-01 Menjelajah etalase, produk, dan toko"])
        UC02(["UC-02 Membaca halaman informasi dan kebijakan"])
        UC03(["UC-03 Mendaftar akun dengan email"])
        UC04(["UC-04 Masuk dengan Google dan menautkan akun"])
        UC05(["UC-05 Masuk, keluar, dan reset password"])
        UC06(["UC-06 Mengelola profil dan akun"])
        UC07(["UC-07 Mengelola alamat"])
        UC08(["UC-08 Mengatur preferensi notifikasi"])
        UC09(["UC-09 Mengikuti toko"])
        UC10(["UC-10 Mengelola keranjang"])
        UC11(["UC-11 Checkout"])
        UC12(["UC-12 Membayar pesanan"])
        UC13(["UC-13 Mengalihkan pembayaran ke COD"])
        UC14(["UC-14 Melihat riwayat dan detail pesanan"])
        UC15(["UC-15 Membatalkan pesanan"])
        UC16(["UC-16 Melacak pengiriman"])
        UC17(["UC-17 Mengonfirmasi pesanan selesai"])
        UC18(["UC-18 Memberi ulasan"])
        UC19(["UC-19 Mengobrol dengan toko"])
        UC20(["UC-20 Mengajukan dan menanggapi tawaran"])
        UC21(["UC-21 Mengelola notifikasi"])
        UC22(["UC-22 Menghapus akun sendiri"])
    end

    PG --- UC01
    PG --- UC02
    PG --- UC03
    PG --- UC04
    PG --- UC05
    UC04 --- GO

    PB --- UC01
    PB --- UC05
    PB --- UC06
    PB --- UC07
    PB --- UC08
    PB --- UC09
    PB --- UC10
    PB --- UC11
    PB --- UC12
    PB --- UC13
    PB --- UC14
    PB --- UC15
    PB --- UC16
    PB --- UC17
    PB --- UC18
    PB --- UC19
    PB --- UC20
    PB --- UC21
    PB --- UC22
    UC11 --- MT
    UC12 --- MT
    UC13 --- MT

    UC11 -. "include" .-> UC10
    UC13 -. "extend" .-> UC12
    UC20 -. "include" .-> UC19
    UC18 -. "syarat: pesanan delivered" .-> UC14
```

| Use Case | Ketentuan |
|---|---|
| UC-01 | Produk dan toko yang tampil berasal dari toko `verified` yang pemiliknya berstatus `active` atau `warning` |
| UC-03 | Tidak mensyaratkan verifikasi email |
| UC-04 | Admin tidak dapat masuk dengan Google. Penautan ke akun yang sudah ada mensyaratkan password akun |
| UC-11 | Keranjang dipecah menjadi satu pesanan per toko. Tidak dapat membeli dari toko sendiri |
| UC-13 | Hanya untuk pesanan non-COD yang masih `pending` |
| UC-15 | Hanya untuk pesanan `pending` yang belum dibayar |
| UC-16 | Hanya untuk pengiriman `local_delivery` |
| UC-17 | Hanya untuk pesanan non-COD `paid` yang `shipped`, dengan syarat waktu untuk kurir lokal |
| UC-18 | Satu ulasan per item pesanan `delivered` |
| UC-20 | Hanya bila `enable_negotiation` aktif |
| UC-22 | Akun pedagang dan admin tidak dapat dihapus sendiri |

## 2. Kurir Toko

```mermaid
flowchart LR
    KR((Kurir Toko))
    PD((Pedagang))

    subgraph CM["Cibenda Mart - Pelacak Pengiriman"]
        UC50(["UC-50 Menerima serah terima pesanan"])
        UC51(["UC-51 Mengirim lokasi pengantaran"])
        UC52(["UC-52 Menandai tiba di lokasi"])
        UC53(["UC-53 Memverifikasi PIN dan menyelesaikan pesanan"])
    end

    PD -. "menampilkan QR" .-> UC50
    KR --- UC50
    KR --- UC51
    KR --- UC52
    KR --- UC53
    UC51 -. "syarat: serah terima diterima" .-> UC50
    UC53 -. "syarat: serah terima diterima" .-> UC50
```

| Use Case | Ketentuan |
|---|---|
| UC-50 | QR berisi URL bertanda tangan yang berlaku 24 jam. Pemindaian membuka sesi serah terima 30 menit. Berlaku untuk satu pesanan atau batch |
| UC-53 | Verifikasi dikunci 5 menit setelah 5 percobaan PIN salah |

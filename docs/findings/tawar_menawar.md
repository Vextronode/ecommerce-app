# Temuan - Tawar-Menawar Harga

## NEG-01 Status `expired` tidak tersimpan untuk tawaran yang dibiarkan

| Field | Isi |
|---|---|
| Keparahan | Low |
| Status | Selesai (2026-11-20) |
| Lokasi | `app/Models/ChatNegotiation.php`; `routes/console.php` |
| Kondisi Aktual | Kedaluwarsa dihitung saat dibaca melalui `isExpired()`. Status di database baru diubah menjadi `expired` ketika ada aksi atas tawaran tersebut. Method `checkAndExpire()` tidak dipanggil di mana pun. |
| Dampak | Tawaran kedaluwarsa yang tidak ditindaklanjuti tetap berstatus `pending`, `countered`, atau `accepted`. Query atau laporan yang hanya memfilter kolom `status` akan menghitungnya sebagai tawaran aktif. |
| Bukti | Pencarian `checkAndExpire` di `app/` hanya menemukan definisinya. |
| Rekomendasi | Jalankan pembaruan status terjadwal, atau selalu sertakan `expires_at` pada query tawaran aktif. |
| Resolusi | Menambahkan scheduled background command di `routes/console.php` (`expire-abandoned-negotiations`) yang berjalan setiap 15 menit untuk memperbarui tawaran `pending` dan `countered` yang telah melewati `expires_at` menjadi `expired`. |

# Temuan - Tawar-Menawar Harga

## NEG-01 Status `expired` tidak tersimpan untuk tawaran yang dibiarkan

| Field | Isi |
|---|---|
| Keparahan | Low |
| Status | Terbuka |
| Lokasi | `app/Models/ChatNegotiation.php:91` (`isExpired`), `:104` (`checkAndExpire`) |
| Kondisi Aktual | Kedaluwarsa dihitung saat dibaca melalui `isExpired()`. Status di database baru diubah menjadi `expired` ketika ada aksi atas tawaran tersebut. Method `checkAndExpire()` tidak dipanggil di mana pun. |
| Dampak | Tawaran kedaluwarsa yang tidak ditindaklanjuti tetap berstatus `pending`, `countered`, atau `accepted`. Query atau laporan yang hanya memfilter kolom `status` akan menghitungnya sebagai tawaran aktif. |
| Bukti | Pencarian `checkAndExpire` di `app/` hanya menemukan definisinya. |
| Rekomendasi | Jalankan pembaruan status terjadwal, atau selalu sertakan `expires_at` pada query tawaran aktif. |

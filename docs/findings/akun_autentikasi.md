# Temuan - Akun dan Autentikasi

## AUTH-01 Pendaftaran dengan email tidak mensyaratkan verifikasi email

| Field | Isi |
|---|---|
| Keparahan | Low |
| Status | Terbuka |
| Lokasi | `app/Http/Controllers/Auth/RegisteredUserController.php:32`; `app/Models/User.php:5`, `:29`; `routes/web.php` (grup `role:user,pedagang`); `app/Http/Controllers/Auth/SocialiteController.php:89` |
| Kondisi Aktual | Formulir `/register` membuat akun pembeli dengan email dan password lalu langsung login. Model `User` tidak mengimplementasikan `MustVerifyEmail` (import-nya dikomentari), dan rute pembeli tidak memakai middleware `verified`. Saat pemilik email login dengan Google dan akun dengan email itu sudah ada tanpa `google_id`, penautan mensyaratkan password akun tersebut. |
| Dampak | Seseorang dapat mendaftar dan bertransaksi memakai email milik orang lain. Pemilik email yang sebenarnya tidak dapat login dengan Google tanpa password yang dibuat pendaftar tersebut. Pemilik email masih dapat mengambil alih akun melalui reset password, karena tautan reset dikirim ke alamat email tersebut. Notifikasi pesanan untuk pembeli dikirim melalui aplikasi dan push notification, bukan email. |
| Bukti | `// use Illuminate\Contracts\Auth\MustVerifyEmail;` dan `class User extends Authenticatable` |
| Rekomendasi | Wajibkan verifikasi email untuk akun yang dibuat lewat formulir, atau tutup pendaftaran email bila pembeli memang hanya mendaftar lewat Google. |

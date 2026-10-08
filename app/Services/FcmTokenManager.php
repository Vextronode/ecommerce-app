<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Database\ConcurrencyErrorDetector;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Facades\DB;

// satu pintu untuk semua operasi kepemilikan fcm token.
// fcm_token itu kredensial perangkat: satu token hanya boleh dimiliki satu akun.
// semua claim/clear/handoff wajib lewat sini supaya logikanya tidak terpisah-pisah
// dan tidak ada jalur yang lupa memasang guard anti-hijack.
class FcmTokenManager
{
    public const DITOLAK_MILIK_ORANG_LAIN = 409;

    public const SUKSES = 200;

    // window "masih aktif" buat sinyal kepemilikan token. lebih lebar dari isOnline()
    // supaya jeda antar request user aktif tidak salah dianggap sudah pindah tangan.
    private const WINDOW_AKTIF_MENIT = 15;

    // simpan token milik user yang login. kalau token sudah dimiliki user lain,
    // tolak (409) tanpa menyentuh token korban. kepemilikan dijamin unique index
    // + transaksi, error concurrency db dipetakan ke 409 supaya tidak bocor 500.
    public function claim(User $user, string $token): array
    {
        try {
            return DB::transaction(function () use ($user, $token) {
                $ownedByOther = User::where('fcm_token', $token)
                    ->where('id', '!=', $user->id)
                    ->lockForUpdate()
                    ->exists();

                if ($ownedByOther) {
                    return $this->hasilDitolak();
                }

                return $this->tulisToken($user, $token);
            }, 5);
        } catch (UniqueConstraintViolationException $e) {
            return $this->hasilDitolak();
        } catch (\Throwable $e) {
            if (app(ConcurrencyErrorDetector::class)->causedByConcurrencyError($e)) {
                return $this->hasilDitolak();
            }

            throw $e;
        }
    }

    // null-kan token milik user ini saja. dipakai saat logout/suspend akun.
    public function clear(User $user): void
    {
        if ($user->fcm_token === null) {
            return;
        }

        $user->forceFill(['fcm_token' => null])->saveQuietly();
    }

    // saat satu session perangkat dihapus (logout device lain), token hanya boleh
    // dibersihkan kalau user tidak punya activity device lain yang masih baru.
    // pakai conditional update atomik (where last_seen_at basi) supaya tidak ada
    // jendela toctou antara cek dan tulis: kalau heartbeat datang di sela-sela,
    // update tidak mengenai baris dan token dipertahankan.
    //
    // @deprecated belum ada caller produksi dan secara desain underdetermined.
    // fcm_token itu satu per user sehingga fungsi ini tidak bisa membedakan token
    // device sekarang vs device lain (lihat catatan device registry di session.md).
    // jangan di-wire sebelum model token pindah ke per-device/per-session.
    public function clearIfNoActiveSession(User $user): void
    {
        if ($user->fcm_token === null) {
            return;
        }

        User::whereKey($user->id)
            ->where('fcm_token', $user->fcm_token)
            ->where(function ($query) {
                $query->whereNull('last_seen_at')
                    ->orWhere('last_seen_at', '<=', now()->subMinutes(3));
            })
            ->update(['fcm_token' => null]);
    }

    // pindahkan kepemilikan token dari pemilik lama ke user sekarang.
    // handoff hanya terjadi kalau pemilik lama sudah tidak aktif. sinyal aktif
    // diambil dari users.last_seen_at (di-update tiap request via HandleInertiaRequests),
    // bukan tabel sessions: di produksi SESSION_DRIVER=redis sehingga tabel sessions
    // tidak pernah terisi dan exists() selalu false (celah handoff bypass).
    // semua cek + tulis dalam satu transaksi + lockForUpdate supaya tidak double-claim.
    public function handoffJikaPemilikLamaTidakAktif(User $user, string $token): array
    {
        try {
            return DB::transaction(function () use ($user, $token) {
                $pemilikLama = User::where('fcm_token', $token)
                    ->where('id', '!=', $user->id)
                    ->lockForUpdate()
                    ->first();

                if (! $pemilikLama) {
                    return $this->tulisToken($user, $token);
                }

                if ($this->masihAktif($pemilikLama)) {
                    return $this->hasilDitolak();
                }

                $pemilikLama->forceFill(['fcm_token' => null])->saveQuietly();

                return $this->tulisToken($user, $token);
            }, 5);
        } catch (UniqueConstraintViolationException $e) {
            return $this->hasilDitolak();
        } catch (\Throwable $e) {
            if (app(ConcurrencyErrorDetector::class)->causedByConcurrencyError($e)) {
                return $this->hasilDitolak();
            }

            throw $e;
        }
    }

    private function tulisToken(User $user, string $token): array
    {
        $user->forceFill([
            'fcm_token' => $token,
            'last_seen_at' => now(),
        ])->save();

        return ['status' => self::SUKSES, 'message' => 'ok'];
    }

    // pemilik lama dianggap masih aktif kalau last_seen_at dalam window ini.
    // window sengaja lebih lebar dari isOnline() (3 menit) supaya jeda antar request
    // user yang masih aktif tidak salah dianggap sudah pindah tangan.
    private function masihAktif(User $pemilikLama): bool
    {
        if (! $pemilikLama->last_seen_at) {
            return false;
        }

        $batas = now()->subMinutes(self::WINDOW_AKTIF_MENIT);

        return $pemilikLama->last_seen_at->gt($batas);
    }

    private function hasilDitolak(): array
    {
        return [
            'status' => self::DITOLAK_MILIK_ORANG_LAIN,
            'message' => 'Token perangkat ini sudah terdaftar pada akun lain.',
        ];
    }
}

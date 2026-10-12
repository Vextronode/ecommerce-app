<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Models\Withdrawal;
use App\Notifications\PushNotification;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Throwable;

class AlertStuckWithdrawals extends Command
{
    protected $signature = 'withdrawals:alert-stuck
        {--threshold=30 : umur maksimal (menit) sebelum withdrawal nyangkut dianggap stuck}
        {--dry-run : cuma lihat daftar stuck tanpa ngirim notifikasi}';

    protected $description = 'Kirim alert ke admin kalau ada withdrawal nyangkut processing lebih dari threshold menit';

    // per-withdrawal, cooldown biar alert ga nge-spam tiap schedule 15 menit jalan.
    private const ALERT_COOLDOWN_MINUTES = 60;

    public function handle(): int
    {
        $threshold = max(1, (int) $this->option('threshold'));
        $dryRun = (bool) $this->option('dry-run');

        $stuck = Withdrawal::where(function ($q) {
            $q->where(function ($q2) {
                $q2->where('status', 'processing')->whereNotNull('payout_sent_at');
            })->orWhere(function ($q2) {
                $q2->where('status', 'failed')->where('needs_reconciliation', true);
            });
        })
            ->where(function ($q) use ($threshold) {
                // umur dihitung dari payout_sent_at, atau updated_at buat yang failed tanpa payout_sent_at
                $q->where('payout_sent_at', '<=', now()->subMinutes($threshold))
                    ->orWhere(function ($q2) use ($threshold) {
                        $q2->whereNull('payout_sent_at')->where('updated_at', '<=', now()->subMinutes($threshold));
                    });
            })
            ->orderBy('payout_sent_at')
            ->get();

        if ($stuck->isEmpty()) {
            $this->info("Ga ada withdrawal nyangkut lebih dari {$threshold} menit. Aman.");

            return self::SUCCESS;
        }

        $this->info("Ketemu {$stuck->count()} withdrawal nyangkut lebih dari {$threshold} menit:");

        foreach ($stuck as $withdrawal) {
            $age = $this->ageMinutes($withdrawal);
            $this->line("#{$withdrawal->id} ({$withdrawal->reference_no}) - Rp ".number_format((float) $withdrawal->amount, 0, ',', '.')." - nyangkut {$age} menit");
        }

        if ($dryRun) {
            $this->warn('Dry-run aktif, notifikasi ga dikirim.');

            return self::SUCCESS;
        }

        // buang withdrawal yang baru saja dialertkan (masih dalam window cooldown)
        // biar admin ga di-spam notifikasi yang sama tiap schedule jalan.
        $stuck = $stuck->filter(fn (Withdrawal $w) => ! Cache::has($this->cooldownKey($w)))->values();

        if ($stuck->isEmpty()) {
            $this->info('Semua withdrawal nyangkut sudah dialertkan sebelumnya, cooldown masih jalan.');

            return self::SUCCESS;
        }

        $admins = User::where('role', 'admin')->get();

        if ($admins->isEmpty()) {
            $this->warn('Ga ada user admin yang ketemu buat dikirimi notifikasi.');
            Log::warning("AlertStuckWithdrawals: {$stuck->count()} withdrawal nyangkut tapi ga ada admin buat dinotifikasi.");

            return self::SUCCESS;
        }

        $count = $stuck->count();
        $title = 'Withdrawal Nyangkut Perlu Rekonsiliasi';
        $oldest = $this->ageMinutes($stuck->first());
        $message = "Ada {$count} penarikan dana berstatus perlu rekonsiliasi lebih dari {$threshold} menit (terlama {$oldest} menit). Segera cek rekonsiliasi Midtrans IRIS.";

        foreach ($admins as $admin) {
            $hasToken = ! empty($admin->fcm_token);
            try {
                $admin->notify(new PushNotification($title, $message, 'withdrawal', '/cibenda-portal/withdrawals'));
            } catch (Throwable $e) {
                Log::warning("AlertStuckWithdrawals: gagal kirim notifikasi ke admin #{$admin->id}: ".$e->getMessage());

                continue;
            }

            // kalau admin ga punya fcm_token, push-nya ga akan sampe, minimal catat biar ada jejak
            if (! $hasToken) {
                Log::warning("AlertStuckWithdrawals: admin #{$admin->id} ga punya fcm_token, alert withdrawal nyangkut cuma kesimpen di in-app.");
            }
        }

        Log::warning("AlertStuckWithdrawals: {$count} withdrawal nyangkut > {$threshold} menit, notifikasi dikirim ke ".$admins->count().' admin.');

        // set cooldown per-withdrawal setelah alert terkirim ke admin.
        foreach ($stuck as $withdrawal) {
            Cache::put($this->cooldownKey($withdrawal), true, now()->addMinutes(self::ALERT_COOLDOWN_MINUTES));
        }

        $this->info("Notifikasi terkirim ke {$admins->count()} admin.");

        return self::SUCCESS;
    }

    /**
     * key cooldown unik per-withdrawal supaya alert yang sama tidak dikirim berulang
     */
    private function cooldownKey(Withdrawal $withdrawal): string
    {
        return 'withdrawal_alert_cooldown:'.$withdrawal->id;
    }

    /**
     * hitung umur withdrawal dalam menit, fallback ke updated_at kalau payout_sent_at kosong
     */
    private function ageMinutes(Withdrawal $withdrawal): int
    {
        $reference = $withdrawal->payout_sent_at ?? $withdrawal->updated_at;

        return $reference ? max(0, (int) $reference->diffInMinutes(now())) : 0;
    }
}

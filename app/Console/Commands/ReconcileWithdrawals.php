<?php

namespace App\Console\Commands;

use App\Events\WithdrawalUpdated;
use App\Models\Store;
use App\Models\Withdrawal;
use App\Notifications\PushNotification;
use App\Services\MidtransIrisService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

class ReconcileWithdrawals extends Command
{
    protected $signature = 'withdrawals:reconcile
        {--dry-run : cuma lihat hasil rekonsiliasi tanpa ngubah data}';

    protected $description = 'Rekonsiliasi withdrawal yang nyangkut di status processing dengan status aslinya di Midtrans IRIS';

    /**
     * status gateway yang kita anggap payout beneran sukses terkirim
     */
    private const SUCCESS_STATUSES = ['completed', 'success', 'processed', 'paid', 'settled'];

    /**
     * status gateway yang jelas-jelas payout gagal/ditolak, aman buat refund
     */
    private const FAILED_STATUSES = ['failed', 'rejected', 'cancelled', 'canceled', 'denied', 'expired', 'not_found'];

    public function handle(MidtransIrisService $irisService): int
    {
        $dryRun = (bool) $this->option('dry-run');

        $withdrawals = Withdrawal::where(function ($q) {
            $q->where(function ($q2) {
                // yang nyangkut di processing dengan payout_sent_at terisi
                $q2->where('status', 'processing')->whereNotNull('payout_sent_at');
            })->orWhere(function ($q2) {
                // yang udah ditandai failed tapi payout mungkin terkirim, harus dicek juga biar ga nyangkut selamanya
                $q2->where('status', 'failed')->where('needs_reconciliation', true);
            });
        })
            ->orderBy('id')
            ->get();

        if ($withdrawals->isEmpty()) {
            $this->info('Ga ada withdrawal yang nyangkut processing. Aman.');

            return self::SUCCESS;
        }

        $this->info("Ketemu {$withdrawals->count()} withdrawal nyangkut processing. Mulai rekonsiliasi...");

        $completed = 0;
        $failed = 0;
        $skipped = 0;

        foreach ($withdrawals as $withdrawal) {
            try {
                $result = $irisService->getPayoutStatus($withdrawal->reference_no);
            } catch (Throwable $e) {
                // gateway ga bisa dijawab, jangan asal refund, skip aja
                $this->warn("Withdrawal #{$withdrawal->id} ({$withdrawal->reference_no}): gagal cek status - {$e->getMessage()}");
                Log::warning("ReconcileWithdrawals: gagal cek status withdrawal #{$withdrawal->id}: {$e->getMessage()}");
                $skipped++;

                continue;
            }

            $gatewayStatus = strtolower((string) ($result['status'] ?? 'unknown'));
            $isFound = (bool) ($result['found'] ?? true);

            if (in_array($gatewayStatus, self::SUCCESS_STATUSES, true)) {
                $changed = $dryRun
                    ? false
                    : $this->markCompleted($withdrawal, $gatewayStatus);

                if ($changed || $dryRun) {
                    $this->line("[completed] Withdrawal #{$withdrawal->id} ({$withdrawal->reference_no}) status gateway: {$gatewayStatus}");
                    $completed++;
                } else {
                    $skipped++;
                }

                continue;
            }

            if (! $isFound || in_array($gatewayStatus, self::FAILED_STATUSES, true)) {
                // gateway bilang payout ga ketemu / ditolak, berarti dana belum pernah cair, aman refund
                $reason = $isFound
                    ? "Payout ditolak gateway (status: {$gatewayStatus})."
                    : 'Payout tidak ditemukan di gateway.';

                $changed = $dryRun
                    ? false
                    : $this->markFailedAndRefund($withdrawal, $reason);

                if ($changed || $dryRun) {
                    $this->line("[failed] Withdrawal #{$withdrawal->id} ({$withdrawal->reference_no}) - {$reason}");
                    $failed++;
                } else {
                    $skipped++;
                }

                continue;
            }

            // status ambigu / masih pending di gateway, biarin processing buat dicek manual
            $this->warn("[skipped] Withdrawal #{$withdrawal->id} ({$withdrawal->reference_no}) status gateway ambigu: {$gatewayStatus}");
            Log::warning("ReconcileWithdrawals: withdrawal #{$withdrawal->id} status gateway ambigu ({$gatewayStatus}), dibiarkan processing.");
            $skipped++;
        }

        $mode = $dryRun ? ' (DRY-RUN, ga ada data yang diubah)' : '';
        $this->newLine();
        $this->info("Ringkasan{$mode}: completed={$completed}, failed={$failed}, skipped={$skipped}");

        return self::SUCCESS;
    }

    /**
     * tandai withdrawal completed secara atomik dan idempoten
     */
    private function markCompleted(Withdrawal $withdrawal, string $gatewayStatus): bool
    {
        $updated = DB::transaction(function () use ($withdrawal, $gatewayStatus) {
            $locked = Withdrawal::where('id', $withdrawal->id)->lockForUpdate()->first();

            // boleh diproses kalau masih processing, atau failed yang ditandai butuh rekonsiliasi
            $reconcilable = $locked && ($locked->status === 'processing' || ($locked->status === 'failed' && $locked->needs_reconciliation));
            if (! $reconcilable) {
                return null;
            }

            $locked->status = 'completed';
            $locked->notes = "Rekonsiliasi otomatis: gateway Midtrans IRIS mengonfirmasi payout sukses (status: {$gatewayStatus}).";
            $locked->forceFill(['needs_reconciliation' => false])->save();

            return $locked;
        });

        if (! $updated) {
            return false;
        }

        $this->notifyMerchant(
            $updated,
            'Penarikan Saldo Berhasil!',
            'Dana penarikan Rp '.number_format((float) $updated->amount, 0, ',', '.')." berhasil dicairkan ke rekening {$updated->bank_name} ({$updated->account_number})."
        );

        $this->broadcastUpdate($updated);

        Log::info("ReconcileWithdrawals: withdrawal #{$updated->id} ditandai completed via rekonsiliasi.");

        return true;
    }

    /**
     * tandai withdrawal failed dan balikin saldo toko secara atomik, cegah refund dobel
     */
    private function markFailedAndRefund(Withdrawal $withdrawal, string $reason): bool
    {
        $refunded = DB::transaction(function () use ($withdrawal, $reason) {
            $locked = Withdrawal::where('id', $withdrawal->id)->lockForUpdate()->first();

            // boleh diproses kalau masih processing, atau failed yang ditandai butuh rekonsiliasi
            $reconcilable = $locked && ($locked->status === 'processing' || ($locked->status === 'failed' && $locked->needs_reconciliation));
            if (! $reconcilable) {
                return null;
            }

            Store::where('id', $locked->store_id)->lockForUpdate()->increment('available_balance', (float) $locked->amount);

            $locked->status = 'failed';
            $locked->notes = $reason.' Saldo sudah dikembalikan otomatis lewat rekonsiliasi.';
            $locked->forceFill(['needs_reconciliation' => false])->save();

            return $locked;
        });

        if (! $refunded) {
            return false;
        }

        $this->notifyMerchant(
            $refunded,
            'Penarikan Saldo Gagal',
            'Permintaan penarikan saldo Rp '.number_format((float) $refunded->amount, 0, ',', '.').' gagal diproses. Saldo telah dikembalikan ke saldo aktif toko Anda.'
        );

        $this->broadcastUpdate($refunded);

        Log::warning("ReconcileWithdrawals: withdrawal #{$refunded->id} ditandai failed & refund saldo. Alasan: {$reason}");

        return true;
    }

    /**
     * kirim in-app notification ke pemilik toko kalau notifikasinya aktif
     */
    private function notifyMerchant(Withdrawal $withdrawal, string $title, string $message): void
    {
        $store = Store::with('user')->find($withdrawal->store_id);
        if (! $store?->user) {
            return;
        }

        $settings = $store->user->notification_settings ?? [];
        if (! ($settings['penarikan_saldo'] ?? true)) {
            return;
        }

        try {
            $store->user->notify(new PushNotification($title, $message, 'withdrawal', '/pedagang/withdrawals'));
        } catch (Throwable $e) {
            Log::warning('ReconcileWithdrawals: gagal kirim notifikasi merchant: '.$e->getMessage());
        }
    }

    /**
     * broadcast update real-time ke dashboard merchant
     */
    private function broadcastUpdate(Withdrawal $withdrawal): void
    {
        try {
            broadcast(new WithdrawalUpdated($withdrawal->fresh()));
        } catch (Throwable $e) {
            Log::warning('ReconcileWithdrawals: broadcast withdrawal gagal: '.$e->getMessage());
        }
    }
}

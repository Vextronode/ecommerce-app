<?php

namespace App\Jobs;

use App\Events\WithdrawalUpdated;
use App\Exceptions\GatewayRateLimitedException;
use App\Exceptions\GatewayUncertainException;
use App\Models\Store;
use App\Models\Withdrawal;
use App\Notifications\PushNotification;
use App\Services\MidtransIrisService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ProcessWithdrawalPayout implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of times the job may be attempted.
     * Allows up to 3 automatic retries for rate-limiting and transient gateway disruptions.
     */
    public int $tries = 3;

    /**
     * Exponential backoff delays in seconds between retries:
     * Attempt 1 -> wait 60s, Attempt 2 -> wait 180s (3m), Attempt 3 -> final failure.
     */
    public array $backoff = [60, 180, 300];

    /**
     * The number of seconds the job can run before timing out.
     */
    public int $timeout = 60;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public Withdrawal $withdrawal
    ) {}

    /**
     * Execute the job.
     */
    public function handle(MidtransIrisService $irisService): void
    {
        // Refresh withdrawal instance from database
        $this->withdrawal->refresh();

        // kalau payout mungkin udah terkirim ke gateway & status nyangkut processing, jangan kirim ulang, tunggu rekonsiliasi manual
        if ($this->withdrawal->payout_sent_at !== null && $this->withdrawal->status === 'processing') {
            Log::warning("ProcessWithdrawalPayout: Withdrawal #{$this->withdrawal->id} nyangkut di processing dengan payout_sent_at, skip kirim ulang biar ga dobel payout.");

            return;
        }

        $refNo = $this->withdrawal->reference_no;
        $storeId = $this->withdrawal->store_id;
        $amount = (float) $this->withdrawal->amount;
        $currentAttempt = $this->attempts();

        // kunci status pending -> processing sebelum nembak gateway biar retry ga kirim payout dobel
        // payout_sent_at di-set di sini biar kalau worker mati setelah gateway call, refund ga salah jalan
        $claimed = DB::transaction(function () {
            $locked = Withdrawal::where('id', $this->withdrawal->id)->lockForUpdate()->first();

            // kalau udah bukan pending, artinya payout pernah dikirim atau udah final, jangan proses lagi
            if (! $locked || $locked->status !== 'pending') {
                Log::warning("ProcessWithdrawalPayout: Withdrawal #{$this->withdrawal->id} berstatus '".($locked->status ?? 'null')."', skip biar ga dobel.");

                return null;
            }

            $locked->update([
                'status' => 'processing',
            ]);
            // payout_sent_at ga masuk fillable, set lewat forceFill biar ga bisa diisi mass-assign
            $locked->forceFill([
                'payout_sent_at' => now(),
            ])->save();

            return $locked;
        });

        if (! $claimed) {
            $this->withdrawal->refresh();

            return;
        }

        $this->withdrawal = $claimed;

        try {
            Log::info("ProcessWithdrawalPayout: Initiating IRIS payout for withdrawal #{$this->withdrawal->id} ({$refNo}), store #{$storeId}, amount: Rp {$amount} (Percobaan {$currentAttempt}/{$this->tries})");

            $irisResult = $irisService->createPayout([
                'idempotency_key' => $refNo,
                'beneficiary_name' => $this->withdrawal->account_holder,
                'beneficiary_account' => $this->withdrawal->account_number,
                'beneficiary_bank' => $this->withdrawal->bank_name,
                'amount' => $amount,
                'notes' => 'Withdrawal '.$refNo,
            ]);

            $updated = DB::transaction(function () use ($irisResult) {
                $locked = Withdrawal::where('id', $this->withdrawal->id)->lockForUpdate()->first();
                if (! $locked || $locked->status !== 'processing') {
                    return false;
                }

                $locked->update([
                    'status' => 'completed',
                    'notes' => ! empty($irisResult['simulated'])
                        ? 'Penarikan berhasil diproses (Simulasi Sandbox)'
                        : 'Penarikan berhasil diproses via Midtrans IRIS',
                ]);

                return true;
            });

            if (! $updated) {
                return;
            }
            $this->withdrawal->refresh();

            // In-app notification for merchant owner
            $store = $this->withdrawal->store;
            if ($store?->user) {
                $merchantSettings = $store->user->notification_settings ?? [];
                $isAllowed = $merchantSettings['penarikan_saldo'] ?? true;

                if ($isAllowed) {
                    $formattedAmount = 'Rp '.number_format($amount, 0, ',', '.');
                    $title = 'Penarikan Saldo Berhasil!';
                    $message = "Dana penarikan {$formattedAmount} berhasil dicairkan ke rekening {$this->withdrawal->bank_name} ({$this->withdrawal->account_number}).";
                    $store->user->notify(new PushNotification($title, $message, 'withdrawal', '/pedagang/withdrawals'));
                }
            }

            // Real-time WebSocket broadcast to merchant dashboard
            try {
                broadcast(new WithdrawalUpdated($this->withdrawal->fresh()));
            } catch (\Throwable $bEx) {
                Log::warning('WithdrawalUpdated broadcast error: '.$bEx->getMessage());
            }

            Log::info("ProcessWithdrawalPayout: Successfully completed withdrawal #{$this->withdrawal->id} ({$refNo}) for store #{$storeId}", (array) $irisResult);
        } catch (GatewayRateLimitedException $e) {
            if ($currentAttempt < $this->tries) {
                $delaySeconds = $e->retryAfterSeconds > 0 ? $e->retryAfterSeconds : ($this->backoff[$currentAttempt - 1] ?? 60);

                // gateway nolak request (429) jadi payout pasti belum terkirim, aman balikin ke pending & clear payout_sent_at
                $reset = Withdrawal::find($this->withdrawal->id);
                if ($reset) {
                    $reset->status = 'pending';
                    $reset->notes = "Gateway sedang sibuk / rate-limited (Percobaan {$currentAttempt}/{$this->tries}). Menunggu {$delaySeconds} detik untuk mencoba ulang otomatis...";
                    $reset->forceFill(['payout_sent_at' => null])->save();
                }

                try {
                    broadcast(new WithdrawalUpdated($this->withdrawal->fresh()));
                } catch (\Throwable $bEx) {}

                Log::warning("ProcessWithdrawalPayout: Rate-limited on attempt {$currentAttempt}/{$this->tries} for withdrawal #{$this->withdrawal->id}. Releasing back to queue in {$delaySeconds}s.");

                $this->release($delaySeconds);

                return;
            }

            // semua percobaan habis -> gateway nolak terus (429), payout pasti belum terkirim, aman refund
            $this->markAsFailedAndRefund("Gagal setelah {$this->tries}x percobaan: Gateway pembayaran sedang mengalami pembatasan limit (Rate Limit).", true);
        } catch (GatewayUncertainException $e) {
            // 5xx: request udah kekirim ke gateway tapi statusnya ambigu, payout mungkin udah cair.
            // jangan reset ke pending & jangan refund, biarin processing bertanda payout_sent_at buat direkonsiliasi.
            Log::warning("ProcessWithdrawalPayout: Withdrawal #{$this->withdrawal->id} ({$refNo}) dapet respons ambigu dari gateway: ".$e->getMessage());

            Withdrawal::where('id', $this->withdrawal->id)->update([
                'notes' => "Gateway memberi respons ambigu, status payout belum pasti. Menunggu rekonsiliasi otomatis.",
            ]);

            try {
                broadcast(new WithdrawalUpdated($this->withdrawal->fresh()));
            } catch (\Throwable $bEx) {}

            return;
        } catch (\Throwable $e) {
            $msg = strtolower($e->getMessage());

            // koneksi gagal sebelum request terkirim -> payout pasti belum jalan, aman retry
            $isNotSent = str_contains($msg, 'connection refused') || str_contains($msg, 'temporarily unavailable');

            // request mungkin udah nyampe gateway tapi kita ga dapet balasan -> payout bisa jadi udah cair
            $isMaybeSent = str_contains($msg, 'timeout') || str_contains($msg, 'rate limit') || str_contains($msg, 'too many requests');

            if ($isNotSent && $currentAttempt < $this->tries) {
                $delaySeconds = $this->backoff[$currentAttempt - 1] ?? 60;

                $reset = Withdrawal::find($this->withdrawal->id);
                if ($reset) {
                    $reset->status = 'pending';
                    $reset->notes = "Koneksi gateway gagal sebelum terkirim (Percobaan {$currentAttempt}/{$this->tries}). Menunggu {$delaySeconds} detik untuk mencoba ulang otomatis...";
                    $reset->forceFill(['payout_sent_at' => null])->save();
                }

                try {
                    broadcast(new WithdrawalUpdated($this->withdrawal->fresh()));
                } catch (\Throwable $bEx) {}

                Log::warning("ProcessWithdrawalPayout: Not-sent error '{$e->getMessage()}' on attempt {$currentAttempt}/{$this->tries} for withdrawal #{$this->withdrawal->id}. Releasing back to queue in {$delaySeconds}s.");

                $this->release($delaySeconds);

                return;
            }

            if ($isMaybeSent && $currentAttempt < $this->tries) {
                $delaySeconds = $this->backoff[$currentAttempt - 1] ?? 60;

                // payout_sent_at udah keset di CAS, biarin processing biar retry berikutnya skip & tunggu rekonsiliasi
                Withdrawal::where('id', $this->withdrawal->id)->update([
                    'notes' => "Koneksi gateway terganggu, payout mungkin terkirim (Percobaan {$currentAttempt}/{$this->tries}). Menunggu rekonsiliasi.",
                ]);

                try {
                    broadcast(new WithdrawalUpdated($this->withdrawal->fresh()));
                } catch (\Throwable $bEx) {}

                Log::warning("ProcessWithdrawalPayout: Maybe-sent error '{$e->getMessage()}' on attempt {$currentAttempt}/{$this->tries} for withdrawal #{$this->withdrawal->id}. Biarin processing buat rekonsiliasi.");

                $this->release($delaySeconds);

                return;
            }

            // error fatal / non-retryable (misal rekening invalid, ditolak bank) -> payout ditolak gateway, aman refund
            Log::error("ProcessWithdrawalPayout: Fatal payout failure for withdrawal #{$this->withdrawal->id} ({$refNo}): ".$e->getMessage());
            $this->markAsFailedAndRefund("Gagal diproses: {$e->getMessage()}.", true);
        }
    }

    /**
     * tandai withdrawal gagal dan balikin saldo toko secara atomik
     *
     * @param  string  $reason  alasan gagal buat ditampilin ke merchant
     * @param  bool  $payoutCertainNotSent  true kalau kita yakin payout belum pernah terkirim ke gateway
     */
    private function markAsFailedAndRefund(string $reason, bool $payoutCertainNotSent = false): void
    {
        $refundedWithdrawal = DB::transaction(function () use ($reason, $payoutCertainNotSent) {
            $withdrawal = Withdrawal::where('id', $this->withdrawal->id)->lockForUpdate()->first();
            if (! $withdrawal || ! in_array($withdrawal->status, ['pending', 'processing'], true)) {
                return null;
            }

            // kalau payout mungkin udah dikirim ke gateway, jangan refund otomatis
            // biar ga dobel (duit bisa jadi udah cair di bank walau kita timeout)
            if (! $payoutCertainNotSent) {
                // set status failed + flag rekonsiliasi lewat forceFill, biar tetap kekejar oleh command rekonsiliasi
                $withdrawal->status = 'failed';
                $withdrawal->notes = $reason.' Butuh rekonsiliasi manual: payout mungkin sudah dikirim ke gateway, saldo tidak dikembalikan otomatis.';
                $withdrawal->forceFill(['needs_reconciliation' => true])->save();

                return null;
            }

            Store::where('id', $withdrawal->store_id)->lockForUpdate()->increment('available_balance', (float) $withdrawal->amount);

            $withdrawal->update([
                'status' => 'failed',
                'notes' => $reason,
            ]);

            return $withdrawal;
        });

        if (! $refundedWithdrawal) {
            // tetap kabarin merchant kalau status udah jadi failed
            $failed = Withdrawal::find($this->withdrawal->id);
            if ($failed && $failed->status === 'failed') {
                try {
                    broadcast(new WithdrawalUpdated($failed->fresh()));
                } catch (\Throwable $bEx) {}
            }

            return;
        }

        $withdrawal = $refundedWithdrawal;
        $storeId = $withdrawal->store_id;
        $amount = (float) $withdrawal->amount;

        // In-app notification for merchant owner
        $store = Store::find($storeId);
        if ($store?->user) {
            $formattedAmount = 'Rp '.number_format($amount, 0, ',', '.');
            $title = 'Penarikan Saldo Gagal';
            $message = "Permintaan penarikan saldo {$formattedAmount} gagal diproses. Saldo telah dikembalikan ke saldo aktif toko Anda.";
            $store->user->notify(new PushNotification($title, $message, 'withdrawal', '/pedagang/withdrawals'));
        }

        // Real-time WebSocket broadcast to merchant dashboard
        try {
            broadcast(new WithdrawalUpdated($withdrawal->fresh()));
        } catch (\Throwable $bEx) {
            Log::warning('WithdrawalUpdated broadcast error: '.$bEx->getMessage());
        }

        Log::warning("ProcessWithdrawalPayout: Marked withdrawal #{$withdrawal->id} as failed and refunded Rp {$amount} to store #{$storeId}. Reason: {$reason}");
    }

    /**
     * Handle a job failure if an unhandled exception occurred or worker was killed.
     * Di sini kita ga bisa mastiin payout udah terkirim atau belum, jadi default jangan refund otomatis.
     */
    public function failed(?\Throwable $exception): void
    {
        $this->markAsFailedAndRefund(
            'Gagal: '.($exception ? $exception->getMessage() : 'Batas maksimal percobaan antrean tercapai.'),
            false
        );
    }
}

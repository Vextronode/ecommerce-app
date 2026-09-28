<?php

namespace App\Jobs;

use App\Events\WithdrawalUpdated;
use App\Exceptions\GatewayRateLimitedException;
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

        // Idempotency check: only process if status is still pending
        if ($this->withdrawal->status !== 'pending') {
            Log::warning("ProcessWithdrawalPayout: Withdrawal #{$this->withdrawal->id} is already in '{$this->withdrawal->status}' status. Skipping execution.");

            return;
        }

        $refNo = $this->withdrawal->reference_no;
        $storeId = $this->withdrawal->store_id;
        $amount = (float) $this->withdrawal->amount;
        $currentAttempt = $this->attempts();

        try {
            Log::info("ProcessWithdrawalPayout: Initiating IRIS payout for withdrawal #{$this->withdrawal->id} ({$refNo}), store #{$storeId}, amount: Rp {$amount} (Percobaan {$currentAttempt}/{$this->tries})");

            $irisResult = $irisService->createPayout([
                'beneficiary_name' => $this->withdrawal->account_holder,
                'beneficiary_account' => $this->withdrawal->account_number,
                'beneficiary_bank' => $this->withdrawal->bank_name,
                'amount' => $amount,
                'notes' => 'Withdrawal '.$refNo,
            ]);

            $this->withdrawal->update([
                'status' => 'completed',
                'notes' => ! empty($irisResult['simulated'])
                    ? 'Penarikan berhasil diproses (Simulasi Sandbox)'
                    : 'Penarikan berhasil diproses via Midtrans IRIS',
            ]);

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

                $this->withdrawal->update([
                    'notes' => "Gateway sedang sibuk / rate-limited (Percobaan {$currentAttempt}/{$this->tries}). Menunggu {$delaySeconds} detik untuk mencoba ulang otomatis...",
                ]);

                try {
                    broadcast(new WithdrawalUpdated($this->withdrawal->fresh()));
                } catch (\Throwable $bEx) {}

                Log::warning("ProcessWithdrawalPayout: Rate-limited on attempt {$currentAttempt}/{$this->tries} for withdrawal #{$this->withdrawal->id}. Releasing back to queue in {$delaySeconds}s.");

                $this->release($delaySeconds);

                return;
            }

            // All retry attempts exhausted
            $this->markAsFailedAndRefund("Gagal setelah {$this->tries}x percobaan: Gateway pembayaran sedang mengalami pembatasan limit (Rate Limit). Saldo telah dikembalikan ke akun toko.");
        } catch (\Throwable $e) {
            $msg = strtolower($e->getMessage());
            $isTransient = str_contains($msg, 'rate limit')
                || str_contains($msg, 'too many requests')
                || str_contains($msg, 'timeout')
                || str_contains($msg, 'temporarily unavailable')
                || str_contains($msg, 'connection refused');

            if ($isTransient && $currentAttempt < $this->tries) {
                $delaySeconds = $this->backoff[$currentAttempt - 1] ?? 60;

                $this->withdrawal->update([
                    'notes' => "Koneksi gateway terganggu (Percobaan {$currentAttempt}/{$this->tries}). Menunggu {$delaySeconds} detik untuk mencoba ulang otomatis...",
                ]);

                try {
                    broadcast(new WithdrawalUpdated($this->withdrawal->fresh()));
                } catch (\Throwable $bEx) {}

                Log::warning("ProcessWithdrawalPayout: Transient error '{$e->getMessage()}' on attempt {$currentAttempt}/{$this->tries} for withdrawal #{$this->withdrawal->id}. Releasing back to queue in {$delaySeconds}s.");

                $this->release($delaySeconds);

                return;
            }

            // Fatal / Non-retryable error (e.g. invalid account, bank rejection)
            Log::error("ProcessWithdrawalPayout: Fatal payout failure for withdrawal #{$this->withdrawal->id} ({$refNo}): ".$e->getMessage());
            $this->markAsFailedAndRefund("Gagal diproses: {$e->getMessage()}. Saldo telah dikembalikan ke akun toko.");
        }
    }

    /**
     * Mark withdrawal as failed and refund store available balance atomically.
     */
    private function markAsFailedAndRefund(string $reason): void
    {
        $withdrawal = $this->withdrawal->fresh();
        if (! $withdrawal || $withdrawal->status !== 'pending') {
            return;
        }

        $storeId = $withdrawal->store_id;
        $amount = (float) $withdrawal->amount;

        DB::transaction(function () use ($withdrawal, $storeId, $amount, $reason) {
            Store::where('id', $storeId)->increment('available_balance', $amount);

            $withdrawal->update([
                'status' => 'failed',
                'notes' => $reason,
            ]);
        });

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
     */
    public function failed(?\Throwable $exception): void
    {
        $this->markAsFailedAndRefund(
            'Gagal: '.($exception ? $exception->getMessage() : 'Batas maksimal percobaan antrean tercapai.').'. Saldo telah dikembalikan ke akun toko.'
        );
    }
}

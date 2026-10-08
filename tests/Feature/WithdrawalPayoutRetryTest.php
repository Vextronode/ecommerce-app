<?php

namespace Tests\Feature;

use App\Exceptions\GatewayRateLimitedException;
use App\Jobs\ProcessWithdrawalPayout;
use App\Models\Store;
use App\Models\User;
use App\Models\Withdrawal;
use App\Services\MidtransIrisService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class WithdrawalPayoutRetryTest extends TestCase
{
    use RefreshDatabase;

    public function test_payout_rate_limit_keeps_withdrawal_pending_for_auto_retry(): void
    {
        $merchant = User::factory()->create(['role' => 'pedagang']);
        $store = Store::create([
            'user_id' => $merchant->id,
            'name' => 'Toko Bahari',
            'slug' => 'toko-bahari-'.Str::random(6),
            'available_balance' => 0,
            'pending_balance' => 0,
            'bank_name' => 'BCA',
            'bank_account_number' => '1234567890',
            'bank_account_holder' => 'Bahari Jaya',
        ]);

        $withdrawal = Withdrawal::create([
            'store_id' => $store->id,
            'reference_no' => 'WD-TEST-RETRY',
            'amount' => 50000,
            'bank_name' => 'BCA',
            'account_number' => '1234567890',
            'account_holder' => 'Bahari Jaya',
            'status' => 'pending',
            'notes' => 'Menunggu pemrosesan',
        ]);

        // Mock Iris service returning Rate Limited 429
        $mockIris = $this->createMock(MidtransIrisService::class);
        $mockIris->method('createPayout')->willThrowException(
            new GatewayRateLimitedException('Gateway rate limited', 60)
        );

        $job = new ProcessWithdrawalPayout($withdrawal);
        $job->handle($mockIris);

        $withdrawal->refresh();

        // Must STAY pending so it can be retried automatically by queue
        $this->assertEquals('pending', $withdrawal->status);
        $this->assertStringContainsString('rate-limited', $withdrawal->notes);
        $this->assertStringContainsString('mencoba ulang', $withdrawal->notes);
        // Balance must NOT be refunded yet
        $this->assertEquals(0, (float) $store->fresh()->available_balance);
    }

    public function test_payout_fatal_error_marks_withdrawal_failed_and_refunds_balance(): void
    {
        $merchant = User::factory()->create(['role' => 'pedagang']);
        $store = Store::create([
            'user_id' => $merchant->id,
            'name' => 'Toko Bahari 2',
            'slug' => 'toko-bahari-2-'.Str::random(6),
            'available_balance' => 0,
            'pending_balance' => 0,
            'bank_name' => 'BCA',
            'bank_account_number' => '9999999999',
            'bank_account_holder' => 'Salah Rekening',
        ]);

        $withdrawal = Withdrawal::create([
            'store_id' => $store->id,
            'reference_no' => 'WD-TEST-FATAL',
            'amount' => 50000,
            'bank_name' => 'BCA',
            'account_number' => '9999999999',
            'account_holder' => 'Salah Rekening',
            'status' => 'pending',
            'notes' => 'Menunggu pemrosesan',
        ]);

        // Mock Iris service returning Fatal Bank Rejection
        $mockIris = $this->createMock(MidtransIrisService::class);
        $mockIris->method('createPayout')->willThrowException(
            new \RuntimeException('Nomor rekening bank tujuan tidak ditemukan.')
        );

        $job = new ProcessWithdrawalPayout($withdrawal);
        $job->handle($mockIris);

        $withdrawal->refresh();

        // Must immediately transition to failed and refund balance
        $this->assertEquals('failed', $withdrawal->status);
        $this->assertStringContainsString('Nomor rekening bank tujuan tidak ditemukan', $withdrawal->notes);
        $this->assertEquals(50000, (float) $store->fresh()->available_balance);
    }

    public function test_retry_tidak_kirim_payout_dua_kali_saat_timeout(): void
    {
        $merchant = User::factory()->create(['role' => 'pedagang']);
        $store = Store::create([
            'user_id' => $merchant->id,
            'name' => 'Toko Timeout',
            'slug' => 'toko-timeout-'.Str::random(6),
            'bank_name' => 'BCA',
            'bank_account_number' => '111222333',
            'bank_account_holder' => 'Timeout Jaya',
        ]);
        $store->forceFill(['available_balance' => 0, 'pending_balance' => 0])->save();

        $withdrawal = Withdrawal::create([
            'store_id' => $store->id,
            'reference_no' => 'WD-TEST-TIMEOUT',
            'amount' => 50000,
            'bank_name' => 'BCA',
            'account_number' => '111222333',
            'account_holder' => 'Timeout Jaya',
            'status' => 'pending',
            'notes' => 'Menunggu pemrosesan',
        ]);

        // percobaan pertama timeout setelah kemungkinan payout terkirim
        $mockIris = $this->createMock(MidtransIrisService::class);
        $mockIris->expects($this->exactly(1))
            ->method('createPayout')
            ->willThrowException(new \RuntimeException('Operation timeout after 60s'));

        $job = new ProcessWithdrawalPayout($withdrawal);
        $job->attemptsCount = 1;
        $job->handle($mockIris);

        $withdrawal->refresh();
        $this->assertEquals('processing', $withdrawal->status);
        $this->assertNotNull($withdrawal->payout_sent_at);
        // saldo ga boleh direfund karena payout mungkin udah cair
        $this->assertEquals(0, (float) $store->fresh()->available_balance);

        // percobaan kedua (retry) harus SKIP, ga boleh nembak gateway lagi
        $job2 = new ProcessWithdrawalPayout($withdrawal);
        $job2->attemptsCount = 2;
        $job2->handle($mockIris);

        $this->assertEquals(0, (float) $store->fresh()->available_balance);
    }

    public function test_worker_mati_setelah_gateway_call_tidak_refund_saldo(): void
    {
        $merchant = User::factory()->create(['role' => 'pedagang']);
        $store = Store::create([
            'user_id' => $merchant->id,
            'name' => 'Toko Worker Mati',
            'slug' => 'toko-worker-mati-'.Str::random(6),
            'bank_name' => 'BCA',
            'bank_account_number' => '999888777',
            'bank_account_holder' => 'Worker Mati',
        ]);
        $store->forceFill(['available_balance' => 0, 'pending_balance' => 0])->save();

        $withdrawal = Withdrawal::create([
            'store_id' => $store->id,
            'reference_no' => 'WD-TEST-WORKER-DEAD',
            'amount' => 50000,
            'bank_name' => 'BCA',
            'account_number' => '999888777',
            'account_holder' => 'Worker Mati',
            'status' => 'pending',
            'notes' => 'Menunggu pemrosesan',
        ]);

        // simulasi worker udah nembak gateway terus mati sebelum commit sukses
        $mockIris = $this->createMock(MidtransIrisService::class);
        $mockIris->method('createPayout')->willThrowException(new \RuntimeException('Operation timeout after 60s'));

        $job = new ProcessWithdrawalPayout($withdrawal);
        $job->attemptsCount = 1;
        $job->handle($mockIris);

        // worker dianggap mati, laravel panggil failed()
        $job->failed(new \RuntimeException('Worker killed by OOM'));

        $withdrawal->refresh();
        // saldo jangan dibalikin karena payout mungkin udah cair di bank
        $this->assertEquals(0, (float) $store->fresh()->available_balance);
        $this->assertEquals('failed', $withdrawal->status);
        $this->assertStringContainsString('rekonsiliasi manual', $withdrawal->notes);
    }
}

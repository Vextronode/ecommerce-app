<?php

namespace Tests\Feature;

use App\Exceptions\GatewayUncertainException;
use App\Jobs\ProcessWithdrawalPayout;
use App\Models\Store;
use App\Models\User;
use App\Models\Withdrawal;
use App\Notifications\PushNotification;
use App\Services\MidtransIrisService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;
use Tests\TestCase;

class WithdrawalReconciliationBranchTwoTest extends TestCase
{
    use RefreshDatabase;

    /**
     * siapin toko + withdrawal dengan saldo awal tertentu.
     * status default pending biar bisa diproses lewat job payout.
     */
    private function buatWithdrawal(string $status = 'pending', float $saldoAwal = 0, float $amount = 50000): array
    {
        $merchant = User::factory()->create(['role' => 'pedagang']);

        $store = Store::create([
            'user_id' => $merchant->id,
            'name' => 'Toko Cabang Dua '.Str::random(4),
            'slug' => 'toko-cabdua-'.Str::random(8),
            'bank_name' => 'BCA',
            'bank_account_number' => '1234567890',
            'bank_account_holder' => 'Cabang Dua Jaya',
        ]);

        $store->forceFill(['available_balance' => $saldoAwal, 'pending_balance' => 0])->save();

        $withdrawal = Withdrawal::create([
            'store_id' => $store->id,
            'reference_no' => 'WD-CAB2-'.Str::upper(Str::random(8)),
            'amount' => $amount,
            'bank_name' => 'BCA',
            'account_number' => '1234567890',
            'account_holder' => 'Cabang Dua Jaya',
            'status' => $status,
            'notes' => 'Menunggu pemrosesan',
        ]);

        return [$store, $withdrawal];
    }

    public function test_gateway_uncertain_5xx_bikin_withdrawal_nyangkut_processing_tanpa_refund(): void
    {
        [$store, $withdrawal] = $this->buatWithdrawal('pending', 30000, 50000);

        $mockIris = $this->createMock(MidtransIrisService::class);
        $mockIris->expects($this->once())
            ->method('createPayout')
            ->willThrowException(new GatewayUncertainException('Gateway IRIS balikin HTTP 503.', 503));

        $job = new ProcessWithdrawalPayout($withdrawal);
        $job->attemptsCount = 1;
        $job->handle($mockIris);

        $withdrawal->refresh();

        // payout mungkin udah cair di gateway, jadi jangan reset & jangan refund
        $this->assertEquals('processing', $withdrawal->status);
        $this->assertNotNull($withdrawal->payout_sent_at);
        $this->assertStringContainsString('ambigu', $withdrawal->notes);
        // saldo ga boleh bertambah sama sekali
        $this->assertEquals(30000, (float) $store->fresh()->available_balance);
        // belum ditandai failed, jadi ga masuk jalur rekonsiliasi branch-2
        $this->assertFalse((bool) $withdrawal->needs_reconciliation);
    }

    public function test_mark_as_failed_uncertain_set_failed_dan_needs_reconciliation_tanpa_refund(): void
    {
        [$store, $withdrawal] = $this->buatWithdrawal('pending', 20000, 50000);

        $mockIris = $this->createMock(MidtransIrisService::class);
        $mockIris->method('createPayout')->willThrowException(new GatewayUncertainException('Gateway balikin 504.', 504));

        $job = new ProcessWithdrawalPayout($withdrawal);
        $job->attemptsCount = 1;
        $job->handle($mockIris);

        // worker mati / retry habis -> failed() dipanggil, yang memicu markAsFailedAndRefund(false)
        $job->failed(new GatewayUncertainException('Worker mati sebelum konfirmasi.'));

        $withdrawal->refresh();

        $this->assertEquals('failed', $withdrawal->status);
        $this->assertTrue((bool) $withdrawal->needs_reconciliation);
        $this->assertStringContainsString('rekonsiliasi manual', $withdrawal->notes);
        // saldo tetap, ga ada refund otomatis di jalur ambigu
        $this->assertEquals(20000, (float) $store->fresh()->available_balance);
    }

    public function test_reconcile_branch2_gateway_completed_jadi_completed_dan_flag_false(): void
    {
        [$store, $withdrawal] = $this->buatWithdrawal('failed', 20000, 50000);
        $withdrawal->forceFill(['needs_reconciliation' => true, 'payout_sent_at' => now()->subMinutes(40)])->save();

        $mock = $this->createMock(MidtransIrisService::class);
        $mock->method('getPayoutStatus')->willReturn([
            'status' => 'completed',
            'found' => true,
            'raw' => [],
        ]);
        $this->app->instance(MidtransIrisService::class, $mock);

        $this->artisan('withdrawals:reconcile')->assertExitCode(0);

        $withdrawal->refresh();
        $this->assertEquals('completed', $withdrawal->status);
        $this->assertFalse((bool) $withdrawal->needs_reconciliation);
        // payout beneran cair, saldo ga boleh dikembalikan
        $this->assertEquals(20000, (float) $store->fresh()->available_balance);
    }

    public function test_reconcile_branch2_gateway_failed_refund_sekali_dan_idempoten(): void
    {
        [$store, $withdrawal] = $this->buatWithdrawal('failed', 20000, 50000);
        $withdrawal->forceFill(['needs_reconciliation' => true, 'payout_sent_at' => now()->subMinutes(40)])->save();

        $mock = $this->createMock(MidtransIrisService::class);
        $mock->method('getPayoutStatus')->willReturn([
            'status' => 'failed',
            'found' => true,
            'raw' => [],
        ]);
        $this->app->instance(MidtransIrisService::class, $mock);

        // panggil dua kali, refund harus cuma sekali
        $this->artisan('withdrawals:reconcile')->assertExitCode(0);
        $this->artisan('withdrawals:reconcile')->assertExitCode(0);

        $withdrawal->refresh();
        $this->assertEquals('failed', $withdrawal->status);
        $this->assertFalse((bool) $withdrawal->needs_reconciliation);
        // saldo awal 20000 + refund 50000 = 70000, ga boleh dobel jadi 120000
        $this->assertEquals(70000, (float) $store->fresh()->available_balance);
    }

    public function test_alert_stuck_menemukan_withdrawal_failed_needs_reconciliation(): void
    {
        Notification::fake();

        [$store, $withdrawal] = $this->buatWithdrawal('failed', 0, 75000);
        $withdrawal->forceFill([
            'needs_reconciliation' => true,
            'payout_sent_at' => null,
            'updated_at' => now()->subMinutes(90),
        ])->save();

        $admin = User::factory()->create(['role' => 'admin']);
        $admin->forceFill(['fcm_token' => 'token-admin-cab2'])->save();

        $this->artisan('withdrawals:alert-stuck', ['--threshold' => 30])->assertExitCode(0);

        Notification::assertSentTo($admin, PushNotification::class);
    }
}

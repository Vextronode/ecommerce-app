<?php

namespace Tests\Feature;

use App\Models\Store;
use App\Models\User;
use App\Models\Withdrawal;
use App\Services\MidtransIrisService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class WithdrawalReconciliationTest extends TestCase
{
    use RefreshDatabase;

    /**
     * bikin store merchant lengkap plus withdrawal berstatus processing
     * yang udah pernah dikirim ke gateway (payout_sent_at terisi)
     */
    private function buatWithdrawalProcessing(float $saldoAwal = 0, float $amount = 50000): array
    {
        $merchant = User::factory()->create(['role' => 'pedagang']);

        $store = Store::create([
            'user_id' => $merchant->id,
            'name' => 'Toko Rekonsiliasi '.Str::random(4),
            'slug' => 'toko-rekon-'.Str::random(8),
            'bank_name' => 'BCA',
            'bank_account_number' => '1234567890',
            'bank_account_holder' => 'Rekonsiliasi Jaya',
        ]);

        $store->forceFill(['available_balance' => $saldoAwal, 'pending_balance' => 0])->save();

        $withdrawal = Withdrawal::create([
            'store_id' => $store->id,
            'reference_no' => 'WD-RECON-'.Str::upper(Str::random(8)),
            'amount' => $amount,
            'bank_name' => 'BCA',
            'account_number' => '1234567890',
            'account_holder' => 'Rekonsiliasi Jaya',
            'status' => 'processing',
            'notes' => 'Payout sudah dikirim, nunggu konfirmasi gateway',
        ]);

        $withdrawal->forceFill(['payout_sent_at' => now()->subMinutes(45)])->save();

        return [$store, $withdrawal];
    }

    /**
     * bind mock iris ke container yang balikin hasil status sesuai reference_no
     *
     * @param  array<string, array>  $hasilPerReference
     */
    private function bindIrisMock(array $hasilPerReference, ?callable $fallback = null): void
    {
        $mock = $this->createMock(MidtransIrisService::class);
        $mock->method('getPayoutStatus')->willReturnCallback(
            function (string $reference) use ($hasilPerReference, $fallback) {
                if (array_key_exists($reference, $hasilPerReference)) {
                    return $hasilPerReference[$reference];
                }

                if ($fallback) {
                    return $fallback($reference);
                }

                return ['status' => 'completed', 'found' => true, 'raw' => []];
            }
        );

        $this->app->instance(MidtransIrisService::class, $mock);
    }

    public function test_gateway_completed_menandai_withdrawal_completed(): void
    {
        [$store, $withdrawal] = $this->buatWithdrawalProcessing(0, 50000);

        $this->bindIrisMock([
            $withdrawal->reference_no => ['status' => 'completed', 'found' => true, 'raw' => []],
        ]);

        $this->artisan('withdrawals:reconcile')->assertExitCode(0);

        $withdrawal->refresh();
        $this->assertEquals('completed', $withdrawal->status);
        $this->assertStringContainsString('Rekonsiliasi otomatis', $withdrawal->notes);
        // saldo ga boleh bertambah kalau payout sukses cair
        $this->assertEquals(0, (float) $store->fresh()->available_balance);
    }

    public function test_gateway_not_found_menandai_failed_dan_refund_saldo(): void
    {
        [$store, $withdrawal] = $this->buatWithdrawalProcessing(10000, 50000);

        $this->bindIrisMock([
            $withdrawal->reference_no => ['status' => 'not_found', 'found' => false, 'raw' => []],
        ]);

        $this->artisan('withdrawals:reconcile')->assertExitCode(0);

        $withdrawal->refresh();
        $this->assertEquals('failed', $withdrawal->status);
        // saldo awal 10000 + refund 50000 = 60000
        $this->assertEquals(60000, (float) $store->fresh()->available_balance);
    }

    public function test_status_ambigu_tidak_mengubah_apapun(): void
    {
        [$store, $withdrawal] = $this->buatWithdrawalProcessing(10000, 50000);

        $this->bindIrisMock([
            $withdrawal->reference_no => ['status' => 'pending', 'found' => true, 'raw' => []],
        ]);

        $this->artisan('withdrawals:reconcile')->assertExitCode(0);

        $withdrawal->refresh();
        $this->assertEquals('processing', $withdrawal->status);
        $this->assertEquals(10000, (float) $store->fresh()->available_balance);
    }

    public function test_idempoten_tidak_refund_dobel_saat_dipanggil_dua_kali(): void
    {
        [$store, $withdrawal] = $this->buatWithdrawalProcessing(10000, 50000);

        $this->bindIrisMock([
            $withdrawal->reference_no => ['status' => 'not_found', 'found' => false, 'raw' => []],
        ]);

        $this->artisan('withdrawals:reconcile')->assertExitCode(0);
        $this->artisan('withdrawals:reconcile')->assertExitCode(0);

        $withdrawal->refresh();
        $this->assertEquals('failed', $withdrawal->status);
        // cuma boleh kerefund sekali: 10000 + 50000 = 60000
        $this->assertEquals(60000, (float) $store->fresh()->available_balance);
    }

    public function test_dry_run_tidak_mengubah_status_maupun_saldo(): void
    {
        [$store, $withdrawal] = $this->buatWithdrawalProcessing(10000, 50000);

        $this->bindIrisMock([
            $withdrawal->reference_no => ['status' => 'not_found', 'found' => false, 'raw' => []],
        ]);

        $this->artisan('withdrawals:reconcile', ['--dry-run' => true])->assertExitCode(0);

        $withdrawal->refresh();
        $this->assertEquals('processing', $withdrawal->status);
        $this->assertEquals(10000, (float) $store->fresh()->available_balance);
    }

    public function test_gateway_lempar_exception_tidak_refund_dan_tetap_processing(): void
    {
        [$store, $withdrawal] = $this->buatWithdrawalProcessing(10000, 50000);

        $mock = $this->createMock(MidtransIrisService::class);
        $mock->method('getPayoutStatus')->willThrowException(
            new \RuntimeException('Gateway timeout saat cek status')
        );
        $this->app->instance(MidtransIrisService::class, $mock);

        $this->artisan('withdrawals:reconcile')->assertExitCode(0);

        $withdrawal->refresh();
        $this->assertEquals('processing', $withdrawal->status);
        $this->assertEquals(10000, (float) $store->fresh()->available_balance);
    }

    public function test_skip_dry_run_yang_error_tetap_tidak_refund(): void
    {
        // dua withdrawal: satu sukses, satu error; yang error ga boleh ngerusak yang lain
        [$storeA, $withdrawalA] = $this->buatWithdrawalProcessing(0, 30000);
        [$storeB, $withdrawalB] = $this->buatWithdrawalProcessing(0, 40000);

        $mock = $this->createMock(MidtransIrisService::class);
        $mock->method('getPayoutStatus')->willReturnCallback(
            function (string $reference) use ($withdrawalA) {
                if ($reference === $withdrawalA->reference_no) {
                    return ['status' => 'completed', 'found' => true, 'raw' => []];
                }

                throw new \RuntimeException('Gateway down');
            }
        );
        $this->app->instance(MidtransIrisService::class, $mock);

        $this->artisan('withdrawals:reconcile')->assertExitCode(0);

        $this->assertEquals('completed', $withdrawalA->fresh()->status);
        $this->assertEquals('processing', $withdrawalB->fresh()->status);
        $this->assertEquals(0, (float) $storeB->fresh()->available_balance);
    }
}

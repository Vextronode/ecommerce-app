<?php

namespace Tests\Feature;

use App\Models\Store;
use App\Models\User;
use App\Models\Withdrawal;
use App\Notifications\PushNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;
use Tests\TestCase;

class AlertStuckWithdrawalsTest extends TestCase
{
    use RefreshDatabase;

    /**
     * bikin withdrawal processing dengan payout_sent_at dimundurin sesuai umur menit
     */
    private function buatWithdrawalStuck(int $umurMenit, float $amount = 75000): Withdrawal
    {
        $merchant = User::factory()->create(['role' => 'pedagang']);

        $store = Store::create([
            'user_id' => $merchant->id,
            'name' => 'Toko Stuck '.Str::random(4),
            'slug' => 'toko-stuck-'.Str::random(8),
            'bank_name' => 'BCA',
            'bank_account_number' => '1234567890',
            'bank_account_holder' => 'Stuck Jaya',
        ]);

        $store->forceFill(['available_balance' => 0, 'pending_balance' => 0])->save();

        $withdrawal = Withdrawal::create([
            'store_id' => $store->id,
            'reference_no' => 'WD-STUCK-'.Str::upper(Str::random(8)),
            'amount' => $amount,
            'bank_name' => 'BCA',
            'account_number' => '1234567890',
            'account_holder' => 'Stuck Jaya',
            'status' => 'processing',
            'notes' => 'Nunggu konfirmasi gateway',
        ]);

        $withdrawal->forceFill(['payout_sent_at' => now()->subMinutes($umurMenit)])->save();

        return $withdrawal;
    }

    public function test_alert_terkirim_ke_admin_saat_withdrawal_nyangkut(): void
    {
        Notification::fake();

        $this->buatWithdrawalStuck(60);

        $admin = User::factory()->create(['role' => 'admin']);
        $admin->forceFill(['fcm_token' => 'token-admin-123'])->save();

        $this->artisan('withdrawals:alert-stuck', ['--threshold' => 30])->assertExitCode(0);

        Notification::assertSentTo($admin, PushNotification::class);
    }

    public function test_dry_run_tidak_mengirim_notifikasi(): void
    {
        Notification::fake();

        $this->buatWithdrawalStuck(60);

        $admin = User::factory()->create(['role' => 'admin']);
        $admin->forceFill(['fcm_token' => 'token-admin-dry'])->save();

        $this->artisan('withdrawals:alert-stuck', ['--threshold' => 30, '--dry-run' => true])->assertExitCode(0);

        Notification::assertNothingSent();
    }

    public function test_withdrawal_belum_lewat_threshold_tidak_dialert(): void
    {
        Notification::fake();

        // umur 10 menit, threshold 30 menit -> belum stuck
        $this->buatWithdrawalStuck(10);

        $admin = User::factory()->create(['role' => 'admin']);
        $admin->forceFill(['fcm_token' => 'token-admin-fresh'])->save();

        $this->artisan('withdrawals:alert-stuck', ['--threshold' => 30])->assertExitCode(0);

        Notification::assertNothingSent();
    }

    public function test_alert_cooldown_cegah_spam_per_withdrawal(): void
    {
        Notification::fake();

        $this->buatWithdrawalStuck(60);

        $admin = User::factory()->create(['role' => 'admin']);
        $admin->forceFill(['fcm_token' => 'token-admin-cooldown'])->save();

        // run pertama -> notifikasi terkirim
        $this->artisan('withdrawals:alert-stuck', ['--threshold' => 30])->assertExitCode(0);
        Notification::assertSentToTimes($admin, PushNotification::class, 1);

        // run kedua dalam window cooldown -> tidak ada notifikasi baru
        $this->artisan('withdrawals:alert-stuck', ['--threshold' => 30])->assertExitCode(0);
        Notification::assertSentToTimes($admin, PushNotification::class, 1);
    }

    public function test_dua_withdrawal_stuck_terkirim_sebagai_satu_batch_ke_admin(): void
    {
        Notification::fake();

        $this->buatWithdrawalStuck(60);
        $this->buatWithdrawalStuck(70);

        $admin = User::factory()->create(['role' => 'admin']);
        $admin->forceFill(['fcm_token' => 'token-admin-multi'])->save();

        $this->artisan('withdrawals:alert-stuck', ['--threshold' => 30])->assertExitCode(0);

        // notifikasi dibatch per-admin berisi hitungan total, jadi tetap satu kiriman
        Notification::assertSentToTimes($admin, PushNotification::class, 1);
    }

    public function test_cooldown_di_reset_saat_dry_run_tidak_mengunci_alert(): void
    {
        Notification::fake();

        $this->buatWithdrawalStuck(60);

        $admin = User::factory()->create(['role' => 'admin']);
        $admin->forceFill(['fcm_token' => 'token-admin-dryreset'])->save();

        // dry-run tidak boleh memasang cooldown
        $this->artisan('withdrawals:alert-stuck', ['--threshold' => 30, '--dry-run' => true])->assertExitCode(0);
        Notification::assertNothingSent();

        // run normal berikutnya tetap boleh mengirim
        $this->artisan('withdrawals:alert-stuck', ['--threshold' => 30])->assertExitCode(0);
        Notification::assertSentToTimes($admin, PushNotification::class, 1);
    }
}

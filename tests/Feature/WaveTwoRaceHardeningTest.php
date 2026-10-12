<?php

namespace Tests\Feature;

use App\Models\Store;
use App\Models\User;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Tests\TestCase;

// regresi akechi: dua celah race gelombang 2 harus ketutup
// 1. fcm token toctou -> unique index + transaksi (dua akun tidak bisa pegang token sama)
// 2. cooldown bank non-atomic -> cache::lock + cache::has (dua perubahan paralel tidak lolos bareng)
class WaveTwoRaceHardeningTest extends TestCase
{
    use RefreshDatabase;

    private function buatMerchant(): User
    {
        return User::factory()->create([
            'role' => 'pedagang',
            'password' => Hash::make('rahasia123'),
        ]);
    }

    private function buatStore(User $merchant): Store
    {
        return Store::create([
            'user_id' => $merchant->id,
            'name' => 'Toko Race '.Str::random(4),
            'slug' => 'toko-race-'.Str::random(8),
            'bank_name' => 'BCA',
            'bank_account_number' => '1234567890',
            'bank_account_holder' => 'Budi Santoso',
        ]);
    }

    public function test_unique_index_fcm_token_aktif(): void
    {
        $a = User::factory()->create(['role' => 'user', 'fcm_token' => 'TOKEN-UNIK-PANJANG-A-1234567890']);
        $b = User::factory()->create(['role' => 'user', 'fcm_token' => null]);

        $this->expectException(UniqueConstraintViolationException::class);

        // paksa insert token duplikat langsung ke db -> unique index harus nge-throw
        User::where('id', $b->id)->update(['fcm_token' => 'TOKEN-UNIK-PANJANG-A-1234567890']);

        $this->assertNull($a->fresh());
    }

    public function test_serial_claim_token_milik_user_lain_selalu_ditolak(): void
    {
        $korban = User::factory()->create(['role' => 'user', 'fcm_token' => 'TOKEN-SERIAL-KORBAN-PANJANG-1234']);
        $penyerang = User::factory()->create(['role' => 'user', 'fcm_token' => null]);

        // percobaan berulang pun tetap ditolak
        for ($i = 0; $i < 3; $i++) {
            $this->actingAs($penyerang)
                ->postJson(route('notifications.saveFcmToken'), ['fcm_token' => 'TOKEN-SERIAL-KORBAN-PANJANG-1234'])
                ->assertStatus(409);
        }

        $this->assertSame('TOKEN-SERIAL-KORBAN-PANJANG-1234', $korban->fresh()->fcm_token);
        $this->assertNull($penyerang->fresh()->fcm_token);
    }

    public function test_cooldown_bank_regresi_sekuensial(): void
    {
        // catatan: race paralel beneran dibuktikan di WaveTwoRealRaceTest (pcntl_fork).
        // test ini cuma jaga perilaku cooldown sekuensial + cache::add terpasang.
        $merchant = $this->buatMerchant();
        $store = $this->buatStore($merchant);

        $this->actingAs($merchant)->put(route('merchant.withdrawals.update-bank'), [
            'bank_name' => 'mandiri',
            'bank_account_number' => '9998887776',
            'bank_account_holder' => 'Budi Santoso',
            'password' => 'rahasia123',
        ])->assertSessionHasNoErrors();

        $cooldownKey = 'withdrawal_bank_cooldown:'.$store->id;
        $this->assertTrue(Cache::has($cooldownKey), 'cooldown harus terpasang setelah ganti rekening');

        // percobaan kedua dalam window ditolak walau password benar
        $this->actingAs($merchant)->put(route('merchant.withdrawals.update-bank'), [
            'bank_name' => 'bri',
            'bank_account_number' => '1112223334',
            'bank_account_holder' => 'Penyerang',
            'password' => 'rahasia123',
        ])->assertSessionHasErrors('password');

        $this->assertSame('9998887776', $store->fresh()->bank_account_number);
    }

    public function test_noop_perubahan_rekening_sama_tidak_pasang_cooldown(): void
    {
        $merchant = $this->buatMerchant();
        $store = $this->buatStore($merchant);

        // kirim data persis sama dengan yang ada -> no-op, tidak boleh pasang cooldown
        $this->actingAs($merchant)->put(route('merchant.withdrawals.update-bank'), [
            'bank_name' => 'BCA',
            'bank_account_number' => '1234567890',
            'bank_account_holder' => 'Budi Santoso',
            'password' => 'rahasia123',
        ])->assertSessionHasNoErrors();

        $this->assertFalse(Cache::has('withdrawal_bank_cooldown:'.$store->id), 'no-op tidak boleh memasang cooldown');

        // karena belum ada cooldown, perubahan nyata berikutnya harus tetap bisa
        $this->actingAs($merchant)->put(route('merchant.withdrawals.update-bank'), [
            'bank_name' => 'mandiri',
            'bank_account_number' => '9998887776',
            'bank_account_holder' => 'Budi Santoso',
            'password' => 'rahasia123',
        ])->assertSessionHasNoErrors();

        $this->assertSame('9998887776', $store->fresh()->bank_account_number);
    }
}

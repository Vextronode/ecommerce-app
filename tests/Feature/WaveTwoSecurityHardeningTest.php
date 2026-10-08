<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\Store;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Tests\TestCase;

// regresi gelombang 2: fcm token hijack, bank swap tanpa re-auth, dan racun brute force pin
class WaveTwoSecurityHardeningTest extends TestCase
{
    use RefreshDatabase;

    private function buatMerchant(array $overrides = []): User
    {
        return User::factory()->create(array_merge([
            'role' => 'pedagang',
            'password' => Hash::make('rahasia123'),
        ], $overrides));
    }

    private function buatStore(User $merchant, array $overrides = []): Store
    {
        return Store::create(array_merge([
            'user_id' => $merchant->id,
            'name' => 'Toko Gelombang Dua '.Str::random(4),
            'slug' => 'toko-wave2-'.Str::random(8),
            'bank_name' => 'BCA',
            'bank_account_number' => '1234567890',
            'bank_account_holder' => 'Budi Santoso',
        ], $overrides));
    }

    // --- P0 fcm token hijack ---

    public function test_klaim_token_milik_user_lain_ditolak_dan_token_korban_utuh(): void
    {
        $korban = User::factory()->create(['role' => 'user', 'fcm_token' => 'TOKEN-KORBAN-PANJANG-1234567890']);
        $penyerang = User::factory()->create(['role' => 'user', 'fcm_token' => null]);

        $resp = $this->actingAs($penyerang)->postJson(route('notifications.saveFcmToken'), [
            'fcm_token' => 'TOKEN-KORBAN-PANJANG-1234567890',
        ]);

        $resp->assertStatus(409);
        $resp->assertJson(['success' => false]);

        // token korban TIDAK boleh di-null-kan (cegah dos push korban)
        $this->assertSame('TOKEN-KORBAN-PANJANG-1234567890', $korban->fresh()->fcm_token);
        $this->assertNull($penyerang->fresh()->fcm_token);
    }

    public function test_simpan_token_baru_untuk_diri_sendiri_sukses(): void
    {
        $user = User::factory()->create(['role' => 'user', 'fcm_token' => null]);

        $resp = $this->actingAs($user)->postJson(route('notifications.saveFcmToken'), [
            'fcm_token' => 'TOKEN-SENDIRI-PANJANG-0987654321',
        ]);

        $resp->assertOk();
        $resp->assertJson(['success' => true]);
        $this->assertSame('TOKEN-SENDIRI-PANJANG-0987654321', $user->fresh()->fcm_token);
    }

    public function test_perangkat_sama_kirim_ulang_token_ke_akunnya_sendiri_sukses(): void
    {
        $user = User::factory()->create(['role' => 'user', 'fcm_token' => 'TOKEN-SAMA-PANJANG-1122334455667788']);

        $resp = $this->actingAs($user)->postJson(route('notifications.saveFcmToken'), [
            'fcm_token' => 'TOKEN-SAMA-PANJANG-1122334455667788',
        ]);

        $resp->assertOk();
        $this->assertSame('TOKEN-SAMA-PANJANG-1122334455667788', $user->fresh()->fcm_token);
    }

    // --- P1 bank swap re-auth + cooldown ---

    public function test_ganti_rekening_tanpa_password_ditolak(): void
    {
        $merchant = $this->buatMerchant();
        $store = $this->buatStore($merchant);

        $resp = $this->actingAs($merchant)->put(route('merchant.withdrawals.update-bank'), [
            'bank_name' => 'mandiri',
            'bank_account_number' => '9998887776',
            'bank_account_holder' => 'Penyerang',
        ]);

        $resp->assertSessionHasErrors('password');
        $store->refresh();
        $this->assertSame('BCA', $store->bank_name);
        $this->assertSame('1234567890', $store->bank_account_number);
    }

    public function test_ganti_rekening_password_salah_ditolak(): void
    {
        $merchant = $this->buatMerchant();
        $store = $this->buatStore($merchant);

        $resp = $this->actingAs($merchant)->put(route('merchant.withdrawals.update-bank'), [
            'bank_name' => 'mandiri',
            'bank_account_number' => '9998887776',
            'bank_account_holder' => 'Penyerang',
            'password' => 'password-salah',
        ]);

        $resp->assertSessionHasErrors('password');
        $this->assertSame('1234567890', $store->fresh()->bank_account_number);
    }

    public function test_ganti_rekening_dengan_password_benar_sukses(): void
    {
        $merchant = $this->buatMerchant();
        $store = $this->buatStore($merchant);

        $resp = $this->actingAs($merchant)->put(route('merchant.withdrawals.update-bank'), [
            'bank_name' => 'mandiri',
            'bank_account_number' => '9998887776',
            'bank_account_holder' => 'Budi Santoso',
            'password' => 'rahasia123',
        ]);

        $resp->assertSessionHasNoErrors();
        $store->refresh();
        $this->assertSame('mandiri', $store->bank_name);
        $this->assertSame('9998887776', $store->bank_account_number);
    }

    public function test_cooldown_menolak_ganti_rekening_kedua_dalam_window(): void
    {
        $merchant = $this->buatMerchant();
        $store = $this->buatStore($merchant);

        $this->actingAs($merchant)->put(route('merchant.withdrawals.update-bank'), [
            'bank_name' => 'mandiri',
            'bank_account_number' => '9998887776',
            'bank_account_holder' => 'Budi Santoso',
            'password' => 'rahasia123',
        ])->assertSessionHasNoErrors();

        // percobaan kedua dalam window cooldown -> ditolak
        $resp = $this->actingAs($merchant)->put(route('merchant.withdrawals.update-bank'), [
            'bank_name' => 'bri',
            'bank_account_number' => '1112223334',
            'bank_account_holder' => 'Penyerang',
            'password' => 'rahasia123',
        ]);

        $resp->assertSessionHasErrors('password');
        $this->assertSame('9998887776', $store->fresh()->bank_account_number);
    }

    public function test_cooldown_habis_setelah_window_lewat(): void
    {
        $merchant = $this->buatMerchant();
        $store = $this->buatStore($merchant);

        $this->actingAs($merchant)->put(route('merchant.withdrawals.update-bank'), [
            'bank_name' => 'mandiri',
            'bank_account_number' => '9998887776',
            'bank_account_holder' => 'Budi Santoso',
            'password' => 'rahasia123',
        ])->assertSessionHasNoErrors();

        $this->travel(31)->minutes();

        $resp = $this->actingAs($merchant)->put(route('merchant.withdrawals.update-bank'), [
            'bank_name' => 'bri',
            'bank_account_number' => '1112223334',
            'bank_account_holder' => 'Budi Santoso',
            'password' => 'rahasia123',
        ]);

        $resp->assertSessionHasNoErrors();
        $this->assertSame('1112223334', $store->fresh()->bank_account_number);
    }

    public function test_tarik_dana_langsung_setelah_ganti_rekening_ditolak_cooldown(): void
    {
        $merchant = $this->buatMerchant();
        $store = $this->buatStore($merchant);
        $store->forceFill(['available_balance' => 250000])->save();

        $this->actingAs($merchant)->put(route('merchant.withdrawals.update-bank'), [
            'bank_name' => 'mandiri',
            'bank_account_number' => '9998887776',
            'bank_account_holder' => 'Penyerang Baru',
            'password' => 'rahasia123',
        ])->assertSessionHasNoErrors();

        // percobaan langsung tarik saldo selama masa cooldown 30 menit pasca ganti rekening wajib ditolak
        $resp = $this->actingAs($merchant)->post(route('merchant.withdrawals.store'), [
            'amount' => 100000,
        ]);

        $resp->assertSessionHasErrors('amount');
        $this->assertSame(250000.0, (float) $store->fresh()->available_balance);
    }

    // --- P1 throttle pin route ---

    public function test_route_complete_pasang_throttle_tracker_pin(): void
    {
        $route = app('router')->getRoutes()->getByName('tracker.complete');
        $middleware = $route->gatherMiddleware();

        $this->assertContains('throttle:tracker-pin', $middleware);
    }

    public function test_route_complete_batch_stop_pasang_throttle_tracker_pin(): void
    {
        $route = app('router')->getRoutes()->getByName('tracker.completeBatchStop');
        $middleware = $route->gatherMiddleware();

        $this->assertContains('throttle:tracker-pin', $middleware);
    }

    public function test_pin_brute_force_diblokir_setelah_limit(): void
    {
        $buyer = User::factory()->create(['role' => 'user']);
        $merchant = $this->buatMerchant();
        $store = $this->buatStore($merchant);

        $order = Order::create([
            'store_id' => $store->id,
            'user_id' => $buyer->id,
            'invoice_number' => 'ORD-PIN-BRUTE-001',
            'customer_name' => 'Test Customer',
            'customer_phone' => '08123456789',
            'shipping_address' => 'Jl. Test No. 1',
            'total_amount' => 50000,
            'shipping_status' => 'shipped',
            'payment_status' => 'paid',
            'payment_method' => 'bank_transfer',
            'shipping_pin' => '4321',
        ]);

        // otorisasi kurir lewat session (perilaku lama)
        $this->withSession(["driver_authorized_{$order->invoice_number}" => true]);

        // 5 percobaan salah -> counter penuh (in-controller) + middleware tracker-pin (5/15m by ip+invoice)
        $statuses = [];
        for ($i = 0; $i < 5; $i++) {
            $statuses[] = $this->post(route('tracker.complete', $order->invoice_number), ['pin' => '0000'])->getStatusCode();
        }

        // percobaan ke-6 ditolak middleware throttle:tracker-pin (429), bukan diproses controller
        $resp = $this->post(route('tracker.complete', $order->invoice_number), ['pin' => '4321']);
        $resp->assertStatus(429);

        // pin benar tidak boleh lolos: status tetap shipped
        $this->assertSame('shipped', $order->fresh()->shipping_status);
        $this->assertNotEmpty(Cache::get('pin_verify_'.$order->invoice_number));

        // bersihkan biar tidak bocor antar test
        Cache::forget('pin_verify_'.$order->invoice_number);
    }
}

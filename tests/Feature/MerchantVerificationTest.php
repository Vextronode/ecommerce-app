<?php

namespace Tests\Feature;

use App\Models\Store;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MerchantVerificationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config(['admin.prefix' => 'cibenda-portal']);
    }

    public function test_update_verification_pakai_user_id_bukan_store_id(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'email_verified_at' => now(),
        ]);

        // buat dua pedagang supaya id user != id store
        $lain = User::factory()->create(['role' => 'pedagang']);
        Store::create([
            'user_id' => $lain->id,
            'name' => 'Toko Lain',
            'slug' => 'toko-lain',
        ]);

        $pedagang = User::factory()->create(['role' => 'pedagang']);
        $store = Store::create([
            'user_id' => $pedagang->id,
            'name' => 'Toko Target',
            'slug' => 'toko-target',
        ]);
        $store->forceFill(['sid_status' => 'pending'])->save();

        // pastikan id user dan id store benar-benar beda
        $this->assertNotEquals($pedagang->id, $store->id);

        $resp = $this->actingAs($admin)->patch(
            '/cibenda-portal/pedagang/'.$pedagang->id.'/verification',
            ['sid_status' => 'verified']
        );

        $resp->assertRedirect();
        $store->refresh();
        $this->assertEquals('verified', $store->sid_status);
    }

    public function test_update_verification_404_kalau_store_kosong_dan_tidak_salah_toko(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'email_verified_at' => now(),
        ]);

        // pedagang tanpa store
        $tanpaStore = User::factory()->create(['role' => 'pedagang']);

        // pedagang lain dengan store -> statusnya tidak boleh ikut berubah
        $lain = User::factory()->create(['role' => 'pedagang']);
        $storeLain = Store::create([
            'user_id' => $lain->id,
            'name' => 'Toko Lain',
            'slug' => 'toko-lain',
        ]);
        $storeLain->forceFill(['sid_status' => 'pending'])->save();

        $resp = $this->actingAs($admin)->patch(
            '/cibenda-portal/pedagang/'.$tanpaStore->id.'/verification',
            ['sid_status' => 'verified']
        );

        $resp->assertStatus(404);
        $storeLain->refresh();
        $this->assertEquals('pending', $storeLain->sid_status);
    }
}

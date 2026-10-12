<?php

namespace Tests\Feature;

use App\Models\Store;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MerchantVerificationEdgeCaseTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config(['admin.prefix' => 'cibenda-portal']);
    }

    private function admin(): User
    {
        return User::factory()->create([
            'role' => 'admin',
            'email_verified_at' => now(),
        ]);
    }

    public function test_verify_user_id_3_store_id_9001_menargetkan_toko_benar(): void
    {
        $admin = $this->admin();

        // paksa store pertama supaya id store-nya besar, jauh dari id user
        $pengisi = User::factory()->create(['role' => 'pedagang']);
        Store::create([
            'user_id' => $pengisi->id,
            'name' => 'Toko Pengisi',
            'slug' => 'toko-pengisi',
        ]);

        $pedagang = User::factory()->create(['role' => 'pedagang']);
        $store = Store::create([
            'user_id' => $pedagang->id,
            'name' => 'Toko Target',
            'slug' => 'toko-target',
        ]);
        // simulasikan drift id: store milik pedagang dapat id 9001
        $store->id = 9001;
        $store->save();
        $store->forceFill(['sid_status' => 'pending'])->save();

        $this->assertSame(9001, $store->id);
        $this->assertNotSame($pedagang->id, $store->id);

        $resp = $this->actingAs($admin)->patch(
            '/cibenda-portal/pedagang/'.$pedagang->id.'/verification',
            ['sid_status' => 'verified']
        );

        $resp->assertRedirect();
        $store->refresh();
        $this->assertEquals('verified', $store->sid_status);
    }

    public function test_verify_id_user_yang_bukan_pedagang_menghasilkan_404(): void
    {
        $admin = $this->admin();

        // user biasa, bukan pedagang, tapi punya store supaya bukan 404 karena store kosong
        $pembeli = User::factory()->create(['role' => 'user']);
        Store::create([
            'user_id' => $pembeli->id,
            'name' => 'Toko Nyasar',
            'slug' => 'toko-nyasar',
        ]);

        $resp = $this->actingAs($admin)->patch(
            '/cibenda-portal/pedagang/'.$pembeli->id.'/verification',
            ['sid_status' => 'verified']
        );

        $resp->assertStatus(404);
    }

    public function test_verify_sid_status_tidak_valid_ditolak_422(): void
    {
        $admin = $this->admin();

        $pedagang = User::factory()->create(['role' => 'pedagang']);
        $store = Store::create([
            'user_id' => $pedagang->id,
            'name' => 'Toko Target',
            'slug' => 'toko-target-2',
        ]);
        $store->forceFill(['sid_status' => 'pending'])->save();

        $resp = $this->actingAs($admin)->patch(
            '/cibenda-portal/pedagang/'.$pedagang->id.'/verification',
            ['sid_status' => 'entah']
        );

        $resp->assertSessionHasErrors('sid_status');
        $store->refresh();
        $this->assertEquals('pending', $store->sid_status);
    }
}

<?php

namespace Tests\Feature\Admin;

use App\Jobs\SyncSidSellerApplicationsJob;
use App\Models\SellerApplication;
use App\Models\Store;
use App\Models\User;
use App\Services\Sid\SidApiService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class SellerApplicationIntegrationTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        config([
            'admin.prefix' => 'cibenda-portal',
            'services.sid.mock' => true,
            'services.sid.enabled' => true,
        ]);

        $this->admin = User::factory()->create([
            'name' => 'Admin CibendaMart',
            'email' => 'admin@cibendamart.com',
            'role' => 'admin',
        ]);
    }

    public function test_admin_can_view_seller_applications_tab(): void
    {
        $app = SellerApplication::create([
            'business_ref' => (string) Str::uuid(),
            'status' => SellerApplication::STATUS_PENDING,
            'requested_at' => now(),
            'nik' => '3201010101900001',
            'name' => 'Budi Santoso',
            'business_name' => 'Warung Budi',
            'business_activity' => 'Sembako',
            'category' => 'kelontong',
            'category_label' => 'Toko Kelontong',
            'email' => 'budi@example.com',
            'phone' => '081234567890',
            'address' => 'Desa Cibenda RT 01',
            'letter_number' => '470/099/Des/XI/2026',
            'issued_at' => now()->subDay(),
            'expires_at' => now()->addYear(),
        ]);

        $response = $this->actingAs($this->admin)->get('/cibenda-portal/pedagang?tab=applications');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Merchants/Index')
            ->where('active_tab', 'applications')
            ->has('applications.data', 1)
            ->where('stats.pending_merchants', 1)
        );
    }

    public function test_admin_can_view_create_page_with_prefilled_application(): void
    {
        $app = SellerApplication::create([
            'business_ref' => (string) Str::uuid(),
            'status' => SellerApplication::STATUS_PENDING,
            'requested_at' => now(),
            'nik' => '3201010101900002',
            'name' => 'Siti Aminah',
            'business_name' => 'Toko Aminah',
            'business_activity' => 'Toko Baju',
            'category' => 'non_kuliner',
            'category_label' => 'Toko Non Kuliner',
            'email' => 'aminah@example.com',
            'phone' => '085712345678',
            'address' => 'Desa Cibenda RT 02',
            'letter_number' => '470/100/Des/XI/2026',
            'issued_at' => now()->subDay(),
            'expires_at' => now()->addYear(),
        ]);

        $response = $this->actingAs($this->admin)->get("/cibenda-portal/pedagang/create?business_ref={$app->business_ref}");

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Merchants/Create')
            ->where('application.business_ref', $app->business_ref)
            ->where('application.business_name', 'Toko Aminah')
            ->where('application.name', 'Siti Aminah')
            ->where('application.nik', '3201010101900002')
        );
    }

    public function test_admin_can_create_merchant_from_application_with_atomic_lock(): void
    {
        $app = SellerApplication::create([
            'business_ref' => (string) Str::uuid(),
            'status' => SellerApplication::STATUS_PENDING,
            'requested_at' => now(),
            'nik' => '3201010101900003',
            'name' => 'Joni Walker',
            'business_name' => 'Warkop Joni Sejahtera',
            'business_activity' => 'Kuliner',
            'category' => 'kuliner',
            'category_label' => 'Toko Kuliner',
            'email' => 'joni.walker@example.com',
            'phone' => '081234567899',
            'address' => 'Jl. Wisata Cibenda',
            'letter_number' => '470/101/Des/XI/2026',
            'issued_at' => now()->subDay(),
            'expires_at' => now()->addYear(),
        ]);

        $payload = [
            'merchant_name' => 'Warkop Joni Sejahtera',
            'owner_name' => 'Joni Walker',
            'nik' => '3201010101900003',
            'username' => 'warkopjonisejahtera',
            'email' => 'joni.walker@example.com',
            'phone' => '081234567899',
            'password' => 'Password123!',
            'business_ref' => $app->business_ref,
        ];

        $response = $this->actingAs($this->admin)->post('/cibenda-portal/pedagang', $payload);

        $response->assertRedirect('/cibenda-portal/pedagang?tab=merchants');
        $response->assertSessionHas('success');

        // Verify User and Store created
        $this->assertDatabaseHas('users', [
            'email' => 'joni.walker@example.com',
            'nik' => '3201010101900003',
            'role' => 'pedagang',
            'status' => 'active',
        ]);

        $this->assertDatabaseHas('stores', [
            'business_ref' => $app->business_ref,
            'name' => 'Warkop Joni Sejahtera',
            'sid_status' => 'verified',
        ]);

        // Verify Application marked accepted and linked
        $app->refresh();
        $this->assertEquals(SellerApplication::STATUS_ACCEPTED, $app->status);
        $this->assertNotNull($app->decided_at);
        $this->assertNotNull($app->user_id);
        $this->assertNotNull($app->store_id);
    }

    public function test_application_creation_rolls_back_if_cancelled_by_applicant(): void
    {
        // 36-character valid hex UUID ending in 'c44ce1' triggers mock cancellation
        $cancelRef = '00000000-0000-0000-0000-000000c44ce1';

        $app = SellerApplication::create([
            'business_ref' => $cancelRef,
            'status' => SellerApplication::STATUS_PENDING,
            'requested_at' => now(),
            'nik' => '3201010101900004',
            'name' => 'Pemohon Batalkan',
            'business_name' => 'Toko Dibatalkan',
            'business_activity' => 'Jasa',
            'category' => 'non_kuliner',
            'category_label' => 'Toko Non Kuliner',
            'email' => 'batalkan@example.com',
            'phone' => '081234567800',
            'address' => 'Desa Cibenda RT 04',
            'letter_number' => '470/102/Des/XI/2026',
            'issued_at' => now()->subDay(),
            'expires_at' => now()->addYear(),
        ]);

        $payload = [
            'merchant_name' => 'Toko Dibatalkan',
            'owner_name' => 'Pemohon Batalkan',
            'nik' => '3201010101900004',
            'username' => 'tokodibatalkan',
            'email' => 'batalkan@example.com',
            'phone' => '081234567800',
            'password' => 'Password123!',
            'business_ref' => $cancelRef,
        ];

        $response = $this->actingAs($this->admin)->post('/cibenda-portal/pedagang', $payload);

        $response->assertRedirect('/cibenda-portal/pedagang?tab=applications');
        $response->assertSessionHas('error');

        // DB Transaction must have rolled back
        $this->assertDatabaseMissing('users', [
            'email' => 'batalkan@example.com',
        ]);
        $this->assertDatabaseMissing('stores', [
            'business_ref' => $cancelRef,
        ]);

        // Application must be marked cancelled and PII anonymized
        $app->refresh();
        $this->assertEquals(SellerApplication::STATUS_CANCELLED, $app->status);
        $this->assertNull($app->nik);
        $this->assertNull($app->name);
        $this->assertNull($app->email);
        $this->assertNull($app->phone);
    }

    public function test_admin_can_reject_application_with_note(): void
    {
        $app = SellerApplication::create([
            'business_ref' => (string) Str::uuid(),
            'status' => SellerApplication::STATUS_PENDING,
            'requested_at' => now(),
            'nik' => '3201010101900005',
            'name' => 'Ditolak Test',
            'business_name' => 'Toko Kurang Syarat',
            'business_activity' => 'Makanan',
            'category' => 'kuliner',
            'category_label' => 'Toko Kuliner',
            'email' => 'tolak@example.com',
            'phone' => '081234567805',
            'address' => 'Desa Cibenda RT 05',
            'letter_number' => '470/103/Des/XI/2026',
            'issued_at' => now()->subDay(),
            'expires_at' => now()->addYear(),
        ]);

        $response = $this->actingAs($this->admin)->post(
            "/cibenda-portal/pedagang/applications/{$app->business_ref}/reject",
            ['note' => 'Dokumen foto tempat usaha tidak sesuai dengan jenis makanan yang didaftarkan.']
        );

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $app->refresh();
        $this->assertEquals(SellerApplication::STATUS_REJECTED, $app->status);
        $this->assertEquals('Dokumen foto tempat usaha tidak sesuai dengan jenis makanan yang didaftarkan.', $app->note);
        $this->assertNotNull($app->decided_at);
    }

    public function test_admin_can_trigger_sid_sync(): void
    {
        $response = $this->actingAs($this->admin)->post('/cibenda-portal/pedagang/applications/sync');

        $response->assertRedirect();
        $response->assertSessionHas('success');

        // At least 1 mock application is synced from SID
        $this->assertGreaterThan(0, SellerApplication::count());
    }
}

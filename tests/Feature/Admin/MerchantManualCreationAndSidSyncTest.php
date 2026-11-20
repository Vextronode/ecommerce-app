<?php

namespace Tests\Feature\Admin;

use App\Jobs\SyncSidSellerApplicationsJob;
use App\Models\PlatformSetting;
use App\Models\SellerApplication;
use App\Models\Store;
use App\Models\User;
use App\Services\Sid\SidApiService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Tests\TestCase;

class MerchantManualCreationAndSidSyncTest extends TestCase
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

    public function test_non_sid_merchant_creation_requires_manual_creation_reason(): void
    {
        $payload = [
            'merchant_name' => 'Toko Manual Sejahtera',
            'owner_name' => 'Kang Ujang',
            'nik' => '3201010101900010',
            'username' => 'tokomanualsejahtera',
            'email' => 'ujang@example.com',
            'phone' => '081234567891',
            'password' => 'Password123!',
            'business_ref' => null,
            'manual_creation_reason' => '',
        ];

        $response = $this->actingAs($this->admin)->post('/cibenda-portal/pedagang', $payload);

        $response->assertSessionHasErrors(['manual_creation_reason']);
        $this->assertDatabaseMissing('users', ['email' => 'ujang@example.com']);
    }

    public function test_non_sid_merchant_creation_succeeds_with_reason_and_records_audit(): void
    {
        Log::spy();

        $payload = [
            'merchant_name' => 'Toko Manual Berkah',
            'owner_name' => 'Kang Asep',
            'nik' => '3201010101900011',
            'username' => 'tokomanualberkah',
            'email' => 'asep@example.com',
            'phone' => '081234567892',
            'password' => 'Password123!',
            'business_ref' => null,
            'manual_creation_reason' => 'Mitra UMKM binaan khusus desa belum terhubung SKU digital',
        ];

        $response = $this->actingAs($this->admin)->post('/cibenda-portal/pedagang', $payload);

        $response->assertRedirect('/cibenda-portal/pedagang?tab=merchants');
        $response->assertSessionHas('success');

        $store = Store::where('name', 'Toko Manual Berkah')->first();
        $this->assertNotNull($store);
        $this->assertTrue((bool) $store->is_manual_creation);
        $this->assertEquals('Mitra UMKM binaan khusus desa belum terhubung SKU digital', $store->manual_creation_reason);
        $this->assertNull($store->business_ref);

        // Verify audit log recorded
        Log::shouldHaveReceived('info')
            ->withArgs(fn ($message) => str_contains($message, 'mendaftarkan pedagang manual tanpa SID') && str_contains($message, 'Mitra UMKM binaan'));
    }

    public function test_sid_merchant_creation_sets_is_manual_creation_false(): void
    {
        $app = SellerApplication::create([
            'business_ref' => (string) Str::uuid(),
            'status' => SellerApplication::STATUS_PENDING,
            'requested_at' => now(),
            'nik' => '3201010101900012',
            'name' => 'Cecep Sutisna',
            'business_name' => 'Warung Cecep SID',
            'business_activity' => 'Kuliner',
            'category' => 'kuliner',
            'category_label' => 'Toko Kuliner',
            'email' => 'cecep@example.com',
            'phone' => '081234567893',
            'address' => 'Desa Cibenda RT 05',
            'letter_number' => '470/103/Des/XI/2026',
            'issued_at' => now()->subDay(),
            'expires_at' => now()->addYear(),
        ]);

        $payload = [
            'merchant_name' => 'Warung Cecep SID',
            'owner_name' => 'Cecep Sutisna',
            'nik' => '3201010101900012',
            'username' => 'warungcecepsid',
            'email' => 'cecep@example.com',
            'phone' => '081234567893',
            'password' => 'Password123!',
            'business_ref' => $app->business_ref,
        ];

        $response = $this->actingAs($this->admin)->post('/cibenda-portal/pedagang', $payload);

        $response->assertRedirect('/cibenda-portal/pedagang?tab=merchants');
        $response->assertSessionHas('success');

        $store = Store::where('business_ref', $app->business_ref)->first();
        $this->assertNotNull($store);
        $this->assertFalse((bool) $store->is_manual_creation);
        $this->assertNull($store->manual_creation_reason);
    }

    public function test_sync_job_skips_when_enable_sid_sync_is_disabled(): void
    {
        PlatformSetting::set('enable_sid_sync', false, 'boolean');

        $mockSidService = $this->createMock(SidApiService::class);
        $mockSidService->expects($this->never())->method('fetchApplications');

        $job = new SyncSidSellerApplicationsJob;
        $job->handle($mockSidService);
    }

    public function test_sync_job_runs_when_enable_sid_sync_is_enabled(): void
    {
        PlatformSetting::set('enable_sid_sync', true, 'boolean');

        $mockSidService = $this->createMock(SidApiService::class);
        $mockSidService->method('isEnabled')->willReturn(true);
        $mockSidService->expects($this->once())
            ->method('fetchApplications')
            ->willReturn(['data' => [], 'meta' => ['last_page' => 1]]);

        $job = new SyncSidSellerApplicationsJob;
        $job->handle($mockSidService);
    }
}

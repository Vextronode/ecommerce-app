<?php

namespace Tests\Feature\Admin;

use App\Models\PlatformSetting;
use App\Models\User;
use Database\Seeders\PlatformSettingSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PlatformSettingControllerTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected User $regularUser;

    protected function setUp(): void
    {
        parent::setUp();

        config(['admin.prefix' => 'cibenda-portal']);

        $this->admin = User::factory()->create([
            'name' => 'Admin CibendaMart',
            'email' => 'admin@cibendamart.com',
            'role' => 'admin',
        ]);

        $this->regularUser = User::factory()->create([
            'role' => 'user',
        ]);

        $this->seed(PlatformSettingSeeder::class);
    }

    public function test_guest_cannot_access_platform_settings(): void
    {
        $response = $this->get(route('admin.settings.index'));

        $response->assertRedirect(route('admin.login.view'));
    }

    public function test_regular_user_cannot_access_platform_settings(): void
    {
        $response = $this->actingAs($this->regularUser)
            ->get(route('admin.settings.index'));

        $response->assertRedirect('/dashboard');
    }

    public function test_admin_can_view_platform_settings_page(): void
    {
        $response = $this->actingAs($this->admin)
            ->get(route('admin.settings.index'));

        $response->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Settings/Index')
                ->has('settings', 9)
            );
    }

    public function test_admin_can_update_platform_settings(): void
    {
        $payload = [
            'settings' => [
                ['key' => 'enable_tax', 'value' => true],
                ['key' => 'tax_percentage', 'value' => 11],
                ['key' => 'enable_service_fee', 'value' => true],
                ['key' => 'service_fee_amount', 'value' => 2000],
                ['key' => 'enable_online_payment', 'value' => false],
            ],
        ];

        $response = $this->actingAs($this->admin)
            ->put(route('admin.settings.update'), $payload);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertTrue(PlatformSetting::isEnabled('enable_tax'));
        $this->assertSame(11, PlatformSetting::get('tax_percentage'));
        $this->assertTrue(PlatformSetting::isEnabled('enable_service_fee'));
        $this->assertSame(2000, PlatformSetting::get('service_fee_amount'));
        $this->assertFalse(PlatformSetting::isEnabled('enable_online_payment'));
    }

    public function test_update_validates_tax_percentage_and_service_fee(): void
    {
        $payload = [
            'settings' => [
                ['key' => 'tax_percentage', 'value' => 150],
            ],
        ];

        $response = $this->actingAs($this->admin)
            ->put(route('admin.settings.update'), $payload);

        $response->assertSessionHasErrors(['tax_percentage']);

        $invalidFeePayload = [
            'settings' => [
                ['key' => 'service_fee_amount', 'value' => -500],
            ],
        ];

        $response2 = $this->actingAs($this->admin)
            ->put(route('admin.settings.update'), $invalidFeePayload);

        $response2->assertSessionHasErrors(['service_fee_amount']);
    }

    public function test_admin_page_self_heals_when_settings_table_is_empty(): void
    {
        PlatformSetting::query()->delete();
        $this->assertSame(0, PlatformSetting::count());

        $response = $this->actingAs($this->admin)
            ->get(route('admin.settings.index'));

        $response->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Settings/Index')
                ->has('settings', 9)
            );

        $this->assertSame(9, PlatformSetting::count());
    }
}

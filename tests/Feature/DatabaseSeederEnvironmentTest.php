<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\PlatformSetting;
use App\Models\User;
use Database\Seeders\PlatformSettingSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DatabaseSeederEnvironmentTest extends TestCase
{
    use RefreshDatabase;

    public function test_production_environment_skips_dummy_data_and_only_seeds_master_data(): void
    {
        // Mock environment to production
        $this->app->detectEnvironment(fn () => 'production');

        $this->artisan('db:seed', ['--force' => true]);

        // Master data MUST be seeded
        $this->assertTrue(Category::where('name', 'Seafood')->exists());
        $this->assertTrue(PlatformSetting::where('key', 'enable_tax')->exists());

        // Dummy admin MUST NOT be created in production
        $this->assertDatabaseMissing('users', [
            'email' => 'admin@cibendamart.com',
        ]);

        // Demo merchants and stores MUST NOT be created in production
        $this->assertEquals(0, User::where('role', 'pedagang')->count());
    }

    public function test_platform_setting_seeder_does_not_overwrite_values_configured_by_admin(): void
    {
        // Initial seed
        $this->seed(PlatformSettingSeeder::class);

        // Admin modifies settings via dashboard
        $taxSetting = PlatformSetting::where('key', 'tax_percentage')->first();
        $taxSetting->update(['value' => '11']);

        $onlinePaymentSetting = PlatformSetting::where('key', 'enable_online_payment')->first();
        $onlinePaymentSetting->update(['value' => '0']);

        // Seeder is run again during subsequent deploy
        $this->seed(PlatformSettingSeeder::class);

        // Modified values MUST persist and NOT be overwritten
        $taxSetting->refresh();
        $this->assertEquals('11', $taxSetting->value);

        $onlinePaymentSetting->refresh();
        $this->assertEquals('0', $onlinePaymentSetting->value);
    }
}

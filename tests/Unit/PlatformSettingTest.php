<?php

namespace Tests\Unit;

use App\Models\PlatformSetting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class PlatformSettingTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_retrieve_default_when_setting_not_found(): void
    {
        $this->assertNull(PlatformSetting::get('non_existent_key'));
        $this->assertEquals('fallback', PlatformSetting::get('non_existent_key', 'fallback'));
        $this->assertFalse(PlatformSetting::isEnabled('non_existent_key'));
        $this->assertTrue(PlatformSetting::isEnabled('non_existent_key', true));
    }

    public function test_can_set_and_get_boolean_setting_with_cache(): void
    {
        PlatformSetting::create([
            'key' => 'enable_online_payment',
            'value' => '1',
            'type' => PlatformSetting::TYPE_BOOLEAN,
            'group' => PlatformSetting::GROUP_FEATURE_FLAGS,
            'label' => 'Online Payment',
        ]);

        $this->assertTrue(PlatformSetting::isEnabled('enable_online_payment'));

        PlatformSetting::set('enable_online_payment', false);

        $this->assertFalse(PlatformSetting::isEnabled('enable_online_payment'));
        $this->assertSame(false, PlatformSetting::get('enable_online_payment'));
    }

    public function test_can_set_and_get_numeric_setting(): void
    {
        PlatformSetting::create([
            'key' => 'service_fee_amount',
            'value' => '1000',
            'type' => PlatformSetting::TYPE_NUMBER,
            'group' => PlatformSetting::GROUP_FINANCE,
            'label' => 'Service Fee',
        ]);

        $this->assertSame(1000, PlatformSetting::get('service_fee_amount'));

        PlatformSetting::set('service_fee_amount', 2500);

        $this->assertSame(2500, PlatformSetting::get('service_fee_amount'));
    }

    public function test_cache_is_invalidated_when_model_is_saved_or_deleted(): void
    {
        $setting = PlatformSetting::create([
            'key' => 'tax_percentage',
            'value' => '11',
            'type' => PlatformSetting::TYPE_NUMBER,
            'group' => PlatformSetting::GROUP_FINANCE,
            'label' => 'PPN',
        ]);

        $this->assertSame(11, PlatformSetting::get('tax_percentage'));

        $setting->update(['value' => '12']);
        $this->assertSame(12, PlatformSetting::get('tax_percentage'));

        $setting->delete();
        $this->assertNull(PlatformSetting::get('tax_percentage'));
    }
}

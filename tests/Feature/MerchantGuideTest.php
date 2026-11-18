<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class MerchantGuideTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_view_merchant_guide_page(): void
    {
        $response = $this->get(route('merchant.guide'));

        $response->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Storefront/MerchantGuide')
                ->has('sidPortalUrl')
            );
    }

    public function test_merchant_guide_accessible_via_mitra_path(): void
    {
        $response = $this->get('/mitra');

        $response->assertOk();
    }
}

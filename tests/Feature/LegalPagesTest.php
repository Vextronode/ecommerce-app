<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class LegalPagesTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_view_merchant_agreement_page(): void
    {
        $response = $this->get(route('legal.merchant-agreement'));

        $response->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Legal/MerchantAgreement')
            );
    }

    public function test_can_view_refund_policy_page(): void
    {
        $response = $this->get(route('legal.refund'));

        $response->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Legal/RefundPolicy')
            );
    }

    public function test_can_view_terms_and_conditions_page(): void
    {
        $response = $this->get(route('legal.terms'));

        $response->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Legal/TermsAndConditions')
            );
    }

    public function test_can_view_prohibited_products_page(): void
    {
        $response = $this->get(route('legal.prohibited-products'));

        $response->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Legal/ProhibitedProducts')
            );
    }
}

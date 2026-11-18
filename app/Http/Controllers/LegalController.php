<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class LegalController extends Controller
{
    public function merchantAgreement(): Response
    {
        return Inertia::render('Legal/MerchantAgreement');
    }

    public function refundPolicy(): Response
    {
        return Inertia::render('Legal/RefundPolicy');
    }

    public function termsAndConditions(): Response
    {
        return Inertia::render('Legal/TermsAndConditions');
    }

    public function prohibitedProducts(): Response
    {
        return Inertia::render('Legal/ProhibitedProducts');
    }
}

<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class InfoPageController extends Controller
{
    /**
     * Display the About Us page.
     */
    public function about(): Response
    {
        return Inertia::render('Storefront/About');
    }

    /**
     * Display the Merchant / Partner Registration Guide page.
     */
    public function merchantGuide(): Response
    {
        return Inertia::render('Storefront/MerchantGuide', [
            'sidPortalUrl' => config('services.sid.portal_url', 'https://cibenda.desa.id'),
        ]);
    }
}

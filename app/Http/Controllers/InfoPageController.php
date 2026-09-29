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
}

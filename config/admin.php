<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Admin Panel Path Prefix
    |--------------------------------------------------------------------------
    |
    | This secret path prefix configures the URL path under which the admin
    | portal and admin authentication routes are exposed to prevent URL
    | enumeration and unauthorized discovery.
    |
    */
    'prefix' => env('ADMIN_PANEL_PATH', 'cibenda-portal'),
];

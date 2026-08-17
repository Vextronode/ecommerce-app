<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="theme-color" content="#ED7218">
        <meta name="mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="default">
        <meta name="apple-mobile-web-app-title" content="CiMart">

        <title inertia>{{ config('app.name', 'Cibenda Mart') }}</title>

        <!-- Favicon -->
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png">
        <link rel="shortcut icon" href="/favicon.png">
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">

        <!-- PWA Manifest — berbeda per role -->
        @php
            $isMerchant = request()->is('pedagang*') || request()->is('pedagang/*');
            $isAdmin    = request()->is(config('app.admin_panel_path', 'cibenda-portal') . '*');
        @endphp

        @if($isMerchant)
            <link rel="manifest" href="/manifest-merchant.json">
            <meta name="theme-color" content="#4F46E5">
        @elseif(!$isAdmin)
            <link rel="manifest" href="/manifest.json">
            <meta name="theme-color" content="#ED7218">
        @endif


        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800&display=swap" rel="stylesheet">

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/Pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia

        <!-- PWA Service Worker Registration -->
        @if(!$isAdmin)
        <script>
            if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                    navigator.serviceWorker.register('/sw.js', { scope: '/' })
                        .catch((err) => console.warn('SW registration failed:', err));
                });
            }
        </script>
        @endif

    </body>
</html>

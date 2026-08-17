<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="default">

        @php
            $isMerchant = request()->is('pedagang') || request()->is('pedagang/*');
            $adminPrefix = config('admin.prefix', 'cibenda-portal');
            $isAdmin    = request()->is($adminPrefix) || request()->is($adminPrefix . '/*');
        @endphp

        <title inertia>{{ config('app.name', 'Cibenda Mart') }}</title>

        <!-- Favicon & PWA Icons per Role -->
        @if($isMerchant)
            <meta name="theme-color" content="#4F46E5">
            <meta name="apple-mobile-web-app-title" content="Toko CiMart">
            <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-merchant-192.png">
            <link rel="shortcut icon" href="/icons/icon-merchant-192.png">
            <link rel="apple-touch-icon" href="/icons/apple-touch-icon-merchant.png">
            <link rel="manifest" href="/manifest-merchant.json">
        @elseif(!$isAdmin)
            <meta name="theme-color" content="#ED7218">
            <meta name="apple-mobile-web-app-title" content="CiMart">
            <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
            <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png">
            <link rel="shortcut icon" href="/favicon.png">
            <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">
            <link rel="manifest" href="/manifest.json">
        @else
            <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
            <link rel="shortcut icon" href="/favicon.png">
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

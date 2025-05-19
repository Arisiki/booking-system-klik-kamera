// ... existing code ...

protected $middlewareGroups = [
    'web' => [
        // ... existing code ...
        \Illuminate\Routing\Middleware\SubstituteBindings::class,
        \Illuminate\View\Middleware\ShareErrorsFromSession::class,
        \App\Http\Middleware\VerifyCsrfToken::class,
        \Illuminate\Routing\Middleware\SubstituteBindings::class,
        \App\Http\Middleware\HandleInertiaRequests::class,
        \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        // Tambahkan middleware cache untuk halaman statis
        // \Illuminate\Http\Middleware\SetCacheHeaders::class,
    ],
    
    // ... existing code ...
];
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CacheControl
{
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);
        
        // Tambahkan header cache untuk aset statis
        if ($request->is('*.js') || $request->is('*.css') || $request->is('*.svg') || $request->is('*.jpg') || $request->is('*.png')) {
            $response->header('Cache-Control', 'public, max-age=31536000');
        }
        
        return $response;
    }
}
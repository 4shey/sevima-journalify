<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\Response;

class SetSimulatedTimeMiddleware
{
    /**
     * Handle an incoming request.
     *
     * Sets Carbon test now for controllers and view rendering,
     * then safely resets it in the finally block so Laravel session
     * expiration checks and garbage collection are unaffected.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (Cache::has('simulated_time')) {
            $simulated = Cache::get('simulated_time');
            if ($simulated) {
                Carbon::setTestNow(Carbon::parse($simulated));
            }
        }

        try {
            return $next($request);
        } finally {
            Carbon::setTestNow(null);
        }
    }
}

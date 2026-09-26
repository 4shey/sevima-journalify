<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => fn () => $this->userPayload($request),
            ],
            'ziggy' => fn () => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],
        ];
    }

    /**
     * Build the shared payload for the authenticated user.
     *
     * @return array<string, mixed>|null
     */
    private function userPayload(Request $request): ?array
    {
        $user = $request->user();

        if (! $user) {
            return null;
        }

        $teacher = $user->teacher;
        $curriculum = $user->curriculum;

        return [
            'id' => $user->id,
            'email' => $user->email,
            'role' => $user->role?->value,
            'name' => $teacher?->name ?? $curriculum?->name,
            'code' => $teacher?->code,
        ];
    }
}

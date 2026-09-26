<?php

namespace App\Support;

use App\Models\Schedule;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

final class MonitoringDay
{
    public function __construct(
        public readonly string $date,
        public readonly string $maxDate,
        public readonly string $weekday,
        public readonly ?Schedule $schedule,
    ) {}

    public static function fromRequest(Request $request): self
    {
        return self::forDate((string) $request->query('date', now()->toDateString()));
    }

    public static function forDate(?string $date): self
    {
        $maxDate = now()->toDateString();
        $date = trim((string) $date);

        if ($date === '' || preg_match('/^\d{4}-\d{2}-\d{2}$/', $date) !== 1 || $date > $maxDate) {
            $date = $maxDate;
        }

        return new self(
            date: $date,
            maxDate: $maxDate,
            weekday: Carbon::parse($date)->format('l'),
            schedule: Schedule::effectiveOn($date),
        );
    }
}

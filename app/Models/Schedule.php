<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['name', 'active_date'])]
class Schedule extends Model
{
    use HasUuids;

    public function scheduleDetails(): HasMany
    {
        return $this->hasMany(ScheduleDetail::class);
    }

    public static function effectiveOn(string $date): ?self
    {
        return static::query()
            ->where('active_date', '<=', $date)
            ->orderByDesc('active_date')
            ->first();
    }
}

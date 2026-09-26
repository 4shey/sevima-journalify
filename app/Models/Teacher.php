<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['user_id', 'name', 'code'])]
class Teacher extends Model
{
    use HasUuids;

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scheduleDetails(): HasMany
    {
        return $this->hasMany(ScheduleDetail::class);
    }
}

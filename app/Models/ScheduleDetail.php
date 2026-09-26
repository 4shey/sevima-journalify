<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[Fillable(['schedule_id', 'subject_id', 'class_id', 'teacher_id', 'day', 'start_period_id', 'end_period_id'])]
class ScheduleDetail extends Model
{
    use HasUuids;

    public function schedule(): BelongsTo
    {
        return $this->belongsTo(Schedule::class);
    }

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    public function classroom(): BelongsTo
    {
        return $this->belongsTo(Classroom::class, 'class_id');
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(Teacher::class);
    }

    public function startPeriod(): BelongsTo
    {
        return $this->belongsTo(Period::class, 'start_period_id');
    }

    public function endPeriod(): BelongsTo
    {
        return $this->belongsTo(Period::class, 'end_period_id');
    }

    public function journal(): HasOne
    {
        return $this->hasOne(Journal::class);
    }
}

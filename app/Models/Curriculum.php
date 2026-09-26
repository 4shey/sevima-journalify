<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['user_id', 'name'])]
class Curriculum extends Model
{
    use HasUuids;

    /**
     * The table is intentionally pluralized (not "curricula").
     */
    protected $table = 'curriculums';

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

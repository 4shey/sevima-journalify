<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['major_id', 'grade'])]
class Classroom extends Model
{
    use HasUuids;

    /**
     * The table is "classes" (plural of class is handled manually because
     * "class" is a reserved word in PHP).
     */
    protected $table = 'classes';

    protected $appends = ['label'];

    public function major(): BelongsTo
    {
        return $this->belongsTo(Major::class);
    }

    public function students(): HasMany
    {
        return $this->hasMany(Student::class, 'class_id');
    }

    /**
     * Human readable label, e.g. "X RPL".
     */
    protected function label(): Attribute
    {
        return Attribute::get(fn (): string => $this->major
            ? trim("{$this->grade} {$this->major->name}")
            : (string) $this->grade);
    }
}

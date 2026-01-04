<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Course extends Model
{
    use HasFactory;
    protected $fillable = [
        'name',
        'description',
        'is_available',
        'max_students',
        'teacher_id',
    ];

    protected $casts = [
        'is_available' => 'boolean',
    ];

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    public function students(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'course_user')
            ->withPivot(['enrolled_at', 'completed_at', 'pass_status'])
            ->withTimestamps();
    }

    public function enrolledStudents(): BelongsToMany
    {
        return $this->students()->wherePivot('pass_status', 'pending');
    }

    public function completedStudents(): BelongsToMany
    {
        return $this->students()->wherePivotIn('pass_status', ['pass', 'fail']);
    }

    public function hasSpace(): bool
    {
        return $this->enrolledStudents()->count() < $this->max_students;
    }

    public function canEnroll(): bool
    {
        return $this->is_available && $this->hasSpace();
    }
}

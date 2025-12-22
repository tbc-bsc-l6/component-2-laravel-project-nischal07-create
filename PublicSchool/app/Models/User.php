<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'user_role_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    public function role(): BelongsTo
    {
        return $this->belongsTo(UserRole::class, 'user_role_id');
    }

    public function courses(): BelongsToMany
    {
        return $this->belongsToMany(Course::class, 'course_user')
            ->withPivot(['enrolled_at', 'completed_at', 'pass_status'])
            ->withTimestamps();
    }

    public function teachingCourses(): HasMany
    {
        return $this->hasMany(Course::class, 'teacher_id');
    }

    public function enrolledCourses(): BelongsToMany
    {
        return $this->courses()->wherePivot('pass_status', 'pending');
    }

    public function completedCourses(): BelongsToMany
    {
        return $this->courses()->wherePivotIn('pass_status', ['pass', 'fail']);
    }

    // Role helper methods
    public function isAdmin(): bool
    {
        return $this->role->name === 'admin';
    }

    public function isTeacher(): bool
    {
        return $this->role->name === 'teacher';
    }

    public function isStudent(): bool
    {
        return $this->role->name === 'student';
    }

    public function isOldStudent(): bool
    {
        return $this->role->name === 'old_student';
    }

    public function canEnrollInMoreCourses(): bool
    {
        return $this->isStudent() && $this->enrolledCourses()->count() < 4;
    }
}

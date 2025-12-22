<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class UserRole extends Model
{
    protected $fillable = ['name', 'display_name'];

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    // Helper methods
    public function isAdmin(): bool
    {
        return $this->name === 'admin';
    }

    public function isTeacher(): bool
    {
        return $this->name === 'teacher';
    }

    public function isStudent(): bool
    {
        return $this->name === 'student';
    }

    public function isOldStudent(): bool
    {
        return $this->name === 'old_student';
    }
}

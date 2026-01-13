<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Carbon;

class Announcement extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'body',
        'published_at',
        'user_id',
        'is_pinned',
    ];

    protected $casts = [
        'published_at' => 'datetime',
        'is_pinned' => 'boolean',
    ];

    protected $appends = [
        'excerpt',
    ];

    protected static function booted(): void
    {
        static::saved(fn () => cache()->flush());
        static::deleted(fn () => cache()->flush());
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query->whereNotNull('published_at')
            ->where('published_at', '<=', now());
    }

    public function scopeSearch(Builder $query, ?string $q): Builder
    {
        if (!$q) {
            return $query;
        }
        return $query->where(function ($inner) use ($q) {
            $inner->where('title', 'like', "%{$q}%")
                  ->orWhere('body', 'like', "%{$q}%");
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function getExcerptAttribute(): string
    {
        return str($this->body)->limit(180)->toString();
    }
}

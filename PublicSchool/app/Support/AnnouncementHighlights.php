<?php

namespace App\Support;

use App\Http\Resources\AnnouncementResource;
use App\Models\Announcement;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;

class AnnouncementHighlights
{
    public static function forDashboard(int $limit = 3): Collection
    {
        $limit = max(1, $limit);
        $cacheKey = "announcements:dashboard:{$limit}";

        return Cache::remember($cacheKey, now()->addMinutes(5), function () use ($limit) {
            return Announcement::query()
                ->published()
                ->orderByDesc('is_pinned')
                ->orderByDesc('published_at')
                ->orderByDesc('id')
                ->limit($limit)
                ->get()
                ->map(fn ($announcement) => (new AnnouncementResource($announcement))->resolve());
        });
    }
}

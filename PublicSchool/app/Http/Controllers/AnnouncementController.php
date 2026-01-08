<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\URL;
use Inertia\Inertia;

class AnnouncementController extends Controller
{
    public function index(Request $request)
    {
        $q = (string) $request->query('q', '');
        $page = $request->integer('page', 1);
        $cacheKey = sprintf('announcements:index:q:%s:page:%d', md5($q), $page);

        $announcements = Cache::remember($cacheKey, now()->addMinutes(5), function () use ($q) {
            return Announcement::query()
                ->published()
                ->search($q)
                ->orderByDesc('is_pinned')
                ->orderByDesc('published_at')
                ->orderByDesc('id')
                ->paginate(10)
                ->through(function ($a) {
                    return [
                        'id' => $a->id,
                        'title' => $a->title,
                        'excerpt' => str($a->body)->limit(180)->toString(),
                        'published_at' => optional($a->published_at)->toIso8601String(),
                        'is_pinned' => (bool) $a->is_pinned,
                    ];
                })
                ->withQueryString();
        });

        return Inertia::render('announcements/index', [
            'filters' => ['q' => $q],
            'announcements' => $announcements,
        ]);
    }

    public function show(Announcement $announcement)
    {
        if (!$announcement->published_at || $announcement->published_at->isFuture()) {
            abort(404);
        }

        return Inertia::render('announcements/show', [
            'announcement' => [
                'id' => $announcement->id,
                'title' => $announcement->title,
                'body' => $announcement->body,
                'published_at' => optional($announcement->published_at)->toIso8601String(),
                'is_pinned' => (bool) $announcement->is_pinned,
            ],
        ]);
    }

    public function apiIndex(Request $request)
    {
        $q = (string) $request->query('q', '');
        $limit = min($request->integer('limit', 20), 50);

        $items = Announcement::query()
            ->published()
            ->search($q)
            ->orderByDesc('is_pinned')
            ->orderByDesc('published_at')
            ->orderByDesc('id')
            ->limit($limit)
            ->get()
            ->map(function ($a) {
                return [
                    'id' => $a->id,
                    'title' => $a->title,
                    'excerpt' => str($a->body)->limit(180)->toString(),
                    'published_at' => optional($a->published_at)->toIso8601String(),
                    'is_pinned' => (bool) $a->is_pinned,
                ];
            });

        return response()->json([
            'data' => $items,
        ]);
    }

    public function feed()
    {
        $items = Announcement::query()
            ->published()
            ->orderByDesc('is_pinned')
            ->orderByDesc('published_at')
            ->orderByDesc('id')
            ->limit(20)
            ->get();

        $xml = view('feed.announcements', [
            'items' => $items,
            'now' => now(),
            'link' => URL::to('/announcements'),
        ])->render();

        return response($xml, 200)->header('Content-Type', 'application/rss+xml; charset=UTF-8');
    }
}

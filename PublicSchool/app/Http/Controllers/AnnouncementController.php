<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AnnouncementController extends Controller
{
    public function index(Request $request)
    {
        $q = (string) $request->query('q', '');
        $announcements = Announcement::query()
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

        return Inertia::render('announcements/index', [
            'filters' => ['q' => $q],
            'announcements' => $announcements,
        ]);
    }

    public function show(Announcement $announcement)
    {
        // Implemented in next commit
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
}

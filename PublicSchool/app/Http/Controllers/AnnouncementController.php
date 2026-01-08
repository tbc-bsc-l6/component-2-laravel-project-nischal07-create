<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AnnouncementController extends Controller
{
    public function index(Request $request)
    {
        // Implemented in next commit
        return Inertia::render('announcements/index');
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

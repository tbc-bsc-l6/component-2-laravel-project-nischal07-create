<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\User;
use App\Support\AnnouncementHighlights;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        // Basic aggregate stats for the admin overview
        $stats = [
            'total_users' => User::count(),
            'total_admins' => User::whereHas('role', fn ($q) => $q->where('name', 'admin'))->count(),
            'total_teachers' => User::whereHas('role', fn ($q) => $q->where('name', 'teacher'))->count(),
            'total_students' => User::whereHas('role', fn ($q) => $q->whereIn('name', ['student', 'old_student']))->count(),
            'total_courses' => Course::count(),
            'available_courses' => Course::where('is_available', true)->count(),
        ];

        // Recent users and courses for quick overview
        $recentUsers = User::with('role')
            ->latest()
            ->limit(5)
            ->get();

        $recentCourses = Course::with('teacher')
            ->withCount('students')
            ->latest()
            ->limit(5)
            ->get();

        return Inertia::render('admin/dashboard', [
            'stats' => $stats,
            'recentUsers' => $recentUsers,
            'recentCourses' => $recentCourses,
            'announcements' => AnnouncementHighlights::forDashboard()->values()->all(),
        ]);
    }
}

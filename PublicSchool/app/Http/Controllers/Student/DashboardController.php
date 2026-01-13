<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Support\AnnouncementHighlights;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $student = auth()->user();

        // Old students ONLY see a list of completed modules with their PASS/FAIL status
        if ($student->isOldStudent()) {
            $completedCourses = $student->completedCourses()
                ->with('teacher')
                ->get();

            return Inertia::render('student/dashboard', [
                'enrolledCourses' => [],
                'completedCourses' => $completedCourses,
                'availableCourses' => [],
                'canEnrollMore' => false,
                'isOldStudent' => true,
                'announcements' => AnnouncementHighlights::forDashboard(),
            ]);
        }

        // Get enrolled courses (pending)
        $enrolledCourses = $student->enrolledCourses()
            ->with('teacher')
            ->get();

        // Get completed courses (pass/fail)
        $completedCourses = $student->completedCourses()
            ->with('teacher')
            ->get();

        // Get available courses (not enrolled and available)
        $availableCourses = Course::where('is_available', true)
            ->whereDoesntHave('students', function ($query) use ($student) {
                $query->where('user_id', $student->id);
            })
            ->with('teacher')
            ->withCount('enrolledStudents')
            ->get()
            ->filter(function ($course) {
                return $course->hasSpace();
            });

        $canEnrollMore = $student->canEnrollInMoreCourses();

        return Inertia::render('student/dashboard', [
            'enrolledCourses' => $enrolledCourses,
            'completedCourses' => $completedCourses,
            'availableCourses' => $availableCourses,
            'canEnrollMore' => $canEnrollMore,
            'isOldStudent' => false,
            'announcements' => AnnouncementHighlights::forDashboard(),
        ]);
    }
}

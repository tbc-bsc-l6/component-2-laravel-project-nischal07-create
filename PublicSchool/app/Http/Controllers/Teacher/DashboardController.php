<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $teacher = auth()->user();
        
        $courses = $teacher->teachingCourses()
            ->with(['enrolledStudents', 'completedStudents'])
            ->withCount(['enrolledStudents', 'completedStudents'])
            ->get();

        return Inertia::render('teacher/dashboard', [
            'courses' => $courses,
        ]);
    }

    public function showCourse($courseId)
    {
        $teacher = auth()->user();
        
        $course = $teacher->teachingCourses()
            ->with(['students' => function ($query) {
                $query->orderBy('course_user.enrolled_at', 'desc');
            }])
            ->findOrFail($courseId);

        return Inertia::render('teacher/course-details', [
            'course' => $course,
        ]);
    }
}

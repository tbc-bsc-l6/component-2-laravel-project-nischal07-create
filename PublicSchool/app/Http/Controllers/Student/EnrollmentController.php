<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Course;
use Illuminate\Http\Request;

class EnrollmentController extends Controller
{
    public function enroll(Course $course)
    {
        $student = auth()->user();

        // Check if student can enroll in more courses
        if (!$student->canEnrollInMoreCourses()) {
            return back()->withErrors(['error' => 'You have reached the maximum of 4 enrolled courses.']);
        }

        // Check if course is available
        if (!$course->is_available) {
            return back()->withErrors(['error' => 'This course is not available for enrollment.']);
        }

        // Check if course has space
        if (!$course->hasSpace()) {
            return back()->withErrors(['error' => 'This course is full.']);
        }

        // Check if already enrolled
        if ($course->students()->where('user_id', $student->id)->exists()) {
            return back()->withErrors(['error' => 'You are already enrolled in this course.']);
        }

        // Enroll student
        $course->students()->attach($student->id, [
            'enrolled_at' => now(),
            'pass_status' => 'pending',
        ]);

        return back()->with('success', 'Successfully enrolled in course.');
    }

    public function unenroll(Course $course)
    {
        $student = auth()->user();

        // Check if student is enrolled
        $enrollment = $course->students()
            ->where('user_id', $student->id)
            ->wherePivot('pass_status', 'pending')
            ->first();

        if (!$enrollment) {
            return back()->withErrors(['error' => 'You are not enrolled in this course or it has been completed.']);
        }

        // Unenroll student
        $course->students()->detach($student->id);

        return back()->with('success', 'Successfully unenrolled from course.');
    }
}

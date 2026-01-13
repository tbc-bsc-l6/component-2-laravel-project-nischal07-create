<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CourseController extends Controller
{
    public function index()
    {
        $courses = Course::with('teacher', 'enrolledStudents')
            ->withCount('enrolledStudents')
            ->get();

        $teachers = User::whereHas('role', function ($query) {
            $query->where('name', 'teacher');
        })->get(['id', 'name']);

        return Inertia::render('admin/courses/index', [
            'courses' => $courses,
            'teachers' => $teachers,
        ]);
    }

    public function create()
    {
        $teachers = User::whereHas('role', function ($query) {
            $query->where('name', 'teacher');
        })->get();

        return Inertia::render('admin/courses/create', [
            'teachers' => $teachers,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_available' => 'boolean',
            // Requirement: courses/modules have a maximum of 10 students attached.
            'max_students' => 'required|integer|min:1|max:10',
            'teacher_id' => 'nullable|exists:users,id',
        ]);

        Course::create($validated);

        return redirect()->route('admin.courses.index')
            ->with('success', 'Course created successfully.');
    }

    public function edit(Course $course)
    {
        $teachers = User::whereHas('role', function ($query) {
            $query->where('name', 'teacher');
        })->get();

        $course->load([
            'teacher',
            'students' => function ($query) {
                $query->orderBy('course_user.enrolled_at', 'desc');
            },
        ]);

        return Inertia::render('admin/courses/edit', [
            'course' => $course,
            'teachers' => $teachers,
        ]);
    }

    public function update(Request $request, Course $course)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_available' => 'boolean',
            // Requirement: courses/modules have a maximum of 10 students attached.
            'max_students' => [
                'required',
                'integer',
                'min:1',
                'max:10',
                function (string $attribute, mixed $value, \Closure $fail) use ($course) {
                    $currentlyEnrolled = $course->enrolledStudents()->count();
                    if ((int) $value < $currentlyEnrolled) {
                        $fail("Max students cannot be less than the currently enrolled count ({$currentlyEnrolled}).");
                    }
                },
            ],
            'teacher_id' => 'nullable|exists:users,id',
        ]);

        $course->update($validated);

        return redirect()->route('admin.courses.index')
            ->with('success', 'Course updated successfully.');
    }

    public function destroy(Course $course)
    {
        $course->delete();

        return redirect()->route('admin.courses.index')
            ->with('success', 'Course deleted successfully.');
    }

    public function toggleAvailability(Course $course)
    {
        $course->update([
            'is_available' => !$course->is_available,
        ]);

        return back()->with('success', 'Course availability updated.');
    }

    public function assignTeacher(Request $request, Course $course)
    {
        $validated = $request->validate([
            'teacher_id' => 'required|exists:users,id',
        ]);

        $course->update(['teacher_id' => $validated['teacher_id']]);

        return back()->with('success', 'Teacher assigned successfully.');
    }

    public function removeStudent(Course $course, User $student)
    {
        // Verify the student is actually enrolled in this course
        $enrollment = $course->students()
            ->where('user_id', $student->id)
            ->first();

        if (!$enrollment) {
            return back()->withErrors([
                'error' => 'Student is not enrolled in this course.',
            ]);
        }

        // Only allow removing currently-enrolled (pending) students to preserve completion history
        if ($enrollment->pivot->pass_status !== 'pending') {
            return back()->withErrors([
                'error' => 'Only currently enrolled students can be removed (completed history is preserved).',
            ]);
        }

        $course->students()->detach($student->id);

        return back()->with('success', 'Student removed from course.');
    }
}

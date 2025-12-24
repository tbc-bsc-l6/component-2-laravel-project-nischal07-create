<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\User;
use App\Models\UserRole;
use Illuminate\Http\Request;

class GradingController extends Controller
{
    public function gradeStudent(Request $request, Course $course, User $student)
    {
        // Verify teacher owns this course
        if ($course->teacher_id !== auth()->id()) {
            abort(403, 'You can only grade students in your own courses.');
        }

        // Verify student is enrolled in this course
        $enrolled = $course->students()->where('user_id', $student->id)->first();

        if (!$enrolled) {
            abort(404, 'Student not enrolled in this course.');
        }

        // Allow updating or resetting the grade. Accept 'pending' to reset.
        $validated = $request->validate([
            'pass_status' => 'required|in:pending,pass,fail',
        ]);

        $passStatus = $validated['pass_status'];

        // Prepare pivot update data
        $pivotData = ['pass_status' => $passStatus];

        if ($passStatus === 'pending') {
            // reset completed_at when marking pending
            $pivotData['completed_at'] = null;
        } else {
            $pivotData['completed_at'] = now();
        }

        $course->students()->updateExistingPivot($student->id, $pivotData);

        // Check if student should become "old_student"
        // If all their courses are completed (pass or fail), change role to old_student
        $oldStudentRole = UserRole::where('name', 'old_student')->first();
        $studentRole = UserRole::where('name', 'student')->first();

        // If student has no pending courses, mark as old_student; otherwise ensure they're a current student
        $pendingCourses = $student->enrolledCourses()->count();

        if ($pendingCourses === 0 && $student->isStudent()) {
            // promote to old_student
            if ($oldStudentRole) {
                $student->update(['user_role_id' => $oldStudentRole->id]);
            }
        } else {
            // if they were old_student but now have pending courses again, revert to student
            if ($student->isOldStudent() && $studentRole) {
                $student->update(['user_role_id' => $studentRole->id]);
            }
        }

        if ($request->wantsJson() || $request->ajax()) {
            return response()->json(['message' => 'Student graded successfully.']);
        }

        return back()->with('success', 'Student graded successfully.');
    }
}

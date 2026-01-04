<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\UserRole;
use App\Models\Course;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TeacherGradingTest extends TestCase
{
    use RefreshDatabase;

    protected User $teacher;
    protected User $student;

    protected function setUp(): void
    {
        parent::setUp();

        $teacherRole = UserRole::firstOrCreate([
            'name' => 'teacher',
        ], [
            'display_name' => 'Teacher',
        ]);

        $studentRole = UserRole::firstOrCreate([
            'name' => 'student',
        ], [
            'display_name' => 'Student',
        ]);

        // ensure old_student role exists to avoid null lookups in controller
        UserRole::firstOrCreate([
            'name' => 'old_student',
        ], [
            'display_name' => 'Old Student',
        ]);

        $this->teacher = User::factory()->create([
            'user_role_id' => $teacherRole->id,
        ]);

        $this->student = User::factory()->create([
            'user_role_id' => $studentRole->id,
        ]);
    }

    public function test_teacher_can_grade_enrolled_student(): void
    {
        $course = Course::factory()->create([
            'teacher_id' => $this->teacher->id,
        ]);

        // enroll the student
        $this->student->courses()->attach($course->id, [
            'enrolled_at' => now(),
            'pass_status' => 'pending',
        ]);

        $response = $this->actingAs($this->teacher)->post("/teacher/courses/{$course->id}/students/{$this->student->id}/grade", [
            'pass_status' => 'pass',
        ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('course_user', [
            'course_id' => $course->id,
            'user_id' => $this->student->id,
            'pass_status' => 'pass',
        ]);
    }

    public function test_teacher_cannot_grade_students_in_other_courses(): void
    {
        $otherTeacher = User::factory()->create();
        $course = Course::factory()->create([
            'teacher_id' => $otherTeacher->id,
        ]);

        $this->student->courses()->attach($course->id, [
            'enrolled_at' => now(),
            'pass_status' => 'pending',
        ]);

        $response = $this->actingAs($this->teacher)->post("/teacher/courses/{$course->id}/students/{$this->student->id}/grade", [
            'pass_status' => 'fail',
        ]);

        $response->assertStatus(403);
    }
}

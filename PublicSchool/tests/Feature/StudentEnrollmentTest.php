<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\User;
use App\Models\UserRole;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StudentEnrollmentTest extends TestCase
{
    use RefreshDatabase;

    protected User $student;
    protected UserRole $studentRole;

    protected function setUp(): void
    {
        parent::setUp();

        $this->studentRole = UserRole::create(['name' => 'student', 'display_name' => 'Student']);
        $this->student = User::factory()->create(['user_role_id' => $this->studentRole->id]);
    }

    public function test_student_can_enroll_in_available_course(): void
    {
        $course = Course::factory()->create([
            'is_available' => true,
            'max_students' => 10,
        ]);

        $response = $this->actingAs($this->student)
            ->post("/student/courses/{$course->id}/enroll");

        $response->assertRedirect();
        $response->assertSessionHas('success');
        $this->assertDatabaseHas('course_user', [
            'user_id' => $this->student->id,
            'course_id' => $course->id,
            'pass_status' => 'pending',
        ]);
    }

    public function test_student_cannot_enroll_in_unavailable_course(): void
    {
        $course = Course::factory()->create([
            'is_available' => false,
            'max_students' => 10,
        ]);

        $response = $this->actingAs($this->student)
            ->post("/student/courses/{$course->id}/enroll");

        $response->assertSessionHasErrors();
        $this->assertDatabaseMissing('course_user', [
            'user_id' => $this->student->id,
            'course_id' => $course->id,
        ]);
    }

    public function test_student_cannot_enroll_in_full_course(): void
    {
        $course = Course::factory()->create([
            'is_available' => true,
            'max_students' => 1,
        ]);

        $otherStudent = User::factory()->create(['user_role_id' => $this->studentRole->id]);
        $course->students()->attach($otherStudent->id, [
            'enrolled_at' => now(),
            'pass_status' => 'pending',
        ]);

        $response = $this->actingAs($this->student)
            ->post("/student/courses/{$course->id}/enroll");

        $response->assertSessionHasErrors();
        $this->assertDatabaseMissing('course_user', [
            'user_id' => $this->student->id,
            'course_id' => $course->id,
        ]);
    }

    public function test_student_cannot_enroll_in_more_than_four_courses(): void
    {
        // Enroll in 4 courses
        for ($i = 0; $i < 4; $i++) {
            $course = Course::factory()->create(['is_available' => true]);
            $this->student->courses()->attach($course->id, [
                'enrolled_at' => now(),
                'pass_status' => 'pending',
            ]);
        }

        $fifthCourse = Course::factory()->create(['is_available' => true]);

        $response = $this->actingAs($this->student)
            ->post("/student/courses/{$fifthCourse->id}/enroll");

        $response->assertSessionHasErrors();
        $this->assertDatabaseMissing('course_user', [
            'user_id' => $this->student->id,
            'course_id' => $fifthCourse->id,
        ]);
    }

    public function test_student_can_unenroll_from_course(): void
    {
        $course = Course::factory()->create();
        $this->student->courses()->attach($course->id, [
            'enrolled_at' => now(),
            'pass_status' => 'pending',
        ]);

        $response = $this->actingAs($this->student)
            ->delete("/student/courses/{$course->id}/unenroll");

        $response->assertRedirect();
        $response->assertSessionHas('success');
        $this->assertDatabaseMissing('course_user', [
            'user_id' => $this->student->id,
            'course_id' => $course->id,
        ]);
    }

    public function test_old_student_cannot_enroll_in_courses(): void
    {
        $oldStudentRole = UserRole::create(['name' => 'old_student', 'display_name' => 'Old Student']);
        $oldStudent = User::factory()->create(['user_role_id' => $oldStudentRole->id]);
        $course = Course::factory()->create(['is_available' => true]);

        $response = $this->actingAs($oldStudent)
            ->post("/student/courses/{$course->id}/enroll");

        $response->assertForbidden();
    }

    public function test_old_student_cannot_unenroll_from_courses(): void
    {
        $oldStudentRole = UserRole::create(['name' => 'old_student', 'display_name' => 'Old Student']);
        $oldStudent = User::factory()->create(['user_role_id' => $oldStudentRole->id]);
        $course = Course::factory()->create();

        $response = $this->actingAs($oldStudent)
            ->delete("/student/courses/{$course->id}/unenroll");

        $response->assertForbidden();
    }

    public function test_non_student_cannot_access_enrollment_routes(): void
    {
        $teacherRole = UserRole::create(['name' => 'teacher', 'display_name' => 'Teacher']);
        $teacher = User::factory()->create(['user_role_id' => $teacherRole->id]);
        $course = Course::factory()->create();

        $response = $this->actingAs($teacher)
            ->post("/student/courses/{$course->id}/enroll");

        $response->assertForbidden();
    }
}

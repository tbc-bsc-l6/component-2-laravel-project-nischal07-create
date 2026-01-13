<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\User;
use App\Models\UserRole;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CourseAvailabilityTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected UserRole $adminRole;
    protected UserRole $studentRole;

    protected function setUp(): void
    {
        parent::setUp();

        $this->adminRole = UserRole::create(['name' => 'admin', 'display_name' => 'Administrator']);
        $this->studentRole = UserRole::create(['name' => 'student', 'display_name' => 'Student']);
        
        $this->admin = User::factory()->create(['user_role_id' => $this->adminRole->id]);
    }

    public function test_admin_can_toggle_course_availability_to_unavailable(): void
    {
        $course = Course::factory()->create(['is_available' => true]);

        $response = $this->actingAs($this->admin)
            ->post("/admin/courses/{$course->id}/toggle-availability");

        $response->assertRedirect();
        $this->assertDatabaseHas('courses', [
            'id' => $course->id,
            'is_available' => false,
        ]);
    }

    public function test_admin_can_toggle_course_availability_to_available(): void
    {
        $course = Course::factory()->create(['is_available' => false]);

        $response = $this->actingAs($this->admin)
            ->post("/admin/courses/{$course->id}/toggle-availability");

        $response->assertRedirect();
        $this->assertDatabaseHas('courses', [
            'id' => $course->id,
            'is_available' => true,
        ]);
    }

    public function test_unavailable_course_prevents_new_enrollments(): void
    {
        $course = Course::factory()->create(['is_available' => false]);
        $student = User::factory()->create(['user_role_id' => $this->studentRole->id]);

        $response = $this->actingAs($student)
            ->post("/student/courses/{$course->id}/enroll");

        $response->assertSessionHasErrors();
        $this->assertDatabaseMissing('course_user', [
            'user_id' => $student->id,
            'course_id' => $course->id,
        ]);
    }

    public function test_archived_course_retains_enrollment_history(): void
    {
        $course = Course::factory()->create(['is_available' => true]);
        $student = User::factory()->create(['user_role_id' => $this->studentRole->id]);

        // Enroll student
        $student->courses()->attach($course->id, [
            'enrolled_at' => now()->subMonth(),
            'completed_at' => now(),
            'pass_status' => 'pass',
        ]);

        // Archive course
        $this->actingAs($this->admin)
            ->post("/admin/courses/{$course->id}/toggle-availability");

        // History should still exist
        $this->assertDatabaseHas('course_user', [
            'user_id' => $student->id,
            'course_id' => $course->id,
            'pass_status' => 'pass',
        ]);
    }

    public function test_available_course_with_space_allows_enrollment(): void
    {
        $course = Course::factory()->create([
            'is_available' => true,
            'max_students' => 10,
        ]);
        $student = User::factory()->create(['user_role_id' => $this->studentRole->id]);

        $response = $this->actingAs($student)
            ->post("/student/courses/{$course->id}/enroll");

        $response->assertRedirect();
        $response->assertSessionHas('success');
        $this->assertDatabaseHas('course_user', [
            'user_id' => $student->id,
            'course_id' => $course->id,
            'pass_status' => 'pending',
        ]);
    }

    public function test_full_course_prevents_new_enrollments(): void
    {
        $course = Course::factory()->create([
            'is_available' => true,
            'max_students' => 1,
        ]);

        // Fill the course
        $firstStudent = User::factory()->create(['user_role_id' => $this->studentRole->id]);
        $course->students()->attach($firstStudent->id, [
            'enrolled_at' => now(),
            'pass_status' => 'pending',
        ]);

        // Try to enroll another student
        $secondStudent = User::factory()->create(['user_role_id' => $this->studentRole->id]);
        $response = $this->actingAs($secondStudent)
            ->post("/student/courses/{$course->id}/enroll");

        $response->assertSessionHasErrors();
        $this->assertDatabaseMissing('course_user', [
            'user_id' => $secondStudent->id,
            'course_id' => $course->id,
        ]);
    }

    public function test_completed_students_do_not_count_toward_max(): void
    {
        $course = Course::factory()->create([
            'is_available' => true,
            'max_students' => 1,
        ]);

        // Add a completed student
        $completedStudent = User::factory()->create(['user_role_id' => $this->studentRole->id]);
        $course->students()->attach($completedStudent->id, [
            'enrolled_at' => now()->subMonth(),
            'completed_at' => now(),
            'pass_status' => 'pass',
        ]);

        // New student should be able to enroll
        $newStudent = User::factory()->create(['user_role_id' => $this->studentRole->id]);
        $response = $this->actingAs($newStudent)
            ->post("/student/courses/{$course->id}/enroll");

        $response->assertRedirect();
        $response->assertSessionHas('success');
        $this->assertDatabaseHas('course_user', [
            'user_id' => $newStudent->id,
            'course_id' => $course->id,
            'pass_status' => 'pending',
        ]);
    }
}

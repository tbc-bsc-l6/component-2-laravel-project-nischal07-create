<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\User;
use App\Models\UserRole;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminRemoveStudentTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $adminRole = UserRole::firstOrCreate([
            'name' => 'admin',
        ], [
            'display_name' => 'Admin',
        ]);

        $this->admin = User::factory()->create([
            'user_role_id' => $adminRole->id,
        ]);
    }

    public function test_admin_can_remove_enrolled_student_from_course(): void
    {
        $student = User::factory()->create([
            'user_role_id' => UserRole::firstOrCreate(['name' => 'student'], ['display_name' => 'Student'])->id,
        ]);

        $course = Course::factory()->create();
        $course->students()->attach($student->id, [
            'enrolled_at' => now(),
            'pass_status' => 'pending',
        ]);

        $this->assertTrue($course->students()->where('user_id', $student->id)->exists());

        $response = $this->actingAs($this->admin)
            ->delete("/admin/courses/{$course->id}/students/{$student->id}");

        $response->assertRedirect();
        $this->assertFalse($course->students()->where('user_id', $student->id)->exists());
    }

    public function test_admin_cannot_remove_completed_student_from_course(): void
    {
        $student = User::factory()->create([
            'user_role_id' => UserRole::firstOrCreate(['name' => 'student'], ['display_name' => 'Student'])->id,
        ]);

        $course = Course::factory()->create();
        $course->students()->attach($student->id, [
            'enrolled_at' => now()->subMonth(),
            'completed_at' => now(),
            'pass_status' => 'pass',
        ]);

        $response = $this->actingAs($this->admin)
            ->delete("/admin/courses/{$course->id}/students/{$student->id}");

        $response->assertSessionHasErrors(['error']);
        $this->assertTrue($course->students()->where('user_id', $student->id)->exists());
    }

    public function test_non_admin_cannot_remove_student(): void
    {
        $student = User::factory()->create([
            'user_role_id' => UserRole::firstOrCreate(['name' => 'student'], ['display_name' => 'Student'])->id,
        ]);

        $teacher = User::factory()->create([
            'user_role_id' => UserRole::firstOrCreate(['name' => 'teacher'], ['display_name' => 'Teacher'])->id,
        ]);

        $course = Course::factory()->create(['teacher_id' => $teacher->id]);
        $course->students()->attach($student->id, [
            'enrolled_at' => now(),
            'pass_status' => 'pending',
        ]);

        $response = $this->actingAs($teacher)
            ->delete("/admin/courses/{$course->id}/students/{$student->id}");

        $response->assertForbidden();
    }
}

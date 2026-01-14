<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\User;
use App\Models\UserRole;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminEditCourseTest extends TestCase
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

    public function test_admin_edit_course_shows_enrolled_students_with_remove_button(): void
    {
        $course = Course::factory()->create();

        $studentRole = UserRole::firstOrCreate(['name' => 'student'], ['display_name' => 'Student']);
        $student1 = User::factory()->create(['user_role_id' => $studentRole->id]);
        $student2 = User::factory()->create(['user_role_id' => $studentRole->id]);

        $course->students()->attach($student1->id, [
            'enrolled_at' => now(),
            'pass_status' => 'pending',
        ]);

        $course->students()->attach($student2->id, [
            'enrolled_at' => now()->subDay(),
            'pass_status' => 'pass',
            'completed_at' => now(),
        ]);

        $response = $this->actingAs($this->admin)->get("/admin/courses/{$course->id}/edit");

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('admin/courses/edit')
            ->has('course.students', 2)
            ->where('course.students.0.id', $student1->id)
            ->where('course.students.0.pivot.pass_status', 'pending')
            ->where('course.students.1.id', $student2->id)
            ->where('course.students.1.pivot.pass_status', 'pass')
            ->has('teachers')
        );
    }

    public function test_admin_can_remove_student_via_edit_course_page(): void
    {
        $course = Course::factory()->create();

        $studentRole = UserRole::firstOrCreate(['name' => 'student'], ['display_name' => 'Student']);
        $student = User::factory()->create(['user_role_id' => $studentRole->id]);

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
}

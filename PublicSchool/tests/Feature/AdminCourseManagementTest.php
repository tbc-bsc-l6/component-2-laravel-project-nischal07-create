<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\User;
use App\Models\UserRole;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminCourseManagementTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $teacher;
    protected UserRole $adminRole;

    protected function setUp(): void
    {
        parent::setUp();

        // Create roles
        $this->adminRole = UserRole::create([
            'name' => 'admin',
            'display_name' => 'Administrator',
        ]);

        $teacherRole = UserRole::create([
            'name' => 'teacher',
            'display_name' => 'Teacher',
        ]);

        // Create users
        $this->admin = User::factory()->create([
            'user_role_id' => $this->adminRole->id,
        ]);

        $this->teacher = User::factory()->create([
            'user_role_id' => $teacherRole->id,
        ]);
    }

    public function test_admin_can_view_courses_index(): void
    {
        $response = $this->actingAs($this->admin)->get('/admin/courses');

        $response->assertOk();
    }

    public function test_non_admin_cannot_view_courses_index(): void
    {
        $response = $this->actingAs($this->teacher)->get('/admin/courses');

        $response->assertForbidden();
    }

    public function test_admin_can_create_course(): void
    {
        $response = $this->actingAs($this->admin)->post('/admin/courses', [
            'name' => 'Test Course',
            'description' => 'Test Description',
            'is_available' => true,
            'max_students' => 10,
            'teacher_id' => $this->teacher->id,
        ]);

        $response->assertRedirect('/admin/courses');
        $this->assertDatabaseHas('courses', [
            'name' => 'Test Course',
            'teacher_id' => $this->teacher->id,
        ]);
    }

    public function test_admin_can_update_course(): void
    {
        $course = Course::factory()->create([
            'name' => 'Original Name',
            'teacher_id' => $this->teacher->id,
        ]);

        $response = $this->actingAs($this->admin)->put("/admin/courses/{$course->id}", [
            'name' => 'Updated Name',
            'description' => 'Updated Description',
            'is_available' => true,
            'max_students' => 10,
            'teacher_id' => $this->teacher->id,
        ]);

        $response->assertRedirect('/admin/courses');
        $this->assertDatabaseHas('courses', [
            'id' => $course->id,
            'name' => 'Updated Name',
        ]);
    }

    public function test_admin_can_delete_course(): void
    {
        $course = Course::factory()->create();

        $response = $this->actingAs($this->admin)->delete("/admin/courses/{$course->id}");

        $response->assertRedirect('/admin/courses');
        $this->assertDatabaseMissing('courses', ['id' => $course->id]);
    }

    public function test_admin_can_toggle_course_availability(): void
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
}


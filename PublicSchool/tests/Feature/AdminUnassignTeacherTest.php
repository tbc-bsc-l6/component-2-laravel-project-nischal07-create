<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\User;
use App\Models\UserRole;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminUnassignTeacherTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_unassign_teacher_from_course(): void
    {
        // Create admin, teacher, and course with assigned teacher
        $adminRole = UserRole::create(['name' => 'admin', 'display_name' => 'Administrator']);
        $teacherRole = UserRole::create(['name' => 'teacher', 'display_name' => 'Teacher']);
        
        $admin = User::factory()->create(['user_role_id' => $adminRole->id]);
        $teacher = User::factory()->create(['user_role_id' => $teacherRole->id]);
        
        $course = Course::factory()->create([
            'teacher_id' => $teacher->id,
            'name' => 'Test Course',
        ]);

        // Verify teacher is assigned
        $this->assertEquals($teacher->id, $course->teacher_id);

        // Unassign teacher
        $response = $this->actingAs($admin)
            ->post("/admin/courses/{$course->id}/assign-teacher", [
                'teacher_id' => null,
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('success', 'Teacher removed successfully.');

        // Verify teacher is unassigned
        $this->assertDatabaseHas('courses', [
            'id' => $course->id,
            'teacher_id' => null,
        ]);
    }

    public function test_admin_can_update_course_without_teacher(): void
    {
        // Create admin and course without teacher
        $adminRole = UserRole::create(['name' => 'admin', 'display_name' => 'Administrator']);
        $admin = User::factory()->create(['user_role_id' => $adminRole->id]);
        
        $course = Course::factory()->create([
            'teacher_id' => null,
            'name' => 'No Teacher Course',
        ]);

        // Update course keeping no teacher
        $response = $this->actingAs($admin)
            ->put("/admin/courses/{$course->id}", [
                'name' => 'Updated Course',
                'description' => 'Test description',
                'is_available' => true,
                'max_students' => 8,
                'teacher_id' => null,
            ]);

        $response->assertRedirect('/admin/courses');
        $response->assertSessionHas('success', 'Course updated successfully.');

        // Verify course updated with no teacher
        $this->assertDatabaseHas('courses', [
            'id' => $course->id,
            'name' => 'Updated Course',
            'teacher_id' => null,
        ]);
    }

    public function test_admin_can_create_course_without_teacher(): void
    {
        // Create admin
        $adminRole = UserRole::create(['name' => 'admin', 'display_name' => 'Administrator']);
        $admin = User::factory()->create(['user_role_id' => $adminRole->id]);

        // Create course without teacher
        $response = $this->actingAs($admin)
            ->post('/admin/courses', [
                'name' => 'New Course',
                'description' => 'Test description',
                'is_available' => true,
                'max_students' => 10,
                'teacher_id' => null,
            ]);

        $response->assertRedirect('/admin/courses');
        $response->assertSessionHas('success', 'Course created successfully.');

        // Verify course created with no teacher
        $this->assertDatabaseHas('courses', [
            'name' => 'New Course',
            'teacher_id' => null,
        ]);
    }
}

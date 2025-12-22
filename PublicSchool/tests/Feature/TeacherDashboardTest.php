<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\UserRole;
use App\Models\Course;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TeacherDashboardTest extends TestCase
{
    use RefreshDatabase;

    protected User $teacher;

    protected function setUp(): void
    {
        parent::setUp();

        $teacherRole = UserRole::firstOrCreate([
            'name' => 'teacher',
        ], [
            'display_name' => 'Teacher',
        ]);

        $this->teacher = User::factory()->create([
            'user_role_id' => $teacherRole->id,
        ]);
    }

    public function test_teacher_can_view_dashboard(): void
    {
        $course = Course::factory()->create([
            'teacher_id' => $this->teacher->id,
            'name' => 'Teacher Course',
        ]);

        $response = $this->actingAs($this->teacher)->get('/teacher/dashboard');

        $response->assertOk();
    }

    public function test_non_teacher_cannot_view_dashboard(): void
    {
        $otherRole = UserRole::firstOrCreate([
            'name' => 'student',
        ], [
            'display_name' => 'Student',
        ]);

        $user = User::factory()->create([
            'user_role_id' => $otherRole->id,
        ]);

        $response = $this->actingAs($user)->get('/teacher/dashboard');

        $response->assertForbidden();
    }
}

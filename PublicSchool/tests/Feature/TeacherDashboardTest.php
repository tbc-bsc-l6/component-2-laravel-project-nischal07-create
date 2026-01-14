<?php

namespace Tests\Feature;

use App\Models\Announcement;
use App\Models\User;
use App\Models\UserRole;
use App\Models\Course;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Inertia\Testing\AssertableInertia as Assert;

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

    public function test_teacher_dashboard_includes_announcements_widget(): void
    {
        $announcement = Announcement::factory()->create([
            'title' => 'Staff Reminder',
            'is_pinned' => true,
            'published_at' => now()->subHours(2),
        ]);

        $response = $this->actingAs($this->teacher)->get('/teacher/dashboard');

        $response->assertInertia(fn (Assert $page) => $page
            ->component('teacher/dashboard')
            ->has('announcements', 1)
            ->where('announcements.0.title', $announcement->title)
        );
    }
}

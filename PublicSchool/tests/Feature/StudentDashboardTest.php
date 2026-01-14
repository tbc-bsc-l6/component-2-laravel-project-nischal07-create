<?php

namespace Tests\Feature;

use App\Models\Announcement;
use App\Models\User;
use App\Models\UserRole;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Inertia\Testing\AssertableInertia as Assert;

class StudentDashboardTest extends TestCase
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

    public function test_student_can_view_dashboard(): void
    {
        $response = $this->actingAs($this->student)->get('/student/dashboard');

        $response->assertOk();
    }

    public function test_student_dashboard_shows_enrolled_courses(): void
    {
        $course = \App\Models\Course::factory()->create();
        $this->student->courses()->attach($course->id, [
            'enrolled_at' => now(),
            'pass_status' => 'pending',
        ]);

        $response = $this->actingAs($this->student)->get('/student/dashboard');

        $response->assertOk();
        $response->assertSee($course->name);
    }

    public function test_student_dashboard_shows_completed_courses(): void
    {
        $course = \App\Models\Course::factory()->create();
        $this->student->courses()->attach($course->id, [
            'enrolled_at' => now()->subMonth(),
            'completed_at' => now(),
            'pass_status' => 'pass',
        ]);

        $response = $this->actingAs($this->student)->get('/student/dashboard');

        $response->assertOk();
        $response->assertSee($course->name);
    }

    public function test_old_student_can_view_dashboard(): void
    {
        $oldStudentRole = UserRole::create(['name' => 'old_student', 'display_name' => 'Old Student']);
        $oldStudent = User::factory()->create(['user_role_id' => $oldStudentRole->id]);

        $response = $this->actingAs($oldStudent)->get('/student/dashboard');

        $response->assertOk();
    }

    public function test_old_student_sees_only_completed_courses(): void
    {
        $oldStudentRole = UserRole::create(['name' => 'old_student', 'display_name' => 'Old Student']);
        $oldStudent = User::factory()->create(['user_role_id' => $oldStudentRole->id]);
        
        $completedCourse = \App\Models\Course::factory()->create(['name' => 'Completed Course']);
        $oldStudent->courses()->attach($completedCourse->id, [
            'enrolled_at' => now()->subMonth(),
            'completed_at' => now(),
            'pass_status' => 'pass',
        ]);

        $response = $this->actingAs($oldStudent)->get('/student/dashboard');

        $response->assertOk();
        $response->assertSee('Completed Course');
    }

    public function test_non_student_cannot_access_student_dashboard(): void
    {
        $teacherRole = UserRole::create(['name' => 'teacher', 'display_name' => 'Teacher']);
        $teacher = User::factory()->create(['user_role_id' => $teacherRole->id]);

        $response = $this->actingAs($teacher)->get('/student/dashboard');

        $response->assertForbidden();
    }

    public function test_student_dashboard_includes_announcements_widget(): void
    {
        $announcement = Announcement::factory()->create([
            'title' => 'Pinned Notice',
            'is_pinned' => true,
            'published_at' => now()->subDay(),
        ]);

        Announcement::factory()->create([
            'title' => 'Future Notice',
            'is_pinned' => false,
            'published_at' => now()->addDay(),
        ]);

        $response = $this->actingAs($this->student)->get('/student/dashboard');

        $response->assertInertia(fn (Assert $page) => $page
            ->component('student/dashboard')
            ->has('announcements', 1)
            ->where('announcements.0.title', $announcement->title)
            ->where('announcements.0.is_pinned', true)
        );
    }
}

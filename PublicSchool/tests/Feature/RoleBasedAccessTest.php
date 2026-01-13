<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\UserRole;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RoleBasedAccessTest extends TestCase
{
    use RefreshDatabase;

    protected UserRole $adminRole;
    protected UserRole $teacherRole;
    protected UserRole $studentRole;
    protected UserRole $oldStudentRole;

    protected function setUp(): void
    {
        parent::setUp();

        $this->adminRole = UserRole::create(['name' => 'admin', 'display_name' => 'Administrator']);
        $this->teacherRole = UserRole::create(['name' => 'teacher', 'display_name' => 'Teacher']);
        $this->studentRole = UserRole::create(['name' => 'student', 'display_name' => 'Student']);
        $this->oldStudentRole = UserRole::create(['name' => 'old_student', 'display_name' => 'Old Student']);
    }

    public function test_admin_can_access_admin_routes(): void
    {
        $admin = User::factory()->create(['user_role_id' => $this->adminRole->id]);

        $this->actingAs($admin)->get('/admin/dashboard')->assertOk();
        $this->actingAs($admin)->get('/admin/courses')->assertOk();
        $this->actingAs($admin)->get('/admin/users')->assertOk();
    }

    public function test_teacher_can_access_teacher_routes(): void
    {
        $teacher = User::factory()->create(['user_role_id' => $this->teacherRole->id]);

        $this->actingAs($teacher)->get('/teacher/dashboard')->assertOk();
    }

    public function test_student_can_access_student_routes(): void
    {
        $student = User::factory()->create(['user_role_id' => $this->studentRole->id]);

        $this->actingAs($student)->get('/student/dashboard')->assertOk();
    }

    public function test_old_student_can_access_student_dashboard(): void
    {
        $oldStudent = User::factory()->create(['user_role_id' => $this->oldStudentRole->id]);

        $this->actingAs($oldStudent)->get('/student/dashboard')->assertOk();
    }

    public function test_teacher_cannot_access_admin_routes(): void
    {
        $teacher = User::factory()->create(['user_role_id' => $this->teacherRole->id]);

        $this->actingAs($teacher)->get('/admin/dashboard')->assertForbidden();
        $this->actingAs($teacher)->get('/admin/courses')->assertForbidden();
        $this->actingAs($teacher)->get('/admin/users')->assertForbidden();
    }

    public function test_student_cannot_access_admin_routes(): void
    {
        $student = User::factory()->create(['user_role_id' => $this->studentRole->id]);

        $this->actingAs($student)->get('/admin/dashboard')->assertForbidden();
        $this->actingAs($student)->get('/admin/courses')->assertForbidden();
        $this->actingAs($student)->get('/admin/users')->assertForbidden();
    }

    public function test_student_cannot_access_teacher_routes(): void
    {
        $student = User::factory()->create(['user_role_id' => $this->studentRole->id]);

        $this->actingAs($student)->get('/teacher/dashboard')->assertForbidden();
    }

    public function test_teacher_cannot_access_student_routes(): void
    {
        $teacher = User::factory()->create(['user_role_id' => $this->teacherRole->id]);

        $this->actingAs($teacher)->get('/student/dashboard')->assertForbidden();
    }

    public function test_admin_cannot_access_teacher_specific_routes(): void
    {
        $admin = User::factory()->create(['user_role_id' => $this->adminRole->id]);

        $this->actingAs($admin)->get('/teacher/dashboard')->assertForbidden();
    }

    public function test_admin_cannot_access_student_routes(): void
    {
        $admin = User::factory()->create(['user_role_id' => $this->adminRole->id]);

        $this->actingAs($admin)->get('/student/dashboard')->assertForbidden();
    }

    public function test_dashboard_redirects_based_on_role(): void
    {
        $admin = User::factory()->create(['user_role_id' => $this->adminRole->id]);
        $teacher = User::factory()->create(['user_role_id' => $this->teacherRole->id]);
        $student = User::factory()->create(['user_role_id' => $this->studentRole->id]);
        $oldStudent = User::factory()->create(['user_role_id' => $this->oldStudentRole->id]);

        $this->actingAs($admin)->get('/dashboard')->assertRedirect('/admin/dashboard');
        $this->actingAs($teacher)->get('/dashboard')->assertRedirect('/teacher/dashboard');
        $this->actingAs($student)->get('/dashboard')->assertRedirect('/student/dashboard');
        $this->actingAs($oldStudent)->get('/dashboard')->assertRedirect('/student/dashboard');
    }

    public function test_guest_cannot_access_protected_routes(): void
    {
        $this->get('/dashboard')->assertRedirect('/login');
        $this->get('/admin/dashboard')->assertRedirect('/login');
        $this->get('/teacher/dashboard')->assertRedirect('/login');
        $this->get('/student/dashboard')->assertRedirect('/login');
    }
}

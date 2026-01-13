<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\UserRole;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected UserRole $adminRole;

    protected function setUp(): void
    {
        parent::setUp();

        $this->adminRole = UserRole::create(['name' => 'admin', 'display_name' => 'Administrator']);
        UserRole::create(['name' => 'teacher', 'display_name' => 'Teacher']);
        UserRole::create(['name' => 'student', 'display_name' => 'Student']);
        UserRole::create(['name' => 'old_student', 'display_name' => 'Old Student']);
        
        $this->admin = User::factory()->create(['user_role_id' => $this->adminRole->id]);
    }

    public function test_admin_can_view_users_list(): void
    {
        $response = $this->actingAs($this->admin)->get('/admin/users');

        $response->assertOk();
    }

    public function test_admin_can_view_create_teacher_form(): void
    {
        $response = $this->actingAs($this->admin)->get('/admin/users/create-teacher');

        $response->assertOk();
    }

    public function test_admin_can_create_teacher(): void
    {
        $teacherRole = UserRole::where('name', 'teacher')->first();

        $response = $this->actingAs($this->admin)
            ->post('/admin/users/create-teacher', [
                'name' => 'New Teacher',
                'email' => 'newteacher@example.com',
                'password' => 'password123',
                'password_confirmation' => 'password123',
            ]);

        $response->assertRedirect('/admin/users');
        $this->assertDatabaseHas('users', [
            'name' => 'New Teacher',
            'email' => 'newteacher@example.com',
            'user_role_id' => $teacherRole->id,
        ]);
    }

    public function test_admin_can_change_user_role(): void
    {
        $studentRole = UserRole::where('name', 'student')->first();
        $teacherRole = UserRole::where('name', 'teacher')->first();
        
        $student = User::factory()->create(['user_role_id' => $studentRole->id]);

        $response = $this->actingAs($this->admin)
            ->post("/admin/users/{$student->id}/change-role", [
                'user_role_id' => $teacherRole->id,
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');
        $this->assertDatabaseHas('users', [
            'id' => $student->id,
            'user_role_id' => $teacherRole->id,
        ]);
    }

    public function test_admin_can_delete_user(): void
    {
        $studentRole = UserRole::where('name', 'student')->first();
        $student = User::factory()->create(['user_role_id' => $studentRole->id]);

        $response = $this->actingAs($this->admin)
            ->delete("/admin/users/{$student->id}");

        $response->assertRedirect();
        $response->assertSessionHas('success');
        $this->assertDatabaseMissing('users', ['id' => $student->id]);
    }

    public function test_non_admin_cannot_access_user_management(): void
    {
        $teacherRole = UserRole::where('name', 'teacher')->first();
        $teacher = User::factory()->create(['user_role_id' => $teacherRole->id]);

        $response = $this->actingAs($teacher)->get('/admin/users');

        $response->assertForbidden();
    }

    public function test_non_admin_cannot_create_teacher(): void
    {
        $teacherRole = UserRole::where('name', 'teacher')->first();
        $teacher = User::factory()->create(['user_role_id' => $teacherRole->id]);

        $response = $this->actingAs($teacher)
            ->post('/admin/users/create-teacher', [
                'name' => 'New Teacher',
                'email' => 'test@example.com',
                'password' => 'password123',
                'password_confirmation' => 'password123',
            ]);

        $response->assertForbidden();
    }

    public function test_non_admin_cannot_change_user_role(): void
    {
        $studentRole = UserRole::where('name', 'student')->first();
        $teacherRole = UserRole::where('name', 'teacher')->first();
        
        $student = User::factory()->create(['user_role_id' => $studentRole->id]);
        $teacher = User::factory()->create(['user_role_id' => $teacherRole->id]);

        $response = $this->actingAs($teacher)
            ->post("/admin/users/{$student->id}/change-role", [
                'user_role_id' => $teacherRole->id,
            ]);

        $response->assertForbidden();
    }

    public function test_non_admin_cannot_delete_user(): void
    {
        $studentRole = UserRole::where('name', 'student')->first();
        $teacherRole = UserRole::where('name', 'teacher')->first();
        
        $student = User::factory()->create(['user_role_id' => $studentRole->id]);
        $teacher = User::factory()->create(['user_role_id' => $teacherRole->id]);

        $response = $this->actingAs($teacher)
            ->delete("/admin/users/{$student->id}");

        $response->assertForbidden();
    }
}

<?php

namespace Tests\Unit;

use App\Models\UserRole;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserRoleModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_is_admin_returns_true_for_admin_role(): void
    {
        $role = UserRole::create(['name' => 'admin', 'display_name' => 'Administrator']);

        $this->assertTrue($role->isAdmin());
        $this->assertFalse($role->isTeacher());
        $this->assertFalse($role->isStudent());
        $this->assertFalse($role->isOldStudent());
    }

    public function test_is_teacher_returns_true_for_teacher_role(): void
    {
        $role = UserRole::create(['name' => 'teacher', 'display_name' => 'Teacher']);

        $this->assertFalse($role->isAdmin());
        $this->assertTrue($role->isTeacher());
        $this->assertFalse($role->isStudent());
        $this->assertFalse($role->isOldStudent());
    }

    public function test_is_student_returns_true_for_student_role(): void
    {
        $role = UserRole::create(['name' => 'student', 'display_name' => 'Student']);

        $this->assertFalse($role->isAdmin());
        $this->assertFalse($role->isTeacher());
        $this->assertTrue($role->isStudent());
        $this->assertFalse($role->isOldStudent());
    }

    public function test_is_old_student_returns_true_for_old_student_role(): void
    {
        $role = UserRole::create(['name' => 'old_student', 'display_name' => 'Old Student']);

        $this->assertFalse($role->isAdmin());
        $this->assertFalse($role->isTeacher());
        $this->assertFalse($role->isStudent());
        $this->assertTrue($role->isOldStudent());
    }

    public function test_users_relationship_returns_users(): void
    {
        $role = UserRole::create(['name' => 'student', 'display_name' => 'Student']);

        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Relations\HasMany::class, $role->users());
    }
}

<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\UserRole;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminCreateTeacherTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_teacher_via_post()
    {
        $adminRole = UserRole::firstOrCreate(['name' => 'admin'], ['display_name' => 'Administrator']);
        $teacherRole = UserRole::firstOrCreate(['name' => 'teacher'], ['display_name' => 'Teacher']);

        $admin = User::factory()->create(['user_role_id' => $adminRole->id]);

        $this->actingAs($admin)
            ->post('/admin/users/create-teacher', [
                'name' => 'New Teacher',
                'email' => 'newteacher@example.com',
                'password' => 'password',
                'password_confirmation' => 'password',
            ])
            ->assertRedirect('/admin/users');

        $this->assertDatabaseHas('users', ['email' => 'newteacher@example.com']);
    }
}

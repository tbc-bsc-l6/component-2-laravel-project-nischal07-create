<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\UserRole;
use App\Models\Course;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TeacherSeesAssignedCoursesTest extends TestCase
{
    use RefreshDatabase;

    public function test_teacher_sees_only_their_assigned_courses()
    {
        $teacherRole = UserRole::firstOrCreate(['name' => 'teacher'], ['display_name' => 'Teacher']);
        $otherTeacher = User::factory()->create(['user_role_id' => $teacherRole->id]);
        $teacher = User::factory()->create(['user_role_id' => $teacherRole->id]);

        // Courses assigned to each teacher
        $courseA = Course::factory()->create(['teacher_id' => $teacher->id, 'name' => 'Course A']);
        $courseB = Course::factory()->create(['teacher_id' => $otherTeacher->id, 'name' => 'Course B']);

        $response = $this->actingAs($teacher)->get('/teacher/dashboard');

        $response->assertOk();
        $response->assertSee('Course A');
        $response->assertDontSee('Course B');
    }
}

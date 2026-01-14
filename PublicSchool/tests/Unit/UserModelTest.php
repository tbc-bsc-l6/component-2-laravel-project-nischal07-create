<?php

namespace Tests\Unit;

use App\Models\Course;
use App\Models\User;
use App\Models\UserRole;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserModelTest extends TestCase
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

    public function test_user_belongs_to_role(): void
    {
        $user = User::factory()->create(['user_role_id' => $this->studentRole->id]);

        $this->assertInstanceOf(UserRole::class, $user->role);
        $this->assertEquals('student', $user->role->name);
    }

    public function test_user_has_many_courses_as_student(): void
    {
        $user = User::factory()->create(['user_role_id' => $this->studentRole->id]);
        $course = Course::factory()->create();

        $user->courses()->attach($course->id, [
            'enrolled_at' => now(),
            'pass_status' => 'pending',
        ]);

        $this->assertCount(1, $user->courses);
        $this->assertEquals($course->id, $user->courses->first()->id);
    }

    public function test_user_has_many_teaching_courses(): void
    {
        $teacher = User::factory()->create(['user_role_id' => $this->teacherRole->id]);
        $course = Course::factory()->create(['teacher_id' => $teacher->id]);

        $this->assertCount(1, $teacher->teachingCourses);
        $this->assertEquals($course->id, $teacher->teachingCourses->first()->id);
    }

    public function test_enrolled_courses_returns_only_pending(): void
    {
        $user = User::factory()->create(['user_role_id' => $this->studentRole->id]);
        $course1 = Course::factory()->create();
        $course2 = Course::factory()->create();

        $user->courses()->attach($course1->id, [
            'enrolled_at' => now(),
            'pass_status' => 'pending',
        ]);
        $user->courses()->attach($course2->id, [
            'enrolled_at' => now()->subMonth(),
            'completed_at' => now(),
            'pass_status' => 'pass',
        ]);

        $enrolled = $user->enrolledCourses;

        $this->assertCount(1, $enrolled);
        $this->assertEquals($course1->id, $enrolled->first()->id);
    }

    public function test_completed_courses_returns_pass_and_fail(): void
    {
        $user = User::factory()->create(['user_role_id' => $this->oldStudentRole->id]);
        $passed = Course::factory()->create();
        $failed = Course::factory()->create();
        $pending = Course::factory()->create();

        $user->courses()->attach($passed->id, [
            'enrolled_at' => now()->subMonth(),
            'completed_at' => now(),
            'pass_status' => 'pass',
        ]);
        $user->courses()->attach($failed->id, [
            'enrolled_at' => now()->subMonth(),
            'completed_at' => now(),
            'pass_status' => 'fail',
        ]);
        $user->courses()->attach($pending->id, [
            'enrolled_at' => now(),
            'pass_status' => 'pending',
        ]);

        $completed = $user->completedCourses;

        $this->assertCount(2, $completed);
        $this->assertTrue($completed->pluck('id')->contains($passed->id));
        $this->assertTrue($completed->pluck('id')->contains($failed->id));
    }

    public function test_is_admin_returns_true_for_admin_user(): void
    {
        $admin = User::factory()->create(['user_role_id' => $this->adminRole->id]);

        $this->assertTrue($admin->isAdmin());
        $this->assertFalse($admin->isTeacher());
        $this->assertFalse($admin->isStudent());
        $this->assertFalse($admin->isOldStudent());
    }

    public function test_is_teacher_returns_true_for_teacher_user(): void
    {
        $teacher = User::factory()->create(['user_role_id' => $this->teacherRole->id]);

        $this->assertFalse($teacher->isAdmin());
        $this->assertTrue($teacher->isTeacher());
        $this->assertFalse($teacher->isStudent());
        $this->assertFalse($teacher->isOldStudent());
    }

    public function test_is_student_returns_true_for_student_user(): void
    {
        $student = User::factory()->create(['user_role_id' => $this->studentRole->id]);

        $this->assertFalse($student->isAdmin());
        $this->assertFalse($student->isTeacher());
        $this->assertTrue($student->isStudent());
        $this->assertFalse($student->isOldStudent());
    }

    public function test_is_old_student_returns_true_for_old_student_user(): void
    {
        $oldStudent = User::factory()->create(['user_role_id' => $this->oldStudentRole->id]);

        $this->assertFalse($oldStudent->isAdmin());
        $this->assertFalse($oldStudent->isTeacher());
        $this->assertFalse($oldStudent->isStudent());
        $this->assertTrue($oldStudent->isOldStudent());
    }

    public function test_can_enroll_in_more_courses_returns_true_when_below_limit(): void
    {
        $student = User::factory()->create(['user_role_id' => $this->studentRole->id]);
        $course = Course::factory()->create();

        $student->courses()->attach($course->id, [
            'enrolled_at' => now(),
            'pass_status' => 'pending',
        ]);

        $this->assertTrue($student->canEnrollInMoreCourses());
    }

    public function test_can_enroll_in_more_courses_returns_false_when_at_limit(): void
    {
        $student = User::factory()->create(['user_role_id' => $this->studentRole->id]);

        for ($i = 0; $i < 4; $i++) {
            $course = Course::factory()->create();
            $student->courses()->attach($course->id, [
                'enrolled_at' => now(),
                'pass_status' => 'pending',
            ]);
        }

        $this->assertFalse($student->canEnrollInMoreCourses());
    }

    public function test_can_enroll_in_more_courses_returns_false_for_non_student(): void
    {
        $teacher = User::factory()->create(['user_role_id' => $this->teacherRole->id]);

        $this->assertFalse($teacher->canEnrollInMoreCourses());
    }

    public function test_password_is_hidden_in_array(): void
    {
        $user = User::factory()->create();

        $array = $user->toArray();

        $this->assertArrayNotHasKey('password', $array);
        $this->assertArrayNotHasKey('remember_token', $array);
        $this->assertArrayNotHasKey('two_factor_secret', $array);
    }
}

<?php

namespace Tests\Unit;

use App\Models\Course;
use App\Models\User;
use App\Models\UserRole;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CourseModelTest extends TestCase
{
    use RefreshDatabase;

    protected User $teacher;
    protected UserRole $studentRole;

    protected function setUp(): void
    {
        parent::setUp();

        $teacherRole = UserRole::create(['name' => 'teacher', 'display_name' => 'Teacher']);
        $this->studentRole = UserRole::create(['name' => 'student', 'display_name' => 'Student']);
        $this->teacher = User::factory()->create(['user_role_id' => $teacherRole->id]);
    }

    public function test_course_belongs_to_teacher(): void
    {
        $course = Course::factory()->create(['teacher_id' => $this->teacher->id]);

        $this->assertInstanceOf(User::class, $course->teacher);
        $this->assertEquals($this->teacher->id, $course->teacher->id);
    }

    public function test_course_has_many_students(): void
    {
        $course = Course::factory()->create();
        $student = User::factory()->create(['user_role_id' => $this->studentRole->id]);
        
        $course->students()->attach($student->id, [
            'enrolled_at' => now(),
            'pass_status' => 'pending',
        ]);

        $this->assertCount(1, $course->students);
        $this->assertEquals($student->id, $course->students->first()->id);
    }

    public function test_enrolled_students_returns_only_pending(): void
    {
        $course = Course::factory()->create();
        $pending = User::factory()->create(['user_role_id' => $this->studentRole->id]);
        $completed = User::factory()->create(['user_role_id' => $this->studentRole->id]);

        $course->students()->attach($pending->id, [
            'enrolled_at' => now(),
            'pass_status' => 'pending',
        ]);
        $course->students()->attach($completed->id, [
            'enrolled_at' => now()->subMonth(),
            'completed_at' => now(),
            'pass_status' => 'pass',
        ]);

        $enrolled = $course->enrolledStudents;
        
        $this->assertCount(1, $enrolled);
        $this->assertEquals($pending->id, $enrolled->first()->id);
    }

    public function test_completed_students_returns_pass_and_fail(): void
    {
        $course = Course::factory()->create();
        $passed = User::factory()->create(['user_role_id' => $this->studentRole->id]);
        $failed = User::factory()->create(['user_role_id' => $this->studentRole->id]);
        $pending = User::factory()->create(['user_role_id' => $this->studentRole->id]);

        $course->students()->attach($passed->id, [
            'enrolled_at' => now()->subMonth(),
            'completed_at' => now(),
            'pass_status' => 'pass',
        ]);
        $course->students()->attach($failed->id, [
            'enrolled_at' => now()->subMonth(),
            'completed_at' => now(),
            'pass_status' => 'fail',
        ]);
        $course->students()->attach($pending->id, [
            'enrolled_at' => now(),
            'pass_status' => 'pending',
        ]);

        $completed = $course->completedStudents;
        
        $this->assertCount(2, $completed);
        $this->assertTrue($completed->pluck('id')->contains($passed->id));
        $this->assertTrue($completed->pluck('id')->contains($failed->id));
        $this->assertFalse($completed->pluck('id')->contains($pending->id));
    }

    public function test_has_space_returns_true_when_below_max(): void
    {
        $course = Course::factory()->create(['max_students' => 10]);
        $student = User::factory()->create(['user_role_id' => $this->studentRole->id]);

        $course->students()->attach($student->id, [
            'enrolled_at' => now(),
            'pass_status' => 'pending',
        ]);

        $this->assertTrue($course->hasSpace());
    }

    public function test_has_space_returns_false_when_at_max(): void
    {
        $course = Course::factory()->create(['max_students' => 2]);
        
        for ($i = 0; $i < 2; $i++) {
            $student = User::factory()->create(['user_role_id' => $this->studentRole->id]);
            $course->students()->attach($student->id, [
                'enrolled_at' => now(),
                'pass_status' => 'pending',
            ]);
        }

        $this->assertFalse($course->hasSpace());
    }

    public function test_can_enroll_returns_true_when_available_and_has_space(): void
    {
        $course = Course::factory()->create([
            'is_available' => true,
            'max_students' => 10,
        ]);

        $this->assertTrue($course->canEnroll());
    }

    public function test_can_enroll_returns_false_when_not_available(): void
    {
        $course = Course::factory()->create([
            'is_available' => false,
            'max_students' => 10,
        ]);

        $this->assertFalse($course->canEnroll());
    }

    public function test_can_enroll_returns_false_when_full(): void
    {
        $course = Course::factory()->create([
            'is_available' => true,
            'max_students' => 1,
        ]);
        
        $student = User::factory()->create(['user_role_id' => $this->studentRole->id]);
        $course->students()->attach($student->id, [
            'enrolled_at' => now(),
            'pass_status' => 'pending',
        ]);

        $this->assertFalse($course->canEnroll());
    }

    public function test_course_casts_is_available_to_boolean(): void
    {
        $course = Course::factory()->create(['is_available' => 1]);

        $this->assertIsBool($course->is_available);
        $this->assertTrue($course->is_available);
    }
}

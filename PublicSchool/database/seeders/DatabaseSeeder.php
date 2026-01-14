<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\UserRole;
use App\Models\Course;
use App\Models\Announcement;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create user roles
        $adminRole = UserRole::firstOrCreate(
            ['name' => 'admin'],
            ['display_name' => 'Administrator']
        );

        $teacherRole = UserRole::firstOrCreate(
            ['name' => 'teacher'],
            ['display_name' => 'Teacher']
        );

        $studentRole = UserRole::firstOrCreate(
            ['name' => 'student'],
            ['display_name' => 'Student']
        );

        $oldStudentRole = UserRole::firstOrCreate(
            ['name' => 'old_student'],
            ['display_name' => 'Old Student']
        );

        // Create admin user
        $admin = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'user_role_id' => $adminRole->id,
            ]
        );

        // Create sample teachers
        $teacher1 = User::firstOrCreate(
            ['email' => 'teacher1@example.com'],
            [
                'name' => 'John Teacher',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'user_role_id' => $teacherRole->id,
            ]
        );

        $teacher2 = User::firstOrCreate(
            ['email' => 'teacher2@example.com'],
            [
                'name' => 'Jane Teacher',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'user_role_id' => $teacherRole->id,
            ]
        );

        // Create sample students
        $student1 = User::firstOrCreate(
            ['email' => 'student1@example.com'],
            [
                'name' => 'Alice Student',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'user_role_id' => $studentRole->id,
            ]
        );

        $student2 = User::firstOrCreate(
            ['email' => 'student2@example.com'],
            [
                'name' => 'Bob Student',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'user_role_id' => $studentRole->id,
            ]
        );

        $student3 = User::firstOrCreate(
            ['email' => 'student3@example.com'],
            [
                'name' => 'Charlie Student',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'user_role_id' => $studentRole->id,
            ]
        );

        // Create an old student
        $oldStudent = User::firstOrCreate(
            ['email' => 'oldstudent@example.com'],
            [
                'name' => 'David Old Student',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'user_role_id' => $oldStudentRole->id,
            ]
        );

        // Create sample courses/modules
        $courses = [
            [
                'name' => 'Advanced Web Engineering',
                'description' => 'Learn advanced web development techniques including Laravel, React, and modern web architectures.',
                'is_available' => true,
                'max_students' => 10,
                'teacher_id' => $teacher1->id,
            ],
            [
                'name' => 'Database Management',
                'description' => 'Master database design, optimization, and administration.',
                'is_available' => true,
                'max_students' => 10,
                'teacher_id' => $teacher1->id,
            ],
            [
                'name' => 'Cloud Computing',
                'description' => 'Introduction to cloud infrastructure and services (AWS, Azure, GCP).',
                'is_available' => true,
                'max_students' => 10,
                'teacher_id' => $teacher2->id,
            ],
            [
                'name' => 'Machine Learning Fundamentals',
                'description' => 'Fundamentals of machine learning and artificial intelligence.',
                'is_available' => true,
                'max_students' => 10,
                'teacher_id' => $teacher2->id,
            ],
            [
                'name' => 'Cybersecurity Essentials',
                'description' => 'Security principles, practices, and ethical hacking.',
                'is_available' => false,
                'max_students' => 10,
                'teacher_id' => null,
            ],
            [
                'name' => 'Mobile App Development',
                'description' => 'Build native and cross-platform mobile applications.',
                'is_available' => true,
                'max_students' => 10,
                'teacher_id' => $teacher1->id,
            ],
        ];

        foreach ($courses as $courseData) {
            Course::firstOrCreate(
                ['name' => $courseData['name']],
                $courseData
            );
        }

        // Enroll some students in courses
        $course1 = Course::where('name', 'Advanced Web Engineering')->first();
        $course2 = Course::where('name', 'Database Management')->first();
        $course3 = Course::where('name', 'Cloud Computing')->first();

        // Student 1 enrollments
        if ($course1 && $student1) {
            $student1->courses()->syncWithoutDetaching([
                $course1->id => [
                    'enrolled_at' => now()->subDays(30),
                    'pass_status' => 'pending',
                ]
            ]);
        }

        if ($course2 && $student1) {
            $student1->courses()->syncWithoutDetaching([
                $course2->id => [
                    'enrolled_at' => now()->subDays(25),
                    'pass_status' => 'pending',
                ]
            ]);
        }

        // Student 2 enrollments
        if ($course1 && $student2) {
            $student2->courses()->syncWithoutDetaching([
                $course1->id => [
                    'enrolled_at' => now()->subDays(28),
                    'pass_status' => 'pending',
                ]
            ]);
        }

        // Student 3 enrollments
        if ($course3 && $student3) {
            $student3->courses()->syncWithoutDetaching([
                $course3->id => [
                    'enrolled_at' => now()->subDays(20),
                    'pass_status' => 'pending',
                ]
            ]);
        }

        // Add completed course history for old student
        if ($course1 && $oldStudent) {
            $oldStudent->courses()->syncWithoutDetaching([
                $course1->id => [
                    'enrolled_at' => now()->subMonths(6),
                    'completed_at' => now()->subMonths(3),
                    'pass_status' => 'pass',
                ]
            ]);
        }

        if ($course2 && $oldStudent) {
            $oldStudent->courses()->syncWithoutDetaching([
                $course2->id => [
                    'enrolled_at' => now()->subMonths(5),
                    'completed_at' => now()->subMonths(2),
                    'pass_status' => 'fail',
                ]
            ]);
        }

        // Create sample announcements
        if (Announcement::count() === 0) {
            Announcement::factory()->count(8)->create([
                'user_id' => $admin->id,
            ]);

            // Ensure at least one pinned and one scheduled
            Announcement::factory()->create([
                'title' => 'Welcome to Public School Portal',
                'is_pinned' => true,
                'published_at' => now()->subDay(),
                'user_id' => $admin->id,
            ]);

            Announcement::factory()->create([
                'title' => 'Maintenance Window (Scheduled)',
                'published_at' => now()->addDays(2),
                'user_id' => $admin->id,
            ]);
        }
    }
}

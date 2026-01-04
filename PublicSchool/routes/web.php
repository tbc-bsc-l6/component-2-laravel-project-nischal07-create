<?php

use App\Http\Controllers\Admin\CourseController as AdminCourseController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\UserManagementController;
use App\Http\Controllers\Student\DashboardController as StudentDashboardController;
use App\Http\Controllers\Student\EnrollmentController;
use App\Http\Controllers\Teacher\DashboardController as TeacherDashboardController;
use App\Http\Controllers\Teacher\GradingController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    // Smart dashboard that redirects based on role
    Route::get('dashboard', function () {
        $user = auth()->user();
        
        if ($user->isAdmin()) {
            return redirect()->route('admin.dashboard');
        } elseif ($user->isTeacher()) {
            return redirect()->route('teacher.dashboard');
        } elseif ($user->isStudent()) {
            return redirect()->route('student.dashboard');
        } elseif ($user->isOldStudent()) {
            return redirect()->route('student.dashboard');
        }
        
        return Inertia::render('dashboard');
    })->name('dashboard');

    // Admin Routes
    Route::middleware(['role:admin'])->prefix('admin')->name('admin.')->group(function () {
        // Dashboard
        Route::get('dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');

        // Course Management
        Route::resource('courses', AdminCourseController::class);
        Route::post('courses/{course}/toggle-availability', [AdminCourseController::class, 'toggleAvailability'])
            ->name('courses.toggle-availability');
        Route::post('courses/{course}/assign-teacher', [AdminCourseController::class, 'assignTeacher'])
            ->name('courses.assign-teacher');
        Route::delete('courses/{course}/students/{student}', [AdminCourseController::class, 'removeStudent'])
            ->name('courses.remove-student');

        // User Management
        Route::get('users', [UserManagementController::class, 'index'])->name('users.index');
        Route::get('users/create-teacher', [UserManagementController::class, 'createTeacher'])
            ->name('users.create-teacher');
        Route::post('users/create-teacher', [UserManagementController::class, 'storeTeacher'])
            ->name('users.store-teacher');
        Route::post('users/{user}/change-role', [UserManagementController::class, 'changeRole'])
            ->name('users.change-role');
        Route::delete('users/{user}', [UserManagementController::class, 'destroy'])
            ->name('users.destroy');
    });

    // Teacher Routes
    Route::middleware(['role:teacher'])->prefix('teacher')->name('teacher.')->group(function () {
        Route::get('dashboard', [TeacherDashboardController::class, 'index'])->name('dashboard');
        Route::get('courses/{courseId}', [TeacherDashboardController::class, 'showCourse'])
            ->name('courses.show');
        Route::post('courses/{course}/students/{student}/grade', [GradingController::class, 'gradeStudent'])
            ->name('grade-student');
    });

    // Student Routes
    Route::middleware(['role:student,old_student'])->prefix('student')->name('student.')->group(function () {
        Route::get('dashboard', [StudentDashboardController::class, 'index'])->name('dashboard');
        
        // Only current students can enroll/unenroll
        Route::middleware(['role:student'])->group(function () {
            Route::post('courses/{course}/enroll', [EnrollmentController::class, 'enroll'])
                ->name('courses.enroll');
            Route::delete('courses/{course}/unenroll', [EnrollmentController::class, 'unenroll'])
                ->name('courses.unenroll');
        });
    });
});

require __DIR__.'/settings.php';

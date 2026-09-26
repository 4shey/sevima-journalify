<?php

use App\Http\Controllers\Curriculum\DashboardController as CurriculumDashboardController;
use App\Http\Controllers\Curriculum\Management\ScheduleController as ManagementScheduleController;
use App\Http\Controllers\Curriculum\Management\StudentController as ManagementStudentController;
use App\Http\Controllers\Curriculum\Management\SubjectController as ManagementSubjectController;
use App\Http\Controllers\Curriculum\Management\TeacherController as ManagementTeacherController;
use App\Http\Controllers\Curriculum\Monitoring\AttendanceController as MonitoringAttendanceController;
use App\Http\Controllers\Curriculum\Monitoring\JournalController as MonitoringJournalController;
use App\Http\Controllers\Teacher\DashboardController as TeacherDashboardController;
use App\Http\Controllers\Teacher\JournalController as TeacherJournalController;
use App\Http\Controllers\Teacher\ScheduleController as TeacherScheduleController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/', function (Request $request) {
    $user = $request->user();

    if (! $user) {
        return redirect()->route('login');
    }

    return redirect()->to(
        $user->isTeacher()
            ? route('teacher.dashboard', absolute: false)
            : route('curriculum.dashboard', absolute: false)
    );
});

Route::prefix('teacher')->name('teacher.')->middleware(['auth', 'role:teacher'])->group(function () {
    Route::get('dashboard', [TeacherDashboardController::class, 'index'])->name('dashboard');
    Route::get('schedule', [TeacherScheduleController::class, 'index'])->name('schedule');
    Route::get('journal', [TeacherJournalController::class, 'index'])->name('journal');
});

Route::prefix('curriculum')->name('curriculum.')->middleware(['auth', 'role:curriculum'])->group(function () {
    Route::get('dashboard', [CurriculumDashboardController::class, 'index'])->name('dashboard');

    Route::prefix('management')->name('management.')->group(function () {
        Route::get('teachers', [ManagementTeacherController::class, 'index'])->name('teachers');
        Route::post('teachers', [ManagementTeacherController::class, 'store'])->name('teachers.store');
        Route::put('teachers/{teacher}', [ManagementTeacherController::class, 'update'])->name('teachers.update');
        Route::delete('teachers/{teacher}', [ManagementTeacherController::class, 'destroy'])->name('teachers.destroy');

        Route::get('students', [ManagementStudentController::class, 'index'])->name('students');
        Route::post('students', [ManagementStudentController::class, 'store'])->name('students.store');
        Route::put('students/{student}', [ManagementStudentController::class, 'update'])->name('students.update');
        Route::delete('students/{student}', [ManagementStudentController::class, 'destroy'])->name('students.destroy');

        Route::get('subjects', [ManagementSubjectController::class, 'index'])->name('subjects');
        Route::get('schedules', [ManagementScheduleController::class, 'index'])->name('schedules');
    });

    Route::prefix('monitoring')->name('monitoring.')->group(function () {
        Route::get('journals', [MonitoringJournalController::class, 'index'])->name('journals');
        Route::get('attendance', [MonitoringAttendanceController::class, 'index'])->name('attendance');
    });
});

require __DIR__ . '/auth.php';

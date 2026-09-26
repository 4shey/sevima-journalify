<?php

use App\Http\Controllers\Curriculum\DashboardController as CurriculumDashboardController;
use App\Http\Controllers\Curriculum\Management\ClassroomController as ManagementClassroomController;
use App\Http\Controllers\Curriculum\Management\ScheduleController as ManagementScheduleController;
use App\Http\Controllers\Curriculum\Management\StudentController as ManagementStudentController;
use App\Http\Controllers\Curriculum\Management\SubjectController as ManagementSubjectController;
use App\Http\Controllers\Curriculum\Management\TeacherController as ManagementTeacherController;
use App\Http\Controllers\Curriculum\Monitoring\AttendanceController as MonitoringAttendanceController;
use App\Http\Controllers\Curriculum\Monitoring\JournalController as MonitoringJournalController;
use App\Http\Controllers\Curriculum\TimeSimulationController;
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
            ? route('teacher.schedule', absolute: false)
            : route('curriculum.dashboard', absolute: false)
    );
});

Route::prefix('teacher')->name('teacher.')->middleware(['auth', 'role:teacher'])->group(function () {
    Route::get('schedule', [TeacherScheduleController::class, 'index'])->name('schedule');
    Route::get('journal', [TeacherJournalController::class, 'index'])->name('journal');
    Route::post('journals', [TeacherJournalController::class, 'store'])->name('journals.store');
});

Route::prefix('curriculum')->name('curriculum.')->middleware(['auth', 'role:curriculum'])->group(function () {
    Route::get('dashboard', [CurriculumDashboardController::class, 'index'])->name('dashboard');
    Route::post('time-simulation', [TimeSimulationController::class, 'update'])->name('time.update');
    Route::delete('time-simulation', [TimeSimulationController::class, 'reset'])->name('time.reset');

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
        Route::post('subjects', [ManagementSubjectController::class, 'store'])->name('subjects.store');
        Route::put('subjects/{subject}', [ManagementSubjectController::class, 'update'])->name('subjects.update');
        Route::delete('subjects/{subject}', [ManagementSubjectController::class, 'destroy'])->name('subjects.destroy');

        Route::get('classes', [ManagementClassroomController::class, 'index'])->name('classes');
        Route::post('classes', [ManagementClassroomController::class, 'store'])->name('classes.store');
        Route::put('classes/{classroom}', [ManagementClassroomController::class, 'update'])->name('classes.update');
        Route::delete('classes/{classroom}', [ManagementClassroomController::class, 'destroy'])->name('classes.destroy');

        Route::get('schedules', [ManagementScheduleController::class, 'index'])->name('schedules');
        Route::post('schedules', [ManagementScheduleController::class, 'store'])->name('schedules.store');
        Route::put('schedules/{schedule}', [ManagementScheduleController::class, 'update'])->name('schedules.update');
        Route::delete('schedules/{schedule}', [ManagementScheduleController::class, 'destroy'])->name('schedules.destroy');
    });

    Route::prefix('monitoring')->name('monitoring.')->group(function () {
        Route::get('journals', [MonitoringJournalController::class, 'index'])->name('journals');
        Route::post('journals', [MonitoringJournalController::class, 'store'])->name('journals.store');
        Route::put('journals/{journal}', [MonitoringJournalController::class, 'update'])->name('journals.update');
        Route::delete('journals/{journal}', [MonitoringJournalController::class, 'destroy'])->name('journals.destroy');

        Route::get('attendance', [MonitoringAttendanceController::class, 'index'])->name('attendance');
        Route::put('attendance/{journal}', [MonitoringAttendanceController::class, 'update'])->name('attendance.update');
    });
});

require __DIR__.'/auth.php';

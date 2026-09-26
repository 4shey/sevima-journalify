<?php

namespace Tests\Feature\Curriculum;

use App\Models\Attendance;
use App\Models\Classroom;
use App\Models\Journal;
use App\Models\Major;
use App\Models\Period;
use App\Models\Schedule;
use App\Models\ScheduleDetail;
use App\Models\Student;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\Feature\Concerns\CreatesSchoolRecords;
use Tests\TestCase;

class AttendanceTest extends TestCase
{
    use CreatesSchoolRecords;
    use RefreshDatabase;

    public function test_curriculum_user_can_update_student_attendance_in_journal(): void
    {
        $curriculumUser = User::factory()->create(['role' => 'curriculum']);

        $major = Major::create(['name' => 'Teknik Komputer']);
        $classroom = Classroom::create(['grade' => 'X', 'major_id' => $major->id, 'section' => 'A']);
        $student = Student::create([
            'class_id' => $classroom->id,
            'name' => 'Budi Santoso',
            'attendance_number' => '01',
        ]);

        $teacherUser = User::factory()->create(['role' => 'teacher']);
        $teacher = Teacher::create(['user_id' => $teacherUser->id, 'name' => 'Guru IPA', 'code' => 'G01']);
        $subject = Subject::create(['name' => 'Fisika', 'code' => 'FIS']);

        $startPeriod = Period::create(['order' => 1, 'start_time' => '07:00:00', 'end_time' => '08:00:00']);
        $endPeriod = Period::create(['order' => 2, 'start_time' => '08:00:00', 'end_time' => '09:00:00']);

        $schedule = Schedule::create(['name' => 'Jadwal Utama', 'active_date' => now()->toDateString()]);
        $scheduleDetail = ScheduleDetail::create([
            'schedule_id' => $schedule->id,
            'class_id' => $classroom->id,
            'subject_id' => $subject->id,
            'teacher_id' => $teacher->id,
            'day' => 'Monday',
            'start_period_id' => $startPeriod->id,
            'end_period_id' => $endPeriod->id,
        ]);

        $journal = Journal::create([
            'name' => 'Jurnal Fisika Bab 1',
            'date' => now()->toDateString(),
            'schedule_detail_id' => $scheduleDetail->id,
        ]);

        $attendance = Attendance::create([
            'journal_id' => $journal->id,
            'student_id' => $student->id,
            'status' => 'H',
        ]);

        $response = $this->actingAs($curriculumUser)
            ->put(route('curriculum.monitoring.attendance.update', $journal->id), [
                'student_id' => $student->id,
                'status' => 'I',
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('flash.success', 'Status presensi siswa berhasil diperbarui.');

        $this->assertDatabaseHas('attendances', [
            'journal_id' => $journal->id,
            'student_id' => $student->id,
            'status' => 'I',
        ]);
    }

    public function test_attendance_update_creates_missing_student_row(): void
    {
        $curriculumUser = $this->createCurriculumUser();
        $teacher = $this->createTeacher();
        $classroom = $this->createClassroom();
        $student = $this->createStudent($classroom);
        $subject = $this->createSubject();
        $startPeriod = $this->createPeriod(1);
        $endPeriod = $this->createPeriod(2, '07:50:00', '08:40:00');
        $schedule = $this->createSchedule('2026-09-21');
        $detail = $this->createScheduleDetail($schedule, $teacher, $classroom, $subject, $startPeriod, $endPeriod);
        $journal = $this->createJournal($detail, '2026-09-28');
        Cache::put('simulated_time', '2026-09-28 10:00:00');

        try {
            $response = $this->actingAs($curriculumUser)
                ->put(route('curriculum.monitoring.attendance.update', $journal), [
                    'student_id' => $student->id,
                    'status' => 'A',
                ]);
        } finally {
            Cache::forget('simulated_time');
        }

        $response->assertSessionHas('flash.success', 'Status presensi siswa berhasil diperbarui.');
        $this->assertDatabaseHas('attendances', [
            'journal_id' => $journal->id,
            'student_id' => $student->id,
            'status' => 'A',
        ]);
    }

    public function test_attendance_for_future_journal_cannot_be_updated(): void
    {
        $curriculumUser = $this->createCurriculumUser();
        $teacher = $this->createTeacher();
        $classroom = $this->createClassroom();
        $student = $this->createStudent($classroom);
        $subject = $this->createSubject();
        $startPeriod = $this->createPeriod(1);
        $endPeriod = $this->createPeriod(2, '07:50:00', '08:40:00');
        $schedule = $this->createSchedule('2026-09-21');
        $detail = $this->createScheduleDetail($schedule, $teacher, $classroom, $subject, $startPeriod, $endPeriod);
        $journal = $this->createJournal($detail, '2026-09-29');
        Cache::put('simulated_time', '2026-09-28 10:00:00');

        try {
            $response = $this->actingAs($curriculumUser)
                ->put(route('curriculum.monitoring.attendance.update', $journal), [
                    'student_id' => $student->id,
                    'status' => 'A',
                ]);
        } finally {
            Cache::forget('simulated_time');
        }

        $response->assertSessionHas('flash.error', 'Jurnal pada tanggal di masa depan tidak dapat diubah.');
        $this->assertDatabaseCount('attendances', 0);
    }

    public function test_attendance_monitoring_returns_latest_status_for_each_student(): void
    {
        $curriculumUser = $this->createCurriculumUser();
        $teacher = $this->createTeacher();
        $classroom = $this->createClassroom();
        $student = $this->createStudent($classroom);
        $subject = $this->createSubject();
        $startPeriod = $this->createPeriod(1);
        $endPeriod = $this->createPeriod(2, '07:50:00', '08:40:00');
        $schedule = $this->createSchedule('2026-09-21');
        $detail = $this->createScheduleDetail($schedule, $teacher, $classroom, $subject, $startPeriod, $endPeriod);
        $journal = $this->createJournal($detail, '2026-09-28');
        Attendance::create(['journal_id' => $journal->id, 'student_id' => $student->id, 'status' => 'S']);
        Cache::put('simulated_time', '2026-09-28 10:00:00');

        try {
            $response = $this->actingAs($curriculumUser)
                ->get(route('curriculum.monitoring.attendance'));
        } finally {
            Cache::forget('simulated_time');
        }

        $response->assertInertia(fn (Assert $page) => $page
            ->where('date', '2026-09-28')
            ->where('weekday', 'Monday')
            ->has('students.data', 1)
            ->where('students.data.0.latest_status', 'S')
            ->has('classSlots', 1));
    }
}

<?php

namespace Tests\Feature\Curriculum\Monitoring;

use App\Models\Attendance;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\Feature\Concerns\CreatesSchoolRecords;
use Tests\TestCase;

class JournalTest extends TestCase
{
    use CreatesSchoolRecords;
    use RefreshDatabase;

    public function test_curriculum_user_can_create_manual_journal_with_attendances(): void
    {
        $curriculumUser = $this->createCurriculumUser();
        $teacher = $this->createTeacher();
        $classroom = $this->createClassroom();
        $student = $this->createStudent($classroom);
        $subject = $this->createSubject();
        $startPeriod = $this->createPeriod(1, '07:00:00', '07:50:00');
        $endPeriod = $this->createPeriod(2, '07:50:00', '08:40:00');
        $schedule = $this->createSchedule('2026-09-21');
        $detail = $this->createScheduleDetail($schedule, $teacher, $classroom, $subject, $startPeriod, $endPeriod);
        Cache::put('simulated_time', '2026-09-28 10:00:00');

        try {
            $response = $this->actingAs($curriculumUser)
                ->post(route('curriculum.monitoring.journals.store'), [
                    'schedule_detail_id' => $detail->id,
                    'name' => 'Jurnal Manual Kurikulum',
                    'date' => '2026-09-28',
                    'time' => '07:25',
                    'attendances' => [['student_id' => $student->id, 'status' => 'H']],
                ]);
        } finally {
            Cache::forget('simulated_time');
        }

        $response->assertSessionHas('flash.success', 'Jurnal berhasil dibuat oleh Kurikulum.');
        $this->assertDatabaseHas('journals', [
            'schedule_detail_id' => $detail->id,
            'date' => '2026-09-28',
            'name' => 'Jurnal Manual Kurikulum',
        ]);
        $this->assertDatabaseHas('attendances', ['student_id' => $student->id, 'status' => 'H']);
    }

    public function test_curriculum_journal_index_uses_requested_date_and_effective_schedule(): void
    {
        $curriculumUser = $this->createCurriculumUser();
        $teacher = $this->createTeacher();
        $classroom = $this->createClassroom();
        $subject = $this->createSubject();
        $startPeriod = $this->createPeriod(1);
        $endPeriod = $this->createPeriod(2, '07:50:00', '08:40:00');
        $schedule = $this->createSchedule('2026-09-21');
        $this->createScheduleDetail($schedule, $teacher, $classroom, $subject, $startPeriod, $endPeriod);
        Cache::put('simulated_time', '2026-09-28 10:00:00');

        try {
            $response = $this->actingAs($curriculumUser)
                ->get(route('curriculum.monitoring.journals', [
                    'date' => '2026-09-28',
                    'search' => $teacher->code,
                ]));
        } finally {
            Cache::forget('simulated_time');
        }

        $response->assertInertia(fn (Assert $page) => $page
            ->where('date', '2026-09-28')
            ->where('weekday', 'Monday')
            ->where('activeSchedule.id', $schedule->id)
            ->where('filters.search', $teacher->code)
            ->has('teachers.data', 1)
            ->where('teachers.data.0.id', $teacher->id));
    }

    public function test_manual_journal_time_must_be_inside_the_schedule_slot(): void
    {
        $curriculumUser = $this->createCurriculumUser();
        $teacher = $this->createTeacher();
        $classroom = $this->createClassroom();
        $student = $this->createStudent($classroom);
        $subject = $this->createSubject();
        $startPeriod = $this->createPeriod(1, '07:00:00', '07:50:00');
        $endPeriod = $this->createPeriod(2, '07:50:00', '08:40:00');
        $schedule = $this->createSchedule('2026-09-21');
        $detail = $this->createScheduleDetail($schedule, $teacher, $classroom, $subject, $startPeriod, $endPeriod);
        Cache::put('simulated_time', '2026-09-28 10:00:00');

        try {
            $response = $this->actingAs($curriculumUser)
                ->post(route('curriculum.monitoring.journals.store'), [
                    'schedule_detail_id' => $detail->id,
                    'name' => 'Jurnal Di Luar Slot',
                    'date' => '2026-09-28',
                    'time' => '09:00',
                    'attendances' => [['student_id' => $student->id, 'status' => 'H']],
                ]);
        } finally {
            Cache::forget('simulated_time');
        }

        $response->assertSessionHas('flash.error', 'Jam yang dimasukkan (09:00) berada di luar jam pelajaran (07:00 - 08:40).');
        $this->assertDatabaseCount('journals', 0);
        $this->assertDatabaseCount('attendances', 0);
    }

    public function test_manual_journal_update_replaces_attendance_rows(): void
    {
        $curriculumUser = $this->createCurriculumUser();
        $teacher = $this->createTeacher();
        $classroom = $this->createClassroom();
        $firstStudent = $this->createStudent($classroom, 1);
        $secondStudent = $this->createStudent($classroom, 2);
        $subject = $this->createSubject();
        $startPeriod = $this->createPeriod(1, '07:00:00', '07:50:00');
        $endPeriod = $this->createPeriod(2, '07:50:00', '08:40:00');
        $schedule = $this->createSchedule('2026-09-21');
        $detail = $this->createScheduleDetail($schedule, $teacher, $classroom, $subject, $startPeriod, $endPeriod);
        $journal = $this->createJournal($detail, '2026-09-28', 'Nama Lama');
        Attendance::create(['journal_id' => $journal->id, 'student_id' => $firstStudent->id, 'status' => 'H']);
        Cache::put('simulated_time', '2026-09-28 10:00:00');

        try {
            $response = $this->actingAs($curriculumUser)
                ->put(route('curriculum.monitoring.journals.update', $journal), [
                    'name' => 'Nama Baru',
                    'time' => '07:30',
                    'attendances' => [['student_id' => $secondStudent->id, 'status' => 'S']],
                ]);
        } finally {
            Cache::forget('simulated_time');
        }

        $response->assertSessionHas('flash.success', 'Jurnal berhasil diperbarui oleh Kurikulum.');
        $this->assertDatabaseHas('journals', ['id' => $journal->id, 'name' => 'Nama Baru']);
        $this->assertDatabaseMissing('attendances', ['journal_id' => $journal->id, 'student_id' => $firstStudent->id]);
        $this->assertDatabaseHas('attendances', [
            'journal_id' => $journal->id,
            'student_id' => $secondStudent->id,
            'status' => 'S',
        ]);
    }

    public function test_future_journal_cannot_be_updated(): void
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
        $journal = $this->createJournal($detail, '2026-09-28', 'Jurnal Masa Depan');
        Cache::put('simulated_time', '2026-09-27 10:00:00');

        try {
            $response = $this->actingAs($curriculumUser)
                ->put(route('curriculum.monitoring.journals.update', $journal), [
                    'name' => 'Perubahan Tidak Sah',
                    'time' => '07:30',
                    'attendances' => [['student_id' => $student->id, 'status' => 'H']],
                ]);
        } finally {
            Cache::forget('simulated_time');
        }

        $response->assertSessionHas('flash.error', 'Jurnal pada tanggal di masa depan tidak dapat diubah.');
        $this->assertDatabaseHas('journals', ['id' => $journal->id, 'name' => 'Jurnal Masa Depan']);
    }

    public function test_future_journal_cannot_be_deleted(): void
    {
        $curriculumUser = $this->createCurriculumUser();
        $teacher = $this->createTeacher();
        $classroom = $this->createClassroom();
        $subject = $this->createSubject();
        $startPeriod = $this->createPeriod(1);
        $endPeriod = $this->createPeriod(2, '07:50:00', '08:40:00');
        $schedule = $this->createSchedule('2026-09-21');
        $detail = $this->createScheduleDetail($schedule, $teacher, $classroom, $subject, $startPeriod, $endPeriod);
        $journal = $this->createJournal($detail, '2026-09-28', 'Jurnal Masa Depan');
        Cache::put('simulated_time', '2026-09-27 10:00:00');

        try {
            $response = $this->actingAs($curriculumUser)
                ->delete(route('curriculum.monitoring.journals.destroy', $journal));
        } finally {
            Cache::forget('simulated_time');
        }

        $response->assertSessionHas('flash.error', 'Jurnal pada tanggal di masa depan tidak dapat dihapus.');
        $this->assertModelExists($journal);
    }

    public function test_curriculum_user_can_delete_past_journal(): void
    {
        $curriculumUser = $this->createCurriculumUser();
        $teacher = $this->createTeacher();
        $classroom = $this->createClassroom();
        $subject = $this->createSubject();
        $startPeriod = $this->createPeriod(1);
        $endPeriod = $this->createPeriod(2, '07:50:00', '08:40:00');
        $schedule = $this->createSchedule('2026-09-21');
        $detail = $this->createScheduleDetail($schedule, $teacher, $classroom, $subject, $startPeriod, $endPeriod);
        $journal = $this->createJournal($detail, '2026-09-21', 'Jurnal Lampau');
        Cache::put('simulated_time', '2026-09-28 10:00:00');

        try {
            $response = $this->actingAs($curriculumUser)
                ->delete(route('curriculum.monitoring.journals.destroy', $journal));
        } finally {
            Cache::forget('simulated_time');
        }

        $response->assertSessionHas('flash.success', 'Jurnal berhasil dihapus.');
        $this->assertModelMissing($journal);
    }
}

<?php

namespace Tests\Feature\Teacher;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\Feature\Concerns\CreatesSchoolRecords;
use Tests\TestCase;

class JournalTest extends TestCase
{
    use CreatesSchoolRecords;
    use RefreshDatabase;

    public function test_teacher_can_create_journal_with_complete_attendance_during_slot(): void
    {
        $teacher = $this->createTeacher();
        $classroom = $this->createClassroom();
        $firstStudent = $this->createStudent($classroom, 1);
        $secondStudent = $this->createStudent($classroom, 2);
        $subject = $this->createSubject();
        $startPeriod = $this->createPeriod(1, '07:00:00', '07:50:00');
        $endPeriod = $this->createPeriod(2, '07:50:00', '08:40:00');
        $schedule = $this->createSchedule('2026-09-28');
        $detail = $this->createScheduleDetail($schedule, $teacher, $classroom, $subject, $startPeriod, $endPeriod);
        Cache::put('simulated_time', '2026-09-28 07:25:00');

        try {
            $response = $this->actingAs($teacher->user)
                ->post(route('teacher.journals.store'), [
                    'schedule_detail_id' => $detail->id,
                    'name' => 'Pembahasan Bab Satu',
                    'date' => '2026-09-28',
                    'attendances' => [
                        ['student_id' => $firstStudent->id, 'status' => 'H'],
                        ['student_id' => $secondStudent->id, 'status' => 'I'],
                    ],
                ]);
        } finally {
            Cache::forget('simulated_time');
        }

        $response->assertRedirect(route('teacher.schedule'));
        $response->assertSessionHas('flash.success', 'Jurnal berhasil dibuat.');
        $this->assertDatabaseHas('journals', [
            'schedule_detail_id' => $detail->id,
            'date' => '2026-09-28',
            'name' => 'Pembahasan Bab Satu',
        ]);
        $this->assertDatabaseCount('attendances', 2);
        $this->assertDatabaseHas('attendances', ['student_id' => $secondStudent->id, 'status' => 'I']);
    }

    public function test_teacher_cannot_create_journal_for_another_teachers_slot(): void
    {
        $teacher = $this->createTeacher();
        $otherTeacher = $this->createTeacher();
        $classroom = $this->createClassroom();
        $firstStudent = $this->createStudent($classroom, 1);
        $this->createStudent($classroom, 2);
        $subject = $this->createSubject();
        $startPeriod = $this->createPeriod(1, '07:00:00', '07:50:00');
        $endPeriod = $this->createPeriod(2, '07:50:00', '08:40:00');
        $schedule = $this->createSchedule('2026-09-28');
        $detail = $this->createScheduleDetail($schedule, $otherTeacher, $classroom, $subject, $startPeriod, $endPeriod);
        Cache::put('simulated_time', '2026-09-28 07:25:00');

        try {
            $response = $this->actingAs($teacher->user)
                ->post(route('teacher.journals.store'), [
                    'schedule_detail_id' => $detail->id,
                    'name' => 'Jurnal Tidak Sah',
                    'date' => '2026-09-28',
                    'attendances' => [['student_id' => $firstStudent->id, 'status' => 'H']],
                ]);
        } finally {
            Cache::forget('simulated_time');
        }

        $response->assertSessionHas('flash.error', 'Jurnal hanya dapat dibuat untuk jadwal mengajar Anda sendiri.');
        $this->assertDatabaseCount('journals', 0);
        $this->assertDatabaseCount('attendances', 0);
    }

    public function test_teacher_must_submit_every_student_in_the_class(): void
    {
        $teacher = $this->createTeacher();
        $classroom = $this->createClassroom();
        $student = $this->createStudent($classroom, 1);
        $this->createStudent($classroom, 2);
        $subject = $this->createSubject();
        $startPeriod = $this->createPeriod(1, '07:00:00', '07:50:00');
        $endPeriod = $this->createPeriod(2, '07:50:00', '08:40:00');
        $schedule = $this->createSchedule('2026-09-28');
        $detail = $this->createScheduleDetail($schedule, $teacher, $classroom, $subject, $startPeriod, $endPeriod);
        Cache::put('simulated_time', '2026-09-28 07:25:00');

        try {
            $response = $this->actingAs($teacher->user)
                ->post(route('teacher.journals.store'), [
                    'schedule_detail_id' => $detail->id,
                    'name' => 'Jurnal Tidak Lengkap',
                    'date' => '2026-09-28',
                    'attendances' => [['student_id' => $student->id, 'status' => 'H']],
                ]);
        } finally {
            Cache::forget('simulated_time');
        }

        $response->assertSessionHas('flash.error', 'Daftar absensi harus berisi seluruh siswa kelas jadwal ini tepat satu kali.');
        $this->assertDatabaseCount('journals', 0);
    }

    public function test_teacher_cannot_create_journal_outside_slot_time(): void
    {
        $teacher = $this->createTeacher();
        $classroom = $this->createClassroom();
        $student = $this->createStudent($classroom);
        $subject = $this->createSubject();
        $startPeriod = $this->createPeriod(1, '07:00:00', '07:50:00');
        $endPeriod = $this->createPeriod(2, '07:50:00', '08:40:00');
        $schedule = $this->createSchedule('2026-09-28');
        $detail = $this->createScheduleDetail($schedule, $teacher, $classroom, $subject, $startPeriod, $endPeriod);
        Cache::put('simulated_time', '2026-09-28 09:00:00');

        try {
            $response = $this->actingAs($teacher->user)
                ->post(route('teacher.journals.store'), [
                    'schedule_detail_id' => $detail->id,
                    'name' => 'Jurnal Di Luar Slot',
                    'date' => '2026-09-28',
                    'attendances' => [['student_id' => $student->id, 'status' => 'H']],
                ]);
        } finally {
            Cache::forget('simulated_time');
        }

        $response->assertSessionHas('flash.error', 'Jurnal hanya dapat dibuat pada jam pelajaran yang berlangsung.');
        $this->assertDatabaseCount('journals', 0);
    }

    public function test_teacher_journal_history_excludes_other_teachers_records(): void
    {
        $teacher = $this->createTeacher();
        $otherTeacher = $this->createTeacher();
        $classroom = $this->createClassroom();
        $subject = $this->createSubject();
        $startPeriod = $this->createPeriod(1);
        $endPeriod = $this->createPeriod(2, '07:50:00', '08:40:00');
        $schedule = $this->createSchedule('2026-09-21');
        $ownDetail = $this->createScheduleDetail($schedule, $teacher, $classroom, $subject, $startPeriod, $endPeriod);
        $otherDetail = $this->createScheduleDetail($schedule, $otherTeacher, $this->createClassroom(), $subject, $startPeriod, $endPeriod);
        $ownJournal = $this->createJournal($ownDetail, '2026-09-21', 'Jurnal Guru A');
        $this->createJournal($otherDetail, '2026-09-21', 'Jurnal Guru B');

        $this->actingAs($teacher->user)
            ->get(route('teacher.journal'))
            ->assertInertia(fn (Assert $page) => $page
                ->has('journals.data', 1)
                ->where('journals.data.0.id', $ownJournal->id));
    }
}

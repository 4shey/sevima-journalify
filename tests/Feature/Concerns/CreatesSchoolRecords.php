<?php

namespace Tests\Feature\Concerns;

use App\Enums\UserRole;
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
use Illuminate\Support\Str;

trait CreatesSchoolRecords
{
    protected function createCurriculumUser(): User
    {
        return User::factory()->curriculum()->create();
    }

    protected function createTeacher(): Teacher
    {
        $user = User::factory()->create(['role' => UserRole::Teacher]);

        return Teacher::create([
            'user_id' => $user->id,
            'name' => 'Guru '.Str::upper(Str::random(6)),
            'code' => 'GUR-'.Str::upper(Str::random(8)),
        ]);
    }

    protected function createMajor(): Major
    {
        return Major::create(['name' => 'Jurusan-'.Str::upper(Str::random(8))]);
    }

    protected function createClassroom(?Major $major = null, string $grade = 'X'): Classroom
    {
        return Classroom::create([
            'grade' => $grade,
            'major_id' => ($major ?? $this->createMajor())->id,
        ]);
    }

    protected function createSubject(): Subject
    {
        return Subject::create([
            'name' => 'Mapel '.Str::upper(Str::random(6)),
            'code' => 'MAP-'.Str::upper(Str::random(8)),
        ]);
    }

    protected function createPeriod(
        int $order,
        string $startTime = '07:00:00',
        string $endTime = '07:50:00',
    ): Period {
        return Period::create([
            'order' => $order,
            'start_time' => $startTime,
            'end_time' => $endTime,
        ]);
    }

    protected function createSchedule(string $activeDate): Schedule
    {
        return Schedule::create([
            'name' => 'Jadwal '.Str::upper(Str::random(6)),
            'active_date' => $activeDate,
        ]);
    }

    protected function createScheduleDetail(
        Schedule $schedule,
        Teacher $teacher,
        Classroom $classroom,
        Subject $subject,
        Period $startPeriod,
        Period $endPeriod,
        string $day = 'Monday',
    ): ScheduleDetail {
        return ScheduleDetail::create([
            'schedule_id' => $schedule->id,
            'subject_id' => $subject->id,
            'class_id' => $classroom->id,
            'teacher_id' => $teacher->id,
            'day' => $day,
            'start_period_id' => $startPeriod->id,
            'end_period_id' => $endPeriod->id,
        ]);
    }

    protected function createStudent(Classroom $classroom, int $attendanceNumber = 1): Student
    {
        return Student::create([
            'name' => 'Siswa '.Str::upper(Str::random(6)),
            'class_id' => $classroom->id,
            'attendance_number' => $attendanceNumber,
        ]);
    }

    protected function createJournal(ScheduleDetail $detail, string $date, string $name = 'Jurnal Pembelajaran'): Journal
    {
        return Journal::create([
            'name' => $name,
            'date' => $date,
            'schedule_detail_id' => $detail->id,
        ]);
    }
}

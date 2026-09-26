<?php

namespace Tests\Feature\Teacher;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\Feature\Concerns\CreatesSchoolRecords;
use Tests\TestCase;

class ScheduleTest extends TestCase
{
    use CreatesSchoolRecords;
    use RefreshDatabase;

    public function test_teacher_sees_only_the_effective_schedule_slots_they_teach(): void
    {
        $teacher = $this->createTeacher();
        $otherTeacher = $this->createTeacher();
        $classroom = $this->createClassroom();
        $subject = $this->createSubject();
        $firstStart = $this->createPeriod(1);
        $firstEnd = $this->createPeriod(2, '07:50:00', '08:40:00');
        $secondStart = $this->createPeriod(3, '08:40:00', '09:30:00');
        $secondEnd = $this->createPeriod(4, '09:30:00', '10:20:00');
        $oldSchedule = $this->createSchedule('2026-09-21');
        $activeSchedule = $this->createSchedule('2026-09-28');
        $this->createScheduleDetail($oldSchedule, $teacher, $classroom, $subject, $firstStart, $firstEnd);
        $activeDetail = $this->createScheduleDetail($activeSchedule, $teacher, $classroom, $subject, $secondStart, $secondEnd);
        $this->createScheduleDetail($activeSchedule, $otherTeacher, $this->createClassroom(), $subject, $firstStart, $firstEnd);
        $student = $this->createStudent($classroom);

        Cache::put('simulated_time', '2026-09-29 07:00:00');

        try {
            $response = $this->actingAs($teacher->user)
                ->get(route('teacher.schedule'));
        } finally {
            Cache::forget('simulated_time');
        }

        $response->assertInertia(fn (Assert $page) => $page
            ->where('schedule.id', $activeSchedule->id)
            ->where('today', '2026-09-29')
            ->where('weekday', 'Tuesday')
            ->has('details', 1)
            ->where('details.0.id', $activeDetail->id)
            ->has('students', 1)
            ->where('students.0.id', $student->id));
    }

    public function test_teacher_schedule_is_empty_when_no_schedule_is_active(): void
    {
        $teacher = $this->createTeacher();
        $classroom = $this->createClassroom();
        $subject = $this->createSubject();
        $startPeriod = $this->createPeriod(1);
        $endPeriod = $this->createPeriod(2, '07:50:00', '08:40:00');
        $schedule = $this->createSchedule('2026-09-28');
        $this->createScheduleDetail($schedule, $teacher, $classroom, $subject, $startPeriod, $endPeriod);

        Cache::put('simulated_time', '2026-09-27 07:00:00');

        try {
            $response = $this->actingAs($teacher->user)
                ->get(route('teacher.schedule'));
        } finally {
            Cache::forget('simulated_time');
        }

        $response->assertInertia(fn (Assert $page) => $page
            ->where('schedule', null)
            ->has('details', 0)
            ->has('students', 0));
    }
}

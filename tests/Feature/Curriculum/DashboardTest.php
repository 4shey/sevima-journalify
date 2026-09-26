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
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_counts_attendance_for_the_simulated_week_only(): void
    {
        $curriculumUser = User::factory()->curriculum()->create();
        $major = Major::create(['name' => 'Teknik Komputer']);
        $classroom = Classroom::create([
            'grade' => 'X',
            'major_id' => $major->id,
        ]);
        $student = Student::create([
            'class_id' => $classroom->id,
            'name' => 'Budi Santoso',
            'attendance_number' => 1,
        ]);

        $teacherUser = User::factory()->create(['role' => 'teacher']);
        $teacher = Teacher::create([
            'user_id' => $teacherUser->id,
            'name' => 'Guru IPA',
            'code' => 'GUR-DASHBOARD',
        ]);
        $subject = Subject::create(['name' => 'Fisika', 'code' => 'FIS']);
        $startPeriod = Period::create([
            'order' => 1,
            'start_time' => '07:00:00',
            'end_time' => '08:00:00',
        ]);
        $endPeriod = Period::create([
            'order' => 2,
            'start_time' => '08:00:00',
            'end_time' => '09:00:00',
        ]);
        $schedule = Schedule::create([
            'name' => 'Jadwal Utama',
            'active_date' => '2026-09-21',
        ]);
        $scheduleDetail = ScheduleDetail::create([
            'schedule_id' => $schedule->id,
            'class_id' => $classroom->id,
            'subject_id' => $subject->id,
            'teacher_id' => $teacher->id,
            'day' => 'Monday',
            'start_period_id' => $startPeriod->id,
            'end_period_id' => $endPeriod->id,
        ]);

        foreach (
            [
                ['2026-09-21', 'H'],
                ['2026-09-22', 'A'],
                ['2026-09-23', 'I'],
                ['2026-09-24', 'S'],
                ['2026-09-20', 'A'],
                ['2026-09-27', 'A'],
                ['2026-09-28', 'A'],
            ] as [$date, $status]
        ) {
            $journal = Journal::create([
                'name' => 'Jurnal Fisika',
                'date' => $date,
                'schedule_detail_id' => $scheduleDetail->id,
            ]);

            Attendance::create([
                'journal_id' => $journal->id,
                'student_id' => $student->id,
                'status' => $status,
            ]);
        }

        Cache::forget('simulated_time');
        Cache::put('simulated_time', '2026-09-24 12:00:00');

        try {
            $response = $this->actingAs($curriculumUser)
                ->get(route('curriculum.dashboard'));
        } finally {
            Cache::forget('simulated_time');
        }

        $response->assertInertia(fn (Assert $page) => $page
            ->where('totalStudents', 1)
            ->where('week.start', '2026-09-21')
            ->where('week.end', '2026-09-27')
            ->where('totals.hadir', 1)
            ->where('totals.alpha', 2)
            ->where('totals.izin', 1)
            ->where('totals.sakit', 1)
            ->where('chartData.1.alpha', 1)
            ->where('chartData.6.alpha', 1));
    }
}

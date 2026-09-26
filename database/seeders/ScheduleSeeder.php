<?php

namespace Database\Seeders;

use App\Models\Classroom;
use App\Models\Period;
use App\Models\Schedule;
use App\Models\ScheduleDetail;
use App\Models\Subject;
use App\Models\Teacher;
use Illuminate\Database\Seeder;

class ScheduleSeeder extends Seeder
{
    public function run(): void
    {
        $schedule = Schedule::create([
            'name' => 'Jadwal Utama Semester Ganjil 2026/2027',
            'active_date' => '2026-09-21',
        ]);

        $days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        $periods = Period::orderBy('order')->get()->keyBy('order');
        $class1 = Classroom::where('grade', 'X')->firstOrFail();
        $class2 = Classroom::where('grade', 'XI')->firstOrFail();
        $subjects = Subject::orderBy('code')->get();
        $teacher1 = Teacher::where('code', 'GUR-001')->firstOrFail();
        $teacher2 = Teacher::where('code', 'GUR-002')->firstOrFail();

        $subjectIdx = 0;

        foreach ($days as $day) {
            ScheduleDetail::create([
                'schedule_id' => $schedule->id,
                'class_id' => $class1->id,
                'day' => $day,
                'start_period_id' => $periods[1]->id,
                'end_period_id' => $periods[2]->id,
                'subject_id' => $subjects[$subjectIdx % $subjects->count()]->id,
                'teacher_id' => $teacher1->id,
            ]);
            $subjectIdx++;

            ScheduleDetail::create([
                'schedule_id' => $schedule->id,
                'class_id' => $class2->id,
                'day' => $day,
                'start_period_id' => $periods[1]->id,
                'end_period_id' => $periods[2]->id,
                'subject_id' => $subjects[$subjectIdx % $subjects->count()]->id,
                'teacher_id' => $teacher2->id,
            ]);
            $subjectIdx++;

            ScheduleDetail::create([
                'schedule_id' => $schedule->id,
                'class_id' => $class1->id,
                'day' => $day,
                'start_period_id' => $periods[3]->id,
                'end_period_id' => $periods[4]->id,
                'subject_id' => $subjects[$subjectIdx % $subjects->count()]->id,
                'teacher_id' => $teacher2->id,
            ]);
            $subjectIdx++;

            ScheduleDetail::create([
                'schedule_id' => $schedule->id,
                'class_id' => $class2->id,
                'day' => $day,
                'start_period_id' => $periods[3]->id,
                'end_period_id' => $periods[4]->id,
                'subject_id' => $subjects[$subjectIdx % $subjects->count()]->id,
                'teacher_id' => $teacher1->id,
            ]);
            $subjectIdx++;
        }
    }
}

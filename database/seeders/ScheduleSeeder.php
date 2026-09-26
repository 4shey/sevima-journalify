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
    /**
     * Seed one schedule with details covering every class, weekday and five teaching slots.
     */
    public function run(): void
    {
        $schedule = Schedule::create([
            'name' => 'Jadwal Ganjil 2026/2027',
            'active_date' => '2026-07-01',
        ]);

        $days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        $slots = [[1, 2], [3, 4], [5, 6], [8, 9], [10, 11]];

        $periods = Period::orderBy('order')->get()->keyBy('order');
        $classrooms = Classroom::orderBy('grade')->get();
        $subjects = Subject::orderBy('code')->get();
        $teachers = Teacher::orderBy('code')->get();

        foreach ($classrooms as $classIndex => $classroom) {
            foreach ($days as $dayIndex => $day) {
                foreach ($slots as $slotIndex => [$startOrder, $endOrder]) {
                    $rotation = ($classIndex + $dayIndex + $slotIndex);

                    ScheduleDetail::create([
                        'schedule_id' => $schedule->id,
                        'class_id' => $classroom->id,
                        'day' => $day,
                        'start_period_id' => $periods[$startOrder]->id,
                        'end_period_id' => $periods[$endOrder]->id,
                        'subject_id' => $subjects[$rotation % $subjects->count()]->id,
                        'teacher_id' => $teachers[$rotation % $teachers->count()]->id,
                    ]);
                }
            }
        }
    }
}

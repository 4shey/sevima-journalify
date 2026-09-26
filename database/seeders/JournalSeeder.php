<?php

namespace Database\Seeders;

use App\Models\Attendance;
use App\Models\Journal;
use App\Models\ScheduleDetail;
use App\Models\Student;
use Illuminate\Database\Seeder;

class JournalSeeder extends Seeder
{
    public function run(): void
    {
        $dates = [
            'Monday' => '2026-09-21',
            'Tuesday' => '2026-09-22',
            'Wednesday' => '2026-09-23',
            'Thursday' => '2026-09-24',
            'Friday' => '2026-09-25',
        ];

        $details = ScheduleDetail::with(['subject', 'classroom'])->get();

        foreach ($details as $detail) {
            $date = $dates[$detail->day] ?? '2026-09-21';

            $journal = Journal::create([
                'name' => 'Pembelajaran '.($detail->subject?->name ?? 'Mapel'),
                'date' => $date,
                'schedule_detail_id' => $detail->id,
            ]);

            $students = Student::where('class_id', $detail->class_id)->get();

            foreach ($students as $student) {
                $status = 'H';
                if ($student->attendance_number == 5) {
                    $status = 'I';
                } elseif ($student->attendance_number == 9) {
                    $status = 'S';
                } elseif ($student->attendance_number == 10 && $detail->day === 'Friday') {
                    $status = 'A';
                }

                Attendance::create([
                    'journal_id' => $journal->id,
                    'student_id' => $student->id,
                    'status' => $status,
                ]);
            }
        }
    }
}

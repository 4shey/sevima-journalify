<?php

namespace Database\Seeders;

use App\Models\Classroom;
use App\Models\Student;
use Illuminate\Database\Seeder;

class StudentSeeder extends Seeder
{
    /**
     * Seed five students spread over the seeded classrooms.
     */
    public function run(): void
    {
        $findClassroom = fn (string $major, string $grade): Classroom => Classroom::query()
            ->whereHas('major', fn ($query) => $query->where('name', $major))
            ->where('grade', $grade)
            ->firstOrFail();

        $students = [
            ['name' => 'Agus Salim', 'classroom' => $findClassroom('RPL', 'X'), 'attendance_number' => 1],
            ['name' => 'Dewi Lestari', 'classroom' => $findClassroom('RPL', 'X'), 'attendance_number' => 2],
            ['name' => 'Rizky Ramadhan', 'classroom' => $findClassroom('RPL', 'XI'), 'attendance_number' => 1],
            ['name' => 'Putri Amelia', 'classroom' => $findClassroom('DKV', 'X'), 'attendance_number' => 1],
            ['name' => 'Joko Susilo', 'classroom' => $findClassroom('DKV', 'XI'), 'attendance_number' => 1],
        ];

        foreach ($students as $student) {
            Student::create([
                'name' => $student['name'],
                'class_id' => $student['classroom']->id,
                'attendance_number' => $student['attendance_number'],
            ]);
        }
    }
}

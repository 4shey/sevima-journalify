<?php

namespace Database\Seeders;

use App\Models\Classroom;
use App\Models\Student;
use Illuminate\Database\Seeder;

class StudentSeeder extends Seeder
{
    public function run(): void
    {
        $class1 = Classroom::where('grade', 'X')->firstOrFail();
        $class2 = Classroom::where('grade', 'XI')->firstOrFail();

        $studentsClass1 = [
            'Andi Pratama', 'Budi Kurniawan', 'Citra Dewi', 'Doni Saputra', 'Eka Rahmawati',
            'Fajar Hidayat', 'Gita Lestari', 'Hendra Wijaya', 'Indah Permata', 'Joko Widodo',
        ];

        foreach ($studentsClass1 as $index => $name) {
            Student::create([
                'class_id' => $class1->id,
                'name' => $name,
                'attendance_number' => $index + 1,
            ]);
        }

        $studentsClass2 = [
            'Kevin Sanjaya', 'Lilis Suryani', 'Muhammad Rizky', 'Nadia Putri', 'Octavio Ramadhan',
            'Putu Ayu', 'Qori Ahmad', 'Rian Ardianto', 'Sinta Nurhaliza', 'Taufik Hidayat',
        ];

        foreach ($studentsClass2 as $index => $name) {
            Student::create([
                'class_id' => $class2->id,
                'name' => $name,
                'attendance_number' => $index + 1,
            ]);
        }
    }
}

<?php

namespace Database\Seeders;

use App\Models\Classroom;
use App\Models\Major;
use Illuminate\Database\Seeder;

class ClassSeeder extends Seeder
{
    public function run(): void
    {
        $rpl = Major::where('name', 'RPL')->first() ?? Major::create(['name' => 'RPL']);

        $classrooms = [
            ['major_id' => $rpl->id, 'grade' => 'X'],
            ['major_id' => $rpl->id, 'grade' => 'XI'],
        ];

        foreach ($classrooms as $classroom) {
            Classroom::create($classroom);
        }
    }
}

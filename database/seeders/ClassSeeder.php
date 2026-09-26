<?php

namespace Database\Seeders;

use App\Models\Classroom;
use App\Models\Major;
use Illuminate\Database\Seeder;

class ClassSeeder extends Seeder
{
    /**
     * Seed five classrooms across the fixed majors.
     */
    public function run(): void
    {
        $rpl = Major::where('name', 'RPL')->firstOrFail();
        $dkv = Major::where('name', 'DKV')->firstOrFail();

        $classrooms = [
            ['major_id' => $rpl->id, 'grade' => 'X'],
            ['major_id' => $rpl->id, 'grade' => 'XI'],
            ['major_id' => $rpl->id, 'grade' => 'XII'],
            ['major_id' => $dkv->id, 'grade' => 'X'],
            ['major_id' => $dkv->id, 'grade' => 'XI'],
        ];

        foreach ($classrooms as $classroom) {
            Classroom::create($classroom);
        }
    }
}

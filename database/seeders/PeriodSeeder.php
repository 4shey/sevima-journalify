<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Period;

class PeriodSeeder extends Seeder
{
    public function run(): void
    {
        Period::create([
            'order' => 1,
            'start_time' => '07:00:00',
            'end_time' => '07:40:00',
        ]);
        Period::create([
            'order' => 2,
            'start_time' => '07:40:00',
            'end_time' => '08:20:00',
        ]);
        Period::create([
            'order' => 3,
            'start_time' => '08:20:00',
            'end_time' => '09:00:00',
        ]);
        Period::create([
            'order' => 4,
            'start_time' => '09:00:00',
            'end_time' => '09:40:00',
        ]);
        Period::create([
            'order' => 5,
            'start_time' => '10:00:00',
            'end_time' => '10:40:00',
        ]);
        Period::create([
            'order' => 6,
            'start_time' => '10:40:00',
            'end_time' => '11:20:00',
        ]);
        Period::create([
            'order' => 7,
            'start_time' => '11:20:00',
            'end_time' => '12:00:00',
        ]);
        Period::create([
            'order' => 8,
            'start_time' => '12:30:00',
            'end_time' => '13:10:00',
        ]);
        Period::create([
            'order' => 9,
            'start_time' => '13:10:00',
            'end_time' => '13:50:00',
        ]);
        Period::create([
            'order' => 10,
            'start_time' => '13:50:00',
            'end_time' => '14:30:00',
        ]);
        Period::create([
            'order' => 11,
            'start_time' => '14:30:00',
            'end_time' => '15:10:00',
        ]);
    }
}

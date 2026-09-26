<?php

namespace Database\Seeders;

use App\Models\Major;
use Illuminate\Database\Seeder;

class MajorSeeder extends Seeder
{
    /**
     * Seed the fixed (system) majors: RPL and DKV.
     */
    public function run(): void
    {
        Major::create(['name' => 'RPL']);
        Major::create(['name' => 'DKV']);
    }
}

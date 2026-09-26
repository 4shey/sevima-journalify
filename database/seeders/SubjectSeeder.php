<?php

namespace Database\Seeders;

use App\Models\Subject;
use Illuminate\Database\Seeder;

class SubjectSeeder extends Seeder
{
    /**
     * Seed five subjects.
     */
    public function run(): void
    {
        $subjects = [
            ['name' => 'Matematika', 'code' => 'MTK'],
            ['name' => 'Bahasa Indonesia', 'code' => 'BIND'],
            ['name' => 'Bahasa Inggris', 'code' => 'BING'],
            ['name' => 'Dasar Pemrograman', 'code' => 'DPM'],
            ['name' => 'Dasar Desain Grafis', 'code' => 'DDG'],
        ];

        foreach ($subjects as $subject) {
            Subject::create($subject);
        }
    }
}

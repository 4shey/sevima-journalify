<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\Curriculum;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $curriculumUser = User::create([
            'email' => 'kurikulum@journalify.test',
            'password' => 'password',
            'role' => UserRole::Curriculum,
        ]);

        Curriculum::create([
            'user_id' => $curriculumUser->id,
            'name' => 'Tim Kurikulum',
        ]);

        $teachers = [
            ['email' => 'budi@journalify.test', 'name' => 'Budi Santoso', 'code' => 'GUR-001'],
            ['email' => 'siti@journalify.test', 'name' => 'Siti Aminah', 'code' => 'GUR-002'],
        ];

        foreach ($teachers as $teacher) {
            $user = User::create([
                'email' => $teacher['email'],
                'password' => 'password',
                'role' => UserRole::Teacher,
            ]);

            Teacher::create([
                'user_id' => $user->id,
                'name' => $teacher['name'],
                'code' => $teacher['code'],
            ]);
        }

        $this->call([
            MajorSeeder::class,
            ClassSeeder::class,
            SubjectSeeder::class,
            StudentSeeder::class,
            PeriodSeeder::class,
            ScheduleSeeder::class,
            JournalSeeder::class,
        ]);
    }
}

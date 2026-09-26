<?php

namespace Tests\Feature\Curriculum\Management;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\Feature\Concerns\CreatesSchoolRecords;
use Tests\TestCase;

class ScheduleTest extends TestCase
{
    use CreatesSchoolRecords;
    use RefreshDatabase;

    public function test_curriculum_user_can_create_schedule_with_details(): void
    {
        $curriculumUser = $this->createCurriculumUser();
        $teacher = $this->createTeacher();
        $classroom = $this->createClassroom();
        $subject = $this->createSubject();
        $startPeriod = $this->createPeriod(1);
        $endPeriod = $this->createPeriod(2, '07:50:00', '08:40:00');

        $response = $this->actingAs($curriculumUser)
            ->post(route('curriculum.management.schedules.store'), [
                'name' => 'Jadwal Semester Ganjil',
                'active_date' => '2026-09-28',
                'details' => [[
                    'day' => 'Monday',
                    'class_id' => $classroom->id,
                    'subject_id' => $subject->id,
                    'teacher_id' => $teacher->id,
                    'start_period_id' => $startPeriod->id,
                    'end_period_id' => $endPeriod->id,
                ]],
            ]);

        $response->assertRedirect(route('curriculum.management.schedules'));
        $response->assertSessionHas('flash.success', 'Jadwal berhasil ditambahkan.');
        $this->assertDatabaseHas('schedules', [
            'name' => 'Jadwal Semester Ganjil',
            'active_date' => '2026-09-28',
        ]);
        $this->assertDatabaseHas('schedule_details', [
            'class_id' => $classroom->id,
            'teacher_id' => $teacher->id,
            'day' => 'Monday',
        ]);
    }

    public function test_overlapping_class_slots_are_rejected_without_creating_schedule(): void
    {
        $curriculumUser = $this->createCurriculumUser();
        $teacher = $this->createTeacher();
        $classroom = $this->createClassroom();
        $firstSubject = $this->createSubject();
        $secondSubject = $this->createSubject();
        $firstPeriod = $this->createPeriod(1, '07:00:00', '07:50:00');
        $secondPeriod = $this->createPeriod(2, '07:50:00', '08:40:00');
        $thirdPeriod = $this->createPeriod(3, '08:40:00', '09:30:00');

        $response = $this->actingAs($curriculumUser)
            ->post(route('curriculum.management.schedules.store'), [
                'name' => 'Jadwal Bentrok',
                'active_date' => '2026-09-28',
                'details' => [
                    [
                        'day' => 'Monday',
                        'class_id' => $classroom->id,
                        'subject_id' => $firstSubject->id,
                        'teacher_id' => $teacher->id,
                        'start_period_id' => $firstPeriod->id,
                        'end_period_id' => $secondPeriod->id,
                    ],
                    [
                        'day' => 'Monday',
                        'class_id' => $classroom->id,
                        'subject_id' => $secondSubject->id,
                        'teacher_id' => $teacher->id,
                        'start_period_id' => $secondPeriod->id,
                        'end_period_id' => $thirdPeriod->id,
                    ],
                ],
            ]);

        $response->assertSessionHasErrors('details.1.start_period_id');
        $this->assertDatabaseCount('schedules', 0);
        $this->assertDatabaseCount('schedule_details', 0);
    }

    public function test_teacher_cannot_be_scheduled_in_two_classes_at_the_same_time(): void
    {
        $curriculumUser = $this->createCurriculumUser();
        $teacher = $this->createTeacher();
        $firstClassroom = $this->createClassroom();
        $secondClassroom = $this->createClassroom();
        $firstSubject = $this->createSubject();
        $secondSubject = $this->createSubject();
        $firstPeriod = $this->createPeriod(1, '07:00:00', '07:50:00');
        $secondPeriod = $this->createPeriod(2, '07:50:00', '08:40:00');
        $response = $this->actingAs($curriculumUser)
            ->post(route('curriculum.management.schedules.store'), [
                'name' => 'Jadwal Guru Bentrok',
                'active_date' => '2026-09-28',
                'details' => [
                    [
                        'day' => 'Monday',
                        'class_id' => $firstClassroom->id,
                        'subject_id' => $firstSubject->id,
                        'teacher_id' => $teacher->id,
                        'start_period_id' => $firstPeriod->id,
                        'end_period_id' => $secondPeriod->id,
                    ],
                    [
                        'day' => 'Monday',
                        'class_id' => $secondClassroom->id,
                        'subject_id' => $secondSubject->id,
                        'teacher_id' => $teacher->id,
                        'start_period_id' => $firstPeriod->id,
                        'end_period_id' => $secondPeriod->id,
                    ],
                ],
            ]);

        $response->assertSessionHasErrors('details.1.teacher_id');
        $this->assertDatabaseCount('schedules', 0);
        $this->assertDatabaseCount('schedule_details', 0);
    }

    public function test_curriculum_user_can_view_schedule_index(): void
    {
        $curriculumUser = $this->createCurriculumUser();
        $teacher = $this->createTeacher();
        $classroom = $this->createClassroom();
        $subject = $this->createSubject();
        $startPeriod = $this->createPeriod(1);
        $endPeriod = $this->createPeriod(2, '07:50:00', '08:40:00');
        $schedule = $this->createSchedule('2026-09-28');
        $this->createScheduleDetail($schedule, $teacher, $classroom, $subject, $startPeriod, $endPeriod);

        $this->actingAs($curriculumUser)
            ->get(route('curriculum.management.schedules'))
            ->assertInertia(fn (Assert $page) => $page
                ->has('schedules.data', 1)
                ->where('schedules.data.0.id', $schedule->id)
                ->where('filters.search', ''));
    }

    public function test_schedule_update_replaces_its_details(): void
    {
        $curriculumUser = $this->createCurriculumUser();
        $teacher = $this->createTeacher();
        $classroom = $this->createClassroom();
        $firstSubject = $this->createSubject();
        $secondSubject = $this->createSubject();
        $firstPeriod = $this->createPeriod(1, '07:00:00', '07:50:00');
        $secondPeriod = $this->createPeriod(2, '07:50:00', '08:40:00');
        $thirdPeriod = $this->createPeriod(3, '08:40:00', '09:30:00');
        $fourthPeriod = $this->createPeriod(4, '09:30:00', '10:20:00');
        $schedule = $this->createSchedule('2026-09-28');
        $oldDetail = $this->createScheduleDetail(
            $schedule,
            $teacher,
            $classroom,
            $firstSubject,
            $firstPeriod,
            $secondPeriod,
        );

        $response = $this->actingAs($curriculumUser)
            ->put(route('curriculum.management.schedules.update', $schedule), [
                'name' => 'Jadwal Diperbarui',
                'active_date' => '2026-09-28',
                'details' => [[
                    'day' => 'Tuesday',
                    'class_id' => $classroom->id,
                    'subject_id' => $secondSubject->id,
                    'teacher_id' => $teacher->id,
                    'start_period_id' => $thirdPeriod->id,
                    'end_period_id' => $fourthPeriod->id,
                ]],
            ]);

        $response->assertRedirect(route('curriculum.management.schedules'));
        $this->assertDatabaseHas('schedules', ['id' => $schedule->id, 'name' => 'Jadwal Diperbarui']);
        $this->assertModelMissing($oldDetail);
        $this->assertDatabaseHas('schedule_details', [
            'schedule_id' => $schedule->id,
            'subject_id' => $secondSubject->id,
            'day' => 'Tuesday',
        ]);
        $this->assertDatabaseCount('schedule_details', 1);
    }

    public function test_curriculum_user_can_delete_a_schedule_and_its_details(): void
    {
        $curriculumUser = $this->createCurriculumUser();
        $teacher = $this->createTeacher();
        $classroom = $this->createClassroom();
        $subject = $this->createSubject();
        $startPeriod = $this->createPeriod(1);
        $endPeriod = $this->createPeriod(2, '07:50:00', '08:40:00');
        $schedule = $this->createSchedule('2026-09-28');
        $detail = $this->createScheduleDetail($schedule, $teacher, $classroom, $subject, $startPeriod, $endPeriod);

        $response = $this->actingAs($curriculumUser)
            ->delete(route('curriculum.management.schedules.destroy', $schedule));

        $response->assertRedirect(route('curriculum.management.schedules'));
        $this->assertModelMissing($schedule);
        $this->assertModelMissing($detail);
    }
}

<?php

namespace Tests\Feature\Curriculum\Management;

use App\Models\Student;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\Feature\Concerns\CreatesSchoolRecords;
use Tests\TestCase;

class StudentTest extends TestCase
{
    use CreatesSchoolRecords;
    use RefreshDatabase;

    public function test_curriculum_user_can_create_a_student(): void
    {
        $curriculumUser = $this->createCurriculumUser();
        $classroom = $this->createClassroom();

        $response = $this->actingAs($curriculumUser)
            ->post(route('curriculum.management.students.store'), [
                'name' => 'Budi Santoso',
                'class_id' => $classroom->id,
                'attendance_number' => 1,
            ]);

        $response->assertRedirect(route('curriculum.management.students'));
        $response->assertSessionHas('flash.success', 'Siswa berhasil ditambahkan.');
        $this->assertDatabaseHas('students', [
            'name' => 'Budi Santoso',
            'class_id' => $classroom->id,
            'attendance_number' => 1,
        ]);
    }

    public function test_attendance_number_must_be_unique_within_a_class(): void
    {
        $curriculumUser = $this->createCurriculumUser();
        $classroom = $this->createClassroom();
        $this->createStudent($classroom, 1);

        $response = $this->actingAs($curriculumUser)
            ->post(route('curriculum.management.students.store'), [
                'name' => 'Siswa Duplikat',
                'class_id' => $classroom->id,
                'attendance_number' => 1,
            ]);

        $response->assertSessionHasErrors('attendance_number');
        $this->assertDatabaseCount('students', 1);
    }

    public function test_curriculum_user_can_update_and_delete_a_student(): void
    {
        $curriculumUser = $this->createCurriculumUser();
        $classroom = $this->createClassroom();
        $student = $this->createStudent($classroom);

        $updateResponse = $this->actingAs($curriculumUser)
            ->put(route('curriculum.management.students.update', $student), [
                'name' => 'Siswa Diperbarui',
                'class_id' => $classroom->id,
                'attendance_number' => 1,
            ]);

        $updateResponse->assertRedirect(route('curriculum.management.students'));
        $this->assertDatabaseHas('students', ['id' => $student->id, 'name' => 'Siswa Diperbarui']);

        $deleteResponse = $this->delete(route('curriculum.management.students.destroy', $student));

        $deleteResponse->assertRedirect(route('curriculum.management.students'));
        $this->assertModelMissing($student);
    }

    public function test_student_search_returns_matching_records(): void
    {
        $curriculumUser = $this->createCurriculumUser();
        $classroom = $this->createClassroom();
        Student::create([
            'name' => 'Dewi Utami',
            'class_id' => $classroom->id,
            'attendance_number' => 1,
        ]);
        Student::create([
            'name' => 'Rudi Hartono',
            'class_id' => $classroom->id,
            'attendance_number' => 2,
        ]);

        $this->actingAs($curriculumUser)
            ->get(route('curriculum.management.students', ['search' => 'Dewi']))
            ->assertInertia(fn (Assert $page) => $page
                ->where('filters.search', 'Dewi')
                ->has('students.data', 1)
                ->where('students.data.0.name', 'Dewi Utami'));
    }
}

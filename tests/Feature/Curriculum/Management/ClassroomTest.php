<?php

namespace Tests\Feature\Curriculum\Management;

use App\Models\Student;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\Feature\Concerns\CreatesSchoolRecords;
use Tests\TestCase;

class ClassroomTest extends TestCase
{
    use CreatesSchoolRecords;
    use RefreshDatabase;

    public function test_curriculum_user_can_create_a_classroom(): void
    {
        $curriculumUser = $this->createCurriculumUser();
        $major = $this->createMajor();

        $response = $this->actingAs($curriculumUser)
            ->post(route('curriculum.management.classes.store'), [
                'major_id' => $major->id,
                'grade' => 'X',
            ]);

        $response->assertRedirect(route('curriculum.management.classes'));
        $response->assertSessionHas('flash.success', 'Kelas berhasil ditambahkan.');
        $this->assertDatabaseHas('classes', ['major_id' => $major->id, 'grade' => 'X']);
    }

    public function test_curriculum_user_can_view_classroom_index(): void
    {
        $curriculumUser = $this->createCurriculumUser();
        $classroom = $this->createClassroom();

        $this->actingAs($curriculumUser)
            ->get(route('curriculum.management.classes'))
            ->assertInertia(fn (Assert $page) => $page
                ->has('classrooms.data', 1)
                ->where('classrooms.data.0.id', $classroom->id)
                ->where('filters.search', ''));
    }

    public function test_classroom_grade_must_be_unique_within_a_major(): void
    {
        $curriculumUser = $this->createCurriculumUser();
        $classroom = $this->createClassroom();

        $response = $this->actingAs($curriculumUser)
            ->post(route('curriculum.management.classes.store'), [
                'major_id' => $classroom->major_id,
                'grade' => $classroom->grade,
            ]);

        $response->assertSessionHasErrors(['grade' => 'Tingkat tersebut sudah ada di jurusan ini.']);
        $this->assertDatabaseCount('classes', 1);
    }

    public function test_curriculum_user_can_update_and_delete_an_empty_classroom(): void
    {
        $curriculumUser = $this->createCurriculumUser();
        $classroom = $this->createClassroom();

        $updateResponse = $this->actingAs($curriculumUser)
            ->put(route('curriculum.management.classes.update', $classroom), [
                'major_id' => $classroom->major_id,
                'grade' => 'XI',
            ]);

        $updateResponse->assertRedirect(route('curriculum.management.classes'));
        $this->assertDatabaseHas('classes', ['id' => $classroom->id, 'grade' => 'XI']);

        $deleteResponse = $this->delete(route('curriculum.management.classes.destroy', $classroom));

        $deleteResponse->assertRedirect(route('curriculum.management.classes'));
        $this->assertModelMissing($classroom);
    }

    public function test_classroom_with_students_cannot_be_deleted(): void
    {
        $curriculumUser = $this->createCurriculumUser();
        $classroom = $this->createClassroom();
        Student::create([
            'class_id' => $classroom->id,
            'name' => 'Siswa Uji',
            'attendance_number' => 1,
        ]);

        $response = $this->actingAs($curriculumUser)
            ->delete(route('curriculum.management.classes.destroy', $classroom));

        $response->assertSessionHas('flash.error', 'Kelas tidak dapat dihapus karena masih memiliki siswa.');
        $this->assertModelExists($classroom);
    }
}

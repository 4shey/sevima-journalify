<?php

namespace Tests\Feature\Curriculum\Management;

use App\Models\Subject;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\Feature\Concerns\CreatesSchoolRecords;
use Tests\TestCase;

class SubjectTest extends TestCase
{
    use CreatesSchoolRecords;
    use RefreshDatabase;

    public function test_curriculum_user_can_create_a_subject(): void
    {
        $curriculumUser = $this->createCurriculumUser();

        $response = $this->actingAs($curriculumUser)
            ->post(route('curriculum.management.subjects.store'), [
                'name' => 'Matematika',
                'code' => 'MTK',
            ]);

        $response->assertRedirect(route('curriculum.management.subjects'));
        $response->assertSessionHas('flash.success', 'Mata pelajaran berhasil ditambahkan.');
        $this->assertDatabaseHas('subjects', ['name' => 'Matematika', 'code' => 'MTK']);
    }

    public function test_subject_search_returns_matching_subjects(): void
    {
        $curriculumUser = $this->createCurriculumUser();
        $subject = Subject::create(['name' => 'Matematika', 'code' => 'MTK']);
        Subject::create(['name' => 'Fisika', 'code' => 'FIS']);

        $this->actingAs($curriculumUser)
            ->get(route('curriculum.management.subjects', ['search' => 'MTK']))
            ->assertInertia(fn (Assert $page) => $page
                ->where('filters.search', 'MTK')
                ->has('subjects.data', 1)
                ->where('subjects.data.0.id', $subject->id));
    }

    public function test_subject_code_must_be_unique(): void
    {
        $curriculumUser = $this->createCurriculumUser();
        Subject::create(['name' => 'Matematika', 'code' => 'MTK']);

        $response = $this->actingAs($curriculumUser)
            ->post(route('curriculum.management.subjects.store'), [
                'name' => 'Matematika Lanjutan',
                'code' => 'MTK',
            ]);

        $response->assertSessionHasErrors('code');
        $this->assertDatabaseCount('subjects', 1);
    }

    public function test_curriculum_user_can_update_and_delete_a_subject(): void
    {
        $curriculumUser = $this->createCurriculumUser();
        $subject = $this->createSubject();

        $updateResponse = $this->actingAs($curriculumUser)
            ->put(route('curriculum.management.subjects.update', $subject), [
                'name' => 'Bahasa Indonesia',
                'code' => $subject->code,
            ]);

        $updateResponse->assertRedirect(route('curriculum.management.subjects'));
        $this->assertDatabaseHas('subjects', ['id' => $subject->id, 'name' => 'Bahasa Indonesia']);

        $deleteResponse = $this->delete(route('curriculum.management.subjects.destroy', $subject));

        $deleteResponse->assertRedirect(route('curriculum.management.subjects'));
        $this->assertModelMissing($subject);
    }
}

<?php

namespace Tests\Feature\Curriculum\Management;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\Feature\Concerns\CreatesSchoolRecords;
use Tests\TestCase;

class TeacherTest extends TestCase
{
    use CreatesSchoolRecords;
    use RefreshDatabase;

    public function test_curriculum_user_creates_teacher_profile_and_login_account(): void
    {
        $curriculumUser = $this->createCurriculumUser();

        $response = $this->actingAs($curriculumUser)
            ->post(route('curriculum.management.teachers.store'), [
                'name' => 'Siti Aminah',
                'code' => 'GUR-100',
                'email' => 'siti@example.test',
                'password' => 'secret123',
            ]);

        $response->assertRedirect(route('curriculum.management.teachers'));
        $response->assertSessionHas('flash.success', 'Guru berhasil ditambahkan.');
        $this->assertDatabaseHas('users', ['email' => 'siti@example.test', 'role' => 'teacher']);
        $this->assertDatabaseHas('teachers', ['name' => 'Siti Aminah', 'code' => 'GUR-100']);
        $this->assertTrue(Hash::check('secret123', User::where('email', 'siti@example.test')->firstOrFail()->password));
    }

    public function test_teacher_search_matches_profile_and_account_email(): void
    {
        $curriculumUser = $this->createCurriculumUser();
        $teacher = $this->createTeacher();

        $this->actingAs($curriculumUser)
            ->get(route('curriculum.management.teachers', ['search' => $teacher->user->email]))
            ->assertInertia(fn (Assert $page) => $page
                ->where('filters.search', $teacher->user->email)
                ->has('teachers.data', 1)
                ->where('teachers.data.0.id', $teacher->id));
    }

    public function test_teacher_update_preserves_password_when_no_new_password_is_submitted(): void
    {
        $curriculumUser = $this->createCurriculumUser();
        $teacher = $this->createTeacher();
        $user = $teacher->user;

        $response = $this->actingAs($curriculumUser)
            ->put(route('curriculum.management.teachers.update', $teacher), [
                'name' => 'Nama Baru',
                'code' => $teacher->code,
                'email' => 'updated@example.test',
                'password' => '',
            ]);

        $response->assertRedirect(route('curriculum.management.teachers'));
        $this->assertDatabaseHas('teachers', ['id' => $teacher->id, 'name' => 'Nama Baru']);
        $this->assertDatabaseHas('users', ['id' => $user->id, 'email' => 'updated@example.test']);
        $this->assertTrue(Hash::check('password', $user->fresh()->password));
    }

    public function test_teacher_code_and_email_must_be_unique(): void
    {
        $curriculumUser = $this->createCurriculumUser();
        $teacher = $this->createTeacher();

        $response = $this->actingAs($curriculumUser)
            ->post(route('curriculum.management.teachers.store'), [
                'name' => 'Guru Duplikat',
                'code' => $teacher->code,
                'email' => $teacher->user->email,
                'password' => 'secret123',
            ]);

        $response->assertSessionHasErrors(['code', 'email']);
        $this->assertDatabaseCount('users', 2);
        $this->assertDatabaseCount('teachers', 1);
    }

    public function test_deleting_teacher_removes_the_login_account_and_profile(): void
    {
        $curriculumUser = $this->createCurriculumUser();
        $teacher = $this->createTeacher();
        $user = $teacher->user;

        $response = $this->actingAs($curriculumUser)
            ->delete(route('curriculum.management.teachers.destroy', $teacher));

        $response->assertRedirect(route('curriculum.management.teachers'));
        $this->assertModelMissing($teacher);
        $this->assertModelMissing($user);
    }
}

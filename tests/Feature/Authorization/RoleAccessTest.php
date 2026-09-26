<?php

namespace Tests\Feature\Authorization;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RoleAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_is_redirected_from_protected_pages_to_login(): void
    {
        $this->get(route('teacher.schedule'))->assertRedirect(route('login'));
        $this->get(route('curriculum.dashboard'))->assertRedirect(route('login'));
    }

    public function test_teacher_cannot_open_curriculum_pages(): void
    {
        $teacher = User::factory()->create(['role' => 'teacher']);

        $this->actingAs($teacher)
            ->get(route('curriculum.dashboard'))
            ->assertForbidden();
    }

    public function test_curriculum_user_cannot_open_teacher_pages(): void
    {
        $curriculumUser = User::factory()->curriculum()->create();

        $this->actingAs($curriculumUser)
            ->get(route('teacher.schedule'))
            ->assertForbidden();
    }

    public function test_root_redirects_authenticated_users_to_their_role_home(): void
    {
        $teacher = User::factory()->create(['role' => 'teacher']);
        $this->actingAs($teacher)->get('/')->assertRedirect(route('teacher.schedule'));

        auth()->logout();

        $curriculumUser = User::factory()->curriculum()->create();
        $this->actingAs($curriculumUser)->get('/')->assertRedirect(route('curriculum.dashboard'));
    }
}

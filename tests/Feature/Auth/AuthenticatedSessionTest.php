<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthenticatedSessionTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_can_view_login_page(): void
    {
        $this->get(route('login'))->assertOk();
    }

    public function test_teacher_login_redirects_to_teacher_schedule(): void
    {
        $user = User::factory()->create([
            'email' => 'guru@example.test',
            'role' => 'teacher',
        ]);

        $response = $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $response->assertRedirect(route('teacher.schedule'));
        $this->assertAuthenticatedAs($user);
    }

    public function test_curriculum_login_redirects_to_curriculum_dashboard(): void
    {
        $user = User::factory()->curriculum()->create([
            'email' => 'kurikulum@example.test',
        ]);

        $response = $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $response->assertRedirect(route('curriculum.dashboard'));
        $this->assertAuthenticatedAs($user);
    }

    public function test_invalid_login_returns_email_error(): void
    {
        User::factory()->create(['email' => 'guru@example.test']);

        $response = $this->from('/login')->post('/login', [
            'email' => 'guru@example.test',
            'password' => 'wrong-password',
        ]);

        $response->assertRedirect('/login');
        $response->assertSessionHasErrors('email');
        $this->assertGuest();
    }

    public function test_logout_invalidates_authenticated_session(): void
    {
        $user = User::factory()->curriculum()->create();
        $this->actingAs($user);

        $response = $this->delete(route('logout'));

        $response->assertRedirect('/');
        $this->assertGuest();
    }

    public function test_guest_visiting_root_is_redirected_to_login(): void
    {
        $this->get('/')->assertRedirect(route('login'));
    }

    public function test_authenticated_curriculum_user_visiting_login_is_redirected_to_dashboard(): void
    {
        $curriculumUser = User::factory()->curriculum()->create();

        $this->actingAs($curriculumUser)
            ->get(route('login'))
            ->assertRedirect(route('curriculum.dashboard'));
    }
}

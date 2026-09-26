<?php

namespace Tests\Feature\Curriculum;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\Feature\Concerns\CreatesSchoolRecords;
use Tests\TestCase;

class TimeSimulationTest extends TestCase
{
    use CreatesSchoolRecords;
    use RefreshDatabase;

    public function test_curriculum_user_can_set_and_reset_simulated_time(): void
    {
        $curriculumUser = $this->createCurriculumUser();

        $this->from(route('curriculum.dashboard'))
            ->actingAs($curriculumUser)
            ->post(route('curriculum.time.update'), [
                'date' => '2026-09-28',
                'time' => '07:30',
            ])
            ->assertRedirect(route('curriculum.dashboard'))
            ->assertSessionHas('flash.success');

        $this->assertSame('2026-09-28 07:30:00', Cache::get('simulated_time'));
        $this->actingAs($curriculumUser)
            ->get(route('curriculum.dashboard'))
            ->assertInertia(fn (Assert $page) => $page
                ->where('simulatedTime.is_set', true)
                ->where('simulatedTime.datetime', '2026-09-28 07:30:00'));

        $this->from(route('curriculum.dashboard'))
            ->delete(route('curriculum.time.reset'))
            ->assertRedirect(route('curriculum.dashboard'))
            ->assertSessionHas('flash.success', 'Waktu simulasi berhasil direset ke waktu asli.');

        $this->assertFalse(Cache::has('simulated_time'));
    }

    public function test_simulated_time_rejects_invalid_date_and_time_formats(): void
    {
        $curriculumUser = $this->createCurriculumUser();

        $response = $this->actingAs($curriculumUser)
            ->post(route('curriculum.time.update'), [
                'date' => '28-09-2026',
                'time' => '7:30',
            ]);

        $response->assertSessionHasErrors(['date', 'time']);
        $this->assertFalse(Cache::has('simulated_time'));
    }
}

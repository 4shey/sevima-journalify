<?php

namespace Tests\Unit;

use App\Enums\UserRole;
use App\Models\User;
use PHPUnit\Framework\TestCase;

class UserRoleTest extends TestCase
{
    public function test_teacher_role_predicates_match_teacher_user(): void
    {
        $user = new User(['role' => UserRole::Teacher]);

        $this->assertTrue($user->isTeacher());
        $this->assertFalse($user->isCurriculum());
    }

    public function test_curriculum_role_predicates_match_curriculum_user(): void
    {
        $user = new User(['role' => UserRole::Curriculum]);

        $this->assertTrue($user->isCurriculum());
        $this->assertFalse($user->isTeacher());
    }
}

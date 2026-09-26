<?php

namespace App\Http\Controllers\Curriculum\Monitoring;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class AttendanceController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('curriculum/monitoring/Attendance');
    }
}

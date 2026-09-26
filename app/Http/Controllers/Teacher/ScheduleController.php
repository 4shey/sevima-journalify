<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Schedule;
use App\Models\Student;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ScheduleController extends Controller
{
    public function index(Request $request): Response
    {
        $teacher = $request->user()->teacher;
        $now = now();
        $today = $now->toDateString();

        $schedule = Schedule::query()
            ->where('active_date', '<=', $today)
            ->orderByDesc('active_date')
            ->first();

        $details = $schedule
            ? $schedule->scheduleDetails()
                ->where('teacher_id', $teacher->id)
                ->with([
                    'subject:id,name,code',
                    'classroom.major:id,name',
                    'startPeriod:id,order,start_time,end_time',
                    'endPeriod:id,order,start_time,end_time',
                    'journal' => fn ($query) => $query->where('date', $today),
                ])
                ->get()
            : collect();

        $classIds = $details->pluck('class_id')->unique()->values();

        return Inertia::render('teacher/Schedule', [
            'schedule' => $schedule?->only(['id', 'name', 'active_date']),
            'today' => $today,
            'weekday' => $now->format('l'),
            'time' => $now->format('H:i:s'),
            'details' => $details,
            'students' => Student::query()
                ->whereIn('class_id', $classIds)
                ->orderBy('attendance_number')
                ->get(['id', 'class_id', 'name', 'attendance_number']),
        ]);
    }
}

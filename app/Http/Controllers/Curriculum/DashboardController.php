<?php

namespace App\Http\Controllers\Curriculum;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Student;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $weekStart = now()->startOfWeek(Carbon::MONDAY);
        $weekEnd = $weekStart->copy()->addDays(6);

        $attendanceByDate = Attendance::query()
            ->join('journals', 'attendances.journal_id', '=', 'journals.id')
            ->whereBetween('journals.date', [
                $weekStart->toDateString(),
                $weekEnd->toDateString(),
            ])
            ->selectRaw('journals.date as attendance_date, attendances.status, COUNT(attendances.id) as total')
            ->groupBy('journals.date', 'attendances.status')
            ->get()
            ->groupBy('attendance_date');

        $chartData = collect(range(0, 6))->map(function (int $offset) use ($weekStart, $attendanceByDate) {
            $date = $weekStart->copy()->addDays($offset);
            $dailyAttendance = $attendanceByDate
                ->get($date->toDateString(), collect())
                ->keyBy('status');

            return [
                'date' => $date->toDateString(),
                'day' => $date->locale('id')->isoFormat('ddd'),
                'hadir' => (int) ($dailyAttendance->get('H')->total ?? 0),
                'alpha' => (int) ($dailyAttendance->get('A')->total ?? 0),
                'izin' => (int) ($dailyAttendance->get('I')->total ?? 0),
                'sakit' => (int) ($dailyAttendance->get('S')->total ?? 0),
            ];
        })->values();

        return Inertia::render('curriculum/Dashboard', [
            'totalStudents' => Student::query()->count(),
            'week' => [
                'start' => $weekStart->toDateString(),
                'end' => $weekEnd->toDateString(),
            ],
            'totals' => [
                'hadir' => $chartData->sum('hadir'),
                'alpha' => $chartData->sum('alpha'),
                'izin' => $chartData->sum('izin'),
                'sakit' => $chartData->sum('sakit'),
            ],
            'chartData' => $chartData,
        ]);
    }
}

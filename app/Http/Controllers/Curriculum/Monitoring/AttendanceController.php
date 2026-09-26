<?php

namespace App\Http\Controllers\Curriculum\Monitoring;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Journal;
use App\Models\ScheduleDetail;
use App\Models\Student;
use App\Support\MonitoringDay;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AttendanceController extends Controller
{
    public function index(Request $request): Response
    {
        $day = MonitoringDay::fromRequest($request);
        $search = trim((string) $request->query('search', ''));

        $classSlots = collect();

        if ($day->schedule) {
            $classSlots = ScheduleDetail::query()
                ->where('schedule_id', $day->schedule->id)
                ->where('day', $day->weekday)
                ->with([
                    'subject:id,name,code',
                    'teacher:id,name,code',
                    'startPeriod:id,order,start_time,end_time',
                    'endPeriod:id,order,start_time,end_time',
                    'journal' => fn ($jq) => $jq->where('date', $day->date)
                        ->with('attendances:id,journal_id,student_id,status'),
                ])
                ->get()
                ->sortBy(fn (ScheduleDetail $detail) => $detail->startPeriod?->order ?? 0)
                ->values();
        }

        $slotsByClass = $classSlots->groupBy('class_id');

        $students = Student::query()
            ->with(['classroom.major:id,name'])
            ->when($search !== '', function ($q) use ($search) {
                $q->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('attendance_number', 'like', "%{$search}%")
                        ->orWhereHas('classroom', function ($cq) use ($search) {
                            $cq->where('grade', 'like', "%{$search}%")
                                ->orWhereHas('major', fn ($mq) => $mq->where('name', 'like', "%{$search}%"));
                        });
                });
            })
            ->orderBy('class_id')
            ->orderBy('attendance_number')
            ->paginate(5)
            ->withQueryString();

        $students->getCollection()->transform(function (Student $student) use ($slotsByClass) {
            $slots = $slotsByClass->get($student->class_id, collect())
                ->sortByDesc(fn (ScheduleDetail $detail) => $detail->startPeriod?->order ?? 0);

            $latestStatus = null;

            foreach ($slots as $slot) {
                $attendance = $slot->journal?->attendances?->firstWhere('student_id', $student->id);

                if ($attendance) {
                    $latestStatus = $attendance->status;
                    break;
                }
            }

            $student->setAttribute('latest_status', $latestStatus);

            return $student;
        });

        return Inertia::render('curriculum/monitoring/Attendance', [
            'students' => $students,
            'classSlots' => $classSlots,
            'activeSchedule' => $day->schedule?->only(['id', 'name', 'active_date']),
            'date' => $day->date,
            'maxDate' => $day->maxDate,
            'weekday' => $day->weekday,
            'filters' => [
                'search' => $search,
                'date' => $day->date,
            ],
        ]);
    }

    public function update(Request $request, Journal $journal): RedirectResponse
    {
        $maxDate = now()->toDateString();

        if ($journal->date > $maxDate) {
            return redirect()->back()->with('flash', [
                'error' => 'Jurnal pada tanggal di masa depan tidak dapat diubah.',
            ]);
        }

        $data = $request->validate([
            'student_id' => ['required', 'uuid', 'exists:students,id'],
            'status' => ['required', 'string', Rule::in(['H', 'A', 'I', 'S'])],
        ], [
            'student_id.required' => 'Siswa wajib dipilih.',
            'student_id.exists' => 'Siswa tidak ditemukan.',
            'status.required' => 'Status presensi wajib dipilih.',
            'status.in' => 'Status presensi tidak valid.',
        ]);

        Attendance::updateOrCreate(
            [
                'journal_id' => $journal->id,
                'student_id' => $data['student_id'],
            ],
            [
                'status' => $data['status'],
            ]
        );

        return redirect()->back()->with('flash', [
            'success' => 'Status presensi siswa berhasil diperbarui.',
        ]);
    }
}

<?php

namespace App\Http\Controllers\Curriculum\Monitoring;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Journal;
use App\Models\ScheduleDetail;
use App\Models\Student;
use App\Models\Teacher;
use App\Support\MonitoringDay;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class JournalController extends Controller
{
    public function index(Request $request): Response
    {
        $day = MonitoringDay::fromRequest($request);
        $search = trim((string) $request->query('search', ''));

        $teachers = Teacher::query()
            ->with([
                'scheduleDetails' => function ($q) use ($day) {
                    if (! $day->schedule) {
                        $q->whereRaw('0 = 1');

                        return;
                    }

                    $q->where('schedule_id', $day->schedule->id)
                        ->where('day', $day->weekday)
                        ->orderByRaw('(select `order` from periods where periods.id = schedule_details.start_period_id)')
                        ->with([
                            'subject:id,name,code',
                            'classroom.major:id,name',
                            'startPeriod:id,order,start_time,end_time',
                            'endPeriod:id,order,start_time,end_time',
                            'journal' => fn ($jq) => $jq->where('date', $day->date)->with('attendances.student:id,name,attendance_number'),
                        ]);
                },
            ])
            ->withCount([
                'scheduleDetails' => function ($q) use ($day) {
                    if (! $day->schedule) {
                        $q->whereRaw('0 = 1');

                        return;
                    }

                    $q->where('schedule_id', $day->schedule->id)
                        ->where('day', $day->weekday);
                },
            ])
            ->when($search !== '', function ($q) use ($search) {
                $q->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('code', 'like', "%{$search}%");
                });
            })
            ->orderBy('code')
            ->paginate(5)
            ->withQueryString();

        $students = Student::query()
            ->orderBy('attendance_number')
            ->get(['id', 'class_id', 'name', 'attendance_number']);

        return Inertia::render('curriculum/monitoring/Journals', [
            'teachers' => $teachers,
            'activeSchedule' => $day->schedule?->only(['id', 'name', 'active_date']),
            'date' => $day->date,
            'maxDate' => $day->maxDate,
            'weekday' => $day->weekday,
            'students' => $students,
            'filters' => [
                'search' => $search,
                'date' => $day->date,
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $maxDate = now()->toDateString();

        $data = $request->validate([
            'schedule_detail_id' => ['required', 'uuid', 'exists:schedule_details,id'],
            'name' => ['required', 'string', 'max:255'],
            'date' => ['required', 'date_format:Y-m-d', 'before_or_equal:'.$maxDate],
            'time' => ['required', 'string'],
            'attendances' => ['required', 'array', 'min:1'],
            'attendances.*.student_id' => ['required', 'uuid', 'exists:students,id'],
            'attendances.*.status' => ['required', 'string', Rule::in(['H', 'A', 'I', 'S'])],
        ], [
            'schedule_detail_id.required' => 'Detail jadwal wajib dipilih.',
            'name.required' => 'Nama jurnal wajib diisi.',
            'date.required' => 'Tanggal jurnal wajib diisi.',
            'date.before_or_equal' => 'Tanggal jurnal tidak boleh melebihi hari ini.',
            'time.required' => 'Jam manual wajib diisi.',
            'attendances.required' => 'Daftar absensi wajib diisi.',
        ]);

        $detail = ScheduleDetail::with(['startPeriod', 'endPeriod', 'classroom'])->findOrFail($data['schedule_detail_id']);
        $day = MonitoringDay::forDate($data['date']);

        if (! $day->schedule || $detail->schedule_id !== $day->schedule->id) {
            return redirect()->back()->with('flash', [
                'error' => 'Detail jadwal tidak berlaku pada tanggal tersebut.',
            ]);
        }

        if ($detail->day !== $day->weekday) {
            return redirect()->back()->with('flash', [
                'error' => 'Slot jadwal tidak sesuai dengan hari pada tanggal yang dipilih.',
            ]);
        }

        $timeInput = trim($data['time']);
        $formattedTime = strlen($timeInput) === 5 ? "{$timeInput}:00" : $timeInput;

        $startTime = $detail->startPeriod->start_time;
        $endTime = $detail->endPeriod->end_time;

        if ($formattedTime < $startTime || $formattedTime > $endTime) {
            $startShow = substr($startTime, 0, 5);
            $endShow = substr($endTime, 0, 5);

            return redirect()->back()->with('flash', [
                'error' => "Jam yang dimasukkan ({$timeInput}) berada di luar jam pelajaran ({$startShow} - {$endShow}).",
            ]);
        }

        if (Journal::where('schedule_detail_id', $detail->id)->where('date', $day->date)->exists()) {
            return redirect()->back()->with('flash', [
                'error' => 'Jurnal untuk jadwal ini pada hari tersebut sudah ada.',
            ]);
        }

        DB::transaction(function () use ($data, $detail, $day) {
            $journal = Journal::create([
                'name' => $data['name'],
                'date' => $day->date,
                'schedule_detail_id' => $detail->id,
            ]);

            foreach ($data['attendances'] as $row) {
                Attendance::create([
                    'journal_id' => $journal->id,
                    'student_id' => $row['student_id'],
                    'status' => $row['status'],
                ]);
            }
        });

        return redirect()->back()->with('flash', [
            'success' => 'Jurnal berhasil dibuat oleh Kurikulum.',
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
            'name' => ['required', 'string', 'max:255'],
            'time' => ['required', 'string'],
            'attendances' => ['required', 'array', 'min:1'],
            'attendances.*.student_id' => ['required', 'uuid', 'exists:students,id'],
            'attendances.*.status' => ['required', 'string', Rule::in(['H', 'A', 'I', 'S'])],
        ], [
            'name.required' => 'Nama jurnal wajib diisi.',
            'time.required' => 'Jam manual wajib diisi.',
            'attendances.required' => 'Daftar absensi wajib diisi.',
        ]);

        $detail = $journal->scheduleDetail()->with(['startPeriod', 'endPeriod'])->firstOrFail();

        $timeInput = trim($data['time']);
        $formattedTime = strlen($timeInput) === 5 ? "{$timeInput}:00" : $timeInput;

        $startTime = $detail->startPeriod->start_time;
        $endTime = $detail->endPeriod->end_time;

        if ($formattedTime < $startTime || $formattedTime > $endTime) {
            $startShow = substr($startTime, 0, 5);
            $endShow = substr($endTime, 0, 5);

            return redirect()->back()->with('flash', [
                'error' => "Jam yang dimasukkan ({$timeInput}) berada di luar jam pelajaran ({$startShow} - {$endShow}).",
            ]);
        }

        DB::transaction(function () use ($journal, $data) {
            $journal->update([
                'name' => $data['name'],
            ]);

            $journal->attendances()->delete();

            foreach ($data['attendances'] as $row) {
                Attendance::create([
                    'journal_id' => $journal->id,
                    'student_id' => $row['student_id'],
                    'status' => $row['status'],
                ]);
            }
        });

        return redirect()->back()->with('flash', [
            'success' => 'Jurnal berhasil diperbarui oleh Kurikulum.',
        ]);
    }

    public function destroy(Journal $journal): RedirectResponse
    {
        if ($journal->date > now()->toDateString()) {
            return redirect()->back()->with('flash', [
                'error' => 'Jurnal pada tanggal di masa depan tidak dapat dihapus.',
            ]);
        }

        $journal->delete();

        return redirect()->back()->with('flash', [
            'success' => 'Jurnal berhasil dihapus.',
        ]);
    }
}

<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Journal;
use App\Models\ScheduleDetail;
use App\Models\Student;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class JournalController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('teacher/Journal');
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'schedule_detail_id' => ['required', 'uuid', 'exists:schedule_details,id'],
            'name' => ['required', 'string', 'max:255'],
            'date' => ['required', 'date'],
            'attendances' => ['required', 'array', 'min:1'],
            'attendances.*.student_id' => ['required', 'uuid', 'exists:students,id'],
            'attendances.*.status' => ['required', 'string', Rule::in(['H', 'A', 'I', 'S'])],
        ], [
            'schedule_detail_id.required' => 'Jadwal wajib dipilih.',
            'schedule_detail_id.exists' => 'Jadwal tidak ditemukan.',
            'name.required' => 'Nama jurnal wajib diisi.',
            'name.max' => 'Nama jurnal maksimal 255 karakter.',
            'date.required' => 'Tanggal wajib diisi.',
            'date.date' => 'Tanggal tidak valid.',
            'attendances.required' => 'Daftar absensi wajib diisi.',
            'attendances.min' => 'Daftar absensi wajib diisi.',
            'attendances.*.student_id.required' => 'Siswa wajib dipilih.',
            'attendances.*.student_id.exists' => 'Siswa tidak ditemukan.',
            'attendances.*.status.required' => 'Status kehadiran wajib dipilih.',
            'attendances.*.status.in' => 'Status kehadiran tidak valid.',
        ], [
            'schedule_detail_id' => 'Jadwal',
            'name' => 'Nama Jurnal',
            'date' => 'Tanggal',
            'attendances.*.student_id' => 'Siswa',
            'attendances.*.status' => 'Status Kehadiran',
        ]);

        $back = route('teacher.schedule');
        $detail = ScheduleDetail::with(['startPeriod', 'endPeriod'])->find($data['schedule_detail_id']);
        $teacher = $request->user()->teacher;

        if (! $detail || $detail->teacher_id !== $teacher->id) {
            return redirect($back)->with('flash', [
                'error' => 'Jurnal hanya dapat dibuat untuk jadwal mengajar Anda sendiri.',
            ]);
        }

        $classStudents = Student::where('class_id', $detail->class_id)->pluck('id');
        $submittedIds = collect($data['attendances'])->pluck('student_id');

        if (
            $submittedIds->duplicates()->isNotEmpty()
            || $classStudents->diff($submittedIds)->isNotEmpty()
            || $submittedIds->diff($classStudents)->isNotEmpty()
        ) {
            return redirect($back)->with('flash', [
                'error' => 'Daftar absensi harus berisi seluruh siswa kelas jadwal ini tepat satu kali.',
            ]);
        }

        $now = now();
        $today = $now->toDateString();
        $date = Carbon::parse($data['date'])->toDateString();

        if ($date !== $today) {
            return redirect($back)->with('flash', [
                'error' => 'Jurnal hanya dapat dibuat pada tanggal jadwal berlangsung.',
            ]);
        }

        if ($detail->day !== $now->format('l')) {
            return redirect($back)->with('flash', [
                'error' => 'Tidak ada jadwal mengajar pada hari ini.',
            ]);
        }

        $time = $now->format('H:i:s');

        if ($time < $detail->startPeriod->start_time || $time > $detail->endPeriod->end_time) {
            return redirect($back)->with('flash', [
                'error' => 'Jurnal hanya dapat dibuat pada jam pelajaran yang berlangsung.',
            ]);
        }

        if (Journal::where('schedule_detail_id', $detail->id)->where('date', $today)->exists()) {
            return redirect($back)->with('flash', [
                'error' => 'Jurnal untuk jadwal ini pada hari tersebut sudah dibuat.',
            ]);
        }

        DB::transaction(function () use ($data, $detail, $today) {
            $journal = Journal::create([
                'name' => $data['name'],
                'date' => $today,
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

        return redirect()->route('teacher.schedule')->with('flash', [
            'success' => 'Jurnal berhasil dibuat.',
        ]);
    }
}

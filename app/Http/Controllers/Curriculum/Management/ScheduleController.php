<?php

namespace App\Http\Controllers\Curriculum\Management;

use App\Http\Controllers\Controller;
use App\Models\Classroom;
use App\Models\Period;
use App\Models\Schedule;
use App\Models\Subject;
use App\Models\Teacher;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class ScheduleController extends Controller
{
    private const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));

        $schedules = Schedule::query()
            ->with([
                'scheduleDetails.subject:id,name,code',
                'scheduleDetails.teacher:id,name,code',
                'scheduleDetails.startPeriod:id,order,start_time,end_time',
                'scheduleDetails.endPeriod:id,order,start_time,end_time',
            ])
            ->withCount('scheduleDetails')
            ->when($search !== '', fn ($query) => $query->where('name', 'like', "%{$search}%"))
            ->orderByDesc('active_date')
            ->paginate(5)
            ->withQueryString();

        return Inertia::render('curriculum/management/Schedules', [
            'schedules' => $schedules,
            'classes' => Classroom::query()
                ->with('major:id,name')
                ->orderBy('grade')
                ->orderBy('major_id')
                ->get(['id', 'major_id', 'grade']),
            'subjects' => Subject::query()->orderBy('name')->get(['id', 'name', 'code']),
            'teachers' => Teacher::query()->orderBy('name')->get(['id', 'name', 'code']),
            'periods' => Period::query()->orderBy('order')->get(),
            'filters' => ['search' => $search],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validateSchedule($request);

        DB::transaction(function () use ($data) {
            $schedule = Schedule::create(Arr::only($data, ['name', 'active_date']));

            foreach ($data['details'] as $detail) {
                $schedule->scheduleDetails()->create($detail);
            }
        });

        return redirect()
            ->route('curriculum.management.schedules')
            ->with('flash', ['success' => 'Jadwal berhasil ditambahkan.']);
    }

    public function update(Request $request, Schedule $schedule): RedirectResponse
    {
        $data = $this->validateSchedule($request, $schedule);

        DB::transaction(function () use ($schedule, $data) {
            $schedule->update(Arr::only($data, ['name', 'active_date']));
            $schedule->scheduleDetails()->delete();

            foreach ($data['details'] as $detail) {
                $schedule->scheduleDetails()->create($detail);
            }
        });

        return redirect()
            ->route('curriculum.management.schedules')
            ->with('flash', ['success' => 'Jadwal berhasil diperbarui.']);
    }

    public function destroy(Schedule $schedule): RedirectResponse
    {
        $schedule->delete();

        return redirect()
            ->route('curriculum.management.schedules')
            ->with('flash', ['success' => 'Jadwal berhasil dihapus.']);
    }

    /**
     * @return array{name: string, active_date: string, details: array<int, array<string, string>>}
     */
    private function validateSchedule(Request $request, ?Schedule $schedule = null): array
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'active_date' => ['required', 'date', Rule::unique('schedules', 'active_date')->ignore($schedule?->id)],
            'details' => ['required', 'array', 'min:1'],
            'details.*.day' => ['required', 'string', Rule::in(self::DAYS)],
            'details.*.class_id' => ['required', 'uuid', 'exists:classes,id'],
            'details.*.subject_id' => ['required', 'uuid', 'exists:subjects,id'],
            'details.*.teacher_id' => ['required', 'uuid', 'exists:teachers,id'],
            'details.*.start_period_id' => ['required', 'uuid', 'exists:periods,id'],
            'details.*.end_period_id' => ['required', 'uuid', 'exists:periods,id'],
        ], [
            'name.required' => 'Nama jadwal wajib diisi.',
            'name.max' => 'Nama jadwal maksimal 255 karakter.',
            'active_date.required' => 'Tanggal aktif wajib diisi.',
            'active_date.date' => 'Tanggal aktif tidak valid.',
            'active_date.unique' => 'Tanggal aktif sudah digunakan oleh jadwal lain.',
            'details.required' => 'Detail jadwal wajib diisi.',
            'details.min' => 'Jadwal minimal memiliki 1 detail.',
            'details.array' => 'Format detail jadwal tidak valid.',
            'details.*.day.required' => 'Hari wajib dipilih.',
            'details.*.day.in' => 'Hari tidak valid.',
            'details.*.class_id.required' => 'Kelas wajib dipilih.',
            'details.*.class_id.uuid' => 'Kelas tidak valid.',
            'details.*.class_id.exists' => 'Kelas tidak ditemukan.',
            'details.*.subject_id.required' => 'Mata pelajaran wajib dipilih.',
            'details.*.subject_id.uuid' => 'Mata pelajaran tidak valid.',
            'details.*.subject_id.exists' => 'Mata pelajaran tidak ditemukan.',
            'details.*.teacher_id.required' => 'Guru wajib dipilih.',
            'details.*.teacher_id.uuid' => 'Guru tidak valid.',
            'details.*.teacher_id.exists' => 'Guru tidak ditemukan.',
            'details.*.start_period_id.required' => 'Jam mulai wajib dipilih.',
            'details.*.start_period_id.uuid' => 'Jam mulai tidak valid.',
            'details.*.start_period_id.exists' => 'Jam mulai tidak ditemukan.',
            'details.*.end_period_id.required' => 'Jam selesai wajib dipilih.',
            'details.*.end_period_id.uuid' => 'Jam selesai tidak valid.',
            'details.*.end_period_id.exists' => 'Jam selesai tidak ditemukan.',
        ], [
            'name' => 'Nama Jadwal',
            'active_date' => 'Tanggal Aktif',
            'details.*.day' => 'Hari',
            'details.*.class_id' => 'Kelas',
            'details.*.subject_id' => 'Mata Pelajaran',
            'details.*.teacher_id' => 'Guru',
            'details.*.start_period_id' => 'Jam Mulai',
            'details.*.end_period_id' => 'Jam Selesai',
        ]);

        $errors = $this->validateDetailRanges($data['details']);

        if ($errors !== []) {
            throw ValidationException::withMessages($errors);
        }

        return $data;
    }

    /**
     * Reject end-before-start and overlapping periods within the same class/day or teacher/day.
     *
     * @param  array<int, array<string, string>>  $details
     * @return array<string, string>
     */
    private function validateDetailRanges(array $details): array
    {
        $orders = Period::query()->pluck('order', 'id');
        $errors = [];
        $classRanges = [];
        $teacherRanges = [];

        foreach ($details as $index => $detail) {
            $start = $orders[$detail['start_period_id']] ?? null;
            $end = $orders[$detail['end_period_id']] ?? null;

            if ($start === null || $end === null) {
                continue;
            }

            if ($end < $start) {
                $errors["details.{$index}.end_period_id"] = 'Jam selesai tidak boleh lebih awal dari jam mulai.';

                continue;
            }

            $classKey = $detail['class_id'].'|'.$detail['day'];

            foreach ($classRanges[$classKey] ?? [] as [$rangeStart, $rangeEnd, $otherIndex]) {
                if ($start <= $rangeEnd && $end >= $rangeStart) {
                    $errors["details.{$index}.start_period_id"] = 'Jadwal bentrok dengan detail ke-'.($otherIndex + 1).' pada hari dan kelas yang sama.';
                    break;
                }
            }

            $classRanges[$classKey][] = [$start, $end, $index];

            $teacherKey = $detail['teacher_id'].'|'.$detail['day'];

            foreach ($teacherRanges[$teacherKey] ?? [] as [$rangeStart, $rangeEnd, $otherIndex]) {
                if ($start <= $rangeEnd && $end >= $rangeStart) {
                    $errors["details.{$index}.teacher_id"] = 'Jadwal guru bentrok dengan detail ke-'.($otherIndex + 1).' pada hari yang sama.';
                    break;
                }
            }

            $teacherRanges[$teacherKey][] = [$start, $end, $index];
        }

        return $errors;
    }
}

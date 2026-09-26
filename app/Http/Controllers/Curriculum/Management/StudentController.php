<?php

namespace App\Http\Controllers\Curriculum\Management;

use App\Http\Controllers\Controller;
use App\Models\Classroom;
use App\Models\Student;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class StudentController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));

        $students = Student::query()
            ->with(['classroom.major'])
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('attendance_number', 'like', "%{$search}%")
                        ->orWhereHas('classroom.major', fn ($query) => $query->where('name', 'like', "%{$search}%"));
                });
            })
            ->orderBy('name')
            ->paginate(5)
            ->withQueryString();

        $classrooms = Classroom::query()
            ->with('major:id,name')
            ->orderBy('grade')
            ->orderBy('major_id')
            ->get(['id', 'major_id', 'grade']);

        return Inertia::render('curriculum/management/Students', [
            'students' => $students,
            'classrooms' => $classrooms,
            'filters' => ['search' => $search],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'class_id' => ['required', 'uuid', 'exists:classes,id'],
            'attendance_number' => [
                'required',
                'integer',
                'min:1',
                'max:65535',
                Rule::unique('students', 'attendance_number')->where('class_id', $request->input('class_id')),
            ],
        ], [
            'name.required' => 'Nama wajib diisi.',
            'class_id.required' => 'Kelas wajib dipilih.',
            'class_id.exists' => 'Kelas tidak ditemukan.',
            'attendance_number.required' => 'Nomor absen wajib diisi.',
            'attendance_number.integer' => 'Nomor absen harus berupa angka.',
            'attendance_number.min' => 'Nomor absen minimal 1.',
            'attendance_number.unique' => 'Nomor absen sudah digunakan di kelas tersebut.',
        ], [
            'name' => 'Nama',
            'class_id' => 'Kelas',
            'attendance_number' => 'Nomor Absen',
        ]);

        Student::create($data);

        return redirect()
            ->route('curriculum.management.students')
            ->with('flash', ['success' => 'Siswa berhasil ditambahkan.']);
    }

    public function update(Request $request, Student $student): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'class_id' => ['required', 'uuid', 'exists:classes,id'],
            'attendance_number' => [
                'required',
                'integer',
                'min:1',
                'max:65535',
                Rule::unique('students', 'attendance_number')
                    ->where('class_id', $request->input('class_id'))
                    ->ignore($student->id),
            ],
        ], [
            'name.required' => 'Nama wajib diisi.',
            'class_id.required' => 'Kelas wajib dipilih.',
            'class_id.exists' => 'Kelas tidak ditemukan.',
            'attendance_number.required' => 'Nomor absen wajib diisi.',
            'attendance_number.integer' => 'Nomor absen harus berupa angka.',
            'attendance_number.min' => 'Nomor absen minimal 1.',
            'attendance_number.unique' => 'Nomor absen sudah digunakan di kelas tersebut.',
        ], [
            'name' => 'Nama',
            'class_id' => 'Kelas',
            'attendance_number' => 'Nomor Absen',
        ]);

        $student->update($data);

        return redirect()
            ->route('curriculum.management.students')
            ->with('flash', ['success' => 'Siswa berhasil diperbarui.']);
    }

    public function destroy(Student $student): RedirectResponse
    {
        $student->delete();

        return redirect()
            ->route('curriculum.management.students')
            ->with('flash', ['success' => 'Siswa berhasil dihapus.']);
    }
}

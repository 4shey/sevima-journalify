<?php

namespace App\Http\Controllers\Curriculum\Management;

use App\Http\Controllers\Controller;
use App\Models\Classroom;
use App\Models\Major;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Unique;
use Inertia\Inertia;
use Inertia\Response;

class ClassroomController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));

        $classrooms = Classroom::query()
            ->with('major:id,name')
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query->where('grade', 'like', "%{$search}%")
                        ->orWhereHas('major', fn ($query) => $query->where('name', 'like', "%{$search}%"));
                });
            })
            ->orderBy('grade')
            ->paginate(5)
            ->withQueryString();

        $majors = Major::query()
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('curriculum/management/Classes', [
            'classrooms' => $classrooms,
            'majors' => $majors,
            'filters' => ['search' => $search],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'major_id' => ['required', 'uuid', 'exists:majors,id'],
            'grade' => ['required', 'string', 'max:10', self::uniqueGradeRule($request)],
        ], [
            'major_id.required' => 'Jurusan wajib dipilih.',
            'major_id.exists' => 'Jurusan tidak ditemukan.',
            'grade.required' => 'Tingkat wajib diisi.',
            'grade.max' => 'Tingkat maksimal 10 karakter.',
            'grade.unique' => 'Tingkat tersebut sudah ada di jurusan ini.',
        ], [
            'major_id' => 'Jurusan',
            'grade' => 'Tingkat',
        ]);

        Classroom::create($data);

        return redirect()
            ->route('curriculum.management.classes')
            ->with('flash', ['success' => 'Kelas berhasil ditambahkan.']);
    }

    public function update(Request $request, Classroom $classroom): RedirectResponse
    {
        $data = $request->validate([
            'major_id' => ['required', 'uuid', 'exists:majors,id'],
            'grade' => [
                'required',
                'string',
                'max:10',
                Rule::unique('classes', 'grade')
                    ->where('major_id', $request->input('major_id'))
                    ->ignore($classroom->id),
            ],
        ], [
            'major_id.required' => 'Jurusan wajib dipilih.',
            'major_id.exists' => 'Jurusan tidak ditemukan.',
            'grade.required' => 'Tingkat wajib diisi.',
            'grade.max' => 'Tingkat maksimal 10 karakter.',
            'grade.unique' => 'Tingkat tersebut sudah ada di jurusan ini.',
        ], [
            'major_id' => 'Jurusan',
            'grade' => 'Tingkat',
        ]);

        $classroom->update($data);

        return redirect()
            ->route('curriculum.management.classes')
            ->with('flash', ['success' => 'Kelas berhasil diperbarui.']);
    }

    public function destroy(Classroom $classroom): RedirectResponse
    {
        if ($classroom->students()->exists()) {
            return redirect()
                ->route('curriculum.management.classes')
                ->with('flash', ['error' => 'Kelas tidak dapat dihapus karena masih memiliki siswa.']);
        }

        $classroom->delete();

        return redirect()
            ->route('curriculum.management.classes')
            ->with('flash', ['success' => 'Kelas berhasil dihapus.']);
    }

    private static function uniqueGradeRule(Request $request): Unique
    {
        return Rule::unique('classes', 'grade')->where('major_id', $request->input('major_id'));
    }
}

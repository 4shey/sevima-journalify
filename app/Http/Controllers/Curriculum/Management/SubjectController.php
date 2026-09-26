<?php

namespace App\Http\Controllers\Curriculum\Management;

use App\Http\Controllers\Controller;
use App\Models\Subject;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class SubjectController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));

        $subjects = Subject::query()
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('code', 'like', "%{$search}%");
                });
            })
            ->orderBy('name')
            ->paginate(5)
            ->withQueryString();

        return Inertia::render('curriculum/management/Subjects', [
            'subjects' => $subjects,
            'filters' => ['search' => $search],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:50', 'unique:subjects,code'],
        ], [
            'name.required' => 'Nama wajib diisi.',
            'code.required' => 'Kode wajib diisi.',
            'code.unique' => 'Kode mata pelajaran sudah digunakan.',
        ], [
            'name' => 'Nama',
            'code' => 'Kode',
        ]);

        Subject::create($data);

        return redirect()
            ->route('curriculum.management.subjects')
            ->with('flash', ['success' => 'Mata pelajaran berhasil ditambahkan.']);
    }

    public function update(Request $request, Subject $subject): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:50', Rule::unique('subjects', 'code')->ignore($subject->id)],
        ], [
            'name.required' => 'Nama wajib diisi.',
            'code.required' => 'Kode wajib diisi.',
            'code.unique' => 'Kode mata pelajaran sudah digunakan.',
        ], [
            'name' => 'Nama',
            'code' => 'Kode',
        ]);

        $subject->update($data);

        return redirect()
            ->route('curriculum.management.subjects')
            ->with('flash', ['success' => 'Mata pelajaran berhasil diperbarui.']);
    }

    public function destroy(Subject $subject): RedirectResponse
    {
        $subject->delete();

        return redirect()
            ->route('curriculum.management.subjects')
            ->with('flash', ['success' => 'Mata pelajaran berhasil dihapus.']);
    }
}

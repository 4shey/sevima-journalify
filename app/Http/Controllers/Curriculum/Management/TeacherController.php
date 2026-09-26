<?php

namespace App\Http\Controllers\Curriculum\Management;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class TeacherController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));

        $teachers = Teacher::query()
            ->with('user:id,email')
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('code', 'like', "%{$search}%")
                        ->orWhereHas('user', fn ($query) => $query->where('email', 'like', "%{$search}%"));
                });
            })
            ->orderBy('name')
            ->paginate(5)
            ->withQueryString();

        return Inertia::render('curriculum/management/Teachers', [
            'teachers' => $teachers,
            'filters' => ['search' => $search],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:50', 'unique:teachers,code'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:6'],
        ], [
            'name.required' => 'Nama wajib diisi.',
            'code.required' => 'Kode wajib diisi.',
            'code.unique' => 'Kode guru sudah digunakan.',
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Email tidak valid.',
            'email.unique' => 'Email sudah digunakan.',
            'password.required' => 'Kata sandi wajib diisi.',
            'password.min' => 'Kata sandi minimal 6 karakter.',
        ], [
            'name' => 'Nama',
            'code' => 'Kode',
            'email' => 'Email',
            'password' => 'Kata Sandi',
        ]);

        DB::transaction(function () use ($data) {
            $user = User::create([
                'email' => $data['email'],
                'password' => $data['password'],
                'role' => UserRole::Teacher,
            ]);

            Teacher::create([
                'user_id' => $user->id,
                'name' => $data['name'],
                'code' => $data['code'],
            ]);
        });

        return redirect()
            ->route('curriculum.management.teachers')
            ->with('flash', ['success' => 'Guru berhasil ditambahkan.']);
    }

    public function update(Request $request, Teacher $teacher): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:50', Rule::unique('teachers', 'code')->ignore($teacher->id)],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($teacher->user_id)],
            'password' => ['nullable', 'string', 'min:6'],
        ], [
            'name.required' => 'Nama wajib diisi.',
            'code.required' => 'Kode wajib diisi.',
            'code.unique' => 'Kode guru sudah digunakan.',
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Email tidak valid.',
            'email.unique' => 'Email sudah digunakan.',
            'password.min' => 'Kata sandi minimal 6 karakter.',
        ], [
            'name' => 'Nama',
            'code' => 'Kode',
            'email' => 'Email',
            'password' => 'Kata Sandi',
        ]);

        DB::transaction(function () use ($teacher, $data) {
            $teacher->update([
                'name' => $data['name'],
                'code' => $data['code'],
            ]);

            $teacher->user->update([
                'email' => $data['email'],
                ...($data['password'] ? ['password' => $data['password']] : []),
            ]);
        });

        return redirect()
            ->route('curriculum.management.teachers')
            ->with('flash', ['success' => 'Guru berhasil diperbarui.']);
    }

    public function destroy(Teacher $teacher): RedirectResponse
    {
        DB::transaction(fn () => $teacher->user->delete());

        return redirect()
            ->route('curriculum.management.teachers')
            ->with('flash', ['success' => 'Guru berhasil dihapus.']);
    }
}

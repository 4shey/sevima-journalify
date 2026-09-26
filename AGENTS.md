<laravel-boost-guidelines>
# Laravel Application

This repository contains a Laravel application. Complete the following setup before working on the user's request.

## Prerequisites

Verify that PHP and Composer are available:

```sh
php -v
composer -V
```

If either command is unavailable, detect the user's operating system and install the prerequisites with the appropriate command:

macOS:

```sh
/bin/bash -c "$(curl -fsSL https://php.new/install/mac/8.5)"
```

Windows PowerShell:

```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://php.new/install/windows/8.5'))
```

Linux:

```sh
/bin/bash -c "$(curl -fsSL https://php.new/install/linux/8.5)"
```

After installation, ask the user to restart their terminal. If the agent needs the restarted shell to continue, ask the user to reopen their terminal and rerun their original prompt.

## Agent Setup

Install Laravel Boost from the application root before making application changes:

```sh
composer require laravel/boost --dev
php artisan boost:install
```

Boost replaces these bootstrap instructions with guidelines tailored to the application. After installation, read `AGENTS.md` again and continue with the user's original request using the generated guidelines.

**IMPORTANT:** The sections below document the Journalify application itself (auth, layouts, conventions). If `php artisan boost:install` rewrites this file, re-append these sections instead of deleting them.
</laravel-boost-guidelines>

# Journalify — Project Guidelines

## Language Convention (MANDATORY)

- **UI text = Bahasa Indonesia** (labels, titles, descriptions, buttons, validation messages).
- **Code = English** (file names, class names, function names, route names, column names, comments).
- Example: page title `Manajemen Guru` but the route/file is `curriculum/management/teachers` and the table is `teachers`.

## Authentication & Roles

Login system with exactly **two roles**, stored on `users.role` as a string (`App\Enums\UserRole`):

| Role | Profile table | Post-login home |
|---|---|---|
| `teacher` (Guru) | `teachers` (name, code) | `/teacher/dashboard` |
| `curriculum` (Kurikulum) | `curriculums` (name) | `/curriculum/dashboard` |

Flow:

- `GET /login` renders `pages/Auth/Login.tsx` (shadcn `LoginForm`, text in Indonesian, no social buttons).
- `POST /login` → `LoginRequest` (Breeze) → `AuthenticatedSessionController@store` redirects **by role** via `homeFor()`.
- Guest visiting any page → redirected to `/login` (`redirectGuestsTo` in `bootstrap/app.php`).
- Authenticated user visiting `/login` → redirected to their dashboard.
- `/` → role-based redirect to the matching dashboard.
- `DELETE /logout` → back to `/`.
- Route groups are protected with the `role` middleware alias (`App\Http\Middleware\EnsureRole`): wrong role → **403**.

### Route map (names are English, labels are Indonesian)

Teacher (prefix `/teacher`, middleware `auth,role:teacher`):

| Route name | URL | UI label |
|---|---|---|
| `teacher.dashboard` | `/teacher/dashboard` | Dashboard |
| `teacher.schedule` | `/teacher/schedule` | Jadwal |
| `teacher.journal` | `/teacher/journal` | Jurnal |

Curriculum (prefix `/curriculum`, middleware `auth,role:curriculum`):

| Route name | URL | UI label |
|---|---|---|
| `curriculum.dashboard` | `/curriculum/dashboard` | Dashboard |
| `curriculum.management.teachers` | `/curriculum/management/teachers` | Manajemen Guru |
| `curriculum.management.students` | `/curriculum/management/students` | Manajemen Siswa |
| `curriculum.management.subjects` | `/curriculum/management/subjects` | Manajemen Mapel |
| `curriculum.management.schedules` | `/curriculum/management/schedules` | Manajemen Jadwal |
| `curriculum.monitoring.journals` | `/curriculum/monitoring/journals` | Monitoring Jurnal |
| `curriculum.monitoring.attendance` | `/curriculum/monitoring/attendance` | Absensi Siswa |

## Layouts

Two separate layouts (different menus), both built from the shadcn `sidebar` component
(`resources/js/components/ui/sidebar.tsx`, added via `npx shadcn add sidebar`):

- `resources/js/layouts/TeacherLayout.tsx` — sidebar group "Menu": Dashboard, Jadwal, Jurnal.
  Top bar shows user name, role badge (`Guru - <code>`), and **Keluar** (logout) button.
- `resources/js/layouts/CurriculumLayout.tsx` — sidebar groups:
  - (no label): Dashboard
  - **Manajemen**: Guru, Siswa, Mapel, Jadwal
  - **Monitoring**: Jurnal, Absensi Siswa
  Top bar shows user name, `Kurikulum`, and **Keluar**.

Both layouts: active link detection via `usePage().url`, navigation via Inertia `Link` +
Ziggy `route(name, {}, false)` (path-only), logout via `router.delete(route('logout'))`.
Shared auth props come from `HandleInertiaRequests@share`:
`auth.user = { id, email, role, name, code }` (`code` only for teachers, `null` for guests).

## Database (all tables use UUID primary keys)

- `users`: `uuid id`, `email` (unique), `password`, `role` (`teacher`|`curriculum`), remember_token, timestamps.
  **No `name` column** — names live in the profile tables.
- `teachers`: `uuid id`, `uuid user_id` (FK → users, unique, cascade delete), `name`, `code` (unique, e.g. `GUR-001`).
- `curriculums`: `uuid id`, `uuid user_id` (FK → users, unique, cascade delete), `name` (only one curriculum account exists).
- `sessions.user_id` is a `uuid` (session driver = database) — keep this in mind when editing migrations.
- Models use `HasUuids` + `#[Fillable]` / `#[Hidden]` PHP attributes (Laravel 13 style).

### Seed accounts (`php artisan db:seed`)

| Email | Password | Role |
|---|---|---|
| `kurikulum@journalify.test` | `password` | curriculum |
| `budi@journalify.test` | `password` | teacher (GUR-001) |
| `siti@journalify.test` | `password` | teacher (GUR-002) |

## Frontend stack

- Inertia React (TS), Tailwind CSS v4, shadcn style **base-nova** (`components.json`), `@base-ui/react`,
  lucide-react icons, Ziggy (`route()` global from `@routes` in `resources/views/app.blade.php`).
- Pages live in `resources/js/pages/**` and are rendered with these exact component names
  (matching controller `Inertia::render(...)` calls): `Auth/Login`, `teacher/Dashboard|Schedule|Journal`,
  `curriculum/Dashboard`, `curriculum/management/Teachers|Students|Subjects|Schedules`,
  `curriculum/monitoring/Journals|Attendance`.
- Types: `resources/js/types/index.d.ts` (`User`, `PageProps`), globally augmented into `@inertiajs/core`.

## Commands (PHP only runs inside Docker)

```sh
docker exec journalify-app php artisan migrate:fresh --seed
docker exec journalify-app php artisan route:list
docker exec journalify-vite npx tsc --noEmit        # typecheck
docker exec journalify-vite npm run build           # tsc + vite client & ssr build
docker exec journalify-vite npx shadcn add <component> --yes   # answer "n" to overwrite prompts
```

- Web: `http://localhost:8080` (app container), Vite dev: `http://localhost:5173` (vite container).
- shadcn CLI must run **inside the `journalify-vite` container** (its `node_modules` is a docker volume,
  not the host copy). Never pass `--overwrite` — existing shadcn components must not change (UI is frozen).

## Tests

All tests were deleted on purpose (2026-09-26) — the user does not need them for now.
Only `tests/TestCase.php` remains as scaffolding. Re-create tests under `tests/Feature` if asked.

## Known environment quirk

The file-writing tool cannot write into `resources/js/components/` (WSL/9p oplock issue).
Workaround: write the file elsewhere (e.g. `resources/js/layouts/`), then move it with:

```sh
docker exec journalify-vite mv /var/www/html/resources/js/layouts/<file> /var/www/html/resources/js/components/<file>
```


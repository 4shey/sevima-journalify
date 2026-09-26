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

Teacher also has `POST /teacher/journals` (`teacher.journals.store`, Simpan Jurnal) —
creates a journal + attendance rows; called from the schedule page dialog only.

Curriculum (prefix `/curriculum`, middleware `auth,role:curriculum`):

| Route name | URL | UI label |
|---|---|---|
| `curriculum.dashboard` | `/curriculum/dashboard` | Dashboard |
| `curriculum.management.teachers` | `/curriculum/management/teachers` | Manajemen Guru |
| `curriculum.management.students` | `/curriculum/management/students` | Manajemen Siswa |
| `curriculum.management.classes` | `/curriculum/management/classes` | Manajemen Kelas |
| `curriculum.management.subjects` | `/curriculum/management/subjects` | Manajemen Mapel |
| `curriculum.management.schedules` | `/curriculum/management/schedules` | Manajemen Jadwal |
| `curriculum.monitoring.journals` | `/curriculum/monitoring/journals` | Monitoring Jurnal |
| `curriculum.monitoring.attendance` | `/curriculum/monitoring/attendance` | Absensi Siswa |

CRUD sub-routes exist for `teachers`, `students`, `subjects`, `classes`, `schedules`
(`POST /curriculum/management/<resource>` → `<name>.store`,
`PUT .../{id}` → `<name>.update`, `DELETE .../{id}` → `<name>.destroy`).
`periods` and `majors` are fixed system data — seeded only, no CRUD routes.

## Layouts

Two separate layouts (different menus), both built from the shadcn `sidebar` component
(`resources/js/components/ui/sidebar.tsx`, added via `npx shadcn add sidebar`):

- `resources/js/layouts/TeacherLayout.tsx` — sidebar group "Menu": Dashboard, Jadwal, Jurnal.
  Top bar shows user name, role badge (`Guru - <code>`), and **Keluar** (logout) button.
- `resources/js/layouts/CurriculumLayout.tsx` — sidebar groups:
  - (no label): Dashboard
  - **Manajemen**: Guru, Siswa, Kelas, Mapel, Jadwal
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
- `majors`: `uuid id`, `name` (unique). **Fixed system data** (seeded: `RPL`, `DKV`) — no CRUD.
- `classes`: `uuid id`, `uuid major_id` (FK → majors, restrict), `grade` (e.g. `X`), unique(`major_id`,`grade`).
  Model is `App\Models\Classroom` with explicit `$table = 'classes'` (never name a model `Class` — reserved word).
- `students`: `uuid id`, `name`, `uuid class_id` (FK → classes, restrict), `attendance_number` (u-small int),
  unique(`class_id`,`attendance_number`).
- `subjects`: `uuid id`, `name`, `code` (unique).
- `periods`: `uuid id`, `order` (unique), `start_time`, `end_time` (time).
  **Fixed system data** — `PeriodSeeder` creates the 11 jam pelajaran (07:00–15:10) — no CRUD.
- `schedules`: `uuid id`, `name`, `active_date` (**unique** — no two schedules may share a start
  date, otherwise the effective-date fetch is ambiguous; validated in Indonesian too).
  Effective dating: the schedule in force on date D is the one with the greatest `active_date` ≤ D
  (so journal lookups can span multiple schedules over time).
- `schedule_details`: `uuid id`, FKs `schedule_id`/`subject_id`/`class_id`/`teacher_id`/`start_period_id`/`end_period_id`
  (**all cascade delete**), `day` (enum `Monday`…`Friday` — English storage, Senin…Jumat in UI),
  unique(`schedule_id`,`class_id`,`day`,`start_period_id`). Controller additionally rejects
  overlapping periods per class/day (error on `details.N.start_period_id`, Indonesian).
  `subjects` is the "lessons" table — schedule details reference `subject_id` directly.
- `journals`: `uuid id`, `name` (filled by the teacher in the form), `date` (occurrence date),
  `uuid schedule_detail_id` (FK → schedule_details, cascade), unique(`schedule_detail_id`,`date`).
  Created **only** via `teacher.journals.store`, only by the owning teacher, only when `now` is
  inside the slot's `start_period`–`end_period` on that date (server-side enforced, Indonesian flash errors).
- `attendances`: `uuid id`, `uuid journal_id` (FK → journals, cascade), `uuid student_id`
  (FK → students, cascade), `status` enum `H`|`A`|`I`|`S` (Hadir/Izin/Sakit/Alpha),
  unique(`journal_id`,`student_id`). The form must submit every student of the detail's class exactly once.
- Restrict FKs: a class that still has students cannot be deleted (controller returns Indonesian flash error).
- `sessions.user_id` is a `uuid` (session driver = database) — keep this in mind when editing migrations.
- Models use `HasUuids` + `#[Fillable]` / `#[Hidden]` PHP attributes (Laravel 13 style).

### Seed data (`php artisan db:seed`)

| Email | Password | Role |
|---|---|---|
| `kurikulum@journalify.test` | `password` | curriculum |
| `budi@journalify.test` | `password` | teacher (GUR-001) |
| `siti@journalify.test` | `password` | teacher (GUR-002) |

Also seeded: 2 majors (RPL, DKV), 5 classes (X/XI/XII RPL, X/XI DKV), 5 students,
5 subjects (Matematika/MTK, Bahasa Indonesia/BIND, Bahasa Inggris/BING,
Dasar Pemrograman/DPM, Dasar Desain Grafis/DDG), 11 periods,
1 schedule (`Jadwal Ganjil 2026/2027`, active since 2026-07-01) with 125 details
(5 classes × 5 weekdays × 5 slots each; slot orders 1-2, 3-4, 5-6, 8-9, 10-11).
No journals/attendances are seeded — journals can only be created live, inside their slot.

## Frontend stack

- Inertia React (TS), Tailwind CSS v4, shadcn style **base-nova** (`components.json`), `@base-ui/react`,
  lucide-react icons, Ziggy (`route()` global from `@routes` in `resources/views/app.blade.php`).
- Pages live in `resources/js/pages/**` and are rendered with these exact component names
  (matching controller `Inertia::render(...)` calls): `Auth/Login`, `teacher/Dashboard|Schedule|Journal`,
  `curriculum/Dashboard`, `curriculum/management/Teachers|Students|Classes|Subjects|Schedules`,
  `curriculum/monitoring/Journals|Attendance`.
- Types: `resources/js/types/index.d.ts` (`User`, `Teacher`, `Student`, `Subject`, `Classroom`,
  `Major`, `Period`, `Schedule`, `ScheduleDetail`, `SchoolDay`, `Paginated<T>`, `Flash`, `PageProps`
  — includes shared `flash`), globally augmented into `@inertiajs/core`.
  **Gotcha:** Laravel 13 serializes relation names with `Str::snake` (`$snakeAttributes = true`) —
  multi-word relations arrive as `schedule_details`, `start_period`, `end_period` in props, while
  PHP relation methods stay camelCase (`scheduleDetails`, `withCount('scheduleDetails')`).
- Shared management components: `resources/js/components/management/` —
  `FlashAlert` (renders shared `flash.success`/`flash.error`), `SearchInput` (300 ms debounce →
  `router.get` with `preserveState, replace, preserveScroll`), `Pagination` (Laravel paginator links),
  `ConfirmDeleteDialog`.
- Management pages follow one pattern: header + **Tambah** button → create/edit `Dialog` (useForm,
  `Field`/`FieldError`, Indonesian messages), `SearchInput`, shadcn `Table` (5 rows/page),
  `Pagination`, trash → confirm dialog. Controllers: search + `paginate(5)->withQueryString()`,
  props `entities`, `filters.search`; success via `->with('flash', ['success'|'error' => ...])`.
- `Schedules` is the exception: one combined dialog creates/updates name, `active_date` and all
  detail rows (nested `details.N.*` errors, replace-all on update). Clicking a list row shows a
  grid below (rows = classes sorted major+grade, cols = Senin…Jumat); a cell with entries opens a
  popup listing them (sorted by `start_period.order`).
- `teacher/Schedule` (no CRUD of schedules): tabs **Jadwal Sekarang** (default) + Senin…Jumat.
  "Jadwal Sekarang" detects in realtime (server `time`/`today`/`weekday` props + client ticking
  clock) whether `now` sits inside a slot; card is clickable → journal dialog only when the slot
  is currently running and no journal exists for today. Day tabs are view-only cards. Journal
  dialog: `name` input + table of the class's students with status `H/I/S/A` selects (default H).

## Commands (PHP only runs inside Docker)

```sh
docker exec journalify-app php artisan migrate:fresh --seed
docker exec journalify-app php artisan route:list
docker exec journalify-vite npx tsc --noEmit        # typecheck
docker exec journalify-vite npm run build           # tsc + vite client & ssr build
docker exec journalify-vite npx shadcn add <component> --yes   # answer "n" to overwrite prompts
```

- Web: `http://localhost:8080` (app container), Vite dev: `http://localhost:5173` (vite container).
- App timezone is **Asia/Jakarta (WIB)** via `APP_TIMEZONE` in `.env` + `config/app.php` —
  all "now"/date logic (schedule detection, journal time-lock) runs in WIB; period times in DB
  are plain `time` strings in WIB.
- shadcn CLI must run **inside the `journalify-vite` container** (its `node_modules` is a docker volume,
  not the host copy). Never pass `--overwrite` — existing shadcn components must not change (UI is frozen).
- If the editor reports `Cannot find module 'cn'` (or any other dependency), the **host** `node_modules`
  is stale (builds use the container volume, the editor resolves from the host copy) — run `npm install`
  in the project root, then restart the TS server.

## Tests

All tests were deleted on purpose (2026-09-26) — the user does not need them for now.
Only `tests/TestCase.php` remains as scaffolding. Re-create tests under `tests/Feature` if asked.

## Known environment quirk

The file-writing tool cannot write into `resources/js/components/` (WSL/9p oplock issue).
Workaround: write the file elsewhere (e.g. `resources/js/layouts/`), then move it with:

```sh
docker exec journalify-vite mv /var/www/html/resources/js/layouts/<file> /var/www/html/resources/js/components/<file>
```


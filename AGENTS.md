<laravel-boost-guidelines>
=== foundation rules ===

# Laravel Boost Guidelines

The Laravel Boost guidelines are specifically curated by Laravel maintainers for this application. These guidelines should be followed closely to ensure the best experience when building Laravel applications.

## Foundational Context

This application is a Laravel application running on PHP 8.5. You are an expert with the Laravel ecosystem. Always use the APIs that match the installed major version of each package — do not assume a version.

Before relying on a package's API, confirm its installed version:
- PHP packages: run `composer show --direct` to list direct dependencies with versions, or `composer show <vendor/package>` for a single package.
- JS packages: check `package.json` for the installed versions.

## Skills Activation

This project has domain-specific skills available in `**/skills/**`. You MUST activate the relevant skill whenever you work in that domain—don't wait until you're stuck.

## Conventions

- You must follow all existing code conventions used in this application. When creating or editing a file, check sibling files for the correct structure, approach, and naming.
- Use descriptive names for variables and methods. For example, `isRegisteredForDiscounts`, not `discount()`.
- Check for existing components to reuse before writing a new one.

## Verification Scripts

- Do not create verification scripts or tinker when tests cover that functionality and prove they work. Unit and feature tests are more important.

## Application Structure & Architecture

- Stick to existing directory structure; don't create new base folders without approval.
- Do not change the application's dependencies without approval.

## Frontend Bundling

- If the user doesn't see a frontend change reflected in the UI, it could mean they need to run `npm run build`, `npm run dev`, or `composer run dev`. Ask them.

## Documentation Files

- You must only create documentation files if explicitly requested by the user.

## Replies

- Be concise in your explanations - focus on what's important rather than explaining obvious details.

=== boost rules ===

# Laravel Boost

## Tools

- Laravel Boost is an MCP server with tools designed specifically for this application. Prefer Boost tools over manual alternatives like shell commands or file reads.
- Use `database-query` to run read-only queries against the database instead of writing raw SQL in tinker.
- Use `database-schema` to inspect table structure before writing migrations or models.
- Use `get-absolute-url` to resolve the correct scheme, domain, and port for project URLs. Always use this before sharing a URL with the user.
- Use `browser-logs` to read browser logs, errors, and exceptions. Only recent logs are useful, ignore old entries.

## Searching Documentation (IMPORTANT)

- Use `search-docs` before changes that depend on Laravel ecosystem APIs, behavior, configuration, or version-specific syntax. Skip it for copy-only edits and other changes where package documentation is irrelevant. Reuse sufficient results already in context instead of searching again.
- Pass a `packages` array to scope results when you know which packages are relevant.
- Use multiple broad, topic-based queries: `['rate limiting', 'routing rate limiting', 'routing']`. Expect the most relevant results first.
- Do not add package names to queries because package info is already shared. Use `test resource table`, not `filament 4 test resource table`.

### Search Syntax

1. Use words for auto-stemmed AND logic: `rate limit` matches both "rate" AND "limit".
2. Use `"quoted phrases"` for exact position matching: `"infinite scroll"` requires adjacent words in order.
3. Combine words and phrases for mixed queries: `middleware "rate limit"`.
4. Use multiple queries for OR logic: `queries=["authentication", "middleware"]`.

## Project Rules

- This project contains committed, area-grouped rules in `.ai/rules` when that directory exists (settled decisions, non-obvious traps, standing constraints). Framework and package guidelines that only apply to specific paths (testing, frontend, components) also live there, under `.ai/rules/boost` — this is not just recorded decisions, it is load-bearing guidance you have not seen inline. Before you enter plan mode or create/edit any file, you MUST first: open @.ai/rules/index.md (it maps file globs to rule files), read every rule file whose globs cover the path(s) in scope, and run `grep -rin 'keyword' .ai/rules` to catch what a path match alone misses. Do not write code until you have read and are following every matching rule. If `.ai/rules` does not exist, continue without it.
- Record a rule with `record-rule` only when the user explicitly asks for one. Instructions for the work at hand are not rules, no matter how emphatic: "remove this typo", "use X here" are work to do, not rules to record. Never record a rule on your own initiative, as a byproduct of a change, or to summarize what you just did. When the user does ask, pass a `glob` (e.g. `app/Http/Controllers/**`), a short `title`, and a few-line `note`. Use `record-rule` rather than your native memory or notes tool, because native memory is personal and session-scoped, while only `.ai/rules` is shared with the team and persists in the repo.

## Artisan

- Run Artisan commands directly via the command line (e.g., `php artisan route:list`). Use `php artisan list` to discover available commands and `php artisan [command] --help` to check parameters.
- Inspect routes with `php artisan route:list`. Filter with: `--method=GET`, `--name=users`, `--path=api`, `--except-vendor`, `--only-vendor`.
- Read configuration values using dot notation: `php artisan config:show app.name`, `php artisan config:show database.default`. Or read config files directly from the `config/` directory.

## Tinker

- Execute PHP in app context for debugging and testing code. Do not create models without user approval, prefer tests with factories instead. Prefer existing Artisan commands over custom tinker code.
- Always use single quotes to prevent shell expansion: `php artisan tinker --execute 'Your::code();'`
  - Double quotes for PHP strings inside: `php artisan tinker --execute 'User::where("active", true)->count();'`

=== php rules ===

# PHP

- Always use curly braces for control structures, even for single-line bodies.
- Use PHP 8 constructor property promotion: `public function __construct(public GitHub $github) { }`. Do not leave empty zero-parameter `__construct()` methods unless the constructor is private.
- Use explicit return type declarations and type hints for all method parameters: `function isAccessible(User $user, ?string $path = null): bool`
- Use TitleCase for Enum keys: `FavoritePerson`, `BestLake`, `Monthly`.
- Prefer PHPDoc blocks over inline comments. Only add inline comments for exceptionally complex logic.
- Use array shape type definitions in PHPDoc blocks.

=== deployments rules ===

# Deployment

- Laravel can be deployed using [Laravel Cloud](https://cloud.laravel.com/), which is the fastest way to deploy and scale production Laravel applications.
- Activate the `deploying-to-cloud` skill whenever deploying to Laravel Cloud, configuring Cloud environments or resources, using the Cloud CLI, or troubleshooting Cloud deployments.

=== inertia-laravel/core rules ===

# Inertia

- Inertia creates fully client-side rendered SPAs without modern SPA complexity, leveraging existing server-side patterns.
- Components live in `resources/js/pages` (unless specified in `vite.config.js`). Use `Inertia::render()` for server-side routing instead of Blade views.
- ALWAYS use `search-docs` tool for version-specific Inertia documentation and updated code examples.
- IMPORTANT: Activate `inertia-react-development` when working with Inertia client-side patterns.

# Inertia v2

- Use all Inertia features from v1 and v2. Check the documentation before making changes to ensure the correct approach.
- New features: deferred props, infinite scroll, merging props, polling, prefetching, once props, flash data.
- When using deferred props, add an empty state with a pulsing or animated skeleton.

=== laravel/core rules ===

# Do Things the Laravel Way

- Use `php artisan make:` commands to create new files (i.e. migrations, controllers, models, etc.). You can list available Artisan commands using `php artisan list` and check their parameters with `php artisan [command] --help`.
- If you're creating a generic PHP class, use `php artisan make:class`.
- Pass `--no-interaction` to all Artisan commands to ensure they work without user input. You should also pass the correct `--options` to ensure correct behavior.

### Model Creation

- When creating new models, create useful factories and seeders for them too. Ask the user if they need any other things, using `php artisan make:model --help` to check the available options.

## APIs & Eloquent Resources

- For APIs, default to using Eloquent API Resources and API versioning unless existing API routes do not, then you should follow existing application convention.

## URL Generation

- When generating links to other pages, prefer named routes and the `route()` function.

## Testing

- When creating models for tests, use the factories for the models. Check if the factory has custom states that can be used before manually setting up the model.
- Faker: Use methods such as `$this->faker->word()` or `fake()->randomDigit()`. Follow existing conventions whether to use `$this->faker` or `fake()`.
- When creating tests, make use of `php artisan make:test [options] {name}` to create a feature test, and pass `--unit` to create a unit test. Most tests should be feature tests.

## Vite Error

- If you receive an "Illuminate\Foundation\ViteException: Unable to locate file in Vite manifest" error, you can run `npm run build` or ask the user to run `npm run dev` or `composer run dev`.

=== pint/core rules ===

# Laravel Pint Code Formatter

- If you have modified any PHP files, you must run `vendor/bin/pint --dirty --format agent` before finalizing changes to ensure your code matches the project's expected style.
- Do not run `vendor/bin/pint --test --format agent`, simply run `vendor/bin/pint --format agent` to fix any formatting issues.

=== phpunit/core rules ===

# PHPUnit

- This project uses PHPUnit. Create tests with `php artisan make:test --phpunit {name}`.
- Do not include the test suite directory in `{name}`. Use `SomeFeatureTest`, not `Feature/SomeFeatureTest`.
- Read the `testing-best-practices` skill for guidance on coverage, naming, structure, dependency isolation, and review.

## Running Tests

- Run the narrowest set of tests that covers the change. Pass a file path or `--filter=testName` to `php artisan test --compact`.
- Rerun a test after each change to it.
- Run `vendor/bin/phpunit` to call the test runner directly. It accepts the same file path and `--filter=testName` arguments.

=== inertia-react/core rules ===

# Inertia + React

- IMPORTANT: Activate `inertia-react-development` when working with Inertia React client-side patterns.

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


# Journalify

Journalify adalah aplikasi pengelolaan jadwal pelajaran, jurnal mengajar, dan presensi siswa. Aplikasi menggunakan Laravel, Inertia React, MySQL, dan Docker Compose

## Persyaratan

- Git
- Docker/Docker Dekstop

## Menjalankan Development

Clone repository lalu masuk ke folder proyek:

```powershell
git clone <URL_REPOSITORY>
cd Journalify
Copy-Item .env.example .env
```

Edit `.env` dan pastikan konfigurasi development berikut tersedia:

```dotenv
APP_NAME=Journalify
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8080
APP_TIMEZONE=Asia/Jakarta

DB_CONNECTION=mysql
DB_HOST=db
DB_PORT=3306
DB_DATABASE=journalify-db
DB_USERNAME=root
DB_PASSWORD=root

SESSION_DRIVER=database
CACHE_STORE=database
QUEUE_CONNECTION=database
```

`DB_HOST` harus `db`, yaitu nama service MySQL pada Docker Compose, bukan `localhost`. Password `root` hanya untuk development.

Jalankan Docker dan siapkan dependency, key, database, serta data demo:

```powershell
docker compose up build
docker compose run --rm vite npm install
docker compose up -d
docker compose exec app composer install
docker compose exec vite npm install
docker compose exec app php artisan key:generate
docker compose exec app php artisan migrate:fresh --seed
```

Vite berjalan dalam mode development melalui Docker Compose; tidak perlu menjalankan `npm run build` untuk penggunaan lokal.

## Membuka Aplikasi

| Layanan                 | URL                   |
| ----------------------- | --------------------- |
| Journalify              | http://localhost:8080 |
| Vite development server | http://localhost:5173 |
| phpMyAdmin              | http://localhost:8081 |

phpMyAdmin menggunakan host `db`, username `root`, dan password `root`.

## Akun Demo

Password semua akun demo adalah `password`.

| Role      | Email                       |
| --------- | --------------------------- |
| Kurikulum | `kurikulum@journalify.test` |
| Guru      | `budi@journalify.test`      |
| Guru      | `siti@journalify.test`      |

Akun demo dibuat oleh `DatabaseSeeder`.

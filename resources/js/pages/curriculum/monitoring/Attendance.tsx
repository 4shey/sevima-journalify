import { Head } from "@inertiajs/react"

import CurriculumLayout from "@/layouts/CurriculumLayout"

export default function Attendance() {
  return (
    <CurriculumLayout>
      <Head title="Absensi Siswa" />
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">Absensi Siswa</h1>
        <p className="text-muted-foreground">
          Monitoring absensi siswa akan ditampilkan di halaman ini.
        </p>
      </div>
    </CurriculumLayout>
  )
}

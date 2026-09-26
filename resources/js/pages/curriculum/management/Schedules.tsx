import { Head } from "@inertiajs/react"

import CurriculumLayout from "@/layouts/CurriculumLayout"

export default function Schedules() {
  return (
    <CurriculumLayout>
      <Head title="Manajemen Jadwal" />
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">
          Manajemen Jadwal
        </h1>
        <p className="text-muted-foreground">
          Data jadwal akan dikelola di halaman ini.
        </p>
      </div>
    </CurriculumLayout>
  )
}

import { Head } from "@inertiajs/react"

import CurriculumLayout from "@/layouts/CurriculumLayout"

export default function Subjects() {
  return (
    <CurriculumLayout>
      <Head title="Manajemen Mapel" />
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">
          Manajemen Mapel
        </h1>
        <p className="text-muted-foreground">
          Data mata pelajaran akan dikelola di halaman ini.
        </p>
      </div>
    </CurriculumLayout>
  )
}

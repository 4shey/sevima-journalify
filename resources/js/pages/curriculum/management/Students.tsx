import { Head } from "@inertiajs/react"

import CurriculumLayout from "@/layouts/CurriculumLayout"

export default function Students() {
  return (
    <CurriculumLayout>
      <Head title="Manajemen Siswa" />
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">
          Manajemen Siswa
        </h1>
        <p className="text-muted-foreground">
          Data siswa akan dikelola di halaman ini.
        </p>
      </div>
    </CurriculumLayout>
  )
}

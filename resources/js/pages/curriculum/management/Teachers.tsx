import { Head } from "@inertiajs/react"

import CurriculumLayout from "@/layouts/CurriculumLayout"

export default function Teachers() {
  return (
    <CurriculumLayout>
      <Head title="Manajemen Guru" />
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">
          Manajemen Guru
        </h1>
        <p className="text-muted-foreground">
          Data guru akan dikelola di halaman ini.
        </p>
      </div>
    </CurriculumLayout>
  )
}

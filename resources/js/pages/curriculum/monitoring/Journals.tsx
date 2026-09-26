import { Head } from "@inertiajs/react"

import CurriculumLayout from "@/layouts/CurriculumLayout"

export default function Journals() {
  return (
    <CurriculumLayout>
      <Head title="Monitoring Jurnal" />
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">
          Monitoring Jurnal
        </h1>
        <p className="text-muted-foreground">
          Monitoring jurnal guru akan ditampilkan di halaman ini.
        </p>
      </div>
    </CurriculumLayout>
  )
}

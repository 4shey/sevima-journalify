import { Head } from "@inertiajs/react"

import CurriculumLayout from "@/layouts/CurriculumLayout"

export default function Dashboard() {
  return (
    <CurriculumLayout>
      <Head title="Dashboard" />
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Ringkasan kurikulum akan ditampilkan di sini.
        </p>
      </div>
    </CurriculumLayout>
  )
}

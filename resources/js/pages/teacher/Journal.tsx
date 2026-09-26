import { Head } from "@inertiajs/react"

import TeacherLayout from "@/layouts/TeacherLayout"

export default function Journal() {
  return (
    <TeacherLayout>
      <Head title="Jurnal" />
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">Jurnal</h1>
        <p className="text-muted-foreground">
          Jurnal mengajar akan ditampilkan di sini.
        </p>
      </div>
    </TeacherLayout>
  )
}

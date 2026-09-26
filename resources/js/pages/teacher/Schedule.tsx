import { Head } from "@inertiajs/react"

import TeacherLayout from "@/layouts/TeacherLayout"

export default function Schedule() {
  return (
    <TeacherLayout>
      <Head title="Jadwal" />
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">Jadwal</h1>
        <p className="text-muted-foreground">
          Jadwal mengajar akan ditampilkan di sini.
        </p>
      </div>
    </TeacherLayout>
  )
}

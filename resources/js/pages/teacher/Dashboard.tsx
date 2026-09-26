import { Head } from "@inertiajs/react"

import TeacherLayout from "@/layouts/TeacherLayout"

export default function Dashboard() {
  return (
    <TeacherLayout>
      <Head title="Dashboard" />
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Ringkasan mengajar akan ditampilkan di sini.
        </p>
      </div>
    </TeacherLayout>
  )
}

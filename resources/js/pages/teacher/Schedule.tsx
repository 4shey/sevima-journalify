import { useEffect, useState } from "react"
import { Head, useForm } from "@inertiajs/react"
import { NotebookPenIcon, ClockIcon, CalendarDaysIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import TeacherLayout from "@/layouts/TeacherLayout"
import type {
  AttendanceStatus,
  SchoolDay,
  ScheduleDetail,
  Student,
} from "@/types"

type ScheduleInfo = {
  id: string
  name: string
  active_date: string
}

const DAY_LABELS: Record<string, string> = {
  Monday: "Senin",
  Tuesday: "Selasa",
  Wednesday: "Rabu",
  Thursday: "Kamis",
  Friday: "Jumat",
  Saturday: "Sabtu",
  Sunday: "Minggu",
}

const DAY_TABS: SchoolDay[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
]

const STATUS_OPTIONS: { value: AttendanceStatus; label: string }[] = [
  { value: "H", label: "Hadir" },
  { value: "I", label: "Izin" },
  { value: "S", label: "Sakit" },
  { value: "A", label: "Alpha" },
]

const statusItems = Object.fromEntries(
  STATUS_OPTIONS.map((option) => [option.value, option.label])
)

const toSeconds = (value: string) => {
  const [hours, minutes, seconds] = value.split(":").map(Number)
  return hours * 3600 + minutes * 60 + (seconds ?? 0)
}

const formatClock = (total: number) => {
  const normalized = ((total % 86400) + 86400) % 86400
  const hours = Math.floor(normalized / 3600)
  const minutes = Math.floor((normalized % 3600) / 60)
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`
}

const formatTime = (value: string) => value.slice(0, 5)

const formatDate = (value: string) => {
  const [year, month, day] = value.split("-").map(Number)
  return new Date(year, month - 1, day).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

const sortedForDay = (details: ScheduleDetail[], day: string) =>
  details
    .filter((detail) => detail.day === day)
    .sort(
      (a, b) => (a.start_period?.order ?? 0) - (b.start_period?.order ?? 0)
    )

export default function Schedule({
  schedule,
  today,
  weekday,
  time,
  details,
  students,
}: {
  schedule: ScheduleInfo | null
  today: string
  weekday: string
  time: string
  details: ScheduleDetail[]
  students: Student[]
}) {
  const [formDetail, setFormDetail] = useState<ScheduleDetail | null>(null)
  const [nowSeconds, setNowSeconds] = useState(() => toSeconds(time))

  useEffect(() => {
    const base = toSeconds(time)
    const mounted = Date.now()
    const update = () =>
      setNowSeconds(base + Math.floor((Date.now() - mounted) / 1000))
    const interval = setInterval(update, 15000)
    update()
    return () => clearInterval(interval)
  }, [time])

  const form = useForm({
    schedule_detail_id: "",
    name: "",
    date: "",
    attendances: [] as { student_id: string; status: AttendanceStatus }[],
  })

  const clock = formatClock(nowSeconds)
  const isSchoolDay = weekday in DAY_LABELS && weekday !== "Saturday" && weekday !== "Sunday"
  const todayDetails = sortedForDay(details, weekday)

  const boundsOf = (detail: ScheduleDetail) =>
    detail.start_period && detail.end_period
      ? ([
          toSeconds(detail.start_period.start_time),
          toSeconds(detail.end_period.end_time),
        ] as const)
      : null

  const currentDetail =
    todayDetails.find((detail) => {
      const bounds = boundsOf(detail)
      return bounds && nowSeconds >= bounds[0] && nowSeconds <= bounds[1]
    }) ?? null

  const statusOf = (detail: ScheduleDetail) => {
    const bounds = boundsOf(detail)
    if (!bounds) return "Terjadwal"
    if (nowSeconds < bounds[0]) return "Terjadwal"
    if (nowSeconds > bounds[1]) return "Selesai"
    return "Berlangsung"
  }

  const canCreate = (detail: ScheduleDetail) =>
    Boolean(schedule) && currentDetail?.id === detail.id && !detail.journal

  const banner = (() => {
    if (!schedule) {
      return "Belum ada jadwal aktif. Hubungi kurikulum untuk mengaktifkan jadwal."
    }
    if (!isSchoolDay) {
      return "Akhir pekan - tidak ada jadwal sekolah hari ini."
    }
    if (todayDetails.length === 0) {
      return "Tidak ada jadwal mengajar hari ini."
    }
    if (currentDetail) {
      return `Sedang berlangsung: ${currentDetail.subject?.name ?? "-"} (${formatTime(currentDetail.start_period?.start_time ?? "")}-${formatTime(currentDetail.end_period?.end_time ?? "")}).`
    }

    const first = todayDetails[0]
    const boundsFirst = boundsOf(first)
    if (boundsFirst && nowSeconds < boundsFirst[0]) {
      return `Belum dimulai - jadwal pertama pukul ${formatTime(first.start_period?.start_time ?? "")} WIB.`
    }

    const last = todayDetails[todayDetails.length - 1]
    const boundsLast = boundsOf(last)
    if (boundsLast && nowSeconds > boundsLast[1]) {
      return "Selesai - seluruh jadwal mengajar Anda hari ini telah berakhir."
    }

    const next = todayDetails.find((d) => {
      const b = boundsOf(d)
      return b && nowSeconds < b[0]
    })
    return `Jeda - jadwal berikutnya pukul ${formatTime(next?.start_period?.start_time ?? "")} WIB.`
  })()

  const openJournal = (detail: ScheduleDetail) => {
    form.clearErrors()
    form.setData({
      schedule_detail_id: detail.id,
      name: "",
      date: today,
      attendances: students
        .filter((student) => student.class_id === detail.class_id)
        .map((student) => ({ student_id: student.id, status: "H" })),
    })
    setFormDetail(detail)
  }

  const setStatus = (index: number, status: AttendanceStatus) => {
    form.setData(
      "attendances",
      form.data.attendances.map((row, rowIndex) =>
        rowIndex === index ? { ...row, status } : row
      )
    )
  }

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    form.post(route("teacher.journals.store"), {
      preserveScroll: true,
      onSuccess: () => setFormDetail(null),
    })
  }

  const detailError = (index: number) =>
    (form.errors as Record<string, string | undefined>)[
      `attendances.${index}.status`
    ]

  const journalStudents = formDetail
    ? students.filter(
        (student) => student.class_id === formDetail.class_id
      )
    : []

  const renderCard = (detail: ScheduleDetail, interactive: boolean) => {
    const status = statusOf(detail)
    const creatable = interactive && canCreate(detail)
    const showStatus = interactive && detail.day === weekday

    return (
      <Card
        key={detail.id}
        className={
          creatable
            ? "cursor-pointer border-primary/50 bg-primary/5 shadow-xs transition-colors hover:border-primary"
            : undefined
        }
        onClick={creatable ? () => openJournal(detail) : undefined}
      >
        <CardHeader>
          <div className="flex flex-col gap-0.5">
            <CardTitle>
              {detail.subject?.name ?? "-"}
              {detail.subject ? ` (${detail.subject.code})` : ""}
            </CardTitle>
            <CardDescription>
              {detail.classroom?.label ?? "-"}
            </CardDescription>
          </div>
          {showStatus && (
            <CardAction>
              <Badge
                variant={
                  status === "Berlangsung"
                    ? "default"
                    : status === "Selesai"
                      ? "secondary"
                      : "outline"
                }
              >
                {status}
              </Badge>
            </CardAction>
          )}
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="inline-flex items-center gap-1.5">
            <ClockIcon className="size-3.5 text-muted-foreground" />
            <span className="tabular-nums">
              {detail.start_period
                ? formatTime(detail.start_period.start_time)
                : "?"}
              {" - "}
              {detail.end_period
                ? formatTime(detail.end_period.end_time)
                : "?"}
            </span>
          </span>
          <span className="text-muted-foreground">
            Jam ke-{detail.start_period?.order ?? "?"} - {detail.end_period?.order ?? "?"}
          </span>
        </CardContent>
        {interactive && (
          <CardFooter className="justify-between gap-3">
            {detail.journal ? (
              <Badge variant="secondary">✓ Jurnal Sudah Dibuat</Badge>
            ) : creatable ? (
              <span className="inline-flex items-center gap-2 text-sm font-medium text-primary">
                <NotebookPenIcon className="size-4" />
                Buat Jurnal Pelajaran
              </span>
            ) : (
              <span className="text-sm text-muted-foreground">
                {status === "Selesai"
                  ? "Jurnal tidak dapat dibuat - jam pelajaran sudah selesai."
                  : "Jurnal hanya dapat dibuat saat jam pelajaran berlangsung."}
              </span>
            )}
          </CardFooter>
        )}
      </Card>
    )
  }

  const renderDayCards = (day: SchoolDay, interactive: boolean) => {
    const dayDetails = sortedForDay(details, day)

    if (dayDetails.length === 0) {
      return (
        <p className="py-6 text-center text-sm text-muted-foreground">
          Tidak ada jadwal mengajar pada hari {DAY_LABELS[day] ?? day}.
        </p>
      )
    }

    return (
      <div className="grid gap-3">
        {dayDetails.map((detail) => renderCard(detail, interactive))}
      </div>
    )
  }

  return (
    <TeacherLayout>
      <Head title="Jadwal" />

      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">Jadwal Mengajar</h1>
        <p className="text-muted-foreground">
          {schedule
            ? `${schedule.name} - aktif sejak ${formatDate(schedule.active_date)}.`
            : "Belum ada jadwal aktif."}
        </p>
      </div>

      <Tabs defaultValue="now" className="w-full">
        <TabsList className="h-auto flex-wrap">
          <TabsTrigger value="now" className="gap-2">
            <ClockIcon className="size-4" />
            Jadwal Sekarang
          </TabsTrigger>
          <TabsTrigger value="week" className="gap-2">
            <CalendarDaysIcon className="size-4" />
            Jadwal Minggu Ini
          </TabsTrigger>
        </TabsList>

        {/* Main Tab 1: Jadwal Sekarang (Menampilkan 1 kartu interaktif jika SEDANG BERLANGSUNG) */}
        <TabsContent value="now" className="flex flex-col gap-3 pt-2">
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <p className="font-medium">{formatDate(today)}</p>
            <p className="text-muted-foreground">
              Pukul <span className="tabular-nums font-semibold">{clock}</span> WIB
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2 text-sm">
            <span
              className={
                currentDetail
                  ? "size-2 shrink-0 animate-pulse rounded-full bg-primary"
                  : "size-2 shrink-0 rounded-full bg-muted-foreground/50"
              }
            />
            <p>{banner}</p>
          </div>

          {currentDetail ? (
            renderCard(currentDetail, true)
          ) : (
            <div className="rounded-xl border border-dashed p-8 text-center">
              <ClockIcon className="mx-auto size-8 text-muted-foreground/50" />
              <h3 className="mt-2 text-sm font-semibold">Tidak Ada Jam Pelajaran Berlangsung</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {banner}
              </p>
            </div>
          )}
        </TabsContent>

        {/* Main Tab 2: Jadwal Minggu Ini (Menampilkan tab Senin-Jumat tanpa penanda Hari Ini) */}
        <TabsContent value="week" className="flex flex-col gap-4 pt-2">
          <Tabs defaultValue={isSchoolDay ? (weekday as SchoolDay) : "Monday"} className="w-full">
            <TabsList className="h-auto flex-wrap bg-muted/60">
              {DAY_TABS.map((day) => (
                <TabsTrigger key={day} value={day}>
                  {DAY_LABELS[day]}
                </TabsTrigger>
              ))}
            </TabsList>

            {DAY_TABS.map((day) => (
              <TabsContent key={day} value={day} className="pt-3">
                {renderDayCards(day, false)}
              </TabsContent>
            ))}
          </Tabs>
        </TabsContent>
      </Tabs>

      <Dialog
        open={Boolean(formDetail)}
        onOpenChange={(open) => {
          if (!open) setFormDetail(null)
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Buat Jurnal Pelajaran</DialogTitle>
            <DialogDescription>
              {formDetail
                ? `${formDetail.subject?.name ?? "-"} • ${formDetail.classroom?.label ?? "-"} • ${DAY_LABELS[formDetail.day] ?? formDetail.day}, ${formatDate(today)} • ${formatTime(formDetail.start_period?.start_time ?? "")}-${formatTime(formDetail.end_period?.end_time ?? "")}`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} noValidate className="grid gap-4">
            <FieldGroup>
              <Field data-invalid={!!form.errors.name}>
                <FieldLabel htmlFor="journal-name">Nama Jurnal</FieldLabel>
                <Input
                  id="journal-name"
                  placeholder="cth. Materi Bab 3 - Latihan soal"
                  value={form.data.name}
                  onChange={(event) => form.setData("name", event.target.value)}
                />
                <FieldError>{form.errors.name}</FieldError>
              </Field>

              <Field data-invalid={!!form.errors.attendances}>
                <div className="flex flex-col gap-0.5">
                  <FieldLabel>Absensi Siswa</FieldLabel>
                  <p className="text-xs text-muted-foreground">
                    Pilih status kehadiran seluruh siswa kelas.
                  </p>
                </div>
                <FieldError>{form.errors.attendances}</FieldError>
              </Field>

              <div className="overflow-x-auto rounded-xl border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-14 text-center">No</TableHead>
                      <TableHead className="w-20">No. Absen</TableHead>
                      <TableHead>Nama Siswa</TableHead>
                      <TableHead className="w-40">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {journalStudents.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="h-24 text-center text-muted-foreground"
                        >
                          Tidak ada siswa pada kelas ini.
                        </TableCell>
                      </TableRow>
                    ) : (
                      journalStudents.map((student, index) => (
                        <TableRow key={student.id}>
                          <TableCell className="text-center tabular-nums text-muted-foreground">
                            {index + 1}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {student.attendance_number}
                          </TableCell>
                          <TableCell className="font-medium">
                            {student.name}
                          </TableCell>
                          <TableCell>
                            <Select
                              value={
                                form.data.attendances[index]?.status ?? "H"
                              }
                              onValueChange={(value) =>
                                setStatus(
                                  index,
                                  (value ?? "H") as AttendanceStatus
                                )
                              }
                              items={statusItems}
                            >
                              <SelectTrigger
                                className="w-full"
                                data-invalid={!!detailError(index)}
                              >
                                <SelectValue placeholder="Pilih status" />
                              </SelectTrigger>
                              <SelectContent>
                                {STATUS_OPTIONS.map((option) => (
                                  <SelectItem
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {detailError(index) && (
                              <p className="mt-1 text-sm text-destructive">
                                {detailError(index)}
                              </p>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </FieldGroup>
            <DialogFooter>
              <DialogClose render={<Button type="button" variant="outline" />}>
                Batal
              </DialogClose>
              <Button
                type="submit"
                disabled={form.processing || journalStudents.length === 0}
              >
                {form.processing ? "Menyimpan..." : "Simpan Jurnal"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </TeacherLayout>
  )
}
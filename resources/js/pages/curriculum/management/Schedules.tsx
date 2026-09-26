import { useState } from "react"
import { Head, router, useForm } from "@inertiajs/react"
import { PencilIcon, PlusIcon, Trash2Icon, XIcon } from "lucide-react"

import { ConfirmDeleteDialog } from "@/components/management/confirm-delete-dialog"
import { FlashAlert } from "@/components/management/flash-alert"
import { Pagination } from "@/components/management/pagination"
import { SearchInput } from "@/components/management/search-input"
import { Button } from "@/components/ui/button"
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
import CurriculumLayout from "@/layouts/CurriculumLayout"
import type {
  Classroom,
  Paginated,
  Period,
  Schedule,
  SchoolDay,
  Subject,
  Teacher,
} from "@/types"

const DAYS: { key: SchoolDay; label: string }[] = [
  { key: "Monday", label: "Senin" },
  { key: "Tuesday", label: "Selasa" },
  { key: "Wednesday", label: "Rabu" },
  { key: "Thursday", label: "Kamis" },
  { key: "Friday", label: "Jumat" },
]

type DetailRow = {
  day: SchoolDay | ""
  class_id: string
  subject_id: string
  teacher_id: string
  start_period_id: string
  end_period_id: string
}

const dayLabel = (day: string) =>
  DAYS.find((item) => item.key === day)?.label ?? day

const formatDate = (value: string) => {
  const [year, month, day] = value.split("-").map(Number)
  return new Date(year, month - 1, day).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

const formatTime = (value: string) => value.slice(0, 5)

const emptyRow = (): DetailRow => ({
  day: "",
  class_id: "",
  subject_id: "",
  teacher_id: "",
  start_period_id: "",
  end_period_id: "",
})

export default function Schedules({
  schedules,
  classes,
  subjects,
  teachers,
  periods,
  filters,
}: {
  schedules: Paginated<Schedule>
  classes: Classroom[]
  subjects: Subject[]
  teachers: Teacher[]
  periods: Period[]
  filters: { search: string }
}) {
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Schedule | null>(null)
  const [deleting, setDeleting] = useState<Schedule | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [cell, setCell] = useState<{ classId: string; day: SchoolDay } | null>(
    null
  )

  const form = useForm({
    name: "",
    active_date: "",
    details: [emptyRow()] as DetailRow[],
  })

  const sortedClasses = [...classes].sort(
    (a, b) =>
      (a.major?.name ?? "").localeCompare(b.major?.name ?? "") ||
      a.grade.localeCompare(b.grade)
  )

  const dayItems = Object.fromEntries(DAYS.map((day) => [day.key, day.label]))
  const classItems = Object.fromEntries(
    sortedClasses.map((classroom) => [classroom.id, classroom.label])
  )
  const subjectItems = Object.fromEntries(
    subjects.map((subject) => [subject.id, `${subject.name} (${subject.code})`])
  )
  const teacherItems = Object.fromEntries(
    teachers.map((teacher) => [teacher.id, `${teacher.name} (${teacher.code})`])
  )
  const periodItems = Object.fromEntries(
    periods.map((period) => [
      period.id,
      `${period.order}. ${formatTime(period.start_time)}–${formatTime(period.end_time)}`,
    ])
  )

  const selected =
    schedules.data.find((schedule) => schedule.id === selectedId) ?? null
  const details = selected?.schedule_details ?? []
  const cellEntries = cell
    ? details
        .filter(
          (detail) =>
            detail.class_id === cell.classId && detail.day === cell.day
        )
        .sort(
          (a, b) => (a.start_period?.order ?? 0) - (b.start_period?.order ?? 0)
        )
    : []
  const cellClass = cell
    ? sortedClasses.find((classroom) => classroom.id === cell.classId) ?? null
    : null

  const entriesFor = (classId: string, day: SchoolDay) =>
    details
      .filter((detail) => detail.class_id === classId && detail.day === day)
      .sort((a, b) => (a.start_period?.order ?? 0) - (b.start_period?.order ?? 0))

  const detailError = (index: number, field: keyof DetailRow) =>
    (form.errors as Record<string, string | undefined>)[
      `details.${index}.${field}`
    ]

  const search = (value: string) => {
    router.get(
      route("curriculum.management.schedules", {}, false),
      value ? { search: value } : {},
      { preserveState: true, preserveScroll: true, replace: true }
    )
  }

  const openCreate = () => {
    setEditing(null)
    form.clearErrors()
    form.setData({
      name: "",
      active_date: "",
      details: [emptyRow()],
    })
    setFormOpen(true)
  }

  const openEdit = (schedule: Schedule) => {
    setEditing(schedule)
    form.clearErrors()
    form.setData({
      name: schedule.name,
      active_date: schedule.active_date,
      details:
        schedule.schedule_details?.map((detail) => ({
          day: detail.day,
          class_id: detail.class_id,
          subject_id: detail.subject_id,
          teacher_id: detail.teacher_id,
          start_period_id: detail.start_period_id,
          end_period_id: detail.end_period_id,
        })) ?? [emptyRow()],
    })
    setFormOpen(true)
  }

  const updateRow = (index: number, patch: Partial<DetailRow>) => {
    form.setData(
      "details",
      form.data.details.map((row, rowIndex) =>
        rowIndex === index ? { ...row, ...patch } : row
      )
    )
  }

  const addRow = () => {
    form.setData("details", [...form.data.details, emptyRow()])
  }

  const removeRow = (index: number) => {
    form.setData(
      "details",
      form.data.details.filter((_, rowIndex) => rowIndex !== index)
    )
  }

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const options = {
      preserveScroll: true,
      onSuccess: () => setFormOpen(false),
    }

    if (editing) {
      form.put(
        route("curriculum.management.schedules.update", editing.id),
        options
      )
    } else {
      form.post(route("curriculum.management.schedules.store"), options)
    }
  }

  const confirmDelete = () => {
    if (!deleting) {
      return
    }

    form.delete(
      route("curriculum.management.schedules.destroy", deleting.id),
      {
        preserveScroll: true,
        onSuccess: () => {
          if (selectedId === deleting.id) {
            setSelectedId(null)
          }
          setDeleting(null)
        },
      }
    )
  }

  const selectSchedule = (schedule: Schedule) => {
    setCell(null)
    setSelectedId(schedule.id)
  }

  return (
    <CurriculumLayout>
      <Head title="Manajemen Jadwal" />

      <div className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-semibold tracking-tight">
            Manajemen Jadwal
          </h1>
          <p className="text-muted-foreground">
            Kelola jadwal pelajaran beserta rincian per kelas dan hari.
          </p>
        </div>
        <Button onClick={openCreate}>
          <PlusIcon />
          Tambah Jadwal
        </Button>
      </div>

      <FlashAlert />

      <SearchInput
        value={filters.search}
        onSearch={search}
        placeholder="Cari nama jadwal..."
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama Jadwal</TableHead>
            <TableHead>Aktif Sejak</TableHead>
            <TableHead>Detail</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {schedules.data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={4}
                className="h-24 text-center text-muted-foreground"
              >
                Tidak ada jadwal yang ditemukan.
              </TableCell>
            </TableRow>
          ) : (
            schedules.data.map((schedule) => (
              <TableRow
                key={schedule.id}
                className="cursor-pointer"
                onClick={() => selectSchedule(schedule)}
              >
                <TableCell className="font-medium">{schedule.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(schedule.active_date)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {schedule.schedule_details_count ??
                    schedule.schedule_details?.length ??
                    0}{" "}
                  detail
                </TableCell>
                <TableCell className="text-right">
                  <div
                    className="flex justify-end gap-1"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Ubah"
                      onClick={() => openEdit(schedule)}
                    >
                      <PencilIcon />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-destructive"
                      aria-label="Hapus"
                      onClick={() => setDeleting(schedule)}
                    >
                      <Trash2Icon />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Pagination paginator={schedules} />

      {selected && (
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-0.5">
              <h2 className="text-lg font-semibold">{selected.name}</h2>
              <p className="text-sm text-muted-foreground">
                Aktif sejak {formatDate(selected.active_date)} · Klik tombol
                pada sel untuk melihat rinciannya.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCell(null)
                setSelectedId(null)
              }}
            >
              <XIcon />
              Tutup Detail
            </Button>
          </div>

          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-40">Kelas</TableHead>
                  {DAYS.map((day) => (
                    <TableHead key={day.key} className="text-center">
                      {day.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedClasses.map((classroom) => (
                  <TableRow key={classroom.id}>
                    <TableCell className="font-medium">
                      {classroom.label}
                    </TableCell>
                    {DAYS.map((day) => {
                      const entries = entriesFor(classroom.id, day.key)

                      return (
                        <TableCell key={day.key} className="text-center">
                          {entries.length > 0 ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setCell({ classId: classroom.id, day: day.key })
                              }
                            >
                              {entries.length} jadwal
                            </Button>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      <Dialog
        open={Boolean(cell)}
        onOpenChange={(open) => {
          if (!open) {
            setCell(null)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {cell ? `${dayLabel(cell.day)} · ${cellClass?.label ?? ""}` : ""}
            </DialogTitle>
            <DialogDescription>
              Daftar jadwal pada kelas dan hari ini.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            {cellEntries.map((detail) => (
              <div
                key={detail.id}
                className="flex items-start justify-between gap-3 rounded-lg border p-3"
              >
                <div className="grid gap-0.5">
                  <p className="font-medium">
                    {detail.subject?.name ?? "-"}{" "}
                    <span className="font-normal text-muted-foreground">
                      {detail.subject ? `(${detail.subject.code})` : ""}
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {detail.teacher?.name ?? "-"}
                    {detail.teacher?.code ? ` · ${detail.teacher.code}` : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium tabular-nums">
                    {detail.start_period
                      ? formatTime(detail.start_period.start_time)
                      : "?"}
                    –
                    {detail.end_period
                      ? formatTime(detail.end_period.end_time)
                      : "?"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Jam ke-{detail.start_period?.order ?? "?"}–
                    {detail.end_period?.order ?? "?"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Ubah Jadwal" : "Tambah Jadwal"}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? "Perbarui data jadwal beserta seluruh detailnya."
                : "Tambahkan jadwal baru beserta detail per kelas dan harinya."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} noValidate className="grid gap-4">
            <FieldGroup>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field data-invalid={!!form.errors.name}>
                  <FieldLabel htmlFor="schedule-name">Nama Jadwal</FieldLabel>
                  <Input
                    id="schedule-name"
                    placeholder="cth. Jadwal Ganjil 2026/2027"
                    value={form.data.name}
                    onChange={(event) =>
                      form.setData("name", event.target.value)
                    }
                  />
                  <FieldError>{form.errors.name}</FieldError>
                </Field>
                <Field data-invalid={!!form.errors.active_date}>
                  <FieldLabel htmlFor="schedule-active-date">
                    Tanggal Aktif
                  </FieldLabel>
                  <Input
                    id="schedule-active-date"
                    type="date"
                    value={form.data.active_date}
                    onChange={(event) =>
                      form.setData("active_date", event.target.value)
                    }
                  />
                  <FieldError>{form.errors.active_date}</FieldError>
                </Field>
              </div>

              <Field data-invalid={!!form.errors.details}>
                <div className="flex items-center justify-between">
                  <FieldLabel>Detail Jadwal</FieldLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addRow}
                  >
                    <PlusIcon />
                    Tambah Detail
                  </Button>
                </div>
                <FieldError>{form.errors.details}</FieldError>
              </Field>

              <div className="grid gap-3">
                {form.data.details.map((row, index) => (
                  <div key={index} className="grid gap-3 rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">
                        Detail {index + 1}
                      </p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="text-destructive"
                        aria-label="Hapus detail"
                        disabled={form.data.details.length <= 1}
                        onClick={() => removeRow(index)}
                      >
                        <XIcon />
                      </Button>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      <Field data-invalid={!!detailError(index, "day")}>
                        <FieldLabel>Hari</FieldLabel>
                        <Select
                          value={row.day || null}
                          onValueChange={(value) =>
                            updateRow(index, {
                              day: String(value ?? "") as SchoolDay | "",
                            })
                          }
                          items={dayItems}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Pilih hari" />
                          </SelectTrigger>
                          <SelectContent>
                            {DAYS.map((day) => (
                              <SelectItem key={day.key} value={day.key}>
                                {day.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FieldError>{detailError(index, "day")}</FieldError>
                      </Field>

                      <Field data-invalid={!!detailError(index, "class_id")}>
                        <FieldLabel>Kelas</FieldLabel>
                        <Select
                          value={row.class_id || null}
                          onValueChange={(value) =>
                            updateRow(index, {
                              class_id: String(value ?? ""),
                            })
                          }
                          items={classItems}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Pilih kelas" />
                          </SelectTrigger>
                          <SelectContent>
                            {sortedClasses.map((classroom) => (
                              <SelectItem
                                key={classroom.id}
                                value={classroom.id}
                              >
                                {classroom.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FieldError>
                          {detailError(index, "class_id")}
                        </FieldError>
                      </Field>

                      <Field data-invalid={!!detailError(index, "subject_id")}>
                        <FieldLabel>Mata Pelajaran</FieldLabel>
                        <Select
                          value={row.subject_id || null}
                          onValueChange={(value) =>
                            updateRow(index, {
                              subject_id: String(value ?? ""),
                            })
                          }
                          items={subjectItems}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Pilih mapel" />
                          </SelectTrigger>
                          <SelectContent>
                            {subjects.map((subject) => (
                              <SelectItem key={subject.id} value={subject.id}>
                                {subject.name} ({subject.code})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FieldError>
                          {detailError(index, "subject_id")}
                        </FieldError>
                      </Field>

                      <Field data-invalid={!!detailError(index, "teacher_id")}>
                        <FieldLabel>Guru</FieldLabel>
                        <Select
                          value={row.teacher_id || null}
                          onValueChange={(value) =>
                            updateRow(index, {
                              teacher_id: String(value ?? ""),
                            })
                          }
                          items={teacherItems}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Pilih guru" />
                          </SelectTrigger>
                          <SelectContent>
                            {teachers.map((teacher) => (
                              <SelectItem key={teacher.id} value={teacher.id}>
                                {teacher.name} ({teacher.code})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FieldError>
                          {detailError(index, "teacher_id")}
                        </FieldError>
                      </Field>

                      <Field
                        data-invalid={!!detailError(index, "start_period_id")}
                      >
                        <FieldLabel>Jam Mulai</FieldLabel>
                        <Select
                          value={row.start_period_id || null}
                          onValueChange={(value) =>
                            updateRow(index, {
                              start_period_id: String(value ?? ""),
                            })
                          }
                          items={periodItems}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Pilih jam mulai" />
                          </SelectTrigger>
                          <SelectContent>
                            {periods.map((period) => (
                              <SelectItem key={period.id} value={period.id}>
                                {period.order}.{" "}
                                {formatTime(period.start_time)}–
                                {formatTime(period.end_time)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FieldError>
                          {detailError(index, "start_period_id")}
                        </FieldError>
                      </Field>

                      <Field
                        data-invalid={!!detailError(index, "end_period_id")}
                      >
                        <FieldLabel>Jam Selesai</FieldLabel>
                        <Select
                          value={row.end_period_id || null}
                          onValueChange={(value) =>
                            updateRow(index, {
                              end_period_id: String(value ?? ""),
                            })
                          }
                          items={periodItems}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Pilih jam selesai" />
                          </SelectTrigger>
                          <SelectContent>
                            {periods.map((period) => (
                              <SelectItem key={period.id} value={period.id}>
                                {period.order}.{" "}
                                {formatTime(period.start_time)}–
                                {formatTime(period.end_time)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FieldError>
                          {detailError(index, "end_period_id")}
                        </FieldError>
                      </Field>
                    </div>
                  </div>
                ))}
              </div>
            </FieldGroup>
            <DialogFooter>
              <DialogClose render={<Button type="button" variant="outline" />}>
                Batal
              </DialogClose>
              <Button type="submit" disabled={form.processing}>
                {form.processing
                  ? "Menyimpan..."
                  : editing
                    ? "Simpan Perubahan"
                    : "Tambah"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => {
          if (!open) {
            setDeleting(null)
          }
        }}
        title="Hapus Jadwal"
        description={
          deleting
            ? `Jadwal "${deleting.name}" beserta ${
                deleting.schedule_details_count ??
                deleting.schedule_details?.length ??
                0
              } detail jadwalnya akan dihapus permanen.`
            : ""
        }
        onConfirm={confirmDelete}
        processing={form.processing}
      />
    </CurriculumLayout>
  )
}

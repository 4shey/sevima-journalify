import { useState } from "react";
import { Head, router, useForm } from "@inertiajs/react";
import {
    ArrowLeftIcon,
    CalendarIcon,
    CheckCircle2Icon,
    ClockIcon,
    PencilIcon,
    PlusIcon,
    Trash2Icon,
} from "lucide-react";

import { ConfirmDeleteDialog } from "@/components/management/confirm-delete-dialog";
import { DataTableCard } from "@/components/management/data-table-card";
import { Pagination } from "@/components/management/pagination";
import { SearchInput } from "@/components/management/search-input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import CurriculumLayout from "@/layouts/CurriculumLayout";
import { rowNumber } from "@/lib/utils";
import type {
    AttendanceStatus,
    Classroom,
    Journal,
    Paginated,
    ScheduleDetail,
    Student,
    Teacher,
} from "@/types";

export interface ScheduleDetailWithJournal extends ScheduleDetail {
    subject: { id: string; name: string; code: string } | null;
    classroom:
        | (Classroom & { major: { id: string; name: string } | null })
        | null;
    journal:
        | (Journal & {
              attendances?: {
                  id: string;
                  journal_id: string;
                  student_id: string;
                  status: AttendanceStatus;
                  student?: Student | null;
              }[];
          })
        | null;
}

export interface TeacherWithSchedules extends Teacher {
    schedule_details_count?: number;
    schedule_details?: ScheduleDetailWithJournal[];
}

const formatDate = (value: string) => {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });
};

const formatTime = (value: string) => value.slice(0, 5);

const DAY_LABELS: Record<string, string> = {
    Monday: "Senin",
    Tuesday: "Selasa",
    Wednesday: "Rabu",
    Thursday: "Kamis",
    Friday: "Jumat",
    Saturday: "Sabtu",
    Sunday: "Minggu",
};

const STATUS_OPTIONS: { value: AttendanceStatus; label: string }[] = [
    { value: "H", label: "Hadir (H)" },
    { value: "I", label: "Izin (I)" },
    { value: "S", label: "Sakit (S)" },
    { value: "A", label: "Alpha (A)" },
];

const statusItems = Object.fromEntries(
    STATUS_OPTIONS.map((opt) => [opt.value, opt.label]),
);

export default function Journals({
    teachers,
    activeSchedule,
    date,
    maxDate,
    weekday,
    students,
    filters,
}: {
    teachers: Paginated<TeacherWithSchedules>;
    activeSchedule: { id: string; name: string; active_date: string } | null;
    date: string;
    maxDate: string;
    weekday: string;
    students: Student[];
    filters: { search: string; date: string };
}) {
    const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(
        null,
    );

    const [formOpen, setFormOpen] = useState(false);
    const [editingJournalId, setEditingJournalId] = useState<string | null>(
        null,
    );
    const [editingDetail, setEditingDetail] =
        useState<ScheduleDetailWithJournal | null>(null);
    const [deletingJournal, setDeletingJournal] = useState<{
        id: string;
        name: string;
    } | null>(null);

    const selectedTeacher =
        teachers.data.find((t) => t.id === selectedTeacherId) ?? null;

    const form = useForm({
        schedule_detail_id: "",
        name: "",
        date: date,
        time: "07:00",
        attendances: [] as { student_id: string; status: AttendanceStatus }[],
    });

    const queryParams = (
        overrides: { search?: string; date?: string } = {},
    ) => {
        const nextSearch = overrides.search ?? filters.search;
        const nextDate = overrides.date ?? filters.date;
        const params: Record<string, string> = {};

        if (nextSearch) {
            params.search = nextSearch;
        }

        if (nextDate) {
            params.date = nextDate;
        }

        return params;
    };

    const search = (value: string) => {
        router.get(
            route("curriculum.monitoring.journals", {}, false),
            queryParams({ search: value }),
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const changeDate = (value: string) => {
        const nextDate = value > maxDate ? maxDate : value || maxDate;
        router.get(
            route("curriculum.monitoring.journals", {}, false),
            queryParams({ date: nextDate }),
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const formClassStudents = editingDetail
        ? students
              .filter((s) => s.class_id === editingDetail.class_id)
              .sort(
                  (a, b) =>
                      (a.attendance_number ?? 0) - (b.attendance_number ?? 0),
              )
        : [];

    const openCreateJournal = (detail: ScheduleDetailWithJournal) => {
        setEditingJournalId(null);
        setEditingDetail(detail);
        form.clearErrors();

        const classStudents = students
            .filter((s) => s.class_id === detail.class_id)
            .sort(
                (a, b) =>
                    (a.attendance_number ?? 0) - (b.attendance_number ?? 0),
            );

        const defaultTime = detail.start_period
            ? formatTime(detail.start_period.start_time)
            : "07:00";

        form.setData({
            schedule_detail_id: detail.id,
            name: detail.subject
                ? `Jurnal Pembelajaran ${detail.subject.name}`
                : "Jurnal Pembelajaran",
            date: date,
            time: defaultTime,
            attendances: classStudents.map((s) => ({
                student_id: s.id,
                status: "H",
            })),
        });
        setFormOpen(true);
    };

    const openEditJournal = (detail: ScheduleDetailWithJournal) => {
        if (!detail.journal) return;
        setEditingJournalId(detail.journal.id);
        setEditingDetail(detail);
        form.clearErrors();

        const classStudents = students
            .filter((s) => s.class_id === detail.class_id)
            .sort(
                (a, b) =>
                    (a.attendance_number ?? 0) - (b.attendance_number ?? 0),
            );

        const defaultTime = detail.start_period
            ? formatTime(detail.start_period.start_time)
            : "07:00";
        const existingAtts = detail.journal.attendances ?? [];

        form.setData({
            schedule_detail_id: detail.id,
            name: detail.journal.name,
            date: date,
            time: defaultTime,
            attendances: classStudents.map((s) => {
                const found = existingAtts.find((a) => a.student_id === s.id);
                return {
                    student_id: s.id,
                    status: (found?.status as AttendanceStatus) ?? "H",
                };
            }),
        });
        setFormOpen(true);
    };

    const setStatus = (index: number, status: AttendanceStatus) => {
        form.setData(
            "attendances",
            form.data.attendances.map((row, rowIndex) =>
                rowIndex === index ? { ...row, status } : row,
            ),
        );
    };

    const submitJournal = (e: React.FormEvent) => {
        e.preventDefault();

        const options = {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setFormOpen(false);
                setEditingJournalId(null);
                setEditingDetail(null);
            },
        };

        if (editingJournalId) {
            form.put(
                route(
                    "curriculum.monitoring.journals.update",
                    editingJournalId,
                    false,
                ),
                options,
            );
        } else {
            form.post(
                route("curriculum.monitoring.journals.store", {}, false),
                options,
            );
        }
    };

    const confirmDeleteJournal = () => {
        if (!deletingJournal) return;

        form.delete(
            route(
                "curriculum.monitoring.journals.destroy",
                deletingJournal.id,
                false,
            ),
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => setDeletingJournal(null),
            },
        );
    };

    return (
        <CurriculumLayout>
            <Head
                title={
                    selectedTeacher
                        ? `Detail Jadwal: ${selectedTeacher.name}`
                        : "Monitoring Jurnal Mengajar"
                }
            />

            {selectedTeacher ? (
                /* Child Page: Detail Jadwal Guru */
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedTeacherId(null)}
                                    className="gap-1.5 text-xs"
                                >
                                    <ArrowLeftIcon className="size-3.5" />
                                    Kembali ke Daftar Guru
                                </Button>
                            </div>
                            <h1 className="text-2xl font-semibold tracking-tight mt-2">
                                Detail Jadwal: {selectedTeacher.name} (
                                {selectedTeacher.code})
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Daftar jadwal mengajar pada {formatDate(date)} (
                                {DAY_LABELS[weekday] ?? weekday}).
                            </p>
                        </div>

                        <div className="grid w-full gap-1.5 sm:w-auto">
                            <label
                                htmlFor="journal-child-date"
                                className="text-sm font-medium"
                            >
                                Tanggal Jurnal
                            </label>
                            <Input
                                id="journal-child-date"
                                type="date"
                                max={maxDate}
                                value={filters.date}
                                onChange={(event) =>
                                    changeDate(event.target.value)
                                }
                            />
                        </div>
                    </div>

                    {selectedTeacher.schedule_details?.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                                <CalendarIcon className="size-10 mb-2 opacity-50" />
                                <p className="font-medium">
                                    Tidak Ada Jadwal Mengajar
                                </p>
                                <p className="text-xs">
                                    Guru ini tidak memiliki jadwal mengajar pada{" "}
                                    {DAY_LABELS[weekday] ?? weekday}.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2">
                            {selectedTeacher.schedule_details?.map((detail) => {
                                const hasJournal = Boolean(detail.journal);
                                const startP = detail.start_period;
                                const endP = detail.end_period;
                                const atts = detail.journal?.attendances ?? [];

                                const hadir = atts.filter(
                                    (a) => a.status === "H",
                                ).length;
                                const izin = atts.filter(
                                    (a) => a.status === "I",
                                ).length;
                                const sakit = atts.filter(
                                    (a) => a.status === "S",
                                ).length;
                                const alpha = atts.filter(
                                    (a) => a.status === "A",
                                ).length;

                                return (
                                    <Card
                                        key={detail.id}
                                        className="flex flex-col justify-between"
                                    >
                                        <CardHeader className="pb-3">
                                            <div className="flex items-start justify-between gap-2">
                                                <Badge
                                                    variant="outline"
                                                    className="font-mono text-xs"
                                                >
                                                    Jam ke-
                                                    {startP?.order ?? "?"}-
                                                    {endP?.order ?? "?"} (
                                                    {startP
                                                        ? formatTime(
                                                              startP.start_time,
                                                          )
                                                        : "?"}{" "}
                                                    -{" "}
                                                    {endP
                                                        ? formatTime(
                                                              endP.end_time,
                                                          )
                                                        : "?"}
                                                    )
                                                </Badge>
                                                {hasJournal ? (
                                                    <Badge
                                                        variant="outline"
                                                        className="bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300"
                                                    >
                                                        <CheckCircle2Icon className="size-3 mr-1" />
                                                        Sudah Diisi
                                                    </Badge>
                                                ) : (
                                                    <Badge
                                                        variant="outline"
                                                        className="bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-300"
                                                    >
                                                        <ClockIcon className="size-3 mr-1" />
                                                        Belum Diisi
                                                    </Badge>
                                                )}
                                            </div>
                                            <CardTitle className="text-base mt-2">
                                                {detail.subject?.name ??
                                                    "Mata Pelajaran"}
                                            </CardTitle>
                                            <p className="text-xs text-muted-foreground">
                                                Kelas:{" "}
                                                {detail.classroom?.label ?? "-"}{" "}
                                                ? Mapel Code:{" "}
                                                {detail.subject?.code ?? "-"}
                                            </p>
                                        </CardHeader>
                                        <CardContent className="pb-3 text-xs">
                                            {hasJournal ? (
                                                <div className="flex flex-col gap-2 rounded-md bg-muted/40 p-2.5">
                                                    <div className="font-medium text-foreground">
                                                        Nama:{" "}
                                                        {detail.journal?.name}
                                                    </div>
                                                    <div className="flex items-center gap-3 text-muted-foreground">
                                                        <span className="text-emerald-600 font-medium">
                                                            Hadir: {hadir}
                                                        </span>
                                                        <span className="text-blue-600 font-medium">
                                                            Izin: {izin}
                                                        </span>
                                                        <span className="text-amber-600 font-medium">
                                                            Sakit: {sakit}
                                                        </span>
                                                        <span className="text-rose-600 font-medium">
                                                            Alpha: {alpha}
                                                        </span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-muted-foreground italic">
                                                    Jurnal untuk slot pada
                                                    tanggal ini belum diisi.
                                                </p>
                                            )}
                                        </CardContent>
                                        <div className="flex items-center justify-end gap-2 border-t px-4 py-2.5 bg-muted/20">
                                            {hasJournal ? (
                                                <>
                                                    <Button
                                                        variant="outline"
                                                        size="xs"
                                                        onClick={() =>
                                                            openEditJournal(
                                                                detail,
                                                            )
                                                        }
                                                    >
                                                        <PencilIcon className="size-3 mr-1" />
                                                        Ubah Jurnal
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="xs"
                                                        className="text-destructive hover:bg-destructive/10"
                                                        onClick={() =>
                                                            setDeletingJournal({
                                                                id: detail
                                                                    .journal!
                                                                    .id,
                                                                name: detail
                                                                    .journal!
                                                                    .name,
                                                            })
                                                        }
                                                    >
                                                        <Trash2Icon className="size-3 mr-1" />
                                                        Hapus
                                                    </Button>
                                                </>
                                            ) : (
                                                <Button
                                                    variant="default"
                                                    size="xs"
                                                    onClick={() =>
                                                        openCreateJournal(
                                                            detail,
                                                        )
                                                    }
                                                >
                                                    <PlusIcon className="size-3 mr-1" />
                                                    Buat Jurnal Manual
                                                </Button>
                                            )}
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </div>
            ) : (
                /* Main Page: Daftar Guru & Rekap Jurnal */
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex flex-col gap-1.5">
                            <h1 className="text-2xl font-semibold tracking-tight">
                                Monitoring Jurnal Mengajar
                            </h1>
                        </div>
                    </div>

                    <DataTableCard
                        toolbar={
                            <>
                                <SearchInput
                                    value={filters.search}
                                    onSearch={search}
                                    placeholder="Cari nama atau kode guru..."
                                />
                                <div className="grid w-full gap-1.5 sm:w-auto">
                                    <label
                                        htmlFor="journal-date"
                                        className="text-sm font-medium"
                                    >
                                        Tanggal Jurnal
                                    </label>
                                    <Input
                                        id="journal-date"
                                        type="date"
                                        max={maxDate}
                                        value={filters.date}
                                        onChange={(event) =>
                                            changeDate(event.target.value)
                                        }
                                    />
                                </div>
                            </>
                        }
                        footer={<Pagination paginator={teachers} />}
                    >
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-14 text-center">
                                        No
                                    </TableHead>
                                    <TableHead>Nama Guru</TableHead>
                                    <TableHead>Kode Guru</TableHead>
                                    <TableHead>Total Jadwal</TableHead>
                                    <TableHead className="w-[1%] text-right">
                                        Aksi
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {teachers.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="h-24 text-center text-muted-foreground"
                                        >
                                            Tidak ada guru yang ditemukan.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    teachers.data.map((teacher, index) => (
                                        <TableRow key={teacher.id}>
                                            <TableCell className="text-center tabular-nums text-muted-foreground">
                                                {rowNumber(teachers, index)}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {teacher.name}
                                            </TableCell>
                                            <TableCell className="font-mono text-muted-foreground">
                                                {teacher.code}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {teacher.schedule_details_count ??
                                                        0}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="gap-1.5 text-xs"
                                                    onClick={() =>
                                                        setSelectedTeacherId(
                                                            teacher.id,
                                                        )
                                                    }
                                                >
                                                    <CalendarIcon className="size-3.5" />
                                                    Detail Jadwal
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </DataTableCard>
                </div>
            )}

            {/* Dialog Form Create / Edit Jurnal oleh Kurikulum */}
            <Dialog open={formOpen} onOpenChange={setFormOpen}>
                <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            {editingJournalId
                                ? "Ubah Jurnal (Kurikulum)"
                                : "Buat Jurnal Manual (Kurikulum)"}
                        </DialogTitle>
                        <DialogDescription>
                            {editingDetail ? (
                                <>
                                    {editingDetail.subject?.name} ?{" "}
                                    {editingDetail.classroom?.label} ? Jam ke-
                                    {editingDetail.start_period?.order}-
                                    {editingDetail.end_period?.order} (
                                    {editingDetail.start_period
                                        ? formatTime(
                                              editingDetail.start_period
                                                  .start_time,
                                          )
                                        : "?"}{" "}
                                    -{" "}
                                    {editingDetail.end_period
                                        ? formatTime(
                                              editingDetail.end_period.end_time,
                                          )
                                        : "?"}
                                    )
                                </>
                            ) : null}
                        </DialogDescription>
                    </DialogHeader>

                    <form
                        onSubmit={submitJournal}
                        noValidate
                        className="grid gap-4"
                    >
                        <FieldGroup>
                            <Field>
                                <FieldLabel>Tanggal Jurnal</FieldLabel>
                                <Input
                                    value={formatDate(date)}
                                    disabled
                                    className="bg-muted text-muted-foreground"
                                />
                            </Field>

                            <Field data-invalid={!!form.errors.time}>
                                <FieldLabel htmlFor="sim-manual-time">
                                    Jam Manual (WIB) - Wajib dalam rentang jam
                                    pelajaran
                                </FieldLabel>
                                <Input
                                    id="sim-manual-time"
                                    type="time"
                                    value={form.data.time}
                                    onChange={(e) =>
                                        form.setData("time", e.target.value)
                                    }
                                />
                                <FieldError>{form.errors.time}</FieldError>
                            </Field>

                            <Field data-invalid={!!form.errors.name}>
                                <FieldLabel htmlFor="journal-manual-name">
                                    Nama Jurnal
                                </FieldLabel>
                                <Input
                                    id="journal-manual-name"
                                    placeholder="cth. Pengayaan Bab 2 - Kurikulum Override"
                                    value={form.data.name}
                                    onChange={(e) =>
                                        form.setData("name", e.target.value)
                                    }
                                />
                                <FieldError>{form.errors.name}</FieldError>
                            </Field>

                            <Field data-invalid={!!form.errors.attendances}>
                                <div className="flex flex-col gap-0.5">
                                    <FieldLabel>Absensi Siswa Kelas</FieldLabel>
                                    <p className="text-xs text-muted-foreground">
                                        Pilih status kehadiran untuk setiap
                                        siswa.
                                    </p>
                                </div>
                                <FieldError>
                                    {form.errors.attendances}
                                </FieldError>
                            </Field>

                            <div className="overflow-x-auto rounded-xl border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-14 text-center">
                                                No
                                            </TableHead>
                                            <TableHead className="w-20">
                                                No. Absen
                                            </TableHead>
                                            <TableHead>Nama Siswa</TableHead>
                                            <TableHead className="w-40">
                                                Status
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {formClassStudents.length === 0 ? (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={4}
                                                    className="h-20 text-center text-muted-foreground"
                                                >
                                                    Tidak ada siswa pada kelas
                                                    ini.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            formClassStudents.map(
                                                (st, index) => (
                                                    <TableRow key={st.id}>
                                                        <TableCell className="text-center tabular-nums text-muted-foreground">
                                                            {index + 1}
                                                        </TableCell>
                                                        <TableCell className="font-mono text-muted-foreground">
                                                            {
                                                                st.attendance_number
                                                            }
                                                        </TableCell>
                                                        <TableCell className="font-medium">
                                                            {st.name}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Select
                                                                value={
                                                                    form.data
                                                                        .attendances[
                                                                        index
                                                                    ]?.status ??
                                                                    "H"
                                                                }
                                                                onValueChange={(
                                                                    val,
                                                                ) =>
                                                                    setStatus(
                                                                        index,
                                                                        (val ??
                                                                            "H") as AttendanceStatus,
                                                                    )
                                                                }
                                                                items={
                                                                    statusItems
                                                                }
                                                            >
                                                                <SelectTrigger className="w-full">
                                                                    <SelectValue placeholder="Pilih status" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {STATUS_OPTIONS.map(
                                                                        (
                                                                            opt,
                                                                        ) => (
                                                                            <SelectItem
                                                                                key={
                                                                                    opt.value
                                                                                }
                                                                                value={
                                                                                    opt.value
                                                                                }
                                                                            >
                                                                                {
                                                                                    opt.label
                                                                                }
                                                                            </SelectItem>
                                                                        ),
                                                                    )}
                                                                </SelectContent>
                                                            </Select>
                                                        </TableCell>
                                                    </TableRow>
                                                ),
                                            )
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </FieldGroup>

                        <DialogFooter className="gap-2 sm:gap-0">
                            <DialogClose
                                render={
                                    <Button type="button" variant="outline" />
                                }
                            >
                                Batal
                            </DialogClose>
                            <Button
                                type="submit"
                                disabled={
                                    form.processing ||
                                    formClassStudents.length === 0
                                }
                            >
                                {form.processing
                                    ? "Menyimpan..."
                                    : "Simpan Jurnal"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Confirm Delete Dialog */}
            <ConfirmDeleteDialog
                open={Boolean(deletingJournal)}
                onOpenChange={(open) => {
                    if (!open) setDeletingJournal(null);
                }}
                title="Hapus Jurnal"
                description={
                    deletingJournal
                        ? `Jurnal "${deletingJournal.name}" beserta data absensinya akan dihapus.`
                        : ""
                }
                onConfirm={confirmDeleteJournal}
                processing={form.processing}
            />
        </CurriculumLayout>
    );
}

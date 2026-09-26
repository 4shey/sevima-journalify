import { useState } from "react";
import { Head, router, useForm } from "@inertiajs/react";
import {
    PencilIcon,
    PlusIcon,
    SearchIcon,
    Trash2Icon,
    XIcon,
} from "lucide-react";

import { ConfirmDeleteDialog } from "@/components/management/confirm-delete-dialog";
import { DataTableCard } from "@/components/management/data-table-card";
import { Pagination } from "@/components/management/pagination";
import { SearchInput } from "@/components/management/search-input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
    Classroom,
    Paginated,
    Period,
    Schedule,
    SchoolDay,
    Subject,
    Teacher,
} from "@/types";

const DAYS: { key: SchoolDay; label: string }[] = [
    { key: "Monday", label: "Senin" },
    { key: "Tuesday", label: "Selasa" },
    { key: "Wednesday", label: "Rabu" },
    { key: "Thursday", label: "Kamis" },
    { key: "Friday", label: "Jumat" },
];

type DetailRow = {
    day: SchoolDay | "";
    class_id: string;
    subject_id: string;
    teacher_id: string;
    start_period_id: string;
    end_period_id: string;
};

const dayLabel = (day: string) =>
    DAYS.find((item) => item.key === day)?.label ?? day;

const formatDate = (value: string) => {
    if (!value) return "-";
    const [year, month, day] = value.slice(0, 10).split("-").map(Number);
    return new Date(year, month - 1, day).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
};

const formatTime = (value: string) => (value ? value.slice(0, 5) : "");

const emptyRow = (): DetailRow => ({
    day: "",
    class_id: "",
    subject_id: "",
    teacher_id: "",
    start_period_id: "",
    end_period_id: "",
});

export default function Schedules({
    schedules,
    classes,
    subjects,
    teachers,
    periods,
    filters,
}: {
    schedules: Paginated<Schedule>;
    classes: Classroom[];
    subjects: Subject[];
    teachers: Teacher[];
    periods: Period[];
    filters: { search: string };
}) {
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<Schedule | null>(null);
    const [deleting, setDeleting] = useState<Schedule | null>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [cell, setCell] = useState<{
        classId: string;
        day: SchoolDay;
    } | null>(null);
    const [detailFilter, setDetailFilter] = useState("");

    const form = useForm({
        name: "",
        active_date: "",
        details: [emptyRow()] as DetailRow[],
    });

    const sortedClasses = [...classes].sort(
        (a, b) =>
            (a.major?.name ?? "").localeCompare(b.major?.name ?? "") ||
            a.grade.localeCompare(b.grade),
    );

    const dayItems = Object.fromEntries(
        DAYS.map((day) => [day.key, day.label]),
    );
    const classItems = Object.fromEntries(
        sortedClasses.map((classroom) => [classroom.id, classroom.label]),
    );
    const subjectItems = Object.fromEntries(
        subjects.map((subject) => [
            subject.id,
            `${subject.name} (${subject.code})`,
        ]),
    );
    const teacherItems = Object.fromEntries(
        teachers.map((teacher) => [
            teacher.id,
            `${teacher.name} (${teacher.code})`,
        ]),
    );
    const periodItems = Object.fromEntries(
        periods.map((period) => [
            period.id,
            `${period.order}. ${formatTime(period.start_time)}?${formatTime(period.end_time)}`,
        ]),
    );

    const selected =
        schedules.data.find((schedule) => schedule.id === selectedId) ?? null;
    const details = selected?.schedule_details ?? [];
    const cellEntries = cell
        ? details
              .filter(
                  (detail) =>
                      detail.class_id === cell.classId &&
                      detail.day === cell.day,
              )
              .sort(
                  (a, b) =>
                      (a.start_period?.order ?? 0) -
                      (b.start_period?.order ?? 0),
              )
        : [];
    const cellClass = cell
        ? (sortedClasses.find((classroom) => classroom.id === cell.classId) ??
          null)
        : null;

    const entriesFor = (classId: string, day: SchoolDay) =>
        details
            .filter(
                (detail) => detail.class_id === classId && detail.day === day,
            )
            .sort(
                (a, b) =>
                    (a.start_period?.order ?? 0) - (b.start_period?.order ?? 0),
            );

    const detailError = (index: number, field: keyof DetailRow) =>
        (form.errors as Record<string, string | undefined>)[
            `details.${index}.${field}`
        ];

    const search = (value: string) => {
        router.get(
            route("curriculum.management.schedules", {}, false),
            value ? { search: value } : {},
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const openCreate = () => {
        setEditing(null);
        setDetailFilter("");
        form.clearErrors();
        form.setData({
            name: "",
            active_date: "",
            details: [emptyRow()],
        });
        setFormOpen(true);
    };

    const openEdit = (schedule: Schedule) => {
        setEditing(schedule);
        setDetailFilter("");
        form.clearErrors();

        const formattedDate = schedule.active_date
            ? schedule.active_date.slice(0, 10)
            : "";

        const mappedDetails: DetailRow[] =
            schedule.schedule_details && schedule.schedule_details.length > 0
                ? schedule.schedule_details.map((detail) => ({
                      day: detail.day || "",
                      class_id: detail.class_id || "",
                      subject_id: detail.subject_id || "",
                      teacher_id: detail.teacher_id || "",
                      start_period_id: detail.start_period_id || "",
                      end_period_id: detail.end_period_id || "",
                  }))
                : [emptyRow()];

        form.setData({
            name: schedule.name,
            active_date: formattedDate,
            details: mappedDetails,
        });
        setFormOpen(true);
    };

    const updateRow = (index: number, patch: Partial<DetailRow>) => {
        form.setData(
            "details",
            form.data.details.map((row, rowIndex) =>
                rowIndex === index ? { ...row, ...patch } : row,
            ),
        );
    };

    const addRow = () => {
        form.setData("details", [...form.data.details, emptyRow()]);
    };

    const removeRow = (index: number) => {
        form.setData(
            "details",
            form.data.details.filter((_, rowIndex) => rowIndex !== index),
        );
    };

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const options = {
            preserveScroll: true,
            onSuccess: () => {
                setFormOpen(false);
                setEditing(null);
            },
        };

        if (editing) {
            form.put(
                route("curriculum.management.schedules.update", editing.id),
                options,
            );
        } else {
            form.post(route("curriculum.management.schedules.store"), options);
        }
    };

    const confirmDelete = () => {
        if (!deleting) {
            return;
        }

        form.delete(
            route("curriculum.management.schedules.destroy", deleting.id),
            {
                preserveScroll: true,
                onSuccess: () => {
                    if (selectedId === deleting.id) {
                        setSelectedId(null);
                    }
                    setDeleting(null);
                },
            },
        );
    };

    const selectSchedule = (schedule: Schedule) => {
        setCell(null);
        setSelectedId(schedule.id);
    };

    const filteredDetails = form.data.details
        .map((row, index) => ({ row, originalIndex: index }))
        .filter(({ row }) => {
            if (!detailFilter.trim()) return true;
            const q = detailFilter.toLowerCase().trim();

            const dayStr = dayLabel(row.day).toLowerCase();
            const classStr = (classItems[row.class_id] ?? "").toLowerCase();
            const subjectStr = (
                subjectItems[row.subject_id] ?? ""
            ).toLowerCase();
            const teacherStr = (
                teacherItems[row.teacher_id] ?? ""
            ).toLowerCase();

            return (
                dayStr.includes(q) ||
                classStr.includes(q) ||
                subjectStr.includes(q) ||
                teacherStr.includes(q)
            );
        });
    return (
        <CurriculumLayout>
            <Head title="Manajemen Jadwal" />

            <div className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex flex-col gap-1.5">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Manajemen Jadwal
                    </h1>
                </div>
                <Button onClick={openCreate}>
                    <PlusIcon />
                    Tambah Jadwal
                </Button>
            </div>

            <DataTableCard
                toolbar={
                    <SearchInput
                        value={filters.search}
                        onSearch={search}
                        placeholder="Cari nama jadwal..."
                    />
                }
                footer={<Pagination paginator={schedules} />}
            >
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-14 text-center">
                                No
                            </TableHead>
                            <TableHead>Nama Jadwal</TableHead>
                            <TableHead>Aktif Sejak</TableHead>
                            <TableHead>Detail</TableHead>
                            <TableHead className="w-[1%] text-right">
                                Aksi
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {schedules.data.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={5}
                                    className="h-24 text-center text-muted-foreground"
                                >
                                    Tidak ada jadwal yang ditemukan.
                                </TableCell>
                            </TableRow>
                        ) : (
                            schedules.data.map((schedule, index) => (
                                <TableRow
                                    key={schedule.id}
                                    className="cursor-pointer"
                                    onClick={() => selectSchedule(schedule)}
                                >
                                    <TableCell className="text-center tabular-nums text-muted-foreground">
                                        {rowNumber(schedules, index)}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {schedule.name}
                                    </TableCell>
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
                                            onClick={(event) =>
                                                event.stopPropagation()
                                            }
                                        >
                                            <Button
                                                variant="ghost"
                                                size="icon-sm"
                                                aria-label="Ubah"
                                                onClick={() =>
                                                    openEdit(schedule)
                                                }
                                            >
                                                <PencilIcon />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon-sm"
                                                className="text-destructive"
                                                aria-label="Hapus"
                                                onClick={() =>
                                                    setDeleting(schedule)
                                                }
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
            </DataTableCard>

            {selected && (
                <div className="flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex flex-col gap-0.5">
                            <h2 className="text-lg font-semibold">
                                {selected.name}
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Aktif sejak {formatDate(selected.active_date)} ?
                                Klik tombol pada sel untuk melihat rinciannya.
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setCell(null);
                                setSelectedId(null);
                            }}
                        >
                            <XIcon />
                            Tutup Detail
                        </Button>
                    </div>

                    <div className="overflow-x-auto rounded-xl border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-14 text-center">
                                        No
                                    </TableHead>
                                    <TableHead className="w-40">
                                        Kelas
                                    </TableHead>
                                    {DAYS.map((day) => (
                                        <TableHead
                                            key={day.key}
                                            className="text-center"
                                        >
                                            {day.label}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sortedClasses.map((classroom, index) => (
                                    <TableRow key={classroom.id}>
                                        <TableCell className="text-center tabular-nums text-muted-foreground">
                                            {index + 1}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {classroom.label}
                                        </TableCell>
                                        {DAYS.map((day) => {
                                            const entries = entriesFor(
                                                classroom.id,
                                                day.key,
                                            );

                                            return (
                                                <TableCell
                                                    key={day.key}
                                                    className="text-center"
                                                >
                                                    {entries.length > 0 ? (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() =>
                                                                setCell({
                                                                    classId:
                                                                        classroom.id,
                                                                    day: day.key,
                                                                })
                                                            }
                                                        >
                                                            {entries.length}{" "}
                                                            jadwal
                                                        </Button>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">
                                                            -
                                                        </span>
                                                    )}
                                                </TableCell>
                                            );
                                        })}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}

            {/* Dialog Detail Sel Matriks Jadwal */}
            <Dialog
                open={Boolean(cell)}
                onOpenChange={(open) => {
                    if (!open) {
                        setCell(null);
                    }
                }}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Rincian Jadwal</DialogTitle>
                        <DialogDescription>
                            {cellClass?.label} ?{" "}
                            {cell ? dayLabel(cell.day) : ""}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col gap-2">
                        {cellEntries.map((entry) => (
                            <div
                                key={entry.id}
                                className="flex items-center justify-between rounded-lg border p-3 text-sm"
                            >
                                <div className="flex flex-col gap-0.5">
                                    <span className="font-medium">
                                        {entry.subject?.name} (
                                        {entry.subject?.code})
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        Guru: {entry.teacher?.name} (
                                        {entry.teacher?.code})
                                    </span>
                                </div>
                                <div className="flex flex-col items-end gap-0.5 text-xs text-muted-foreground">
                                    <span>
                                        Jam {entry.start_period?.order}?
                                        {entry.end_period?.order}
                                    </span>
                                    <span>
                                        {entry.start_period
                                            ? formatTime(
                                                  entry.start_period.start_time,
                                              )
                                            : ""}
                                        ?
                                        {entry.end_period
                                            ? formatTime(
                                                  entry.end_period.end_time,
                                              )
                                            : ""}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <DialogFooter>
                        <DialogClose render={<Button variant="outline" />}>
                            Tutup
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog Form Tambah / Edit Jadwal */}
            <Dialog open={formOpen} onOpenChange={setFormOpen}>
                <DialogContent className="h-[90vh] max-h-[calc(100vh-2rem)] w-[calc(100vw-2rem)] overflow-y-auto sm:max-w-7xl">
                    <DialogHeader>
                        <DialogTitle>
                            {editing ? "Ubah Jadwal" : "Tambah Jadwal Baru"}
                        </DialogTitle>
                        <DialogDescription>
                            Isi nama, tanggal aktif, dan rincian slot jadwal
                            pelajaran.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={submit} noValidate className="grid gap-4">
                        <FieldGroup>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <Field data-invalid={!!form.errors.name}>
                                    <FieldLabel htmlFor="schedule-name">
                                        Nama Jadwal
                                    </FieldLabel>
                                    <Input
                                        id="schedule-name"
                                        placeholder="cth. Jadwal Semester Ganjil 2026/2027"
                                        value={form.data.name}
                                        onChange={(event) =>
                                            form.setData(
                                                "name",
                                                event.target.value,
                                            )
                                        }
                                    />
                                    <FieldError>{form.errors.name}</FieldError>
                                </Field>

                                <Field data-invalid={!!form.errors.active_date}>
                                    <FieldLabel htmlFor="active-date">
                                        Tanggal Aktif
                                    </FieldLabel>
                                    <Input
                                        id="active-date"
                                        type="date"
                                        value={form.data.active_date}
                                        onChange={(event) =>
                                            form.setData(
                                                "active_date",
                                                event.target.value,
                                            )
                                        }
                                    />
                                    <FieldError>
                                        {form.errors.active_date}
                                    </FieldError>
                                </Field>
                            </div>

                            <Field data-invalid={!!form.errors.details}>
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mt-2">
                                    <div>
                                        <FieldLabel>
                                            Detail Jadwal (
                                            {form.data.details.length})
                                        </FieldLabel>
                                        <p className="text-xs text-muted-foreground">
                                            Kelola rincian mata pelajaran,
                                            kelas, guru, dan jam pelajaran.
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="relative">
                                            <SearchIcon className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Cari (guru, kelas, hari, mapel)..."
                                                value={detailFilter}
                                                onChange={(e) =>
                                                    setDetailFilter(
                                                        e.target.value,
                                                    )
                                                }
                                                className="pl-8 h-8 text-xs w-56 sm:w-64"
                                            />
                                        </div>
                                        <Button
                                            type="button"
                                            size="sm"
                                            onClick={addRow}
                                        >
                                            <PlusIcon className="size-3.5" />
                                            Tambah Detail
                                        </Button>
                                    </div>
                                </div>
                                <FieldError>{form.errors.details}</FieldError>
                            </Field>

                            <div className="overflow-x-auto rounded-xl border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-12 text-center">
                                                No.
                                            </TableHead>
                                            <TableHead className="w-32">
                                                Hari
                                            </TableHead>
                                            <TableHead className="w-36">
                                                Kelas
                                            </TableHead>
                                            <TableHead className="min-w-44">
                                                Mata Pelajaran
                                            </TableHead>
                                            <TableHead className="min-w-44">
                                                Guru
                                            </TableHead>
                                            <TableHead className="w-36">
                                                Jam Mulai
                                            </TableHead>
                                            <TableHead className="w-36">
                                                Jam Selesai
                                            </TableHead>
                                            <TableHead className="w-16 text-right">
                                                Aksi
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredDetails.length === 0 ? (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={8}
                                                    className="h-24 text-center text-muted-foreground"
                                                >
                                                    {detailFilter.trim()
                                                        ? "Tidak ada detail yang sesuai dengan filter pencarian."
                                                        : "Belum ada detail jadwal. Klik 'Tambah Detail' untuk menambahkan."}
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredDetails.map(
                                                ({ row, originalIndex }) => (
                                                    <TableRow
                                                        key={originalIndex}
                                                    >
                                                        <TableCell className="text-center font-mono text-xs text-muted-foreground">
                                                            {originalIndex + 1}
                                                        </TableCell>

                                                        {/* Hari */}
                                                        <TableCell>
                                                            <div className="flex flex-col gap-1">
                                                                <Select
                                                                    value={
                                                                        row.day ||
                                                                        null
                                                                    }
                                                                    onValueChange={(
                                                                        value,
                                                                    ) =>
                                                                        updateRow(
                                                                            originalIndex,
                                                                            {
                                                                                day: (value ??
                                                                                    "") as SchoolDay,
                                                                            },
                                                                        )
                                                                    }
                                                                    items={
                                                                        dayItems
                                                                    }
                                                                >
                                                                    <SelectTrigger className="w-full text-xs">
                                                                        <SelectValue placeholder="Pilih hari" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {DAYS.map(
                                                                            (
                                                                                day,
                                                                            ) => (
                                                                                <SelectItem
                                                                                    key={
                                                                                        day.key
                                                                                    }
                                                                                    value={
                                                                                        day.key
                                                                                    }
                                                                                >
                                                                                    {
                                                                                        day.label
                                                                                    }
                                                                                </SelectItem>
                                                                            ),
                                                                        )}
                                                                    </SelectContent>
                                                                </Select>
                                                                {detailError(
                                                                    originalIndex,
                                                                    "day",
                                                                ) && (
                                                                    <span className="text-[10px] text-destructive font-medium">
                                                                        {detailError(
                                                                            originalIndex,
                                                                            "day",
                                                                        )}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </TableCell>

                                                        {/* Kelas */}
                                                        <TableCell>
                                                            <div className="flex flex-col gap-1">
                                                                <Select
                                                                    value={
                                                                        row.class_id ||
                                                                        null
                                                                    }
                                                                    onValueChange={(
                                                                        value,
                                                                    ) =>
                                                                        updateRow(
                                                                            originalIndex,
                                                                            {
                                                                                class_id:
                                                                                    String(
                                                                                        value ??
                                                                                            "",
                                                                                    ),
                                                                            },
                                                                        )
                                                                    }
                                                                    items={
                                                                        classItems
                                                                    }
                                                                >
                                                                    <SelectTrigger className="w-full text-xs">
                                                                        <SelectValue placeholder="Pilih kelas" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {sortedClasses.map(
                                                                            (
                                                                                classroom,
                                                                            ) => (
                                                                                <SelectItem
                                                                                    key={
                                                                                        classroom.id
                                                                                    }
                                                                                    value={
                                                                                        classroom.id
                                                                                    }
                                                                                >
                                                                                    {
                                                                                        classroom.label
                                                                                    }
                                                                                </SelectItem>
                                                                            ),
                                                                        )}
                                                                    </SelectContent>
                                                                </Select>
                                                                {detailError(
                                                                    originalIndex,
                                                                    "class_id",
                                                                ) && (
                                                                    <span className="text-[10px] text-destructive font-medium">
                                                                        {detailError(
                                                                            originalIndex,
                                                                            "class_id",
                                                                        )}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </TableCell>

                                                        {/* Mata Pelajaran */}
                                                        <TableCell>
                                                            <div className="flex flex-col gap-1">
                                                                <Select
                                                                    value={
                                                                        row.subject_id ||
                                                                        null
                                                                    }
                                                                    onValueChange={(
                                                                        value,
                                                                    ) =>
                                                                        updateRow(
                                                                            originalIndex,
                                                                            {
                                                                                subject_id:
                                                                                    String(
                                                                                        value ??
                                                                                            "",
                                                                                    ),
                                                                            },
                                                                        )
                                                                    }
                                                                    items={
                                                                        subjectItems
                                                                    }
                                                                >
                                                                    <SelectTrigger className="w-full text-xs">
                                                                        <SelectValue placeholder="Pilih mapel" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {subjects.map(
                                                                            (
                                                                                subject,
                                                                            ) => (
                                                                                <SelectItem
                                                                                    key={
                                                                                        subject.id
                                                                                    }
                                                                                    value={
                                                                                        subject.id
                                                                                    }
                                                                                >
                                                                                    {
                                                                                        subject.name
                                                                                    }{" "}
                                                                                    (
                                                                                    {
                                                                                        subject.code
                                                                                    }

                                                                                    )
                                                                                </SelectItem>
                                                                            ),
                                                                        )}
                                                                    </SelectContent>
                                                                </Select>
                                                                {detailError(
                                                                    originalIndex,
                                                                    "subject_id",
                                                                ) && (
                                                                    <span className="text-[10px] text-destructive font-medium">
                                                                        {detailError(
                                                                            originalIndex,
                                                                            "subject_id",
                                                                        )}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </TableCell>

                                                        {/* Guru */}
                                                        <TableCell>
                                                            <div className="flex flex-col gap-1">
                                                                <Select
                                                                    value={
                                                                        row.teacher_id ||
                                                                        null
                                                                    }
                                                                    onValueChange={(
                                                                        value,
                                                                    ) =>
                                                                        updateRow(
                                                                            originalIndex,
                                                                            {
                                                                                teacher_id:
                                                                                    String(
                                                                                        value ??
                                                                                            "",
                                                                                    ),
                                                                            },
                                                                        )
                                                                    }
                                                                    items={
                                                                        teacherItems
                                                                    }
                                                                >
                                                                    <SelectTrigger className="w-full text-xs">
                                                                        <SelectValue placeholder="Pilih guru" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {teachers.map(
                                                                            (
                                                                                teacher,
                                                                            ) => (
                                                                                <SelectItem
                                                                                    key={
                                                                                        teacher.id
                                                                                    }
                                                                                    value={
                                                                                        teacher.id
                                                                                    }
                                                                                >
                                                                                    {
                                                                                        teacher.name
                                                                                    }{" "}
                                                                                    (
                                                                                    {
                                                                                        teacher.code
                                                                                    }

                                                                                    )
                                                                                </SelectItem>
                                                                            ),
                                                                        )}
                                                                    </SelectContent>
                                                                </Select>
                                                                {detailError(
                                                                    originalIndex,
                                                                    "teacher_id",
                                                                ) && (
                                                                    <span className="text-[10px] text-destructive font-medium">
                                                                        {detailError(
                                                                            originalIndex,
                                                                            "teacher_id",
                                                                        )}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </TableCell>

                                                        {/* Jam Mulai */}
                                                        <TableCell>
                                                            <div className="flex flex-col gap-1">
                                                                <Select
                                                                    value={
                                                                        row.start_period_id ||
                                                                        null
                                                                    }
                                                                    onValueChange={(
                                                                        value,
                                                                    ) =>
                                                                        updateRow(
                                                                            originalIndex,
                                                                            {
                                                                                start_period_id:
                                                                                    String(
                                                                                        value ??
                                                                                            "",
                                                                                    ),
                                                                            },
                                                                        )
                                                                    }
                                                                    items={
                                                                        periodItems
                                                                    }
                                                                >
                                                                    <SelectTrigger className="w-full text-xs">
                                                                        <SelectValue placeholder="Pilih mulai" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {periods.map(
                                                                            (
                                                                                period,
                                                                            ) => (
                                                                                <SelectItem
                                                                                    key={
                                                                                        period.id
                                                                                    }
                                                                                    value={
                                                                                        period.id
                                                                                    }
                                                                                >
                                                                                    {
                                                                                        period.order
                                                                                    }

                                                                                    .{" "}
                                                                                    {formatTime(
                                                                                        period.start_time,
                                                                                    )}

                                                                                    ?
                                                                                    {formatTime(
                                                                                        period.end_time,
                                                                                    )}
                                                                                </SelectItem>
                                                                            ),
                                                                        )}
                                                                    </SelectContent>
                                                                </Select>
                                                                {detailError(
                                                                    originalIndex,
                                                                    "start_period_id",
                                                                ) && (
                                                                    <span className="text-[10px] text-destructive font-medium">
                                                                        {detailError(
                                                                            originalIndex,
                                                                            "start_period_id",
                                                                        )}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </TableCell>

                                                        {/* Jam Selesai */}
                                                        <TableCell>
                                                            <div className="flex flex-col gap-1">
                                                                <Select
                                                                    value={
                                                                        row.end_period_id ||
                                                                        null
                                                                    }
                                                                    onValueChange={(
                                                                        value,
                                                                    ) =>
                                                                        updateRow(
                                                                            originalIndex,
                                                                            {
                                                                                end_period_id:
                                                                                    String(
                                                                                        value ??
                                                                                            "",
                                                                                    ),
                                                                            },
                                                                        )
                                                                    }
                                                                    items={
                                                                        periodItems
                                                                    }
                                                                >
                                                                    <SelectTrigger className="w-full text-xs">
                                                                        <SelectValue placeholder="Pilih selesai" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {periods.map(
                                                                            (
                                                                                period,
                                                                            ) => (
                                                                                <SelectItem
                                                                                    key={
                                                                                        period.id
                                                                                    }
                                                                                    value={
                                                                                        period.id
                                                                                    }
                                                                                >
                                                                                    {
                                                                                        period.order
                                                                                    }

                                                                                    .{" "}
                                                                                    {formatTime(
                                                                                        period.start_time,
                                                                                    )}

                                                                                    ?
                                                                                    {formatTime(
                                                                                        period.end_time,
                                                                                    )}
                                                                                </SelectItem>
                                                                            ),
                                                                        )}
                                                                    </SelectContent>
                                                                </Select>
                                                                {detailError(
                                                                    originalIndex,
                                                                    "end_period_id",
                                                                ) && (
                                                                    <span className="text-[10px] text-destructive font-medium">
                                                                        {detailError(
                                                                            originalIndex,
                                                                            "end_period_id",
                                                                        )}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </TableCell>

                                                        {/* Aksi */}
                                                        <TableCell className="text-right">
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon-sm"
                                                                className="text-destructive"
                                                                disabled={
                                                                    form.data
                                                                        .details
                                                                        .length ===
                                                                    1
                                                                }
                                                                onClick={() =>
                                                                    removeRow(
                                                                        originalIndex,
                                                                    )
                                                                }
                                                            >
                                                                <Trash2Icon className="size-3.5" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ),
                                            )
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </FieldGroup>
                        <DialogFooter className="gap-2 sm:gap-0 mt-2">
                            <DialogClose
                                render={
                                    <Button type="button" variant="outline" />
                                }
                            >
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
                        setDeleting(null);
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
    );
}

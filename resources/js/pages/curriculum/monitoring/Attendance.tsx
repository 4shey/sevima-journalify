import { useState } from "react";
import { Head, router } from "@inertiajs/react";
import { ArrowLeftIcon, EyeIcon, UserCheckIcon } from "lucide-react";

import { DataTableCard } from "@/components/management/data-table-card";
import { Pagination } from "@/components/management/pagination";
import { SearchInput } from "@/components/management/search-input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    Paginated,
    ScheduleDetail,
    Student,
} from "@/types";

export interface StudentWithAttendances extends Student {
    classroom: Classroom | null;
    latest_status?: AttendanceStatus | null;
}

const STATUS_MAP: Record<
    AttendanceStatus,
    { label: string; className: string }
> = {
    H: {
        label: "Hadir",
        className:
            "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300",
    },
    I: {
        label: "Izin",
        className:
            "bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950 dark:text-blue-300",
    },
    S: {
        label: "Sakit",
        className:
            "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-300",
    },
    A: {
        label: "Alpha",
        className:
            "bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950 dark:text-rose-300",
    },
};

const STATUS_OPTIONS: { value: AttendanceStatus; label: string }[] = [
    { value: "H", label: "Hadir (H)" },
    { value: "I", label: "Izin (I)" },
    { value: "S", label: "Sakit (S)" },
    { value: "A", label: "Alpha (A)" },
];

const STATUS_ITEMS = Object.fromEntries(
    STATUS_OPTIONS.map((opt) => [opt.value, opt.label]),
);

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

export default function Attendance({
    students,
    classSlots,
    activeSchedule,
    date,
    maxDate,
    weekday,
    filters,
}: {
    students: Paginated<StudentWithAttendances>;
    classSlots: ScheduleDetail[];
    activeSchedule: { id: string; name: string; active_date: string } | null;
    date: string;
    maxDate: string;
    weekday: string;
    filters: { search: string; date: string };
}) {
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
        null,
    );
    const [updatingJournalId, setUpdatingJournalId] = useState<string | null>(
        null,
    );

    const selectedStudent =
        students.data.find((s) => s.id === selectedStudentId) ?? null;

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
            route("curriculum.monitoring.attendance", {}, false),
            queryParams({ search: value }),
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const changeDate = (value: string) => {
        const nextDate = value > maxDate ? maxDate : value || maxDate;
        router.get(
            route("curriculum.monitoring.attendance", {}, false),
            queryParams({ date: nextDate }),
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const handleUpdateStatus = (
        journalId: string,
        status: AttendanceStatus,
    ) => {
        if (!selectedStudent) return;
        setUpdatingJournalId(journalId);

        router.put(
            route(
                "curriculum.monitoring.attendance.update",
                { journal: journalId },
                false,
            ),
            {
                student_id: selectedStudent.id,
                status,
            },
            {
                preserveState: true,
                preserveScroll: true,
                onFinish: () => setUpdatingJournalId(null),
            },
        );
    };

    const selectedSlots = selectedStudent
        ? classSlots
              .filter((slot) => slot.class_id === selectedStudent.class_id)
              .sort(
                  (a, b) =>
                      (a.start_period?.order ?? 0) -
                      (b.start_period?.order ?? 0),
              )
        : [];

    return (
        <CurriculumLayout>
            <Head
                title={
                    selectedStudent
                        ? `Rincian Presensi: ${selectedStudent.name}`
                        : "Absensi Siswa"
                }
            />

            {selectedStudent ? (
                /* Child Page: Rincian Presensi Siswa */
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedStudentId(null)}
                                    className="gap-1.5 text-xs"
                                >
                                    <ArrowLeftIcon className="size-3.5" />
                                    Kembali ke Daftar Siswa
                                </Button>
                            </div>
                            <h1 className="text-2xl font-semibold tracking-tight mt-2 flex items-center gap-2">
                                <UserCheckIcon className="size-6 text-primary" />
                                Rincian Presensi: {selectedStudent.name}
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                No. Absen {selectedStudent.attendance_number} ?
                                Kelas {selectedStudent.classroom?.label ?? "-"}{" "}
                                ? {DAY_LABELS[weekday] ?? weekday},{" "}
                                {formatDate(date)}
                            </p>
                        </div>

                        <div className="grid w-full gap-1.5 sm:w-auto">
                            <label
                                htmlFor="attendance-child-date"
                                className="text-sm font-medium"
                            >
                                Tanggal
                            </label>
                            <Input
                                id="attendance-child-date"
                                type="date"
                                max={maxDate}
                                value={filters.date}
                                onChange={(event) =>
                                    changeDate(event.target.value)
                                }
                            />
                        </div>
                    </div>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">
                                Status Presensi Per Jurnal
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto rounded-xl border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-14 text-center">
                                                No
                                            </TableHead>
                                            <TableHead>
                                                Mata Pelajaran
                                            </TableHead>
                                            <TableHead>Guru Pengajar</TableHead>
                                            <TableHead>Jam Pelajaran</TableHead>
                                            <TableHead className="w-36 text-right">
                                                Status Presensi
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {selectedSlots.length === 0 ? (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={5}
                                                    className="h-24 text-center text-muted-foreground"
                                                >
                                                    Tidak ada jadwal jurnal
                                                    untuk kelas siswa ini pada
                                                    tanggal tersebut.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            selectedSlots.map((slot, index) => {
                                                const attendance =
                                                    slot.journal?.attendances?.find(
                                                        (row) =>
                                                            row.student_id ===
                                                            selectedStudent.id,
                                                    );
                                                const startP =
                                                    slot.start_period;
                                                const endP = slot.end_period;

                                                return (
                                                    <TableRow key={slot.id}>
                                                        <TableCell className="text-center tabular-nums text-muted-foreground">
                                                            {index + 1}
                                                        </TableCell>
                                                        <TableCell className="font-medium">
                                                            <div className="flex flex-col">
                                                                <span>
                                                                    {slot
                                                                        .subject
                                                                        ?.name ??
                                                                        "-"}
                                                                </span>
                                                                <span className="text-xs text-muted-foreground">
                                                                    {slot
                                                                        .journal
                                                                        ?.name ??
                                                                        slot
                                                                            .subject
                                                                            ?.code ??
                                                                        "-"}
                                                                </span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-muted-foreground text-xs">
                                                            {slot.teacher
                                                                ?.name ??
                                                                "-"}{" "}
                                                            (
                                                            {slot.teacher
                                                                ?.code ?? "-"}
                                                            )
                                                        </TableCell>
                                                        <TableCell className="text-xs font-mono">
                                                            Jam ke-
                                                            {startP?.order ??
                                                                "?"}
                                                            -
                                                            {endP?.order ?? "?"}{" "}
                                                            (
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
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            {slot.journal ? (
                                                                <Select
                                                                    value={
                                                                        attendance?.status ??
                                                                        ""
                                                                    }
                                                                    onValueChange={(
                                                                        val,
                                                                    ) => {
                                                                        if (
                                                                            val &&
                                                                            slot.journal
                                                                        ) {
                                                                            handleUpdateStatus(
                                                                                slot
                                                                                    .journal
                                                                                    .id,
                                                                                val as AttendanceStatus,
                                                                            );
                                                                        }
                                                                    }}
                                                                    items={
                                                                        STATUS_ITEMS
                                                                    }
                                                                    disabled={
                                                                        updatingJournalId ===
                                                                        slot
                                                                            .journal
                                                                            .id
                                                                    }
                                                                >
                                                                    <SelectTrigger className="w-32 ml-auto text-xs">
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
                                                            ) : (
                                                                <Badge
                                                                    variant="outline"
                                                                    className="text-muted-foreground font-normal"
                                                                >
                                                                    Jurnal Belum
                                                                    Ada
                                                                </Badge>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            ) : (
                /* Main Page: Monitoring Absensi Siswa */
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex flex-col gap-1.5">
                            <h1 className="text-2xl font-semibold tracking-tight">
                                Monitoring Absensi Siswa
                            </h1>
                        </div>
                    </div>

                    <DataTableCard
                        toolbar={
                            <>
                                <SearchInput
                                    value={filters.search}
                                    onSearch={search}
                                    placeholder="Cari nama siswa, no absen, atau kelas..."
                                />
                                <div className="grid w-full gap-1.5 sm:w-auto">
                                    <label
                                        htmlFor="attendance-date"
                                        className="text-sm font-medium"
                                    >
                                        Tanggal
                                    </label>
                                    <Input
                                        id="attendance-date"
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
                        footer={<Pagination paginator={students} />}
                    >
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
                                    <TableHead>Kelas</TableHead>
                                    <TableHead>Status Terakhir</TableHead>
                                    <TableHead className="w-[1%] text-right">
                                        Aksi
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {students.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="h-24 text-center text-muted-foreground"
                                        >
                                            Tidak ada siswa yang ditemukan.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    students.data.map((student, index) => {
                                        const statusInfo = student.latest_status
                                            ? STATUS_MAP[student.latest_status]
                                            : null;

                                        return (
                                            <TableRow key={student.id}>
                                                <TableCell className="text-center tabular-nums text-muted-foreground">
                                                    {rowNumber(students, index)}
                                                </TableCell>
                                                <TableCell className="font-mono text-muted-foreground">
                                                    {student.attendance_number}
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {student.name}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">
                                                        {student.classroom
                                                            ?.label ?? "-"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {statusInfo ? (
                                                        <Badge
                                                            variant="outline"
                                                            className={
                                                                statusInfo.className
                                                            }
                                                        >
                                                            {statusInfo.label}
                                                        </Badge>
                                                    ) : (
                                                        <Badge
                                                            variant="outline"
                                                            className="text-muted-foreground font-normal"
                                                        >
                                                            Belum Ada Presensi
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="gap-1.5 text-xs"
                                                        onClick={() =>
                                                            setSelectedStudentId(
                                                                student.id,
                                                            )
                                                        }
                                                    >
                                                        <EyeIcon className="size-3.5" />
                                                        Lihat Rincian
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </DataTableCard>
                </div>
            )}
        </CurriculumLayout>
    );
}

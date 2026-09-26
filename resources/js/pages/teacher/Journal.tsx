import { useState } from "react";
import { Head, router } from "@inertiajs/react";
import {
    NotebookPenIcon,
    ClockIcon,
    CalendarIcon,
    UsersIcon,
    EyeIcon,
    BookOpenIcon,
    GraduationCapIcon,
} from "lucide-react";

import { DataTableCard } from "@/components/management/data-table-card";
import { Pagination } from "@/components/management/pagination";
import { SearchInput } from "@/components/management/search-input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import TeacherLayout from "@/layouts/TeacherLayout";
import type { AttendanceStatus, Paginated, ScheduleDetail } from "@/types";

export interface JournalAttendanceItem {
    id: string;
    journal_id: string;
    student_id: string;
    status: AttendanceStatus;
    student: {
        id: string;
        name: string;
        attendance_number: number;
    } | null;
}

export interface JournalItem {
    id: string;
    name: string;
    date: string;
    schedule_detail_id: string;
    schedule_detail: ScheduleDetail | null;
    attendances?: JournalAttendanceItem[];
    attendances_count?: number;
    hadir_count?: number;
    izin_count?: number;
    sakit_count?: number;
    alpha_count?: number;
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

export default function Journal({
    journals,
    filters,
}: {
    journals: Paginated<JournalItem>;
    filters: { search: string };
}) {
    const [selectedJournal, setSelectedJournal] = useState<JournalItem | null>(
        null,
    );

    const search = (value: string) => {
        router.get(
            route("teacher.journal", {}, false),
            value ? { search: value } : {},
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    return (
        <TeacherLayout>
            <Head title="Riwayat Jurnal" />

            <div className="flex flex-col gap-1.5">
                <h1 className="text-2xl font-semibold tracking-tight">
                    Riwayat Jurnal Mengajar
                </h1>
            </div>

            <DataTableCard
                toolbar={
                    <SearchInput
                        value={filters.search}
                        onSearch={search}
                        placeholder="Cari nama jurnal, mapel, atau kelas..."
                    />
                }
                footer={<Pagination paginator={journals} />}
            >
                <div className="p-4">
                    {journals.data.length === 0 ? (
                        <div className="rounded-xl border border-dashed p-8 text-center">
                            <NotebookPenIcon className="mx-auto size-8 text-muted-foreground/50" />
                            <h3 className="mt-2 text-sm font-semibold">
                                Belum Ada Riwayat Jurnal
                            </h3>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Jurnal mengajar yang Anda isi dari menu Jadwal
                                akan tercatat dan ditampilkan di sini.
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {journals.data.map((journal) => {
                                const detail = journal.schedule_detail;
                                const subject = detail?.subject;
                                const classroom = detail?.classroom;
                                const startPeriod = detail?.start_period;
                                const endPeriod = detail?.end_period;

                                return (
                                    <Card
                                        key={journal.id}
                                        className="shadow-xs hover:border-primary/40 transition-colors"
                                    >
                                        <CardHeader>
                                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                                <div className="space-y-1">
                                                    <CardTitle className="text-lg font-semibold">
                                                        {journal.name}
                                                    </CardTitle>
                                                    <CardDescription className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                                                        <span className="inline-flex items-center gap-1 font-medium text-foreground">
                                                            <BookOpenIcon className="size-3.5 text-muted-foreground" />
                                                            {subject?.name ??
                                                                "-"}{" "}
                                                            (
                                                            {subject?.code ??
                                                                "-"}
                                                            )
                                                        </span>
                                                        <span>•</span>
                                                        <span className="inline-flex items-center gap-1 font-medium text-foreground">
                                                            <GraduationCapIcon className="size-3.5 text-muted-foreground" />
                                                            {classroom?.label ??
                                                                "-"}
                                                        </span>
                                                        <span>•</span>
                                                        <span className="inline-flex items-center gap-1">
                                                            <CalendarIcon className="size-3.5 text-muted-foreground" />
                                                            {formatDate(
                                                                journal.date,
                                                            )}
                                                        </span>
                                                    </CardDescription>
                                                </div>
                                                <Badge
                                                    variant="outline"
                                                    className="w-fit gap-1 shrink-0 font-normal"
                                                >
                                                    <ClockIcon className="size-3" />
                                                    Jam ke-
                                                    {startPeriod?.order ?? "?"}{" "}
                                                    - {endPeriod?.order ?? "?"}{" "}
                                                    (
                                                    {startPeriod
                                                        ? formatTime(
                                                              startPeriod.start_time,
                                                          )
                                                        : "?"}{" "}
                                                    -{" "}
                                                    {endPeriod
                                                        ? formatTime(
                                                              endPeriod.end_time,
                                                          )
                                                        : "?"}
                                                    )
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex flex-wrap items-center gap-2 pt-1">
                                                <span className="text-xs font-semibold text-muted-foreground mr-1">
                                                    Rekap Absensi:
                                                </span>
                                                <Badge
                                                    variant="outline"
                                                    className={
                                                        STATUS_MAP.H.className
                                                    }
                                                >
                                                    Hadir:{" "}
                                                    {journal.hadir_count ?? 0}
                                                </Badge>
                                                <Badge
                                                    variant="outline"
                                                    className={
                                                        STATUS_MAP.I.className
                                                    }
                                                >
                                                    Izin:{" "}
                                                    {journal.izin_count ?? 0}
                                                </Badge>
                                                <Badge
                                                    variant="outline"
                                                    className={
                                                        STATUS_MAP.S.className
                                                    }
                                                >
                                                    Sakit:{" "}
                                                    {journal.sakit_count ?? 0}
                                                </Badge>
                                                <Badge
                                                    variant="outline"
                                                    className={
                                                        STATUS_MAP.A.className
                                                    }
                                                >
                                                    Alpha:{" "}
                                                    {journal.alpha_count ?? 0}
                                                </Badge>
                                                <Badge
                                                    variant="secondary"
                                                    className="ml-auto"
                                                >
                                                    Total:{" "}
                                                    {journal.attendances_count ??
                                                        0}{" "}
                                                    Siswa
                                                </Badge>
                                            </div>
                                        </CardContent>
                                        <CardFooter className="bg-muted/30 border-t justify-end py-2.5">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="gap-1.5 text-xs"
                                                onClick={() =>
                                                    setSelectedJournal(journal)
                                                }
                                            >
                                                <EyeIcon className="size-3.5" />
                                                Lihat Detail Absensi
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </div>
            </DataTableCard>

            {/* Dialog Detail Absensi Siswa */}
            <Dialog
                open={Boolean(selectedJournal)}
                onOpenChange={(open) => {
                    if (!open) setSelectedJournal(null);
                }}
            >
                <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <UsersIcon className="size-5 text-primary" />
                            Detail Absensi Siswa
                        </DialogTitle>
                        <DialogDescription>
                            {selectedJournal ? (
                                <>
                                    {selectedJournal.name} •{" "}
                                    {
                                        selectedJournal.schedule_detail?.subject
                                            ?.name
                                    }{" "}
                                    •{" "}
                                    {
                                        selectedJournal.schedule_detail
                                            ?.classroom?.label
                                    }{" "}
                                    ({formatDate(selectedJournal.date)})
                                </>
                            ) : null}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="mt-2 overflow-x-auto rounded-xl border">
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
                                    <TableHead className="w-32">
                                        Status Kehadiran
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {selectedJournal?.attendances &&
                                selectedJournal.attendances.length > 0 ? (
                                    selectedJournal.attendances.map(
                                        (att, index) => {
                                            const statusInfo =
                                                STATUS_MAP[att.status] ??
                                                STATUS_MAP.H;
                                            return (
                                                <TableRow key={att.id}>
                                                    <TableCell className="text-center tabular-nums text-muted-foreground">
                                                        {index + 1}
                                                    </TableCell>
                                                    <TableCell className="font-mono text-muted-foreground">
                                                        {att.student
                                                            ?.attendance_number ??
                                                            "-"}
                                                    </TableCell>
                                                    <TableCell className="font-medium">
                                                        {att.student?.name ??
                                                            "-"}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant="outline"
                                                            className={
                                                                statusInfo.className
                                                            }
                                                        >
                                                            {statusInfo.label}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        },
                                    )
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={4}
                                            className="h-20 text-center text-muted-foreground"
                                        >
                                            Tidak ada data rincian absensi.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <DialogFooter className="pt-2">
                        <DialogClose render={<Button variant="outline" />}>
                            Tutup
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </TeacherLayout>
    );
}

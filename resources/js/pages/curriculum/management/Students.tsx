import { useState } from "react";
import { Head, router, useForm } from "@inertiajs/react";
import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";

import { ConfirmDeleteDialog } from "@/components/management/confirm-delete-dialog";
import { DataTableCard } from "@/components/management/data-table-card";
import { Pagination } from "@/components/management/pagination";
import { SearchInput } from "@/components/management/search-input";
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
import type { Classroom, Paginated, Student } from "@/types";

export default function Students({
    students,
    classrooms,
    filters,
}: {
    students: Paginated<Student>;
    classrooms: Classroom[];
    filters: { search: string };
}) {
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<Student | null>(null);
    const [deleting, setDeleting] = useState<Student | null>(null);

    const form = useForm({
        name: "",
        class_id: "",
        attendance_number: "",
    });

    const classroomItems = Object.fromEntries(
        classrooms.map((classroom) => [classroom.id, classroom.label]),
    );

    const search = (value: string) => {
        router.get(
            route("curriculum.management.students", {}, false),
            value ? { search: value } : {},
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const openCreate = () => {
        setEditing(null);
        form.clearErrors();
        form.setData({
            name: "",
            class_id: "",
            attendance_number: "",
        });
        setFormOpen(true);
    };

    const openEdit = (student: Student) => {
        setEditing(student);
        form.clearErrors();
        form.setData({
            name: student.name,
            class_id: student.class_id,
            attendance_number: String(student.attendance_number),
        });
        setFormOpen(true);
    };

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const options = {
            preserveScroll: true,
            onSuccess: () => setFormOpen(false),
        };

        if (editing) {
            form.put(
                route("curriculum.management.students.update", editing.id),
                options,
            );
        } else {
            form.post(route("curriculum.management.students.store"), options);
        }
    };

    const confirmDelete = () => {
        if (!deleting) {
            return;
        }

        form.delete(
            route("curriculum.management.students.destroy", deleting.id),
            {
                preserveScroll: true,
                onSuccess: () => setDeleting(null),
            },
        );
    };

    return (
        <CurriculumLayout>
            <Head title="Manajemen Siswa" />

            <div className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex flex-col gap-1.5">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Manajemen Siswa
                    </h1>
                </div>
                <Button onClick={openCreate}>
                    <PlusIcon />
                    Tambah Siswa
                </Button>
            </div>

            <DataTableCard
                toolbar={
                    <SearchInput
                        value={filters.search}
                        onSearch={search}
                        placeholder="Cari nama, nomor absen, atau jurusan..."
                    />
                }
                footer={<Pagination paginator={students} />}
            >
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-14 text-center">
                                No
                            </TableHead>
                            <TableHead>Nama</TableHead>
                            <TableHead>Kelas</TableHead>
                            <TableHead>No. Absen</TableHead>
                            <TableHead className="w-[1%] text-right">
                                Aksi
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {students.data.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={5}
                                    className="h-24 text-center text-muted-foreground"
                                >
                                    Tidak ada siswa yang ditemukan.
                                </TableCell>
                            </TableRow>
                        ) : (
                            students.data.map((student, index) => (
                                <TableRow key={student.id}>
                                    <TableCell className="text-center tabular-nums text-muted-foreground">
                                        {rowNumber(students, index)}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {student.name}
                                    </TableCell>
                                    <TableCell>
                                        {student.classroom?.label ?? "-"}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {student.attendance_number}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon-sm"
                                                aria-label="Ubah"
                                                onClick={() =>
                                                    openEdit(student)
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
                                                    setDeleting(student)
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

            <Dialog open={formOpen} onOpenChange={setFormOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editing ? "Ubah Siswa" : "Tambah Siswa"}
                        </DialogTitle>
                        <DialogDescription>
                            {editing
                                ? "Perbarui data siswa terpilih."
                                : "Tambahkan siswa baru beserta kelasnya."}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submit} noValidate className="grid gap-4">
                        <FieldGroup>
                            <Field data-invalid={!!form.errors.name}>
                                <FieldLabel htmlFor="student-name">
                                    Nama
                                </FieldLabel>
                                <Input
                                    id="student-name"
                                    placeholder="cth. Agus Salim"
                                    value={form.data.name}
                                    onChange={(event) =>
                                        form.setData("name", event.target.value)
                                    }
                                />
                                <FieldError>{form.errors.name}</FieldError>
                            </Field>
                            <Field data-invalid={!!form.errors.class_id}>
                                <FieldLabel>Kelas</FieldLabel>
                                <Select
                                    value={form.data.class_id || null}
                                    onValueChange={(value) =>
                                        form.setData(
                                            "class_id",
                                            String(value ?? ""),
                                        )
                                    }
                                    items={classroomItems}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Pilih kelas" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {classrooms.map((classroom) => (
                                            <SelectItem
                                                key={classroom.id}
                                                value={classroom.id}
                                            >
                                                {classroom.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FieldError>{form.errors.class_id}</FieldError>
                            </Field>
                            <Field
                                data-invalid={!!form.errors.attendance_number}
                            >
                                <FieldLabel htmlFor="student-attendance-number">
                                    Nomor Absen
                                </FieldLabel>
                                <Input
                                    id="student-attendance-number"
                                    type="number"
                                    min={1}
                                    placeholder="cth. 1"
                                    value={form.data.attendance_number}
                                    onChange={(event) =>
                                        form.setData(
                                            "attendance_number",
                                            event.target.value,
                                        )
                                    }
                                />
                                <FieldError>
                                    {form.errors.attendance_number}
                                </FieldError>
                            </Field>
                        </FieldGroup>
                        <DialogFooter>
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
                title="Hapus Siswa"
                description={
                    deleting
                        ? `Data siswa "${deleting.name}" akan dihapus permanen.`
                        : ""
                }
                onConfirm={confirmDelete}
                processing={form.processing}
            />
        </CurriculumLayout>
    );
}

import { useState } from "react";
import { Head, router, useForm } from "@inertiajs/react";
import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";

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
import type { Classroom, Major, Paginated } from "@/types";

export default function Classes({
    classrooms,
    majors,
    filters,
}: {
    classrooms: Paginated<Classroom>;
    majors: Major[];
    filters: { search: string };
}) {
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<Classroom | null>(null);
    const [deleting, setDeleting] = useState<Classroom | null>(null);

    const form = useForm({
        major_id: "",
        grade: "",
    });

    const majorItems = Object.fromEntries(
        majors.map((major) => [major.id, major.name]),
    );

    const search = (value: string) => {
        router.get(
            route("curriculum.management.classes", {}, false),
            value ? { search: value } : {},
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const openCreate = () => {
        setEditing(null);
        form.clearErrors();
        form.setData({
            major_id: "",
            grade: "",
        });
        setFormOpen(true);
    };

    const openEdit = (classroom: Classroom) => {
        setEditing(classroom);
        form.clearErrors();
        form.setData({
            major_id: classroom.major_id,
            grade: classroom.grade,
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
                route("curriculum.management.classes.update", editing.id),
                options,
            );
        } else {
            form.post(route("curriculum.management.classes.store"), options);
        }
    };

    const confirmDelete = () => {
        if (!deleting) {
            return;
        }

        form.delete(
            route("curriculum.management.classes.destroy", deleting.id),
            {
                preserveScroll: true,
                onSuccess: () => setDeleting(null),
            },
        );
    };

    return (
        <CurriculumLayout>
            <Head title="Manajemen Kelas" />

            <div className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex flex-col gap-1.5">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Manajemen Kelas
                    </h1>
                </div>
                <Button onClick={openCreate}>
                    <PlusIcon />
                    Tambah Kelas
                </Button>
            </div>

            <DataTableCard
                toolbar={
                    <SearchInput
                        value={filters.search}
                        onSearch={search}
                        placeholder="Cari tingkat atau jurusan..."
                    />
                }
                footer={<Pagination paginator={classrooms} />}
            >
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-14 text-center">
                                No
                            </TableHead>
                            <TableHead>Tingkat</TableHead>
                            <TableHead>Jurusan</TableHead>
                            <TableHead className="w-[1%] text-right">
                                Aksi
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {classrooms.data.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={4}
                                    className="h-24 text-center text-muted-foreground"
                                >
                                    Tidak ada kelas yang ditemukan.
                                </TableCell>
                            </TableRow>
                        ) : (
                            classrooms.data.map((classroom, index) => (
                                <TableRow key={classroom.id}>
                                    <TableCell className="text-center tabular-nums text-muted-foreground">
                                        {rowNumber(classrooms, index)}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {classroom.grade}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">
                                            {classroom.major?.name ?? "-"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon-sm"
                                                aria-label="Ubah"
                                                onClick={() =>
                                                    openEdit(classroom)
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
                                                    setDeleting(classroom)
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
                            {editing ? "Ubah Kelas" : "Tambah Kelas"}
                        </DialogTitle>
                        <DialogDescription>
                            {editing
                                ? "Perbarui data kelas terpilih."
                                : "Tambahkan kelas baru beserta jurusannya."}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submit} noValidate className="grid gap-4">
                        <FieldGroup>
                            <Field data-invalid={!!form.errors.major_id}>
                                <FieldLabel>Jurusan</FieldLabel>
                                <Select
                                    value={form.data.major_id || null}
                                    onValueChange={(value) =>
                                        form.setData(
                                            "major_id",
                                            String(value ?? ""),
                                        )
                                    }
                                    items={majorItems}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Pilih jurusan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {majors.map((major) => (
                                            <SelectItem
                                                key={major.id}
                                                value={major.id}
                                            >
                                                {major.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FieldError>{form.errors.major_id}</FieldError>
                            </Field>
                            <Field data-invalid={!!form.errors.grade}>
                                <FieldLabel htmlFor="class-grade">
                                    Tingkat
                                </FieldLabel>
                                <Input
                                    id="class-grade"
                                    placeholder="cth. X / XI / XII"
                                    value={form.data.grade}
                                    onChange={(event) =>
                                        form.setData(
                                            "grade",
                                            event.target.value,
                                        )
                                    }
                                />
                                <FieldError>{form.errors.grade}</FieldError>
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
                title="Hapus Kelas"
                description={
                    deleting
                        ? `Kelas "${deleting.label}" akan dihapus. Kelas yang masih memiliki siswa tidak dapat dihapus.`
                        : ""
                }
                onConfirm={confirmDelete}
                processing={form.processing}
            />
        </CurriculumLayout>
    );
}

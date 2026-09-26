import { useState } from "react"
import { Head, router, useForm } from "@inertiajs/react"
import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react"

import { ConfirmDeleteDialog } from "@/components/management/confirm-delete-dialog"
import { FlashAlert } from "@/components/management/flash-alert"
import { Pagination } from "@/components/management/pagination"
import { SearchInput } from "@/components/management/search-input"
import { Badge } from "@/components/ui/badge"
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import CurriculumLayout from "@/layouts/CurriculumLayout"
import type { Paginated, Subject } from "@/types"

export default function Subjects({
  subjects,
  filters,
}: {
  subjects: Paginated<Subject>
  filters: { search: string }
}) {
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Subject | null>(null)
  const [deleting, setDeleting] = useState<Subject | null>(null)

  const form = useForm({
    name: "",
    code: "",
  })

  const search = (value: string) => {
    router.get(
      route("curriculum.management.subjects", {}, false),
      value ? { search: value } : {},
      { preserveState: true, preserveScroll: true, replace: true }
    )
  }

  const openCreate = () => {
    setEditing(null)
    form.clearErrors()
    form.setData({
      name: "",
      code: "",
    })
    setFormOpen(true)
  }

  const openEdit = (subject: Subject) => {
    setEditing(subject)
    form.clearErrors()
    form.setData({
      name: subject.name,
      code: subject.code,
    })
    setFormOpen(true)
  }

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const options = {
      preserveScroll: true,
      onSuccess: () => setFormOpen(false),
    }

    if (editing) {
      form.put(
        route("curriculum.management.subjects.update", editing.id),
        options
      )
    } else {
      form.post(route("curriculum.management.subjects.store"), options)
    }
  }

  const confirmDelete = () => {
    if (!deleting) {
      return
    }

    form.delete(
      route("curriculum.management.subjects.destroy", deleting.id),
      {
        preserveScroll: true,
        onSuccess: () => setDeleting(null),
      }
    )
  }

  return (
    <CurriculumLayout>
      <Head title="Manajemen Mapel" />

      <div className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-semibold tracking-tight">
            Manajemen Mata Pelajaran
          </h1>
          <p className="text-muted-foreground">
            Kelola daftar mata pelajaran beserta kodenya.
          </p>
        </div>
        <Button onClick={openCreate}>
          <PlusIcon />
          Tambah Mapel
        </Button>
      </div>

      <FlashAlert />

      <SearchInput
        value={filters.search}
        onSearch={search}
        placeholder="Cari nama atau kode mapel..."
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama</TableHead>
            <TableHead>Kode</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subjects.data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={3}
                className="h-24 text-center text-muted-foreground"
              >
                Tidak ada mata pelajaran yang ditemukan.
              </TableCell>
            </TableRow>
          ) : (
            subjects.data.map((subject) => (
              <TableRow key={subject.id}>
                <TableCell className="font-medium">{subject.name}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{subject.code}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Ubah"
                      onClick={() => openEdit(subject)}
                    >
                      <PencilIcon />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-destructive"
                      aria-label="Hapus"
                      onClick={() => setDeleting(subject)}
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

      <Pagination paginator={subjects} />

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? "Ubah Mata Pelajaran" : "Tambah Mata Pelajaran"}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? "Perbarui data mata pelajaran terpilih."
                : "Tambahkan mata pelajaran baru."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} noValidate className="grid gap-4">
            <FieldGroup>
              <Field data-invalid={!!form.errors.name}>
                <FieldLabel htmlFor="subject-name">Nama</FieldLabel>
                <Input
                  id="subject-name"
                  placeholder="cth. Matematika"
                  value={form.data.name}
                  onChange={(event) => form.setData("name", event.target.value)}
                />
                <FieldError>{form.errors.name}</FieldError>
              </Field>
              <Field data-invalid={!!form.errors.code}>
                <FieldLabel htmlFor="subject-code">Kode</FieldLabel>
                <Input
                  id="subject-code"
                  placeholder="cth. MTK"
                  value={form.data.code}
                  onChange={(event) => form.setData("code", event.target.value)}
                />
                <FieldError>{form.errors.code}</FieldError>
              </Field>
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
        title="Hapus Mata Pelajaran"
        description={
          deleting
            ? `Mata pelajaran "${deleting.name}" akan dihapus permanen.`
            : ""
        }
        onConfirm={confirmDelete}
        processing={form.processing}
      />
    </CurriculumLayout>
  )
}

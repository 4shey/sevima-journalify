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
import type { Paginated, Teacher } from "@/types"

export default function Teachers({
  teachers,
  filters,
}: {
  teachers: Paginated<Teacher>
  filters: { search: string }
}) {
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Teacher | null>(null)
  const [deleting, setDeleting] = useState<Teacher | null>(null)

  const form = useForm({
    name: "",
    code: "",
    email: "",
    password: "",
  })

  const search = (value: string) => {
    router.get(
      route("curriculum.management.teachers", {}, false),
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
      email: "",
      password: "",
    })
    setFormOpen(true)
  }

  const openEdit = (teacher: Teacher) => {
    setEditing(teacher)
    form.clearErrors()
    form.setData({
      name: teacher.name,
      code: teacher.code,
      email: teacher.user?.email ?? "",
      password: "",
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
        route("curriculum.management.teachers.update", editing.id),
        options
      )
    } else {
      form.post(route("curriculum.management.teachers.store"), options)
    }
  }

  const confirmDelete = () => {
    if (!deleting) {
      return
    }

    form.delete(
      route("curriculum.management.teachers.destroy", deleting.id),
      {
        preserveScroll: true,
        onSuccess: () => setDeleting(null),
      }
    )
  }

  return (
    <CurriculumLayout>
      <Head title="Manajemen Guru" />

      <div className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-semibold tracking-tight">
            Manajemen Guru
          </h1>
          <p className="text-muted-foreground">
            Kelola data guru beserta akun loginnya.
          </p>
        </div>
        <Button onClick={openCreate}>
          <PlusIcon />
          Tambah Guru
        </Button>
      </div>

      <FlashAlert />

      <SearchInput
        value={filters.search}
        onSearch={search}
        placeholder="Cari nama, kode, atau email..."
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama</TableHead>
            <TableHead>Kode</TableHead>
            <TableHead>Email</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teachers.data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={4}
                className="h-24 text-center text-muted-foreground"
              >
                Tidak ada guru yang ditemukan.
              </TableCell>
            </TableRow>
          ) : (
            teachers.data.map((teacher) => (
              <TableRow key={teacher.id}>
                <TableCell className="font-medium">{teacher.name}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{teacher.code}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {teacher.user?.email ?? "-"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Ubah"
                      onClick={() => openEdit(teacher)}
                    >
                      <PencilIcon />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-destructive"
                      aria-label="Hapus"
                      onClick={() => setDeleting(teacher)}
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

      <Pagination paginator={teachers} />

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? "Ubah Guru" : "Tambah Guru"}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? "Perbarui data guru terpilih."
                : "Tambahkan guru baru beserta akun loginnya."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} noValidate className="grid gap-4">
            <FieldGroup>
              <Field data-invalid={!!form.errors.name}>
                <FieldLabel htmlFor="teacher-name">Nama</FieldLabel>
                <Input
                  id="teacher-name"
                  placeholder="cth. Budi Santoso"
                  value={form.data.name}
                  onChange={(event) => form.setData("name", event.target.value)}
                />
                <FieldError>{form.errors.name}</FieldError>
              </Field>
              <Field data-invalid={!!form.errors.code}>
                <FieldLabel htmlFor="teacher-code">Kode</FieldLabel>
                <Input
                  id="teacher-code"
                  placeholder="cth. GUR-001"
                  value={form.data.code}
                  onChange={(event) => form.setData("code", event.target.value)}
                />
                <FieldError>{form.errors.code}</FieldError>
              </Field>
              <Field data-invalid={!!form.errors.email}>
                <FieldLabel htmlFor="teacher-email">Email</FieldLabel>
                <Input
                  id="teacher-email"
                  type="email"
                  placeholder="nama@sekolah.sch.id"
                  value={form.data.email}
                  onChange={(event) =>
                    form.setData("email", event.target.value)
                  }
                />
                <FieldError>{form.errors.email}</FieldError>
              </Field>
              <Field data-invalid={!!form.errors.password}>
                <FieldLabel htmlFor="teacher-password">
                  {editing ? "Kata Sandi (opsional)" : "Kata Sandi"}
                </FieldLabel>
                <Input
                  id="teacher-password"
                  type="password"
                  placeholder={
                    editing ? "Kosongkan jika tidak diubah" : "Minimal 6 karakter"
                  }
                  value={form.data.password}
                  onChange={(event) =>
                    form.setData("password", event.target.value)
                  }
                />
                <FieldError>{form.errors.password}</FieldError>
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
        title="Hapus Guru"
        description={
          deleting
            ? `Data "${deleting.name}" beserta akun loginnya akan dihapus permanen.`
            : ""
        }
        onConfirm={confirmDelete}
        processing={form.processing}
      />
    </CurriculumLayout>
  )
}

import { useForm } from "@inertiajs/react"

import { cn } from "cn"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { data, setData, post, processing, errors } = useForm({
    email: "",
    password: "",
  })

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    post(route("login"))
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Selamat datang kembali</CardTitle>
          <CardDescription>
            Masuk untuk melanjutkan ke Journalify
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} noValidate>
            <FieldGroup>
              <Field data-invalid={!!errors.email}>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@sekolah.sch.id"
                  autoComplete="email"
                  required
                  value={data.email}
                  onChange={(event) => setData("email", event.target.value)}
                />
                <FieldError>{errors.email}</FieldError>
              </Field>
              <Field data-invalid={!!errors.password}>
                <FieldLabel htmlFor="password">Kata Sandi</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={data.password}
                  onChange={(event) => setData("password", event.target.value)}
                />
                <FieldError>{errors.password}</FieldError>
              </Field>
              <Field>
                <Button type="submit" disabled={processing}>
                  {processing ? "Masuk..." : "Masuk"}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

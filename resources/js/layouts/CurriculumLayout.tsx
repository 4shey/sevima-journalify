import { type ReactNode, useState } from "react"
import { Link, router, usePage } from "@inertiajs/react"
import {
  BookOpenIcon,
  CalendarDaysIcon,
  ClipboardCheckIcon,
  GraduationCapIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  NotebookPenIcon,
  SchoolIcon,
  UsersIcon,
  GalleryVerticalEndIcon,
  type LucideIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"

type NavItem = {
  label: string
  href: string
  icon: LucideIcon
}

type NavGroup = {
  label?: string
  items: NavItem[]
}

function currentPathname(url: string): string {
  if (url.includes("://")) {
    return new URL(url).pathname
  }

  return url.split("?")[0]
}

export default function CurriculumLayout({
  children,
}: {
  children: ReactNode
}) {
  const { url, props } = usePage()
  const user = props.auth.user
  const [pending, setPending] = useState(false)

  const pathname = currentPathname(url)

  const groups: NavGroup[] = [
    {
      items: [
        {
          label: "Dashboard",
          href: route("curriculum.dashboard", {}, false),
          icon: LayoutDashboardIcon,
        },
      ],
    },
    {
      label: "Manajemen",
      items: [
        {
          label: "Guru",
          href: route("curriculum.management.teachers", {}, false),
          icon: UsersIcon,
        },
        {
          label: "Siswa",
          href: route("curriculum.management.students", {}, false),
          icon: GraduationCapIcon,
        },
        {
          label: "Kelas",
          href: route("curriculum.management.classes", {}, false),
          icon: SchoolIcon,
        },
        {
          label: "Mapel",
          href: route("curriculum.management.subjects", {}, false),
          icon: BookOpenIcon,
        },
        {
          label: "Jadwal",
          href: route("curriculum.management.schedules", {}, false),
          icon: CalendarDaysIcon,
        },
      ],
    },
    {
      label: "Monitoring",
      items: [
        {
          label: "Jurnal",
          href: route("curriculum.monitoring.journals", {}, false),
          icon: NotebookPenIcon,
        },
        {
          label: "Absensi Siswa",
          href: route("curriculum.monitoring.attendance", {}, false),
          icon: ClipboardCheckIcon,
        },
      ],
    },
  ]

  const logout = () => {
    setPending(true)
    router.delete(route("logout"), { onFinish: () => setPending(false) })
  }

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2 py-1.5">
            <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GalleryVerticalEndIcon className="size-4" />
            </div>
            <span className="truncate text-sm font-semibold">Journalify</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          {groups.map((group) => (
            <SidebarGroup key={group.label ?? "dashboard"}>
              {group.label && (
                <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
              )}
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => (
                    <SidebarMenuItem key={item.label}>
                      <SidebarMenuButton
                        isActive={pathname === item.href}
                        tooltip={item.label}
                        render={<Link href={item.href} />}
                      >
                        <item.icon />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden text-right leading-tight sm:block">
              <p className="text-sm font-medium">
                {user?.name ?? user?.email ?? ""}
              </p>
              <p className="text-xs text-muted-foreground">Kurikulum</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              disabled={pending}
            >
              <LogOutIcon />
              Keluar
            </Button>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}

import { type ReactNode, useState } from "react"
import { Link, router, usePage } from "@inertiajs/react"
import {
  CalendarDaysIcon,
  GalleryVerticalEndIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  NotebookPenIcon,
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

function currentPathname(url: string): string {
  if (url.includes("://")) {
    return new URL(url).pathname
  }

  return url.split("?")[0]
}

export default function TeacherLayout({ children }: { children: ReactNode }) {
  const { url, props } = usePage()
  const user = props.auth.user
  const [pending, setPending] = useState(false)

  const pathname = currentPathname(url)

  const items: NavItem[] = [
    {
      label: "Dashboard",
      href: route("teacher.dashboard", {}, false),
      icon: LayoutDashboardIcon,
    },
    {
      label: "Jadwal",
      href: route("teacher.schedule", {}, false),
      icon: CalendarDaysIcon,
    },
    {
      label: "Jurnal",
      href: route("teacher.journal", {}, false),
      icon: NotebookPenIcon,
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
          <SidebarGroup>
            <SidebarGroupLabel>Menu</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
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
              <p className="text-xs text-muted-foreground">
                {user?.code ? `Guru - ${user.code}` : "Guru"}
              </p>
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

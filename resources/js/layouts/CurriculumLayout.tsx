import { type ReactNode, useState } from "react";
import { Link, router, usePage } from "@inertiajs/react";
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
    type LucideIcon,
} from "lucide-react";

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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TimeSwitcherButton } from "@/components/TimeSwitcherDialog";
import { FlashAlert } from "@/components/management/flash-alert";
import type { PageProps } from "@/types";
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
} from "@/components/ui/sidebar";

type NavItem = {
    label: string;
    href: string;
    icon: LucideIcon;
};

type NavGroup = {
    label?: string;
    items: NavItem[];
};

function currentPathname(url: string): string {
    if (url.includes("://")) {
        return new URL(url).pathname;
    }

    return url.split("?")[0];
}

export default function CurriculumLayout({
    children,
}: {
    children: ReactNode;
}) {
    const { url, props } = usePage<PageProps>();
    const user = props.auth.user;
    const simulatedTime = props.simulatedTime;
    const [pending, setPending] = useState(false);
    const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

    const pathname = currentPathname(url);

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
    ];

    const logout = () => {
        if (pending) {
            return;
        }

        router.delete(route("logout"), {
            onStart: () => setPending(true),
            onSuccess: () => setLogoutDialogOpen(false),
            onFinish: () => setPending(false),
        });
    };

    return (
        <SidebarProvider>
            <Sidebar collapsible="icon">
                <SidebarHeader>
                    <div className="flex items-center gap-2 px-2 py-1.5">
                        <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-black/50">
                            <img
                                src="/images/icon_app.png"
                                alt=""
                                className="size-4 object-contain"
                            />
                        </div>
                        <span className="truncate text-sm font-semibold">
                            Journalify
                        </span>
                    </div>
                </SidebarHeader>
                <SidebarContent>
                    {groups.map((group) => (
                        <SidebarGroup key={group.label ?? "dashboard"}>
                            {group.label && (
                                <SidebarGroupLabel>
                                    {group.label}
                                </SidebarGroupLabel>
                            )}
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    {group.items.map((item) => (
                                        <SidebarMenuItem key={item.label}>
                                            <SidebarMenuButton
                                                isActive={
                                                    pathname === item.href
                                                }
                                                tooltip={item.label}
                                                render={
                                                    <Link href={item.href} />
                                                }
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
                        <TimeSwitcherButton simulatedTime={simulatedTime} />
                        <DropdownMenu>
                            <DropdownMenuTrigger
                                render={
                                    <Button
                                        variant="ghost"
                                        className="h-auto flex-col items-end gap-0 px-2 py-1"
                                    >
                                        <span className="max-w-40 truncate text-sm font-medium">
                                            {user?.name ?? user?.email ?? ""}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            Kurikulum
                                        </span>
                                    </Button>
                                }
                            />
                            <DropdownMenuContent
                                align="end"
                                side="bottom"
                                className="w-56"
                            >
                                <DropdownMenuGroup>
                                    <DropdownMenuLabel className="flex flex-col gap-0.5">
                                        <span className="truncate text-sm font-medium">
                                            {user?.name ?? user?.email ?? ""}
                                        </span>
                                        <span className="text-xs font-normal text-muted-foreground">
                                            Kurikulum
                                        </span>
                                    </DropdownMenuLabel>
                                </DropdownMenuGroup>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    variant="destructive"
                                    onClick={() => setLogoutDialogOpen(true)}
                                >
                                    <LogOutIcon />
                                    Keluar
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Dialog
                            open={logoutDialogOpen}
                            onOpenChange={setLogoutDialogOpen}
                        >
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>
                                        Anda yakin ingin keluar?
                                    </DialogTitle>
                                    <DialogDescription>
                                        Anda akan keluar dari akun{" "}
                                        {user?.name ?? user?.email ?? "ini"}.
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                    <DialogClose
                                        render={
                                            <Button
                                                type="button"
                                                variant="outline"
                                            />
                                        }
                                    >
                                        Batal
                                    </DialogClose>
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        onClick={logout}
                                        disabled={pending}
                                    >
                                        <LogOutIcon />
                                        {pending ? "Keluar..." : "Keluar"}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
                    {children}
                </div>
                <FlashAlert />
            </SidebarInset>
        </SidebarProvider>
    );
}

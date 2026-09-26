import { useState, useEffect } from "react";
import { useForm, router } from "@inertiajs/react";
import { ClockIcon, RotateCcwIcon, SparklesIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Field,
    FieldGroup,
    FieldLabel,
    FieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { SimulatedTimeInfo } from "@/types";

export function TimeSwitcherButton({
    simulatedTime,
}: {
    simulatedTime?: SimulatedTimeInfo;
}) {
    const [open, setOpen] = useState(false);

    const form = useForm({
        date: simulatedTime?.date ?? new Date().toISOString().split("T")[0],
        time: simulatedTime?.time ?? "07:15",
    });

    useEffect(() => {
        if (simulatedTime) {
            form.setData({
                date: simulatedTime.date,
                time: simulatedTime.time,
            });
        }
    }, [simulatedTime?.datetime]);

    const submitUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(route("curriculum.time.update"), {
            preserveScroll: true,
            onSuccess: () => setOpen(false),
        });
    };

    const handleReset = () => {
        router.delete(route("curriculum.time.reset"), {
            preserveScroll: true,
            onSuccess: () => setOpen(false),
        });
    };

    const setPreset = (presetDate: string, presetTime: string) => {
        form.setData({
            date: presetDate,
            time: presetTime,
        });
    };

    const currentDate =
        form.data.date || new Date().toISOString().split("T")[0];

    return (
        <>
            <Button
                variant="outline"
                size="sm"
                onClick={() => setOpen(true)}
                className={
                    simulatedTime?.is_set
                        ? "border-amber-500 bg-amber-50 text-amber-900 hover:bg-amber-100 dark:bg-amber-950/60 dark:text-amber-200 dark:hover:bg-amber-900/60 font-medium shadow-xs"
                        : "text-muted-foreground"
                }
            >
                {simulatedTime?.is_set ? (
                    <>
                        <SparklesIcon className="size-3.5 text-amber-600 dark:text-amber-400 animate-pulse" />
                        <span className="truncate max-w-[220px]">
                            Simulasi: {simulatedTime.formatted}
                        </span>
                    </>
                ) : (
                    <>
                        <ClockIcon className="size-3.5" />
                        <span>Simulasi Waktu</span>
                    </>
                )}
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[480px]">
                    <DialogHeader>
                        <div className="flex items-center gap-2">
                            <ClockIcon className="size-5 text-primary" />
                            <DialogTitle>Pengatur Waktu Simulasi</DialogTitle>
                        </div>
                        <DialogDescription>
                            Ubah tanggal dan jam aplikasi secara global untuk
                            pengujian jadwal, jam pelajaran, dan pengisian
                            jurnal guru.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={submitUpdate} className="space-y-4">
                        <div className="rounded-lg border p-3 bg-muted/30 flex items-center justify-between text-xs">
                            <span className="text-muted-foreground font-medium">
                                Status Waktu Server:
                            </span>
                            {simulatedTime?.is_set ? (
                                <a className="border-amber-500 bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                                    Mode Simulasi: {simulatedTime.formatted}
                                </a>
                            ) : (
                                <a className="bg-emerald-50 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300">
                                    ✓ Waktu Asli (Realtime)
                                </a>
                            )}
                        </div>

                        <FieldGroup>
                            <Field data-invalid={!!form.errors.date}>
                                <FieldLabel htmlFor="sim-date">
                                    Tanggal Simulasi
                                </FieldLabel>
                                <Input
                                    id="sim-date"
                                    type="date"
                                    value={form.data.date}
                                    onChange={(e) =>
                                        form.setData("date", e.target.value)
                                    }
                                />
                                <FieldError>{form.errors.date}</FieldError>
                            </Field>

                            <Field data-invalid={!!form.errors.time}>
                                <FieldLabel htmlFor="sim-time">
                                    Jam Simulasi (WIB)
                                </FieldLabel>
                                <Input
                                    id="sim-time"
                                    type="time"
                                    value={form.data.time}
                                    onChange={(e) =>
                                        form.setData("time", e.target.value)
                                    }
                                />
                                <FieldError>{form.errors.time}</FieldError>
                            </Field>
                        </FieldGroup>

                        <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t">
                            {simulatedTime?.is_set && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleReset}
                                    disabled={form.processing}
                                    className="text-destructive hover:bg-destructive/10"
                                >
                                    <RotateCcwIcon className="size-4" />
                                    Reset Waktu Asli
                                </Button>
                            )}
                            <Button
                                type="submit"
                                disabled={form.processing}
                                className="ml-auto"
                            >
                                {form.processing
                                    ? "Menyimpan..."
                                    : "Terapkan Simulasi"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

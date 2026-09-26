import { Head, usePage } from "@inertiajs/react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CurriculumLayout from "@/layouts/CurriculumLayout";
import type { PageProps } from "@/types";

type AttendanceCounts = {
    alpha: number;
    izin: number;
    sakit: number;
};

type DashboardProps = {
    totalStudents: number;
    week: { start: string; end: string };
    totals: AttendanceCounts;
    chartData: Array<AttendanceCounts & { date: string; day: string }>;
};

const chartConfig = {
    izin: { label: "Izin", color: "#2563eb" },
    sakit: { label: "Sakit", color: "#d97706" },
    alpha: { label: "Alpha", color: "#e11d48" },
} satisfies ChartConfig;

function formatDate(value: string): string {
    return new Date(`${value}T00:00:00`).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

export default function Dashboard({
    totalStudents,
    week,
    totals,
    chartData,
}: DashboardProps) {
    const simulated = usePage<PageProps>().props.simulatedTime?.is_set ?? false;
    const weekdayChartData = chartData.filter(({ date }) => {
        const weekday = new Date(`${date}T00:00:00`).getDay();

        return weekday !== 0 && weekday !== 6;
    });
    const hasAttendance = weekdayChartData.some((day) =>
        Object.values(day).some(
            (value) => typeof value === "number" && value > 0,
        ),
    );

    return (
        <CurriculumLayout>
            <Head title="Dashboard Kurikulum" />

            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex flex-col gap-1.5">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Dashboard Kurikulum
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Rekap presensi {formatDate(week.start)} sampai{" "}
                        {formatDate(week.end)}.
                    </p>
                </div>
                <span className="w-fit rounded-md border px-2.5 py-1 text-xs font-medium text-muted-foreground">
                    {simulated ? "Mengikuti waktu simulasi" : "Minggu ini"}
                </span>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Absensi Siswa Minggu Ini</CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Jumlah catatan presensi per hari dan status.
                    </p>
                </CardHeader>
                <CardContent>
                    {hasAttendance ? (
                        <ChartContainer
                            config={chartConfig}
                            className="h-[320px] w-full aspect-auto"
                        >
                            <BarChart
                                accessibilityLayer
                                data={weekdayChartData}
                                margin={{
                                    top: 8,
                                    right: 8,
                                    left: -20,
                                    bottom: 0,
                                }}
                            >
                                <CartesianGrid vertical={false} />
                                <XAxis
                                    dataKey="day"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                />
                                <YAxis
                                    allowDecimals={false}
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    width={36}
                                />
                                <ChartTooltip
                                    cursor={false}
                                    content={
                                        <ChartTooltipContent indicator="dashed" />
                                    }
                                />
                                <ChartLegend content={<ChartLegendContent />} />
                                <Bar
                                    dataKey="izin"
                                    stackId="attendance"
                                    fill="var(--color-izin)"
                                    radius={[0, 0, 0, 0]}
                                />
                                <Bar
                                    dataKey="sakit"
                                    stackId="attendance"
                                    fill="var(--color-sakit)"
                                    radius={[0, 0, 0, 0]}
                                />
                                <Bar
                                    dataKey="alpha"
                                    stackId="attendance"
                                    fill="var(--color-alpha)"
                                    radius={[3, 3, 0, 0]}
                                />
                            </BarChart>
                        </ChartContainer>
                    ) : (
                        <div className="flex h-[320px] items-center justify-center text-sm text-muted-foreground">
                            Belum ada absensi pada minggu ini.
                        </div>
                    )}
                </CardContent>
            </Card>
        </CurriculumLayout>
    );
}

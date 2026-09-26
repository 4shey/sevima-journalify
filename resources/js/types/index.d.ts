import { Config } from 'ziggy-js';

export type UserRole = 'teacher' | 'curriculum';

export interface User {
    id: string;
    email: string;
    role: UserRole;
    name: string | null;
    code?: string | null;
}

export interface Major {
    id: string;
    name: string;
}

export interface Classroom {
    id: string;
    major_id: string;
    grade: string;
    label: string;
    major: Major | null;
}

export interface Student {
    id: string;
    name: string;
    class_id: string;
    attendance_number: number;
    classroom: Classroom | null;
}

export interface Subject {
    id: string;
    name: string;
    code: string;
}

export interface Teacher {
    id: string;
    user_id: string;
    name: string;
    code: string;
    user: { id: string; email: string } | null;
}

export interface Period {
    id: string;
    order: number;
    start_time: string;
    end_time: string;
}

export type SchoolDay =
    | 'Monday'
    | 'Tuesday'
    | 'Wednesday'
    | 'Thursday'
    | 'Friday';

export type AttendanceStatus = 'H' | 'A' | 'I' | 'S';

export interface Journal {
    id: string;
    name: string;
    date: string;
    schedule_detail_id: string;
}

export interface Attendance {
    id: string;
    journal_id: string;
    student_id: string;
    status: AttendanceStatus;
}

export interface ScheduleDetail {
    id: string;
    schedule_id: string;
    subject_id: string;
    class_id: string;
    teacher_id: string;
    day: SchoolDay;
    start_period_id: string;
    end_period_id: string;
    subject: Subject | null;
    teacher: Teacher | null;
    classroom: Classroom | null;
    start_period: Period | null;
    end_period: Period | null;
    journal: Journal | null;
}

export interface Schedule {
    id: string;
    name: string;
    active_date: string;
    schedule_details_count?: number;
    schedule_details?: ScheduleDetail[];
}

export interface PaginatedLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface Paginated<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: PaginatedLink[];
}

export interface Flash {
    success?: string | null;
    error?: string | null;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User | null;
    };
    ziggy: Config & { location: string };
    flash: Flash | null;
};

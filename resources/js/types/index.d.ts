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

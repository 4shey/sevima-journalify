import { Config } from 'ziggy-js';

export type UserRole = 'teacher' | 'curriculum';

export interface User {
    id: string;
    email: string;
    role: UserRole;
    name: string | null;
    code?: string | null;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User | null;
    };
    ziggy: Config & { location: string };
};

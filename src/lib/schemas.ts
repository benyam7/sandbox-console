import { z } from 'zod';

// Auth schemas
export const AuthTokenSchema = z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
    expiresIn: z.number(),
    createdAt: z.number(),
});

export const UserSchema = z.object({
    id: z.string(),
    email: z.email(),
    name: z.string(),
    role: z.enum(['user', 'admin']),
});

export const LoginFormSchema = z.object({
    email: z.email('Please enter a valid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type AuthContext = {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (data: LoginFormData) => Promise<{ user: User; token: AuthToken }>;
    logout: () => void;
    refreshToken: () => Promise<void>;
};
export type AuthToken = z.infer<typeof AuthTokenSchema>;
export type User = z.infer<typeof UserSchema>;
export type LoginFormData = z.infer<typeof LoginFormSchema>;

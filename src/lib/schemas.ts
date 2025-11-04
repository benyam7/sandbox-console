import { z } from 'zod';

// Auth schemas start
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
    role: z.enum(['user', 'guest']),
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
    continueAsGuest: () => Promise<void>;
};
export type AuthToken = z.infer<typeof AuthTokenSchema>;
export type User = z.infer<typeof UserSchema>;
export type LoginFormData = z.infer<typeof LoginFormSchema>;

// Auth schemas end

// API Keys schemas start
export const APIKeyStatusSchema = z.enum(['active', 'revoked']);

export const APIKeySchema = z.object({
    id: z.string().min(1, 'ID is required'),
    name: z.string().min(1, 'Name is required'),
    key: z.string().min(1, 'Key is required'),
    maskedKey: z.string().min(1, 'Masked key is required'),
    status: APIKeyStatusSchema,
    createdAt: z.date(),
    lastUsedAt: z.date().nullable().optional(),
    userId: z.string().min(1, 'User ID is required'),
});

export const EncryptedAPIKeySchema = z.object({
    id: z.string(),
    name: z.string(),
    encryptedKey: z.string(),
    maskedKey: z.string(),
    status: APIKeyStatusSchema,
    createdAt: z.string(), // ISO string in storage
    lastUsedAt: z.string().nullable(),
    userId: z.string(),
});

export const CreateKeyInputSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
    userId: z.string().min(1, 'User ID is required'),
});

export const KeyOperationInputSchema = z.object({
    keyId: z.string().min(1, 'Key ID is required'),
    userId: z.string().min(1, 'User ID is required'),
});

export const UserIdInputSchema = z.object({
    userId: z.string().min(1, 'User ID is required'),
});

export type APIKeyStatus = z.infer<typeof APIKeyStatusSchema>;
export type APIKey = z.infer<typeof APIKeySchema>;
export type EncryptedAPIKey = z.infer<typeof EncryptedAPIKeySchema>;
export type CreateKeyInput = z.infer<typeof CreateKeyInputSchema>;
export type KeyOperationInput = z.infer<typeof KeyOperationInputSchema>;
export type UserIdInput = z.infer<typeof UserIdInputSchema>;
// API Keys schemas end

// usage schemas start
export const UsageEventKindSchema = z.enum(['request', 'error', 'custom']);

const DateSchema = z
    .string()
    .or(z.date())
    .transform((val) => (typeof val === 'string' ? new Date(val) : val));

export const UsageEventSchema = z.object({
    type: z.enum(['2xx', '4xx', '5xx']),
    cost: z.number().min(0),
    date: DateSchema,
    kind: UsageEventKindSchema,
    count: z.number().int().min(1),
});

export const DailyUsageSchema = z.object({
    date: DateSchema,
    totalRequests: z.number().int().min(0),
    requests2xx: z.number().int().min(0),
    requests4xx: z.number().int().min(0),
    requests5xx: z.number().int().min(0),
    totalCost: z.number().min(0),
    events: z.array(UsageEventSchema),
});

export const KeyUsageSchema = z.object({
    keyId: z.string().min(1, 'Key ID is required'),
    userId: z.string().min(1, 'User ID is required'),
    dailyUsage: z.array(DailyUsageSchema),
});

export type UsageEventKind = z.infer<typeof UsageEventKindSchema>;
export type UsageEvent = z.infer<typeof UsageEventSchema>;
export type DailyUsage = z.infer<typeof DailyUsageSchema>;
export type KeyUsage = z.infer<typeof KeyUsageSchema>;
export type RequestType = '2xx' | '4xx' | '5xx';

// usage schemas end

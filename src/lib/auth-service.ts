import { AuthTokenSchema, type AuthToken, type User } from './schemas';

const AUTH_KEY = 'zama_auth';
const USER_KEY = 'zama_user';

// Mock token generation
function generateMockToken(): AuthToken {
    const token = {
        accessToken:
            'mock_access_' + Date.now() + '_' + Math.random().toString(36),
        refreshToken:
            'mock_refresh_' + Date.now() + '_' + Math.random().toString(36),
        expiresIn: 3600, // 1 hour
        createdAt: Date.now(),
    };
    return AuthTokenSchema.parse(token);
}

// Mock user data
const mockUsers: Record<string, { password: string; user: User }> = {
    'user@example.com': {
        password: 'password123',
        user: {
            id: '1',
            email: 'user@example.com',
            name: 'Demo User',
            role: 'user',
        },
    },
};

export const AuthService = {
    // Login with email and password
    async login(
        email: string,
        password: string
    ): Promise<{ token: AuthToken; user: User }> {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        const userData = mockUsers[email];

        if (!userData || userData.password !== password) {
            throw new Error('Invalid credentials');
        }

        const token = generateMockToken();
        const user = userData.user;

        // Store in localStorage
        if (typeof window !== 'undefined') {
            localStorage.setItem(AUTH_KEY, JSON.stringify(token));
            localStorage.setItem(USER_KEY, JSON.stringify(user));
        }

        return { token, user };
    },

    // Get stored token
    getToken(): AuthToken | null {
        if (typeof window === 'undefined') return null;
        const stored = localStorage.getItem(AUTH_KEY);
        return stored ? JSON.parse(stored) : null;
    },

    // Get stored user
    getUser(): User | null {
        if (typeof window === 'undefined') return null;
        if (!this.isAuthenticated()) {
            return null;
        }
        const stored = localStorage.getItem(USER_KEY);
        return stored ? JSON.parse(stored) : null;
    },

    // Check if authenticated and token is not expired
    isAuthenticated(): boolean {
        const token = this.getToken();

        if (!token) {
            return false;
        }

        // Check if token is expired
        const currentTime = Date.now();
        const tokenAge = (currentTime - token.createdAt) / 1000;

        if (tokenAge >= token.expiresIn) {
            // Token is expired, clean up storage
            this.logout();
            return false;
        }

        return true;
    },

    // Logout
    logout(): void {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(AUTH_KEY);
            localStorage.removeItem(USER_KEY);
        }
    },

    // Refresh token (mock implementation)
    async refreshToken(): Promise<AuthToken> {
        await new Promise((resolve) => setTimeout(resolve, 300));
        const newToken = generateMockToken();
        if (typeof window !== 'undefined') {
            localStorage.setItem(AUTH_KEY, JSON.stringify(newToken));
        }
        return newToken;
    },

    async continueAsGuest(): Promise<{ token: AuthToken; user: User }> {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        const guestUser: User = {
            id: 'guest_id',
            email: 'guest@zama.dev',
            name: 'Guest User',
            role: 'guest',
        };

        const token = generateMockToken();

        // Store in localStorage
        if (typeof window !== 'undefined') {
            localStorage.setItem(AUTH_KEY, JSON.stringify(token));
            localStorage.setItem(USER_KEY, JSON.stringify(guestUser));
        }

        return { token, user: guestUser };
    },
};

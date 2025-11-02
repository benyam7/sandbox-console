import type React from 'react';
import {
    createContext,
    useContext,
    useState,
    useCallback,
    useEffect,
} from 'react';
import { AuthService } from '@/lib/auth-service';
import type {
    User,
    AuthContext,
    LoginFormData,
    AuthToken,
} from '@/lib/schemas';

const AuthContext = createContext<AuthContext | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Initialize auth state from localStorage on mount
    useEffect(() => {
        const storedUser = AuthService.getUser();
        if (storedUser) {
            setUser(storedUser);
        }
        setIsLoading(false);
    }, []);

    const login = useCallback(
        async (
            data: LoginFormData
        ): Promise<{ user: User; token: AuthToken }> => {
            setIsLoading(true);
            try {
                const { user, token } = await AuthService.login(
                    data.email,
                    data.password
                );
                setUser(user);
                return { user: user, token: token };
            } catch (error) {
                console.error(error);
                throw error;
            } finally {
                setIsLoading(false);
            }
        },
        []
    );

    const logout = useCallback(() => {
        AuthService.logout();
        setUser(null);
    }, []);

    const refreshToken = useCallback(async () => {
        try {
            await AuthService.refreshToken();
        } catch (error) {
            logout();
            throw error;
        }
    }, [logout]);

    const value: AuthContext = {
        user,
        isAuthenticated: user !== null,
        isLoading,
        login,
        logout,
        refreshToken,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}

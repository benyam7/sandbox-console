import React, { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import LoginForm from '@/components/auth/login-form';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { LoginFormData } from '@/lib/schemas';
import { Button } from '@/components/ui/button';

export default function SignIn() {
    const navigate = useNavigate();
    const { login, isAuthenticated, continueAsGuest } = useAuth();
    const [error, setError] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    // Redirect if already authenticated
    React.useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, navigate]);

    const handleLogin = async (data: LoginFormData) => {
        setError('');
        setIsLoading(true);

        try {
            await login(data);
            navigate('/dashboard');
        } catch (err) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : 'Login failed. Please try again.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleContinueAsGuest = async () => {
        setError('');
        setIsLoading(true);

        try {
            await continueAsGuest();
            navigate('/dashboard');
        } catch (err) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : 'Guest login failed. Please try again.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-md">
                <Card>
                    <CardHeader className="space-y-2">
                        <CardTitle className="text-2xl">Welcome Back</CardTitle>
                        <CardDescription>
                            Sign in to your Developer Sandbox account
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <LoginForm
                            onSubmit={handleLogin}
                            isLoading={isLoading}
                        />

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-muted"></span>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">
                                    Or
                                </span>
                            </div>
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            className="w-full bg-transparent"
                            onClick={handleContinueAsGuest}
                            disabled={isLoading}
                        >
                            Continue as Guest
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

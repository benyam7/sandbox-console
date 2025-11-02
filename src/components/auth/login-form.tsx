import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoginFormSchema, type LoginFormData } from '@/lib/schemas';

type LoginFormProps = {
    onSubmit: (data: LoginFormData) => Promise<void>;
    isLoading?: boolean;
};
export default function LoginForm({
    onSubmit,
    isLoading = false,
}: LoginFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(LoginFormSchema),
    });

    const onFormSubmit = async (data: LoginFormData) => {
        await onSubmit(data);
    };

    return (
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    disabled={isLoading}
                    className={errors.email ? 'border-destructive' : ''}
                    {...register('email')}
                />
                {errors.email && (
                    <p className="text-sm text-destructive">
                        {errors.email.message}
                    </p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    disabled={isLoading}
                    className={errors.password ? 'border-destructive' : ''}
                    {...register('password')}
                />
                {errors.password && (
                    <p className="text-sm text-destructive">
                        {errors.password.message}
                    </p>
                )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
        </form>
    );
}

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/auth-context';
import { APIKeyService } from '@/lib/api-key-service';
import {
    CreateKeyInputSchema,
    type CreateKeyInput,
    type APIKey,
} from '@/lib/schemas';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Copy, Check } from 'lucide-react';

interface CreateAPIKeyModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: (newKey: APIKey) => void;
}

export function CreateAPIKeyModal({
    isOpen,
    onOpenChange,
    onSuccess,
}: CreateAPIKeyModalProps) {
    const { user } = useAuth();
    const [createdKey, setCreatedKey] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<CreateKeyInput>({
        resolver: zodResolver(CreateKeyInputSchema),
        defaultValues: {
            name: '',
            userId: user?.id || '',
        },
    });

    const handleCreateKey = async (data: CreateKeyInput) => {
        console.log('handleCreateKey', data);
        if (!user) return;

        try {
            setIsLoading(true);
            const newKey = APIKeyService.createKey({
                userId: user.id,
                name: data.name,
            });

            setCreatedKey(newKey.key);
            onSuccess(newKey);
            form.reset();
        } catch (error) {
            console.error('Failed to create API key:', error);
            form.setError('name', { message: 'Failed to create API key' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopyToClipboard = async () => {
        if (!createdKey) return;

        try {
            await navigator.clipboard.writeText(createdKey);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
        }
    };

    const handleClose = () => {
        setCreatedKey(null);
        setIsCopied(false);
        form.reset();
        onOpenChange(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Create New API Key</DialogTitle>
                    <DialogDescription>
                        {createdKey
                            ? "Save your API key securely. You won't be able to see it again."
                            : 'Create a new API key to access our services'}
                    </DialogDescription>
                </DialogHeader>

                {createdKey ? (
                    <div className="space-y-4">
                        <Card className="bg-muted/50 border-primary/20">
                            <CardContent className="pt-6">
                                <p className="text-sm text-muted-foreground mb-2">
                                    Your API Key
                                </p>
                                <div className="flex items-center gap-2">
                                    <code className="flex-1 truncate bg-background px-3 py-2 rounded text-sm font-mono">
                                        {createdKey}
                                    </code>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={handleCopyToClipboard}
                                        className="flex-shrink-0"
                                    >
                                        {isCopied ? (
                                            <Check className="h-4 w-4 text-green-600" />
                                        ) : (
                                            <Copy className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <p className="text-xs text-muted-foreground">
                            ⚠️ This is the only time your API key will be
                            visible. Store it in a secure location.
                        </p>

                        <Button onClick={handleClose} className="w-full">
                            Done
                        </Button>
                    </div>
                ) : (
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(() => {
                                handleCreateKey(form.getValues());
                            })}
                            className="space-y-4"
                        >
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Key Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="e.g., Production API Key"
                                                disabled={isLoading}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex gap-2 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => handleClose()}
                                    disabled={isLoading}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex-1"
                                >
                                    {isLoading ? 'Creating...' : 'Create Key'}
                                </Button>
                            </div>
                        </form>
                    </Form>
                )}
            </DialogContent>
        </Dialog>
    );
}

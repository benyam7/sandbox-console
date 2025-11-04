import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { APIKeyService } from '@/lib/api-key-service';
import type { APIKey } from '@/lib/schemas';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ShowKeyModal } from './show-key-modal';
import { MoreHorizontal, Trash2, RotateCw } from 'lucide-react';

interface APIKeysTableProps {
    refreshTrigger: number;
}

export function APIKeysTable({ refreshTrigger }: APIKeysTableProps) {
    const { user } = useAuth();
    const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedKey, setSelectedKey] = useState<APIKey | null>(null);
    const [actionType, setActionType] = useState<
        'revoke' | 'regenerate' | null
    >(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [regeneratedKey, setRegeneratedKey] = useState<{
        key: string;
        name: string;
    } | null>(null);

    useEffect(() => {
        if (!user) return;

        try {
            const keys = APIKeyService.getAllKeys(user.id);
            setApiKeys(keys);
        } catch (error) {
            console.error('Failed to load API keys:', error);
        } finally {
            setIsLoading(false);
        }
    }, [user, refreshTrigger]);

    const handleRevokeClick = (key: APIKey) => {
        setSelectedKey(key);
        setActionType('revoke');
        setIsDialogOpen(true);
    };

    const handleRegenerateClick = (key: APIKey) => {
        setSelectedKey(key);
        setActionType('regenerate');
        setIsDialogOpen(true);
    };

    const handleConfirmAction = async () => {
        if (!selectedKey || !user || !actionType) return;

        setIsActionLoading(true);
        try {
            if (actionType === 'revoke') {
                APIKeyService.revokeKey({
                    keyId: selectedKey.id,
                    userId: user.id,
                });
            } else if (actionType === 'regenerate') {
                const newKey = APIKeyService.regenerateKey({
                    keyId: selectedKey.id,
                    userId: user.id,
                });

                // Show the regenerated key modal
                setRegeneratedKey({
                    key: newKey.key,
                    name: newKey.name,
                });
            }

            // Refresh the keys list
            const updatedKeys = APIKeyService.getAllKeys(user.id);
            setApiKeys(updatedKeys);
        } catch (error) {
            console.error(`Failed to ${actionType} API key:`, error);
        } finally {
            setIsActionLoading(false);
            setIsDialogOpen(false);
            setSelectedKey(null);
            setActionType(null);
        }
    };

    if (isLoading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-8">
                    <p className="text-muted-foreground">Loading API keys...</p>
                </CardContent>
            </Card>
        );
    }

    if (apiKeys.length === 0) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-12">
                    <p className="text-muted-foreground">
                        No API keys yet. Create one to get started.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Your API Keys</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Key</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead className="text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {apiKeys.map((key) => (
                                    <TableRow key={key.id}>
                                        <TableCell className="font-medium">
                                            {key.name}
                                        </TableCell>
                                        <TableCell className="font-mono text-sm">
                                            {key.maskedKey}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    key.status === 'active'
                                                        ? 'default'
                                                        : 'secondary'
                                                }
                                            >
                                                {key.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {new Date(
                                                key.createdAt
                                            ).toLocaleDateString()}
                                        </TableCell>

                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                    >
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            handleRegenerateClick(
                                                                key
                                                            )
                                                        }
                                                        disabled={
                                                            key.status ===
                                                            'revoked'
                                                        }
                                                    >
                                                        <RotateCw className="h-4 w-4 mr-2" />
                                                        Regenerate
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            handleRevokeClick(
                                                                key
                                                            )
                                                        }
                                                        disabled={
                                                            key.status ===
                                                            'revoked'
                                                        }
                                                        className="text-red-600"
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Revoke
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {actionType === 'revoke'
                                ? 'Revoke API Key?'
                                : 'Regenerate API Key?'}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {actionType === 'revoke'
                                ? `Are you sure you want to revoke "${selectedKey?.name}"? This action cannot be undone and the key will no longer work.`
                                : `Are you sure you want to regenerate "${selectedKey?.name}"? The old key will be revoked and a new one will be generated.`}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogCancel disabled={isActionLoading}>
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleConfirmAction}
                        disabled={isActionLoading}
                        className={
                            actionType === 'revoke'
                                ? 'bg-red-600 hover:bg-red-700'
                                : ''
                        }
                    >
                        {isActionLoading
                            ? 'Processing...'
                            : actionType === 'revoke'
                            ? 'Revoke'
                            : 'Regenerate'}
                    </AlertDialogAction>
                </AlertDialogContent>
            </AlertDialog>

            {regeneratedKey && (
                <ShowKeyModal
                    isOpen={!!regeneratedKey}
                    onOpenChange={(open) => {
                        if (!open) setRegeneratedKey(null);
                    }}
                    apiKey={regeneratedKey.key}
                    keyName={regeneratedKey.name}
                    title="API Key Regenerated"
                    description="Your API key has been regenerated. Save it securely as you won't be able to see it again."
                />
            )}
        </>
    );
}

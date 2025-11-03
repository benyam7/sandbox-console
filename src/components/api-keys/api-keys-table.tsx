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

export function APIKeysTable() {
    const { user } = useAuth();
    const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
    const [isLoading, setIsLoading] = useState(true);

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
    }, [user]);

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
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}

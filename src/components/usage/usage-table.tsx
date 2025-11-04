import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { UsageEvent } from '@/lib/schemas';

interface UsageTableProps {
    events: UsageEvent[];
}

export function UsageTable({ events }: UsageTableProps) {
    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getEventTypeColor = (type: string) => {
        switch (type) {
            case 'request':
                return 'bg-blue-100 text-blue-800';
            case 'error':
                return 'bg-red-100 text-red-800';
            case 'custom':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Usage Events</CardTitle>
                <CardDescription>
                    Recent API usage events and costs
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Kind</TableHead>
                            <TableHead>Count</TableHead>
                            <TableHead className="text-right">Cost</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {events.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={5}
                                    className="text-center text-muted-foreground py-8"
                                >
                                    No usage events found
                                </TableCell>
                            </TableRow>
                        ) : (
                            events.map((event, index) => (
                                <TableRow key={index}>
                                    <TableCell>
                                        {formatDate(event.date)}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            className={getEventTypeColor(
                                                event.type
                                            )}
                                        >
                                            {event.type}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{event.kind}</TableCell>
                                    <TableCell>{event.count}</TableCell>
                                    <TableCell className="text-right font-medium">
                                        ${event.cost.toFixed(2)}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

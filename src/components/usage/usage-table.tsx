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
import type { UsageEvent, RequestType } from '@/lib/schemas';
import { UsageService } from '@/lib/usage-service';
import { REQUEST_TYPE_CONFIG } from '@/lib/request-type-config';

interface UsageTableProps {
    events: UsageEvent[];
    selectedTypes: RequestType[];
}

export function UsageTable({ events, selectedTypes }: UsageTableProps) {
    // Filter events based on selected types
    const filteredEvents = UsageService.filterEventsByType(
        events,
        selectedTypes
    );
    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
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
                        {filteredEvents.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={5}
                                    className="text-center text-muted-foreground py-8"
                                >
                                    No usage events found for selected request
                                    types
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredEvents.map((event, index) => (
                                <TableRow key={index}>
                                    <TableCell>
                                        {formatDate(event.date)}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            style={{
                                                borderColor:
                                                    REQUEST_TYPE_CONFIG[
                                                        event.type
                                                    ].chartColor,
                                                color: REQUEST_TYPE_CONFIG[
                                                    event.type
                                                ].chartColor,
                                            }}
                                        >
                                            {event.type}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="capitalize">
                                        {event.kind}
                                    </TableCell>
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

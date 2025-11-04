import * as React from 'react';
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
import {
    REQUEST_TYPE_CONFIG,
    ALL_REQUEST_TYPES,
} from '@/lib/request-type-config';
import { RequestTypeSelector } from './request-type-selector';

interface UsageTableProps {
    events: UsageEvent[];
}

export function UsageTable({ events }: UsageTableProps) {
    const [selectedTypes, setSelectedTypes] =
        React.useState<RequestType[]>(ALL_REQUEST_TYPES);

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
            <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
                <div className="grid flex-1 gap-1">
                    <CardTitle>Usage Events</CardTitle>
                    <CardDescription>
                        Recent API usage events and costs
                    </CardDescription>
                </div>
                <RequestTypeSelector
                    selectedTypes={selectedTypes}
                    onSelectionChange={setSelectedTypes}
                />
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

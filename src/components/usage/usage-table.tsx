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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import type { UsageEvent, RequestType } from '@/lib/schemas';
import { UsageService } from '@/lib/usage-service';
import {
    REQUEST_TYPE_CONFIG,
    ALL_REQUEST_TYPES,
} from '@/lib/request-type-config';
import { RequestTypeSelector } from './request-type-selector';
import { ApiKeySelector } from './api-key-selector';

interface UsageTableProps {
    events: UsageEvent[];
    apiKeys: Array<{ id: string; name: string }>;
    userId: string;
}

export function UsageTable({ events, apiKeys, userId }: UsageTableProps) {
    const [selectedTypes, setSelectedTypes] =
        React.useState<RequestType[]>(ALL_REQUEST_TYPES);
    const [timeRange, setTimeRange] = React.useState('90d');
    const [selectedKeys, setSelectedKeys] = React.useState<string[]>(
        apiKeys.map((k) => k.id)
    );
    const [filteredEvents, setFilteredEvents] =
        React.useState<UsageEvent[]>(events);

    // Update selectedKeys when apiKeys change
    React.useEffect(() => {
        setSelectedKeys(apiKeys.map((k) => k.id));
    }, [apiKeys]);

    // Fetch filtered data when keys change
    React.useEffect(() => {
        const fetchFilteredData = async () => {
            if (!userId || selectedKeys.length === 0) return;

            const allKeyIds = apiKeys.map((k) => k.id);
            const isAllSelected =
                selectedKeys.length === allKeyIds.length &&
                selectedKeys.every((id) => allKeyIds.includes(id));

            if (isAllSelected) {
                // Use all data
                const allEvents = await UsageService.getAllEvents(userId);
                setFilteredEvents(allEvents);
            } else {
                // Filter by selected keys
                const filtered = await UsageService.getEventsByKeys(
                    userId,
                    selectedKeys
                );
                setFilteredEvents(filtered);
            }
        };

        fetchFilteredData();
    }, [selectedKeys, userId, apiKeys]);

    // Filter events based on time range
    const timeFilteredEvents = React.useMemo(() => {
        if (filteredEvents.length === 0) return [];

        const now = new Date();
        let daysToShow = 90;

        if (timeRange === '30d') {
            daysToShow = 30;
        } else if (timeRange === '7d') {
            daysToShow = 7;
        }

        const cutoffDate = new Date(now);
        cutoffDate.setDate(cutoffDate.getDate() - daysToShow);

        return filteredEvents.filter((event) => {
            const eventDate = new Date(event.date);
            return eventDate >= cutoffDate;
        });
    }, [filteredEvents, timeRange]);

    // Filter events based on selected types
    const finalFilteredEvents = UsageService.filterEventsByType(
        timeFilteredEvents,
        selectedTypes
    );
    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    // Show empty state if no API keys exist
    if (apiKeys.length === 0) {
        return (
            <Card>
                <CardHeader className="border-b">
                    <CardTitle>Usage Events</CardTitle>
                    <CardDescription>
                        Recent API usage events and costs
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="rounded-full bg-muted p-3 mb-4">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-muted-foreground"
                        >
                            <rect
                                width="8"
                                height="4"
                                x="8"
                                y="2"
                                rx="1"
                                ry="1"
                            />
                            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                            <path d="M12 11h4" />
                            <path d="M12 16h4" />
                            <path d="M8 11h.01" />
                            <path d="M8 16h.01" />
                        </svg>
                    </div>
                    <h3 className="font-semibold text-lg mb-2">
                        No API Keys Yet
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-sm">
                        Create your first API key to start tracking usage events
                        and costs.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
                <div className="grid flex-1 gap-1">
                    <CardTitle>Usage Events</CardTitle>
                    <CardDescription>
                        Recent API usage events and costs
                    </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    {apiKeys.length > 0 && (
                        <ApiKeySelector
                            apiKeys={apiKeys}
                            selectedKeys={selectedKeys}
                            onSelectionChange={setSelectedKeys}
                        />
                    )}
                    <RequestTypeSelector
                        selectedTypes={selectedTypes}
                        onSelectionChange={setSelectedTypes}
                    />
                    <Select value={timeRange} onValueChange={setTimeRange}>
                        <SelectTrigger
                            className="w-[160px] rounded-lg"
                            aria-label="Select a time range"
                        >
                            <SelectValue placeholder="Last 3 months" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            <SelectItem value="90d" className="rounded-lg">
                                Last 3 months
                            </SelectItem>
                            <SelectItem value="30d" className="rounded-lg">
                                Last 30 days
                            </SelectItem>
                            <SelectItem value="7d" className="rounded-lg">
                                Last 7 days
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>
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
                        {finalFilteredEvents.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={5}
                                    className="text-center text-muted-foreground py-8"
                                >
                                    No usage events found for selected filters
                                </TableCell>
                            </TableRow>
                        ) : (
                            finalFilteredEvents.map((event, index) => (
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
